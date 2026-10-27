import { INDUSTRY_GROUPS, SITUATIONS, SOLUTION_CATEGORIES, type SolutionCategory } from './options'
import { searchSolutions, type PreparedSolutionSearch } from './search'
import type { IndexSolution, SolutionsIndex } from './solutionsIndex'

/**
 * Filters of the Software catalog `/rozwiazania` (spec. §5): the state lives only in the URL, so a
 * link, a refresh or the menu search (`?q=`) shows the same view. Pure functions — the page
 * renders the first view on the server and the island repeats the same code in the browser (the
 * Biznes pattern, `lib/catalog/filters.ts`). One value per filter, as on the board.
 */

export const CATALOG_PATH = '/rozwiazania'

/** Longest search phrase read from the URL. */
const MAX_QUERY = 100

type Situation = (typeof SITUATIONS)[number]['value']
type IndustryGroup = (typeof INDUSTRY_GROUPS)[number]['value']

export type SoftwareCatalogState = {
  query: string
  category: SolutionCategory | null
  situation: Situation | null
  group: IndustryGroup | null
  /** Only solutions with a live preview. */
  preview: boolean
}

export const DEFAULT_CATALOG_STATE: SoftwareCatalogState = {
  query: '',
  category: null,
  situation: null,
  group: null,
  preview: false,
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
  preview: 'podglad',
} as const

export type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>

function first(params: ParamSource, name: string): string | null {
  const value = params instanceof URLSearchParams ? params.get(name) : params[name]
  const one = Array.isArray(value) ? value[0] : value
  return one?.trim() || null
}

/** The view from the URL; unknown values are dropped, never an empty catalog by mistake. */
export function parseCatalogState(params: ParamSource): SoftwareCatalogState {
  const category = first(params, PARAM.category)
  const situation = first(params, PARAM.situation)
  const group = first(params, PARAM.group)
  return {
    query: (first(params, PARAM.query) ?? '').slice(0, MAX_QUERY),
    category: SOLUTION_CATEGORIES.find(({ value }) => value === category)?.value ?? null,
    situation:
      (Object.entries(SITUATION_PARAMS).find(([, word]) => word === situation)?.[0] as
        Situation | undefined) ?? null,
    group: INDUSTRY_GROUPS.find(({ value }) => value === group)?.value ?? null,
    preview: first(params, PARAM.preview) === '1',
  }
}

/** Address of a view: defaults left out, parameters in a fixed order. */
export function catalogHref(state: SoftwareCatalogState): string {
  const params = new URLSearchParams()
  if (state.query) params.set(PARAM.query, state.query)
  if (state.category) params.set(PARAM.category, state.category)
  if (state.situation) params.set(PARAM.situation, SITUATION_PARAMS[state.situation])
  if (state.group) params.set(PARAM.group, state.group)
  if (state.preview) params.set(PARAM.preview, '1')
  const query = params.toString()
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH
}

/** Number of active filters besides the category and the query — the phone's „Filtry (n)”. */
export const sheetFilterCount = (state: SoftwareCatalogState) =>
  (state.situation ? 1 : 0) + (state.group ? 1 : 0) + (state.preview ? 1 : 0)

type Facet = 'category' | 'situation' | 'group' | 'preview'

function passes(solution: IndexSolution, state: SoftwareCatalogState, skip: Facet | null) {
  return (
    (skip === 'category' || !state.category || solution.category === state.category) &&
    (skip === 'situation' || !state.situation || solution.situations.includes(state.situation)) &&
    (skip === 'group' || !state.group || solution.industryGroups.includes(state.group)) &&
    (skip === 'preview' || !state.preview || solution.hasLivePreview)
  )
}

export type CatalogFacets = {
  /** Per value plus `all`; each facet counted with the other filters on, not itself. */
  category: Record<string, number>
  situation: Record<string, number>
  group: Record<string, number>
  /** Solutions with a live preview under the other filters. */
  preview: number
}

function count(
  base: IndexSolution[],
  state: SoftwareCatalogState,
  facet: Exclude<Facet, 'preview'>,
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

/** Results of a view (search order when searching, else the catalog order) and the counts. */
export function runCatalog(
  index: SolutionsIndex,
  search: PreparedSolutionSearch,
  state: SoftwareCatalogState,
): { results: IndexSolution[]; facets: CatalogFacets } {
  const base = searchSolutions(search, state.query) ?? index.solutions
  return {
    results: base.filter((solution) => passes(solution, state, null)),
    facets: {
      category: count(base, state, 'category', (solution) => [solution.category]),
      situation: count(base, state, 'situation', (solution) => solution.situations),
      group: count(base, state, 'group', (solution) => solution.industryGroups),
      preview: base.filter(
        (solution) => passes(solution, state, 'preview') && solution.hasLivePreview,
      ).length,
    },
  }
}

/** Only the plain catalog is indexed; every filtered view points to it (spec. §5, `noindex`). */
export function catalogSeo(state: SoftwareCatalogState): { index: boolean; canonical: string } {
  return { index: catalogHref(state) === CATALOG_PATH, canonical: CATALOG_PATH }
}
