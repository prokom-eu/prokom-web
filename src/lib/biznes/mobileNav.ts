import { BUNDLES_PATH } from '../catalog/bundle'
import { VENDING_PATH } from '../catalog/category'
import { BRANDS_PATH, CATALOG_PATH } from '../catalog/filters'

/**
 * Address rules of the Biznes phone app (MOBILE-APLIKACJA §1): which bottom bar tab is active
 * and where „←” goes when there is no page of this site to go back to.
 */

export type BiznesTab = 'start' | 'oferta' | 'szukaj' | 'zapytanie' | 'kontakt'

export const INQUIRY_PAGE_PATH = '/zapytanie'
export const CONTACT_PATH = '/kontakt'
const PRODUCT_PATH = '/produkt'

/** Everything that is browsing the offer belongs to the Oferta tab. */
const OFFER_PATHS = [CATALOG_PATH, PRODUCT_PATH, BRANDS_PATH, BUNDLES_PATH, VENDING_PATH]

const within = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

/** Tab of the address, or `null` (Szukaj is a dialog and never follows the address). */
export function activeBiznesTab(pathname: string): BiznesTab | null {
  if (pathname === '/') return 'start'
  if (OFFER_PATHS.some((path) => within(pathname, path))) return 'oferta'
  if (within(pathname, INQUIRY_PAGE_PATH)) return 'zapytanie'
  if (within(pathname, CONTACT_PATH)) return 'kontakt'
  return null
}

/** One level up; a product has no `/produkt` page, so it goes to the catalog. */
export function parentPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length <= 1) return '/'
  if (`/${segments[0]}` === PRODUCT_PATH) return CATALOG_PATH
  return `/${segments.slice(0, -1).join('/')}`
}
