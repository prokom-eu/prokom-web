import { categoryHref } from './category'
import type { CatalogIndex, IndexImage, IndexLogo } from './catalogIndex'
import { brandCount } from './filters'
import type { IconName } from './options'

/** Catalog filtered to one group (mega menu, home page department cards). */
export const groupHref = (slug: string) => `/oferta?grupa=${encodeURIComponent(slug)}`

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
      brands: brandCount(index),
      bundles: index.pages.filter((page) => page.slug.startsWith('zestawy/')).length,
    },
  }
}
