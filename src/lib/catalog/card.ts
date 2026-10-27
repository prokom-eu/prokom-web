import type { CatalogIndex, IndexProduct } from './catalogIndex'
import type { IconName } from './options'

export type BadgeTone = 'service' | 'new' | 'promo' | 'authorized'

export type ProductBadge = { label: string; tone: BadgeTone }

const MAX_BADGES = 2

/** Authorization label: the brand's status from the panel, else by kind (as in the design). */
function authorizedLabel(product: IndexProduct, brands: CatalogIndex['brands']): string {
  const status = brands.find((brand) => brand.slug === product.brand)?.status
  if (status === 'authorized-partner') return 'Autoryzowany partner'
  if (status === 'authorized-service') return 'Autoryzowany serwis'
  return product.kind === 'software' ? 'Autoryzowany partner' : 'Autoryzowany serwis'
}

/**
 * Badges on a product card (spec. §5.3): Usługa, Nowość, the marketing badge, then the
 * authorization if there is room — at most two.
 */
export function productBadges(
  product: IndexProduct,
  brands: CatalogIndex['brands'],
): ProductBadge[] {
  const badges: ProductBadge[] = []
  if (product.kind === 'service') badges.push({ label: 'Usługa', tone: 'service' })
  if (product.isNew) badges.push({ label: 'Nowość', tone: 'new' })
  if (product.badge) badges.push({ label: product.badge, tone: 'promo' })
  if (product.authorized && badges.length < MAX_BADGES) {
    badges.push({ label: authorizedLabel(product, brands), tone: 'authorized' })
  }
  return badges.slice(0, MAX_BADGES)
}

/** Address of a product page (B6). */
export const productHref = (slug: string) => `/produkt/${encodeURIComponent(slug)}`

/**
 * Icon of a product without a photo (`StageFallback` on the studio, K31-ZMIANY §4.10): the icon
 * of its main category, else of its group.
 */
export function cardIcon(
  product: IndexProduct,
  index: Pick<CatalogIndex, 'categories' | 'groups'>,
): IconName {
  const category = index.categories.find((item) => item.slug === product.categories[0])
  const group = index.groups.find((item) => item.slug === product.group)
  return category?.icon ?? group?.icon ?? 'store'
}
