import type { Solution } from '@/payload-types'

import { formatPrice } from './price'

/**
 * Levels of care and kinds of audit (`Solutions.levels`, ADR-014 v22 pkt 2) for `/cennik` and
 * `/audyt` (ZMIANY-v24 §6.3, §9.1). Prices only from `Solutions` (spec. §1 pkt 1); the solutions
 * grid of `/cennik` uses the price cards (`priceCards.ts`).
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

const NBSP = String.fromCharCode(0xa0)
const zl = (amount: number) => `${formatPrice(amount)}${NBSP}zł`

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
      href: solution.priceMonthly ? careContactHref(level.name) : null,
    }
  })
}

/**
 * „Zapytaj o opiekę X →”: the contact form with the topic „Opieka” picked and the level written in
 * the message, both visible to the customer (`?temat=`, `?fraza=` of the shared form, SWA5b).
 */
export function careContactHref(levelName: string): string {
  const phrase = encodeURIComponent(`Interesuje mnie opieka — poziom ${levelName}.`)
  return `/kontakt?temat=Opieka&fraza=${phrase}#formularz`
}

/** „Zapytaj o opiekę Podstawową”: a name in -a takes -ą, any other stays as it is („Systemy”). */
export function levelAccusative(name: string): string {
  return name.endsWith('a') ? `${name.slice(0, -1)}ą` : name
}
