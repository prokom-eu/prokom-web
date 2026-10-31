import type { PublicBiznesNavigation } from '../site/navigation'
import { categoryHref, subcategoryHref } from './category'
import type { CatalogIndex, IndexImage, IndexLogo } from './catalogIndex'
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

export type OfferCategory = { label: string; href: string; count: number; image?: IndexImage }

export type OfferDepartment = {
  slug: string
  name: string
  icon: IconName
  gradient: [string, string]
  description: string | null
  href: string
  /** Listed products of the department (its categories may share a product — counted once). */
  count: number
  categories: OfferCategory[]
  /** „Marki w dziale”: up to 6 brands with a logo, most products first. */
  brands: { slug: string; name: string; logo: IndexLogo }[]
}

export type OfferMenu = {
  departments: OfferDepartment[]
  totals: { products: number; brands: number; bundles: number }
}

/** Brand logos shown under the categories of a department (K35 7a, v147c). */
export const OFFER_BRANDS_PER_DEPARTMENT = 6

/**
 * Oferta ▾ of K4 (K35 7a, mega menu v147c): departments → categories with a product picture and
 * count → brands of the department. The picture of a category: its featured product first,
 * then the most popular one with a photo.
 */
export function offerMenu(
  index: Pick<CatalogIndex, 'products' | 'brands' | 'groups' | 'categories' | 'pages'>,
): OfferMenu {
  // Featured first (lower order wins), then the more popular one.
  const byPick = (a: CatalogIndex['products'][number], b: CatalogIndex['products'][number]) =>
    (a.featuredOrder ?? Number.POSITIVE_INFINITY) - (b.featuredOrder ?? Number.POSITIVE_INFINITY) ||
    b.popularity - a.popularity
  const departments = index.groups.map((group): OfferDepartment => {
    const products = index.products.filter((product) => product.group === group.slug)
    const categories = index.categories
      .filter((category) => category.group === group.slug)
      .map((category): OfferCategory => {
        const pictured = products
          .filter((product) => product.image && product.categories.includes(category.slug))
          .sort(byPick)[0]
        return {
          label: category.name,
          href: categoryHref(category.slug),
          count: category.count,
          ...(pictured?.image && { image: pictured.image }),
        }
      })
    const perBrand = new Map<string, number>()
    for (const product of products) {
      if (product.brand) perBrand.set(product.brand, (perBrand.get(product.brand) ?? 0) + 1)
    }
    const brands = index.brands
      .flatMap((brand) =>
        brand.logo && perBrand.has(brand.slug)
          ? [{ slug: brand.slug, name: brand.name, logo: brand.logo }]
          : [],
      )
      .sort(
        (a, b) =>
          perBrand.get(b.slug)! - perBrand.get(a.slug)! || a.name.localeCompare(b.name, 'pl'),
      )
      .slice(0, OFFER_BRANDS_PER_DEPARTMENT)
    return {
      slug: group.slug,
      name: group.name,
      icon: group.icon,
      gradient: group.gradient,
      description: group.description ?? null,
      href: groupHref(group.slug),
      count: products.length,
      categories,
      brands,
    }
  })
  return {
    departments,
    totals: {
      products: index.products.length,
      brands: index.brands.length,
      bundles: index.pages.filter((page) => page.slug.startsWith('zestawy/')).length,
    },
  }
}
