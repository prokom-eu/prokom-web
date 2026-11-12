import { CATALOG_PATH } from './catalogPath'
import { INDUSTRY_GROUPS, SITUATIONS, type SolutionCategory } from './options'
import { isSlug } from './slug'
import { searchSolutions, type PreparedSolutionSearch } from './search'
import type { IndexSolution, SolutionsIndex } from './solutionsIndex'

/**
 * Filters of the Software catalog `/rozwiazania` (spec. §5): the state lives only in the URL, so a
 * link, a refresh or the menu search (`?q=`) shows the same view. Pure functions — the page
 * renders the first view on the server and the island repeats the same code in the browser (the
 * Biznes pattern, `lib/catalog/filters.ts`). One value per filter, as on the board.
 */

export { CATALOG_PATH }

/** Longest search phrase read from the URL. */
const MAX_QUERY = 100

/**
 * v24 shows four offer groups, the data keeps five categories (ZMIANY-v24 §6.2, decyzja D10):
 * apps count as systems, care and the audit go with the rebuild. This is the only place that
 * maps them — the catalog, the price page and the home grid all read it.
 */
export const OFFER_GROUPS = [
  { value: 'strony', label: 'Strony internetowe', short: 'Strony' },
  { value: 'przebudowa', label: 'Przebudowa i opieka', short: 'Przebudowa i opieka' },
  { value: 'systemy', label: 'Systemy dla firm', short: 'Systemy' },
  { value: 'automatyzacje', label: 'Automatyzacje i AI', short: 'Automatyzacje' },
] as const

export type OfferGroup = (typeof OFFER_GROUPS)[number]['value']

const CATEGORY_GROUP: Record<SolutionCategory, OfferGroup> = {
  strony: 'strony',
  systemy: 'systemy',
  aplikacje: 'systemy',
  automatyzacje: 'automatyzacje',
  opieka: 'przebudowa',
}

/**
 * Pages by data that the board files under „Przebudowa i opieka”. By slug: the data has no rebuild
 * tag (ZMIANY-v24 §6.2), and a slug is the page address, so it changes with a redirect anyway.
 */
const REBUILD_SLUGS: ReadonlySet<string> = new Set(['przebudowa-starej-strony'])

export function offerGroup(solution: { slug: string; category: SolutionCategory }): OfferGroup {
  return REBUILD_SLUGS.has(solution.slug) ? 'przebudowa' : CATEGORY_GROUP[solution.category]
}

/** Old `?kategoria=` words still saved in menus and links (v23) open their v24 group. */
function parseGroup(word: string | null): OfferGroup | null {
  if (!word) return null
  const group = OFFER_GROUPS.find(({ value }) => value === word)?.value
  if (group) return group
  // Own keys only: `constructor`, `__proto__` from the URL are not categories.
  return Object.hasOwn(CATEGORY_GROUP, word) ? CATEGORY_GROUP[word as SolutionCategory] : null
}

type Situation = (typeof SITUATIONS)[number]['value']
type IndustryGroup = (typeof INDUSTRY_GROUPS)[number]['value']

export type SoftwareCatalogState = {
  query: string
  /** Offer group (the URL word stays `kategoria`). */
  category: OfferGroup | null
  situation: Situation | null
  group: IndustryGroup | null
  /** Slug of the open offer window (SWR3, decyzja 1); the island checks that it exists. */
  solution: string | null
}

export const DEFAULT_CATALOG_STATE: SoftwareCatalogState = {
  query: '',
  category: null,
  situation: null,
  group: null,
  solution: null,
}

/** URL words of the situations (readable links instead of the package's letters). */
const SITUATION_PARAMS: Record<Situation, string> = {
  Z: 'od-zera',
  R: 'brakuje-czegos',
  P: 'kilka-programow',
}

const PARAM = {
  query: 'q',
  category: 'kategoria',
  situation: 'sytuacja',
  group: 'branza',
  solution: 'rozwiazanie',
} as const

export type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>

