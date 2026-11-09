/**
 * Links of the procurement pages (BIZ-3 QA): the package names categories and industries by
 * short codes („/oferta/siec”, „/branze/biura-uslugi”) that the site does not have — 7 links
 * answered 404. Before rendering, a `href` to a category or industry missing on this site and a
 * `category` the catalog does not list are left out: the tile renders without a link. Other
 * links (`/kontakt`, `#zestaw`, outside addresses) stay as they are.
 */
export type SiteTargets = {
  categories: ReadonlySet<string>
  /** Active industries only: an inactive one has no page. */
  industries: ReadonlySet<string>
}

function isLive(href: string, site: SiteTargets): boolean {
  const [, section, slug] = href.split(/[?#]/)[0]!.split('/')
  if (section === 'oferta' && slug) return site.categories.has(slug)
  if (section === 'branze' && slug) return site.industries.has(slug)
  return true
}

export function pruneDeadLinks<T>(data: T, site: SiteTargets): T {
  if (Array.isArray(data)) return data.map((item) => pruneDeadLinks(item, site)) as T
  if (typeof data !== 'object' || data === null) return data
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === 'href' && typeof value === 'string' && !isLive(value, site)) continue
    if (key === 'category' && typeof value === 'string' && !site.categories.has(value)) continue
    result[key] = pruneDeadLinks(value, site)
  }
  return result as T
}
