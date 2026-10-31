import { normalizeText } from '../catalog/normalize'
import type { SoftwareTopic } from '../inquiry/types'
import { type AreaKey, CATEGORY_AREA, type SolutionCategory } from './options'
import { formatPrice, keepTogether } from './price'
import type { ProjectItem } from './project'
import type { IndexSolution } from './solutionsIndex'

/**
 * „Twój projekt” above the `/kontakt` form (spec. §6.10; ZMIANY-v21 §10.6, §11.2; board
 * `Kontakt`, stany `kontakt-99b/99c`): each item with its „od” price and term, the one-off sum
 * and care apart per month. Prices come from `Solutions` only — a care or audit item names its
 * level („… · poziom Rozszerzona”, ADR-014 v22 pkt 13), never its price.
 */

export type ProjectSolution = Pick<
  IndexSolution,
  'slug' | 'name' | 'category' | 'priceFrom' | 'priceMonthly' | 'leadTime' | 'thumbnail' | 'levels'
>

export type ProjectRow = {
  id: string
  name: string
  /** Term („termin od 2 tygodni”), level, or why the price is missing. */
  sub: string
  price: string
  /** Priced after a talk: „po rozmowie” / „do wyceny”. */
  ask: boolean
  thumbnail?: string
  /** Area of the solution: the thumbnail's fallback gradient; absent for an item no longer offered. */
  tone?: AreaKey
  /** Name in „Wysłane razem z: …” — with the level, without „poziom”. */
  label: string
}

export type ProjectSummary = {
  rows: ProjectRow[]
  sumLabel: string
  sum: string
  note: string
  /** Topic of the first item the site still offers; the customer may change it. */
  topic: SoftwareTopic | null
  /** Slugs sent with the inquiry: only solutions the site still offers. */
  slugs: string[]
}

const NBSP = String.fromCharCode(0xa0)
const zl = (amount: number) => `${formatPrice(amount)}${NBSP}zł`

const CATEGORY_TOPIC: Record<SolutionCategory, SoftwareTopic> = {
  strony: 'strona',
  systemy: 'system',
  aplikacje: 'mobile',
  automatyzacje: 'laczenie',
  opieka: 'opieka',
}

/** The audit: levels, priced once (care is per month). */
const isAudit = (solution: ProjectSolution) =>
  solution.category === 'opieka' && solution.levels.length > 0 && !solution.priceMonthly

const topicOf = (solution: ProjectSolution): SoftwareTopic =>
  isAudit(solution) ? 'audyt' : CATEGORY_TOPIC[solution.category]

/** Address of a level in `?poziom=`: „Rozszerzona” → `rozszerzona`. */
export function levelSlug(name: string): string {
  return normalizeText(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type Line = { row: ProjectRow; slug: string | null; oneTime: number; monthly: number }

function lineOf(item: ProjectItem, solution: ProjectSolution | undefined): Line {
  if (!solution) {
    const row = { id: item.id, name: item.name, sub: 'do omówienia', price: 'do wyceny' }
    return { row: { ...row, ask: true, label: item.name }, slug: null, oneTime: 0, monthly: 0 }
  }
  const base = {
    id: item.id,
    name: solution.name,
    thumbnail: solution.thumbnail,
    tone: CATEGORY_AREA[solution.category],
  }
  const slug = solution.slug
  if (solution.priceFrom === null) {
    const row = { ...base, sub: 'wycena po krótkiej rozmowie', price: 'po rozmowie', ask: true }
    return { row: { ...row, label: solution.name }, slug, oneTime: 0, monthly: 0 }
  }
  const month = solution.priceMonthly ? '/mies.' : ''
  const sum = (amount: number) =>
    solution.priceMonthly ? { oneTime: 0, monthly: amount } : { oneTime: amount, monthly: 0 }
  if (solution.levels.length > 0) {
    const wanted = normalizeText(
      item.name
        .split(' · ')
        .slice(1)
        .join(' · ')
        .replace(/^poziom\s+/i, ''),
    )
    const level = solution.levels.find((one) => normalizeText(one.name) === wanted)
    if (level) {
      const sub = `${solution.priceMonthly ? 'poziom ' : ''}${level.name}`
      const row = { ...base, sub, price: `${zl(level.price)}${month}`, ask: false }
      return {
        row: { ...row, label: `${solution.name} · ${level.name}` },
        slug,
        ...sum(level.price),
      }
    }
    const sub = solution.priceMonthly
      ? 'poziom opieki dobierzemy razem'
      : 'rodzaj audytu dobierzemy razem'
    const row = { ...base, sub, price: `od${NBSP}${zl(solution.priceFrom)}${month}`, ask: false }
    return { row: { ...row, label: solution.name }, slug, ...sum(solution.priceFrom) }
  }
  const sub = solution.leadTime
    ? `termin ${keepTogether(solution.leadTime)}`
    : 'cena za podstawowy zakres'
  const row = { ...base, sub, price: `od${NBSP}${zl(solution.priceFrom)}${month}`, ask: false }
  return { row: { ...row, label: solution.name }, slug, ...sum(solution.priceFrom) }
}

export function summarizeProject(
  project: readonly ProjectItem[],
  solutions: readonly ProjectSolution[],
): ProjectSummary {
  const bySlug = new Map(solutions.map((solution) => [solution.slug, solution]))
  const lines = project.map((item) => lineOf(item, bySlug.get(item.id)))
  const oneTime = lines.reduce((total, line) => total + line.oneTime, 0)
  const monthly = lines.reduce((total, line) => total + line.monthly, 0)
  // „od” before the monthly sum only when a care level is still to be picked.
  const monthlyFrom = lines.some((line) => line.monthly > 0 && line.row.price.startsWith('od'))
  const parts = [
    oneTime > 0 ? `od${NBSP}${zl(oneTime)}` : null,
    monthly > 0 ? `${monthlyFrom && oneTime === 0 ? `od${NBSP}` : ''}${zl(monthly)}/mies.` : null,
  ].filter((part): part is string => part !== null)
  const asked = lines.filter((line) => line.row.ask).length
  const askNote =
    asked === 0
      ? ''
      : asked === 1
        ? 'Jedna pozycja jest wyceniana po krótkiej rozmowie. '
        : 'Część pozycji wyceniamy po krótkiej rozmowie. '
  const first = project.map((item) => bySlug.get(item.id)).find((solution) => solution)
  return {
    rows: lines.map((line) => line.row),
    sumLabel: lines.length > 1 ? 'Razem (netto)' : 'Cena (netto)',
    sum: parts.length > 0 ? parts.join(' + ') : 'po rozmowie',
    note: `${askNote}Lista pójdzie razem ze zgłoszeniem. Dokładną cenę i termin dostaniesz na piśmie w 5–7 dni.`,
    topic: first ? topicOf(first) : null,
    slugs: lines.flatMap((line) => (line.slug ? [line.slug] : [])),
  }
}

/** `?poziom=rozszerzona` (price list „Zapytaj o opiekę X →”): the care level's name, if any. */
export function careLevelFromParam(
  param: string | string[] | undefined,
  solutions: readonly ProjectSolution[],
): string | null {
  const value = Array.isArray(param) ? param[0] : param
  if (!value) return null
  const care = solutions.find((solution) => solution.priceMonthly && solution.levels.length > 0)
  return care?.levels.find((level) => levelSlug(level.name) === value)?.name ?? null
}
