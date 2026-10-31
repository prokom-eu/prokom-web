/**
 * „Polecane” of the offer (K36 §10, K4-FINAL §4.4). Pure functions: the server renders the first
 * view and the catalog island repeats them in the browser.
 *
 * - Plain offer: grid rows alternate between departments (one row = one department). Inside a
 *   department its top (`CatalogGroups.topProducts`, `dzTop9`) goes first, then one card from each
 *   category in turn, each category in its own order.
 * - Filtered offer: departments and categories in menu order, each category in its own order.
 * - Category order: `Products.categoryOrder` (`pop9`) first, then popularity, then index order.
 */

/** What the ordering reads of a product (`IndexProduct` has it). */
export type OrderedProduct = {
  slug: string
  group: string | null
  categories: string[]
  popularity: number
  /** `pop9`: smaller = earlier; none = after the numbered ones. */
  order?: number
}

/** Departments and categories in menu order (the index keeps the panel's `order`). */
export type OrderSource = {
  groups: { slug: string; top?: string[] }[]
  categories: { slug: string; group: string }[]
}

/** Cards in one grid row: 3 on a computer, 2 up to 1100 px (K36 §10). */
export const ROW_WIDE = 3
export const ROW_NARROW = 2
export const NARROW_ROW_QUERY = '(max-width: 1100px)'

/** Order inside a category: `pop9`, then popularity; equal ones keep their input order. */
export function compareInCategory(a: OrderedProduct, b: OrderedProduct): number {
  const rank = (product: OrderedProduct) => product.order ?? Number.POSITIVE_INFINITY
  return rank(a) - rank(b) || b.popularity - a.popularity
}

/** Index of a value in a list; unknown values go last. */
function positionIn(list: string[]): (value: string | null | undefined) => number {
  const positions = new Map(list.map((value, index) => [value, index]))
  return (value) => (value != null ? (positions.get(value) ?? list.length) : list.length)
}

/** Filtered offer: menu order of departments and categories, each category in its own order. */
export function menuOrder<T extends OrderedProduct>(products: T[], source: OrderSource): T[] {
  const group = positionIn(source.groups.map(({ slug }) => slug))
  const category = positionIn(source.categories.map(({ slug }) => slug))
  return [...products].sort(
    (a, b) =>
      group(a.group) - group(b.group) ||
      category(a.categories[0]) - category(b.categories[0]) ||
      compareInCategory(a, b),
  )
}

/** One department: its top, then one card from each category in turn. */
function departmentList<T extends OrderedProduct>(
  products: T[],
  top: string[],
  categories: string[],
): T[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const list = top.flatMap((slug) => bySlug.get(slug) ?? [])
  const used = new Set(list.map(({ slug }) => slug))
  const queues = new Map<string, T[]>()
  for (const product of products) {
    if (used.has(product.slug)) continue
    const key = product.categories[0] ?? ''
    queues.set(key, [...(queues.get(key) ?? []), product])
  }
  // Categories of the menu first, then any other (a card whose category is not listed).
  const keys = [...new Set([...categories.filter((slug) => queues.has(slug)), ...queues.keys()])]
  const sorted = keys.map((key) => [...queues.get(key)!].sort(compareInCategory))
  while (sorted.some((queue) => queue.length > 0)) {
    for (const queue of sorted) {
      const next = queue.shift()
      if (next) list.push(next)
    }
  }
  return list
}

/** Plain offer: rows of `perRow` cards, the departments taking turns. */
export function departmentRows<T extends OrderedProduct>(
  products: T[],
  source: OrderSource,
  perRow: number,
): T[] {
  const row = Math.max(1, Math.floor(perRow))
  const lists = source.groups.map(({ slug, top = [] }) =>
    departmentList(
      products.filter((product) => product.group === slug),
      top,
      source.categories.filter((category) => category.group === slug).map((c) => c.slug),
    ),
  )
  const known = new Set(source.groups.map(({ slug }) => slug))
  const result: T[] = []
  while (lists.some((list) => list.length > 0)) {
    for (const list of lists) result.push(...list.splice(0, row))
  }
  // A card without a listed department (no category yet) stays visible, at the end.
  return [
    ...result,
    ...menuOrder(
      products.filter((product) => !product.group || !known.has(product.group)),
      source,
    ),
  ]
}
