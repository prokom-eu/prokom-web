import { searchProducts, type PreparedSearch } from '../search'
import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { departmentRows, menuOrder, ROW_WIDE } from './order'

/**
 * Filters of the catalog `/oferta` (spec. §5, §8.3): the state lives only in the URL, so a link
 * or a refresh shows the same view. Pure functions — the page renders the first view on the
 * server and the island repeats the same code in the browser.
 */

export const CATALOG_PATH = '/oferta'

/** Page of all brands (K33 §6). */
export const BRANDS_PATH = '/marki'

/** „Pokaż kolejne” adds this many (K33 §4: 24 — whole rows of 3 and of 2). */
export const CATALOG_PAGE_SIZE = 24

/**
 * The company's own services are listed under the PRO-KOM brand: not a manufacturer, so it is
 * left out of the brand filter and the brand count (as in the design). Slug from the seed.
 * TODO(krystian): a changed slug of this brand in the panel puts PRO-KOM back in the filter.
 */
export const OWN_BRAND_SLUG = 'pro-kom'

/** Longest search phrase read from the URL. */
const MAX_QUERY = 100

export type CatalogKind = IndexProduct['kind']
export type CatalogSort = 'popular' | 'new' | 'az'
export type CatalogView = 'grid' | 'list'

export type CatalogState = {
  query: string
  kind: CatalogKind | null
  group: string | null
  categories: string[]
  brands: string[]
  industries: string[]
  authorized: boolean
  isNew: boolean
  sort: CatalogSort
  view: CatalogView
  /** Pages shown so far: page N lists the first N × 12. */
  page: number
}

export const DEFAULT_STATE: CatalogState = {
  query: '',
  kind: null,
  group: null,
  categories: [],
  brands: [],
  industries: [],
  authorized: false,
  isNew: false,
  sort: 'popular',
  view: 'grid',
  page: 1,
}

/** Polish values in the URL; labels for the radio list and the chips. */
export const KINDS: readonly { value: CatalogKind; param: string; label: string }[] = [
  { value: 'device', param: 'urzadzenia', label: 'Urządzenia' },
  { value: 'software', param: 'oprogramowanie', label: 'Oprogramowanie' },
  { value: 'service', param: 'uslugi', label: 'Usługi' },
]

export const SORTS: readonly { value: CatalogSort; param: string; label: string }[] = [
  { value: 'popular', param: 'polecane', label: 'Polecane' },
  { value: 'new', param: 'nowosci', label: 'Nowości' },
  { value: 'az', param: 'a-z', label: 'A–Z' },
]

const VIEW_LIST_PARAM = 'lista'
const FLAG_ON = '1'

const PARAM = {
  query: 'szukaj',
  kind: 'rodzaj',
  group: 'grupa',
  categories: 'kategoria',
  brands: 'marka',
  industries: 'branza',
  authorized: 'autoryzacja',
  isNew: 'nowosci',
  sort: 'sortuj',
  view: 'widok',
  page: 'strona',
} as const satisfies Record<keyof CatalogState, string>

/** `URLSearchParams` in the browser, the `searchParams` object of a Next page on the server. */
export type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>

function rawValues(params: ParamSource, name: string): string[] {
  return params instanceof URLSearchParams
    ? params.getAll(name)
    : ([] as string[]).concat(params[name] ?? [])
}

/** Every value of a parameter: repeated (`?marka=a&marka=b`) or comma-separated (`a,b`). */
function allValues(params: ParamSource, name: string): string[] {
  return rawValues(params, name)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
}

const firstValue = (params: ParamSource, name: string) => allValues(params, name)[0] ?? ''

/** Values that exist in the index, without repeats, in the URL's order. */
function known(values: string[], allowed: Set<string>): string[] {
  return [...new Set(values)].filter((value) => allowed.has(value))
}

/**
 * The view from the URL. Unknown slugs and values are dropped: an old link or a typo shows
 * the catalog without that filter, not an empty list.
 */
