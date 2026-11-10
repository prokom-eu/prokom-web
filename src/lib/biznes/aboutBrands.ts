import { brandTarget } from '@/lib/catalog/brand'
import type { CatalogIndex, IndexLogo } from '@/lib/catalog/catalogIndex'
import { k4Rank, partnerStatusLabel } from '@/lib/partners/badges'
import type { Partner } from '@/payload-types'

export type AboutBrand = { slug: string; name: string; logo: IndexLogo; href: string | null }
export type AboutBrandRow = { label: string; brands: AboutBrand[] }

/** Status rows in the order of K4-FINAL §1 — the only statuses Biznes may show. */
const ROWS: readonly NonNullable<Partner['partnerStatus']>[] = [
  'authorized-service',
  'authorized-partner',
  'partner',
  'cooperation',
]

/**
 * „Marki, które sprzedajemy, wdrażamy i serwisujemy” of O firmie (Web-o-firmie): a row per status
 * confirmed in the panel (`Partners.partnerStatus`) and the wall of the other catalog brands with
 * a logo. A brand without a logo is left out (a name alone is not a logo wall); a link only where
 * the brand has its salon or page (`brandTarget`).
 */
export function aboutBrands(brands: CatalogIndex['brands']): {
  rows: AboutBrandRow[]
  others: AboutBrand[]
} {
  const withLogo = brands.flatMap(
    (brand): (AboutBrand & { status: Partner['partnerStatus'] | null })[] =>
      brand.logo
        ? [
            {
              slug: brand.slug,
              name: brand.name,
              logo: brand.logo,
              href: brandTarget(brand),
              status: brand.status ?? null,
            },
          ]
        : [],
  )
  const strip = ({
    status: _status,
    ...brand
  }: AboutBrand & { status: Partner['partnerStatus'] | null }) => brand
  const rows = ROWS.flatMap((status): AboutBrandRow[] => {
    const label = partnerStatusLabel(status)
    const items = withLogo
      .filter((brand) => brand.status === status)
      .sort((a, b) => k4Rank(a.slug) - k4Rank(b.slug) || a.name.localeCompare(b.name, 'pl'))
      .map(strip)
    return label && items.length > 0 ? [{ label, brands: items }] : []
  })
  const others = withLogo
    .filter((brand) => !brand.status || !ROWS.includes(brand.status))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
    .map(strip)
  return { rows, others }
}
