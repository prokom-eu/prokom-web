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

/**
 * Logos of the salon brands in `public/instalacje/marki` (the home brand strip's files, RUNDA-V5
 * §2; Ajax from the manufacturer's site): the shared `partners` of Instalacje carry no logo yet,
 * so a salon tile falls back to these. Sizes = the files (2×).
 */
export const SALON_LOGOS: Record<string, { src: string; width: number; height: number }> = {
  dahua: { src: '/instalacje/marki/dahua.webp', width: 402, height: 120 },
  hikvision: { src: '/instalacje/marki/hikvision.webp', width: 520, height: 66 },
  satel: { src: '/instalacje/marki/satel.webp', width: 446, height: 120 },
  ajax: { src: '/instalacje/marki/ajax.webp', width: 480, height: 100 },
  bcs: { src: '/instalacje/marki/bcs.webp', width: 370, height: 120 },
}

export type HomeSalon = {
  slug: string
  name: string
  count: number
  logo: { src: string; width: number; height: number } | null
}

/**
 * Salon tiles of „Sprzęt i marki” (INST-K3): one per salon in the index order, named by its
 * brands, with the count of their listed cards and a logo (the brand's own, else `SALON_LOGOS`).
 */
export function homeSalons(index: Pick<CatalogIndex, 'brands' | 'products'>): HomeSalon[] {
  const salons = new Map<string, HomeSalon>()
  for (const brand of index.brands) {
    if (!brand.salon) continue
    const salon = salons.get(brand.salon) ?? {
      slug: brand.salon,
      name: '',
      count: 0,
      logo: null,
    }
    salon.name = salon.name ? `${salon.name} · ${brand.name}` : brand.name
    salon.count += index.products.filter((product) => product.brand === brand.slug).length
    salon.logo ??= brand.logo
      ? { src: brand.logo.url, width: brand.logo.width, height: brand.logo.height }
      : (SALON_LOGOS[brand.salon] ?? null)
    salons.set(brand.salon, salon)
  }
  return [...salons.values()]
}
