import type { PublicBiznesNavigation } from '../site/navigation'
import { categoryHref, subcategoryHref } from './category'
import type { CatalogIndex } from './catalogIndex'
import type { IconName } from './options'

export type MegaMenuItem = {
  label: string
  href: string
  count?: number
  badge?: string
  /** Subcategory pages under the category (K3b′, e.g. Laptopy, Monitory). */
  sub?: MegaMenuItem[]
}

export type MegaMenuColumn = {
  slug: string
  name: string
  icon: IconName
  gradient: [string, string]
  href: string
  items: MegaMenuItem[]
  /** "Wszystkie w grupie →" when categories did not fit; `hidden` = how many. */
  more: { href: string; hidden: number } | null
}

export type MegaMenu = {
  columns: MegaMenuColumn[]
  total: { products: number; brands: number }
}

/** Catalog filtered to one group (mega menu, home page department cards). */
export const groupHref = (slug: string) => `/oferta?grupa=${encodeURIComponent(slug)}`

/**
 * Columns of the Oferta mega menu (spec. §3.2): one per group of the catalog index, which
 * already holds only categories with published products (ADR-012, rozstrzygnięcie 7). The
 * column limit counts every row, highlights included — fewer rows, not a smaller font. The
 * subcategory pages under a category (K3-KATALOG §9) go with it and are not counted: a hidden
 * category hides them too.
 */
export function megaMenu(
  index: Pick<CatalogIndex, 'products' | 'brands' | 'groups' | 'categories'>,
  navigation: Pick<PublicBiznesNavigation, 'columnLimit' | 'highlights'>,
): MegaMenu {
  const columns = index.groups.map((group) => {
    const href = groupHref(group.slug)
    const highlights: MegaMenuItem[] = navigation.highlights
      .filter((item) => item.group === group.slug)
      .map(({ label, href: link, badge }) => ({ label, href: link, ...(badge && { badge }) }))
    const categories: MegaMenuItem[] = index.categories
      .filter((category) => category.group === group.slug)
      .map(({ name, slug, count, subcategories }) => {
        const sub = (subcategories ?? []).flatMap((item) =>
          item.slug
            ? [{ label: item.name, href: subcategoryHref(slug, item.slug), count: item.count }]
            : [],
        )
        return { label: name, href: categoryHref(slug), count, ...(sub.length > 0 && { sub }) }
      })
    const room = Math.max(navigation.columnLimit - highlights.length, 0)
    const hidden = Math.max(categories.length - room, 0)
    return {
      slug: group.slug,
      name: group.name,
      icon: group.icon,
      gradient: group.gradient,
      href,
      items: [...highlights, ...categories.slice(0, room)],
      more: hidden > 0 ? { href, hidden } : null,
    }
  })
  return { columns, total: { products: index.products.length, brands: index.brands.length } }
}
