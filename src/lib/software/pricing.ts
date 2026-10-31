import type { Solution } from '@/payload-types'

import { SOLUTION_CATEGORIES, type SolutionCategory } from './options'
import { formatPrice, keepTogether } from './price'
import { levelSlug } from './projectSummary'
import type { PriceDisplay } from './wizard'

/**
 * The price list `/cennik` (spec. §6.4, v22; board `Cennik`, stan `89b`): the solutions in the
 * catalog's tabs with one „od” price, one „od” term and „W cenie”, and the levels of care and
 * audit (`Solutions.levels`, ADR-014 v22 pkt 2). Prices and terms only from `Solutions`, words
 * only from `priceDisplay` (spec. §1 pkt 1).
 */

export type PricingSolution = Pick<Solution, 'slug' | 'name' | 'category'> & {
  lead: string | null
  priceFrom: number | null
  leadTime: string | null
  priceMonthly: boolean
  priceNote: string | null
  included: string[]
  levels: NonNullable<Solution['levels']>
  levelRows: NonNullable<Solution['levelRows']>
}

export type PricingRow = {
  slug: string
  name: string
  lead: string | null
  price: string
  term: string
  /** No price: „Zapytaj o wycenę”. */
  ask: boolean
  /** „W cenie” in one line; `null` → the lead says it. */
  included: string | null
  note: string | null
}

export type PricingTab = { slug: SolutionCategory; name: string; rows: PricingRow[] }

const NBSP = String.fromCharCode(0xa0)
const zl = (amount: number) => `${formatPrice(amount)}${NBSP}zł`

function priceOf(solution: PricingSolution, display: PriceDisplay): string {
  if (solution.priceFrom === null) return display.fallback
  if (solution.priceFrom === 0) return zl(0)
  const template = solution.priceMonthly ? display.monthTemplate : display.short
  return keepTogether(template.replace('{cena}', formatPrice(solution.priceFrom)))
}

function rowOf(solution: PricingSolution, display: PriceDisplay): PricingRow {
  const note = solution.priceNote?.trim() || null
  return {
    slug: solution.slug,
    name: solution.name,
    lead: solution.lead,
    price: priceOf(solution, display),
    term: solution.leadTime ? keepTogether(solution.leadTime) : display.termFallback,
    ask: solution.priceFrom === null,
    included: solution.included.length > 0 ? solution.included.join(' · ') : null,
    // The package repeats „Zapytaj o wycenę” as the note of apps: said once is enough.
    note: note && note !== display.fallback ? note : null,
  }
}

/** The tabs with a published solution, in the catalog's order; `names` override the labels. */
export function pricingTabs(
  solutions: readonly PricingSolution[],
  display: PriceDisplay,
  names: Partial<Record<SolutionCategory, string>> = {},
): PricingTab[] {
  return SOLUTION_CATEGORIES.flatMap(({ value, label }) => {
    const rows = solutions
      .filter((solution) => solution.category === value)
      .map((solution) => rowOf(solution, display))
    return rows.length > 0 ? [{ slug: value, name: names[value] ?? label, rows }] : []
  })
}

/** Care has levels priced per month, the audit levels priced once (ADR-014 v22 pkt 2). */
export function findLevelSolution(
  solutions: readonly PricingSolution[],
  kind: 'care' | 'audit',
): PricingSolution | null {
  return (
    solutions.find(
      (solution) => solution.levels.length > 0 && solution.priceMonthly === (kind === 'care'),
    ) ?? null
  )
}

export type LevelPlan = {
  name: string
  price: string
  /** „/ mies.” for care, empty for the audit. */
  period: string
  description: string | null
  termLabel: 'Reakcja' | 'Wynik'
  term: string | null
  recommended: boolean
  /** What the level gives: the first all its rows, the next „Wszystko z …” and what it adds. */
  points: string[]
  /** Care: the contact form with the level (`?poziom=`); the audit has its own page. */
  href: string | null
}

const MARKS = new Set(['tak', 'nie', 'dochodzi'])

/** „Podstawowa” → „Podstawowej”; a name that does not decline reads „poziomu Pełny”. */
const fromLevel = (name: string) =>
  name.endsWith('a') ? `Wszystko z ${name.slice(0, -1)}ej` : `Wszystko z poziomu ${name}`

export function levelPlans(solution: PricingSolution): LevelPlan[] {
  // Rows marked per level; a row of plain texts (the reaction time, the term) is the term itself.
  const rows = solution.levelRows.filter((row) =>
    (row.cells ?? []).every((cell) => MARKS.has(cell)),
  )
  return solution.levels.map((level, i) => {
    const mark = i === 0 ? 'tak' : 'dochodzi'
    const own = rows.filter((row) => row.cells?.[i] === mark).map((row) => row.label)
    const previous = solution.levels[i - 1]
    return {
      name: level.name,
      price: zl(level.price),
      period: solution.priceMonthly ? '/ mies.' : '',
      description: level.description?.trim() || null,
      termLabel: solution.priceMonthly ? 'Reakcja' : 'Wynik',
      term: level.term?.trim() || null,
      recommended: level.recommended ?? false,
      points: previous ? [fromLevel(previous.name), ...own] : own,
      href: solution.priceMonthly ? `/kontakt?poziom=${levelSlug(level.name)}` : null,
    }
  })
}

/** „Zapytaj o opiekę Podstawową”: a name in -a takes -ą, any other stays as it is („Systemy”). */
export function levelAccusative(name: string): string {
  return name.endsWith('a') ? `${name.slice(0, -1)}ą` : name
}
