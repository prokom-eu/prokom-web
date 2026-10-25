import { POST_CATEGORIES } from '../catalog/options'
import type { Line } from '../tenant/lines'

export type PostCategory = (typeof POST_CATEGORIES)[number]['value']

/**
 * Lines with a news section. `/aktualnosci` is one route for all lines (ADR-012 rozstrz. 5,
 * change 22.10.2026): elsewhere it answers 404. Software is added with its look in SW11b.
 */
export const NEWS_LINES: readonly Line[] = ['biznes']

export const NEWS_PATH = '/aktualnosci'

/** Query parameter of the category view; such views are `noindex` with the list as canonical. */
export const CATEGORY_PARAM = 'kategoria'

export function hasNews(line: Line): boolean {
  return NEWS_LINES.includes(line)
}

export function postHref(slug: string): string {
  return `${NEWS_PATH}/${encodeURIComponent(slug)}`
}

export function newsListHref(category: PostCategory | null): string {
  return category ? `${NEWS_PATH}?${CATEGORY_PARAM}=${category}` : NEWS_PATH
}

export function isPostCategory(value: unknown): value is PostCategory {
  return POST_CATEGORIES.some((category) => category.value === value)
}

/** The category of `?kategoria=`; unknown, empty or missing → `null` („Wszystkie”). */
export function parseCategory(value: string | string[] | undefined): PostCategory | null {
  const first = Array.isArray(value) ? value[0] : value
  return isPostCategory(first) ? first : null
}

export function categoryLabel(value: string | null | undefined): string | null {
  return POST_CATEGORIES.find((category) => category.value === value)?.label ?? null
}

/** Filter chips: only categories with at least one published post, in the panel order. */
export function categoryChips(
  categories: readonly (string | null | undefined)[],
): { value: PostCategory; label: string }[] {
  const present = new Set(categories)
  return POST_CATEGORIES.filter(({ value }) => present.has(value)).map(({ value, label }) => ({
    value,
    label,
  }))
}