function first(params: ParamSource, name: string): string | null {
  const value = params instanceof URLSearchParams ? params.get(name) : params[name]
  const one = Array.isArray(value) ? value[0] : value
  return one?.trim() || null
}

/** The view from the URL; unknown values are dropped, never an empty catalog by mistake. */
export function parseCatalogState(params: ParamSource): SoftwareCatalogState {
  const situation = first(params, PARAM.situation)
  const group = first(params, PARAM.group)
  const solution = first(params, PARAM.solution)
  return {
    query: (first(params, PARAM.query) ?? '').slice(0, MAX_QUERY),
    category: parseGroup(first(params, PARAM.category)),
    situation:
      (Object.entries(SITUATION_PARAMS).find(([, word]) => word === situation)?.[0] as
        Situation | undefined) ?? null,
    group: INDUSTRY_GROUPS.find(({ value }) => value === group)?.value ?? null,
    solution: isSlug(solution) ? solution : null,
  }
}

/** Address of a view: defaults left out, parameters in a fixed order. */
export function catalogHref(state: SoftwareCatalogState): string {
  const params = new URLSearchParams()
  if (state.query) params.set(PARAM.query, state.query)
  if (state.category) params.set(PARAM.category, state.category)
  if (state.situation) params.set(PARAM.situation, SITUATION_PARAMS[state.situation])
  if (state.group) params.set(PARAM.group, state.group)
  if (state.solution) params.set(PARAM.solution, state.solution)
  const query = params.toString()
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH
}

type Facet = 'category' | 'situation' | 'group'

function passes(solution: IndexSolution, state: SoftwareCatalogState, skip: Facet | null) {
  return (
    (skip === 'category' || !state.category || offerGroup(solution) === state.category) &&
    (skip === 'situation' || !state.situation || solution.situations.includes(state.situation)) &&
    (skip === 'group' || !state.group || solution.industryGroups.includes(state.group))
  )
}

export type CatalogFacets = {
  /** Per value plus `all`; each facet counted with the other filters on, not itself. */
  category: Record<string, number>
  situation: Record<string, number>
  group: Record<string, number>
}

function count(
  base: IndexSolution[],
  state: SoftwareCatalogState,
  facet: Facet,
  keysOf: (solution: IndexSolution) => readonly string[],
): Record<string, number> {
  const counts: Record<string, number> = { all: 0 }
  for (const solution of base) {
    if (!passes(solution, state, facet)) continue
    counts.all = (counts.all ?? 0) + 1
    for (const key of keysOf(solution)) counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

const GROUP_RANK = new Map<OfferGroup, number>(OFFER_GROUPS.map(({ value }, i) => [value, i]))

/** The catalog order, group by group as on the board (stable within a group). */
const byGroup = (solutions: readonly IndexSolution[]) =>
  [...solutions].sort(
    (a, b) => (GROUP_RANK.get(offerGroup(a)) ?? 0) - (GROUP_RANK.get(offerGroup(b)) ?? 0),
  )

/** Results of a view (search order when searching, else group by group) and the counts. */
export function runCatalog(
  index: SolutionsIndex,
  search: PreparedSolutionSearch,
  state: SoftwareCatalogState,
): { results: IndexSolution[]; facets: CatalogFacets } {
  const base = searchSolutions(search, state.query) ?? byGroup(index.solutions)
  return {
    results: base.filter((solution) => passes(solution, state, null)),
    facets: {
      category: count(base, state, 'category', (solution) => [offerGroup(solution)]),
      situation: count(base, state, 'situation', (solution) => solution.situations),
      group: count(base, state, 'group', (solution) => solution.industryGroups),
    },
  }
}

/**
 * Only the plain catalog is indexed; every filtered view and every open window points to it
 * (spec. §5, `noindex`).
 */
export function catalogSeo(state: SoftwareCatalogState): { index: boolean; canonical: string } {
  return { index: catalogHref(state) === CATALOG_PATH, canonical: CATALOG_PATH }
}
