import type { ProcurementPageData } from './schema'

/**
 * Links of the procurement pages (BIZ-3 QA): the package named categories and industries by
 * short codes („/oferta/siec”, „/branze/biura-uslugi”) the site does not have — 7 links answered
 * 404. Before rendering, an optional link of a tile to a category or industry missing on this
 * site is left out and the tile renders without a link. Only the three lists whose link is
 * optional (`categories`, `industries`, `combo`); a required link (buttons, `combo.link`) stays
 * — the page never renders a link without its address. Only the first segment is checked:
 * `/oferta/<kategoria>/<podkategoria>` counts as live while the category is listed.
 */
export type SiteTargets = {
  categories: ReadonlySet<string>
  /** Active industries only: an inactive one has no page. */
  industries: ReadonlySet<string>
}

export function isLiveHref(href: string, site: SiteTargets): boolean {
  const [, section, slug] = href.split(/[?#]/)[0]!.split('/')
  if (section === 'oferta' && slug) return site.categories.has(slug)
  if (section === 'branze' && slug) return site.industries.has(slug)
  return true
}

const withoutDeadHref = <T extends { href?: string }>(item: T, site: SiteTargets): T => {
  if (!item.href || isLiveHref(item.href, site)) return item
  const { href: _dead, ...rest } = item
  return rest as T
}

export function pruneDeadLinks(data: ProcurementPageData, site: SiteTargets): ProcurementPageData {
  return {
    ...data,
    ...(data.categories && {
      categories: {
        ...data.categories,
        list: data.categories.list.map((item) => {
          if (!item.category || site.categories.has(item.category)) return item
          const { category: _dead, ...rest } = item
          return rest
        }),
      },
    }),
    ...(data.industries && {
      industries: {
        ...data.industries,
        list: data.industries.list.map((item) => withoutDeadHref(item, site)),
      },
    }),
    ...(data.combo && {
      combo: { ...data.combo, list: data.combo.list.map((item) => withoutDeadHref(item, site)) },
    }),
  }
}