export function parseCatalogState(
  params: ParamSource,
  index: Pick<CatalogIndex, 'groups' | 'categories' | 'brands' | 'industries'>,
): CatalogState {
  const slugs = (list: { slug: string }[]) => new Set(list.map((item) => item.slug))
  const rawGroup = firstValue(params, PARAM.group)
  const group = slugs(index.groups).has(rawGroup) ? rawGroup : null
  // With a group, the panel lists only its categories: another one could not be unticked.
  const categories = index.categories.filter((category) => !group || category.group === group)
  const page = Number(firstValue(params, PARAM.page))
  return {
    // The phrase may hold commas: the raw first value, not split.
    query: (rawValues(params, PARAM.query)[0] ?? '').trim().slice(0, MAX_QUERY),
    kind: KINDS.find((kind) => kind.param === firstValue(params, PARAM.kind))?.value ?? null,
    group,
    categories: known(allValues(params, PARAM.categories), slugs(categories)),
    brands: known(allValues(params, PARAM.brands), slugs(index.brands)),
    industries: known(allValues(params, PARAM.industries), slugs(index.industries)),
    authorized: firstValue(params, PARAM.authorized) === FLAG_ON,
    isNew: firstValue(params, PARAM.isNew) === FLAG_ON,
    sort: SORTS.find((sort) => sort.param === firstValue(params, PARAM.sort))?.value ?? 'popular',
    view: firstValue(params, PARAM.view) === VIEW_LIST_PARAM ? 'list' : 'grid',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/** Query string of a view (without `?`), defaults left out; `''` for the plain catalog. */
export function catalogQueryString(state: CatalogState): string {
  const params = new URLSearchParams()
  const set = (name: string, value: string | false | null) => {
    if (value) params.set(name, value)
  }
  set(PARAM.query, state.query.trim())
  set(PARAM.kind, KINDS.find((kind) => kind.value === state.kind)?.param ?? null)
  set(PARAM.group, state.group)
  set(PARAM.categories, state.categories.join(','))
  set(PARAM.brands, state.brands.join(','))
  set(PARAM.industries, state.industries.join(','))
  set(PARAM.authorized, state.authorized && FLAG_ON)
  set(PARAM.isNew, state.isNew && FLAG_ON)
  set(PARAM.sort, state.sort !== 'popular' && SORTS.find((s) => s.value === state.sort)!.param)
  set(PARAM.view, state.view === 'list' && VIEW_LIST_PARAM)
  set(PARAM.page, state.page > 1 && String(state.page))
  return params.toString()
}

export const catalogHref = (state: CatalogState) => {
  const query = catalogQueryString(state)
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH
}

/**
 * The next view after a change. A new filter, phrase or sort starts again from page 1 —
 * the list is a different one; the view switch and „Pokaż kolejne” keep it.
 */
export function updateState(state: CatalogState, change: Partial<CatalogState>): CatalogState {
  const keepsPage = Object.keys(change).every((key) => key === 'page' || key === 'view')
  return { ...state, ...(keepsPage ? {} : { page: 1 }), ...change }
}

type Facet = 'kind' | 'group' | 'categories' | 'brands' | 'industries' | 'authorized' | 'isNew'

/**
 * Does the product pass every filter but `skip` (for that filter's own counts)? Skipping the
 * group skips its categories too: a group tile clears them (`Catalog`), so its count must not
 * hold them either.
 */
function passes(product: IndexProduct, state: CatalogState, skip?: Facet): boolean {
  const anyOf = (selected: string[], values: string[]) =>
    selected.length === 0 || selected.some((value) => values.includes(value))
  return (
    (skip === 'kind' || !state.kind || product.kind === state.kind) &&
    (skip === 'group' || !state.group || product.group === state.group) &&
    (skip === 'categories' || skip === 'group' || anyOf(state.categories, product.categories)) &&
    (skip === 'brands' || anyOf(state.brands, product.brand ? [product.brand] : [])) &&
    (skip === 'industries' || anyOf(state.industries, product.industries)) &&
    (skip === 'authorized' || !state.authorized || product.authorized) &&
    (skip === 'isNew' || !state.isNew || product.isNew)
  )
}

export type CatalogFacets = {
  kinds: Record<CatalogKind | 'all', number>
  /** `all` = the „Wszystko” tile. */
  groups: Record<string, number>
  categories: Record<string, number>
  brands: Record<string, number>
  industries: Record<string, number>
  authorized: number
  isNew: number
}

export type CatalogResult = {
  /** Every match, sorted. */
  results: IndexProduct[]
  /** What the page shows: the first `page × 12`. */
  visible: IndexProduct[]
  facets: CatalogFacets
}

/** Index data „Polecane” needs: departments with their tops and categories in menu order. */
type OrderIndex = Pick<CatalogIndex, 'products' | 'groups' | 'categories'>

/** Any filter on (not the phrase, sort or view): „Polecane” then follows the menu (K36 §10). */
const filtered = (state: CatalogState) =>
  Boolean(
    state.kind ||
    state.group ||
    state.categories.length ||
    state.brands.length ||
    state.industries.length ||
    state.authorized ||
    state.isNew,
  )

function sortProducts(
  products: IndexProduct[],
  state: CatalogState,
  index: OrderIndex,
  perRow: number,
): IndexProduct[] {
  if (state.sort === 'popular') {
    return filtered(state) ? menuOrder(products, index) : departmentRows(products, index, perRow)
  }
  const byPopularity = (a: IndexProduct, b: IndexProduct) => b.popularity - a.popularity
  const compare: Record<
    Exclude<CatalogSort, 'popular'>,
    (a: IndexProduct, b: IndexProduct) => number
  > = {
    new: (a, b) => Number(b.isNew) - Number(a.isNew) || byPopularity(a, b),
    az: (a, b) => a.name.localeCompare(b.name, 'pl'),
  }
  // Stable sort: equal products keep the index order.
  return [...products].sort(compare[state.sort])
}

function count(
  base: IndexProduct[],
  state: CatalogState,
  skip: Facet,
  keys: (product: IndexProduct) => readonly (string | null)[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const product of base) {
    if (!passes(product, state, skip)) continue
    for (const key of new Set(keys(product))) {
      if (key) counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}

/**
 * Results and counts of a view. `perRow`: cards in a grid row, for the department rows of the
 * plain offer (`ROW_NARROW` up to 1100 px). Facet counts follow spec. §8.3: each filter group is counted
 * with every other filter applied but not itself, so a count says how many the click shows.
 */
export function runCatalog(
  index: OrderIndex,
  search: PreparedSearch,
  state: CatalogState,
  { perRow = ROW_WIDE }: { perRow?: number } = {},
): CatalogResult {
  const found = state.query ? searchProducts(search, state.query) : null
  const base = found ?? index.products
  const matching = base.filter((product) => passes(product, state))
  // With a phrase, „Polecane” keeps the search's own order (best match first).
  const results =
    found && state.sort === 'popular' ? matching : sortProducts(matching, state, index, perRow)
  return {
    results,
    visible: results.slice(0, state.page * CATALOG_PAGE_SIZE),
    facets: {
      kinds: {
        device: 0,
        software: 0,
        service: 0,
        ...count(base, state, 'kind', (product) => [product.kind]),
        all: base.filter((product) => passes(product, state, 'kind')).length,
      },
      groups: {
        ...count(base, state, 'group', (product) => [product.group]),
        all: base.filter((product) => passes(product, state, 'group')).length,
      },
      categories: count(base, state, 'categories', (product) => product.categories),
      brands: count(base, state, 'brands', (product) => [product.brand]),
      industries: count(base, state, 'industries', (product) => product.industries),
      authorized: base.filter((p) => p.authorized && passes(p, state, 'authorized')).length,
      isNew: base.filter((p) => p.isNew && passes(p, state, 'isNew')).length,
    },
  }
}

export type ActiveFilter = { key: string; label: string; remove: Partial<CatalogState> }

/** Chips above the list (spec. §5.2): one per active filter, with the change that removes it. */
export function activeFilters(
  state: CatalogState,
  index: Pick<CatalogIndex, 'groups' | 'categories' | 'brands' | 'industries'>,
): ActiveFilter[] {
  const name = (list: { slug: string; name: string }[], slug: string) =>
    list.find((item) => item.slug === slug)?.name ?? slug
  const without = (list: string[], value: string) => list.filter((item) => item !== value)
  const chips: ActiveFilter[] = []
  if (state.query) chips.push({ key: 'query', label: `„${state.query}”`, remove: { query: '' } })
  const kind = KINDS.find((item) => item.value === state.kind)
  if (kind) chips.push({ key: 'kind', label: kind.label, remove: { kind: null } })
  if (state.group) {
    chips.push({ key: 'group', label: name(index.groups, state.group), remove: { group: null } })
  }
  for (const slug of state.categories) {
    chips.push({
      key: `category:${slug}`,
      label: name(index.categories, slug),
      remove: { categories: without(state.categories, slug) },
    })
  }
  for (const slug of state.brands) {
    chips.push({
      key: `brand:${slug}`,
      label: name(index.brands, slug),
      remove: { brands: without(state.brands, slug) },
    })
  }
  for (const slug of state.industries) {
    chips.push({
      key: `industry:${slug}`,
      label: name(index.industries, slug),
      remove: { industries: without(state.industries, slug) },
    })
  }
  if (state.authorized) {
    chips.push({ key: 'authorized', label: 'Autoryzacja PRO-KOM', remove: { authorized: false } })
  }
  if (state.isNew) chips.push({ key: 'isNew', label: 'Nowości', remove: { isNew: false } })
  return chips
}

/**
 * Every filter off, the sort and the view kept. `keepQuery`: the panel's „Wyczyść” clears only
 * the filters it shows, not the phrase of the search box.
 */
export function clearFilters(
  state: CatalogState,
  { keepQuery = false }: { keepQuery?: boolean } = {},
): CatalogState {
  return {
    ...DEFAULT_STATE,
    query: keepQuery ? state.query : '',
    sort: state.sort,
    view: state.view,
  }
}

/**
 * Robots and canonical of a view (ADR-012 §2.2): `/oferta` and its pages are indexed, the page
 * pointing to itself; a filter, phrase, sort or view switch gives a copy of the same products —
 * `noindex, follow` with the canonical of the plain catalog. A page past the end shows the same
 * as the last one, so it points there. `total` = positions of the plain catalog.
 */
export function catalogSeo(
  state: CatalogState,
  total: number,
): { index: boolean; canonical: string } {
  const onlyPage = catalogQueryString({ ...state, page: 1 }) === ''
  if (!onlyPage) return { index: false, canonical: CATALOG_PATH }
  const lastPage = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE))
  return { index: true, canonical: catalogHref({ ...state, page: Math.min(state.page, lastPage) }) }
}
