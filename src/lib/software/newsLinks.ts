import { NEWS_PATH } from '../posts/list'

const isNewsHref = (href: unknown): boolean =>
  typeof href === 'string' &&
  (href.split(/[?#]/)[0] === NEWS_PATH || href.startsWith(`${NEWS_PATH}/`))

/** A link of the navigation JSON: a `{ href }` item or a `[label, href, …]` tuple. */
const isNewsLink = (item: unknown): boolean =>
  Array.isArray(item)
    ? isNewsHref(item[1])
    : !!item && typeof item === 'object' && isNewsHref((item as { href?: unknown }).href)

/**
 * The Software navigation without links to „Aktualności” (header, phone menu, footer) — used
 * while the tenant has no published post, so no menu leads to an empty list (SWV8 P0 #3). The
 * whole JSON is walked, like `withoutIndustryLinks`; anything else stays as it is.
 */
export function withoutNewsLinks<T>(value: T): T {
  return walk(value) as T
}

function walk(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter((item) => !isNewsLink(item)).map(walk)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item)]))
  }
  return value
}
