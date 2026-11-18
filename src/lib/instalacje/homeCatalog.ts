import type { CatalogIndex, IndexProduct } from '../catalog/catalogIndex'

/** Pictures in a department card of „Sprzęt i marki” (plan §3.4 INST-K2: three per card). */
export const SHOWCASE_SIZE = 3
/** Cards of „Najczęściej wybierane”. */
export const FEATURED_SIZE = 8

export type HomeDepartment = {
  slug: string
  name: string
  count: number
  href: string
  products: IndexProduct[]
}

/**
 * Departments of the home section „Sprzęt i marki” (INST-K2, D17): each with its count of listed
 * cards and the first cards with a picture (the index order = „Polecane”), linked to the offer
 * filtered by the department. A department without cards is left out.
 */
export function homeDepartments(
  index: Pick<CatalogIndex, 'groups' | 'products'>,
): HomeDepartment[] {
  return index.groups.flatMap((group) => {
    const listed = index.products.filter((product) => product.group === group.slug)
    if (listed.length === 0) return []
    return [
      {
        slug: group.slug,
        name: group.name,
        count: listed.length,
        href: `/oferta?grupa=${encodeURIComponent(group.slug)}`,
        products: listed.filter((product) => product.image).slice(0, SHOWCASE_SIZE),
      },
    ]
  })
}

/**
 * „Najczęściej wybierane”: the panel's list in its order (only listed cards — a card taken down
 * drops out), topped up with the first listed cards up to eight.
 */
export function featuredProducts(
  index: Pick<CatalogIndex, 'products'>,
  slugs: readonly string[],
): IndexProduct[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const chosen = slugs.flatMap((slug) => bySlug.get(slug) ?? [])
  const rest = index.products.filter((product) => !chosen.includes(product))
  return [...chosen, ...rest].slice(0, FEATURED_SIZE)
}
