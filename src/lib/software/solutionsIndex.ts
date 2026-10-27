import type { SoftwareSetting, Solution } from '@/payload-types'

import { normalizeText } from '../catalog/normalize'
import { INDUSTRY_GROUPS, SITUATIONS, SOLUTION_CATEGORIES, type SolutionCategory } from './options'
import { leadTimeOf, priceFromOf } from './price'
import { type PriceDisplay, priceDisplaySchema } from './wizard'

/**
 * Index of the Software solutions for the catalog, the menu sheet and the 404 search (ADR-014
 * §4): the card fields of every published solution, the catalog filters and the search
 * settings — the same search engine as Biznes (`lib/search.ts`). Prices are public on this
 * line (spec. §5): an empty price stays empty and the page shows „Zapytaj o wycenę”.
 */

type Sizes<T> = { start?: T; std?: T; full?: T }

export type IndexSolution = {
  slug: string
  name: string
  category: SolutionCategory
  label?: string
  tag?: string
  lead?: string
  features: string[]
  forWhom?: string
  situations: NonNullable<Solution['situations']>
  industryGroups: NonNullable<Solution['industryGroups']>
  hasLivePreview: boolean
  /** Text of the toast after „+ Do projektu”. */
  toast?: string
  cardGradient?: NonNullable<Solution['cardGradient']>
  prices: Sizes<number>
  leadTimes: Sizes<string>
  priceNote?: string
  /** Prices are per month (care): shown with `priceDisplay.monthTemplate`. */
  priceMonthly: boolean
  /** Names of the versions; a missing one is „Na start” / „Standard” / „Pełna”. */
  sizeNames: Sizes<string>
  /** Lowest price given (`0` = free); `null` → „Zapytaj o wycenę” (ADR-014 rozstrz. SW0 5). */
  priceFrom: number | null
  /** Term of the `start` size, else the first given; `null` → „po krótkiej rozmowie”. */
  leadTime: string | null
  /** Normalized text the search matches (`normalizeText`). */
  hay: string
}

export type SolutionsIndex = {
  solutions: IndexSolution[]
  /** Only categories with a published solution; `count` = such solutions. */
  categories: { slug: SolutionCategory; name: string; count: number }[]
  industryGroups: { slug: string; name: string }[]
  situations: { slug: string; name: string }[]
  search: { synonyms: Record<string, string[]>; stopWords: string[]; popular: string[] }
  /** Price templates of the wizard settings (one way prices read on the whole site). */
  priceDisplay: PriceDisplay
}

/**
 * Templates of the package (`kreator.json` → `priceDisplay`), used when the settings are not
 * saved yet or no longer match the schema — the catalog still shows prices.
 */
export const DEFAULT_PRICE_DISPLAY: PriceDisplay = {
  template: '{cena} zł netto',
  templateFrom: 'od {cena} zł netto',
  fallback: 'Zapytaj o wycenę',
  termFallback: 'po krótkiej rozmowie',
  monthTemplate: 'od {cena} zł / mies.',
}

/** Fields of a solution the index reads (the `select` of `getSolutionsIndex`). */
export type IndexedSolutionDoc = Pick<
  Solution,
  | 'slug'
  | 'name'
  | 'category'
  | 'label'
  | 'tag'
  | 'lead'
  | 'features'
  | 'forWhom'
  | 'situations'
  | 'industryGroups'
  | 'keywords'
  | 'hasLivePreview'
  | 'toast'
  | 'cardGradient'
  | 'prices'
  | 'leadTimes'
  | 'priceNote'
  | 'priceMonthly'
  | 'sizeNames'
>

export type SolutionsSource = {
  /** Published solutions of one tenant, in catalog order. */
  solutions: IndexedSolutionDoc[]
  search: SoftwareSetting['search'] | null | undefined
  /** `SoftwareSettings.wizard.priceDisplay` as stored (checked here). */
  priceDisplay: unknown
}

const text = (value: string | null | undefined): string | undefined => value?.trim() || undefined

function sizes<T>(values: Partial<Record<keyof Sizes<T>, T | null>> | null | undefined): Sizes<T> {
  const result: Sizes<T> = {}
  for (const size of ['start', 'std', 'full'] as const) {
    const value = values?.[size]
    if (value !== null && value !== undefined && value !== '') result[size] = value
  }
  return result
}

function indexSolution(doc: IndexedSolutionDoc): IndexSolution {
  const features = (doc.features ?? []).map((feature) => feature.trim()).filter(Boolean)
  return {
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    label: text(doc.label),
    tag: text(doc.tag),
    lead: text(doc.lead),
    features,
    forWhom: text(doc.forWhom),
    situations: doc.situations ?? [],
    industryGroups: doc.industryGroups ?? [],
    hasLivePreview: Boolean(doc.hasLivePreview),
    toast: text(doc.toast),
    cardGradient: doc.cardGradient ?? undefined,
    prices: sizes(doc.prices),
    leadTimes: sizes(doc.leadTimes),
    priceNote: text(doc.priceNote),
    priceMonthly: Boolean(doc.priceMonthly),
    sizeNames: sizes(
      doc.sizeNames && {
        start: text(doc.sizeNames.start),
        std: text(doc.sizeNames.std),
        full: text(doc.sizeNames.full),
      },
    ),
    priceFrom: priceFromOf(doc.prices),
    leadTime: leadTimeOf(doc.leadTimes),
    hay: normalizeText(
      [doc.name, doc.label, doc.tag, doc.lead, ...features, doc.forWhom, doc.keywords]
        .filter(Boolean)
        .join(' '),
    ),
  }
}

export function buildSolutionsIndex(source: SolutionsSource): SolutionsIndex {
  const solutions = source.solutions.map(indexSolution)
  const counts = new Map<SolutionCategory, number>()
  for (const solution of solutions) {
    counts.set(solution.category, (counts.get(solution.category) ?? 0) + 1)
  }
  return {
    solutions,
    categories: SOLUTION_CATEGORIES.filter(({ value }) => counts.has(value)).map(
      ({ value, label }) => ({ slug: value, name: label, count: counts.get(value)! }),
    ),
    industryGroups: INDUSTRY_GROUPS.map(({ value, label }) => ({ slug: value, name: label })),
    situations: SITUATIONS.map(({ value, label }) => ({ slug: value, name: label })),
    search: {
      synonyms: Object.fromEntries(
        (source.search?.synonyms ?? []).map(({ phrase, expansions }) => [phrase, expansions]),
      ),
      stopWords: source.search?.stopWords ?? [],
      popular: source.search?.popular ?? [],
    },
    priceDisplay: priceDisplaySchema.safeParse(source.priceDisplay).data ?? DEFAULT_PRICE_DISPLAY,
  }
}
