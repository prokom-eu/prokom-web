import { categoryChips, CATEGORY_PARAM, NEWS_PATH, type PostCategory } from './list'

/** Query parameter of a list page from 2 up (`?strona=2`). */
export const PAGE_PARAM = 'strona'

/**
 * Posts on one page of the list (decision 15.11: pages of 12), the featured one and the two beside
 * it included — so the first page's grid is 9 cards: three full rows of three.
 */
export const NEWS_PAGE_SIZE = 12

/** Posts beside the featured one on the first page of the whole list. */
const LATEST = 2

/**
 * The page of `?strona=`: missing → 1; a whole number from 1 written plainly ("2", not "02" or
 * "2.0") → that page; anything else → `null`, which the route answers with 404 (no second
 * address of the same list).
 */
export function parsePage(value: string | string[] | undefined): number | null {
  const first = Array.isArray(value) ? value[0] : value
  if (first === undefined) return 1
  return /^[1-9]\d{0,3}$/.test(first) ? Number(first) : null
}

/** The address of a list page: the category first, the page only from 2 up. */
export function newsPageHref(category: PostCategory | null, page: number): string {
  const query = new URLSearchParams()
  if (category) query.set(CATEGORY_PARAM, category)
  if (page > 1) query.set(PAGE_PARAM, String(page))
  const search = query.toString()
  return search ? `${NEWS_PATH}?${search}` : NEWS_PATH
}

export type NewsChip = { value: PostCategory; label: string; count: number }

export type NewsListView<T> = {
  /** Categories with posts (of the whole list, not the filter), with their counts. */
  chips: NewsChip[]
  /** Posts of the view (the category's or all), on every page. */
  total: number
  page: number
  pages: number
  /** The newest post — only on the first page of the whole list. */
  featured: T | null
  /** The next posts beside the featured one. */
  latest: T[]
  /** The grid of the page. */
  cards: T[]
}

/**
 * What one page of `/aktualnosci` shows (Software). The whole list features its newest post on
 * the first page (with two beside it); a category view is a plain grid; both in pages of 12.
 * `null` = no such page (404).
 */
export function newsListView<T extends { categoryValue: string }>(
  posts: readonly T[],
  category: PostCategory | null,
  page: number,
): NewsListView<T> | null {
  const counts = new Map<string, number>()
  for (const post of posts)
    counts.set(post.categoryValue, (counts.get(post.categoryValue) ?? 0) + 1)
  const chips = categoryChips([...counts.keys()]).map((chip) => ({
    ...chip,
    count: counts.get(chip.value) ?? 0,
  }))

  const shown = category ? posts.filter((post) => post.categoryValue === category) : posts
  const pages = Math.max(1, Math.ceil(shown.length / NEWS_PAGE_SIZE))
  if (page > pages) return null

  const onPage = shown.slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE)
  const [first, ...rest] = onPage
  const featured = !category && page === 1 && first ? first : null
  const latest = featured ? rest.slice(0, LATEST) : []
  const cards = featured ? rest.slice(LATEST) : onPage
  return {
    chips,
    total: shown.length,
    page,
    pages,
    featured,
    latest,
    cards,
  }
}
