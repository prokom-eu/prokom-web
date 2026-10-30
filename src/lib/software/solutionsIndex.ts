import type { SoftwareSetting, Solution } from '@/payload-types'

import { normalizeText } from '../catalog/normalize'
import { INDUSTRY_GROUPS, SITUATIONS, SOLUTION_CATEGORIES, type SolutionCategory } from './options'
import { type PriceDisplay, priceDisplaySchema } from './wizard'

/**
 * Index of the Software solutions for the catalog, the menu sheet and the 404 search (ADR-014
 * §4): the card fields of every published solution, the catalog filters and the search
 * settings — the same search engine as Biznes (`lib/search.ts`). Prices are public on this
 * line (spec. §5): an empty price stays empty and the page shows „Zapytaj o wycenę”.
 */

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
  /** Text of the toast after „+ Dodaj do wyceny”. */
  toast?: string
  cardGradient?: NonNullable<Solution['cardGradient']>
  priceNote?: string
  /** Prices are per month (care): shown with `priceDisplay.monthTemplate`. */
  priceMonthly: boolean
  /** The one „od” price (`0` = free); `null` → „Zapytaj o wycenę” (ADR-014 v22 pkt 1). */
  priceFrom: number | null
  /** The „od” term as stored („od 2 tygodni”); `null` → „po krótkiej rozmowie”. */
  leadTime: string | null
  /** Thumbnail file in `public/` (`/software/rozwiazania/<slug>.svg`). */
  thumbnail?: string
  /** Levels of care and audit (pkt 2); empty for the other solutions. */
  levels: IndexLevel[]
  /** Card of „12 rzeczy” (SW5): only the fields filled in the panel, absent when none is. */
  featured?: FeaturedCard
  /** Normalized text the search matches (`normalizeText`). */
  hay: string
}

/** A level of care or audit: its own price and reaction time / term. */
export type IndexLevel = {
  name: string
  shortName?: string
  price: number
  term?: string
  recommended: boolean
}

/** Fields of the „12 rzeczy” card that differ from the catalog card (`Solutions.featured`). */
export type FeaturedCard = { name?: string; tag?: string; lead?: string; features?: string[] }

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
  | 'priceFrom'
  | 'leadTime'
  | 'priceNote'
  | 'priceMonthly'
  | 'thumbnail'
  | 'levels'
  | 'featured'
>

export type SolutionsSource = {
  /** Published solutions of one tenant, in catalog order. */
  solutions: IndexedSolutionDoc[]
  search: SoftwareSetting['search'] | null | undefined
  /** `SoftwareSettings.wizard.priceDisplay` as stored (checked here). */
  priceDisplay: unknown
}

const text = (value: string | null | undefined): string | undefined => value?.trim() || undefined

const isPrice = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

function indexLevels(levels: IndexedSolutionDoc['levels']): IndexLevel[] {
  return (levels ?? []).flatMap((level) =>
    isPrice(level.price)
      ? [
          {
            name: level.name,
            shortName: text(level.shortName),
            price: level.price,
            term: text(level.term),
            recommended: Boolean(level.recommended),
          },
        ]
      : [],
  )
}

function featuredCard(featured: IndexedSolutionDoc['featured']): FeaturedCard | undefined {
  const card: FeaturedCard = {}
  const name = text(featured?.name)
  const tag = text(featured?.tag)
  const lead = text(featured?.lead)
  const features = (featured?.features ?? []).map((feature) => feature.trim()).filter(Boolean)
  if (name) card.name = name
  if (tag) card.tag = tag
  if (lead) card.lead = lead
  if (features.length > 0) card.features = features
  return Object.keys(card).length > 0 ? card : undefined
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
    priceNote: text(doc.priceNote),
    priceMonthly: Boolean(doc.priceMonthly),
    priceFrom: isPrice(doc.priceFrom) ? doc.priceFrom : null,
    leadTime: text(doc.leadTime) ?? null,
    thumbnail: text(doc.thumbnail),
    levels: indexLevels(doc.levels),
    featured: featuredCard(doc.featured),
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
