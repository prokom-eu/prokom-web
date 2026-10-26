import type { IconName } from '../catalog/options'
import { formatPrice } from './price'

/**
 * Data rules of the Software phone layer (spec. §3.2): which bottom bar item is active and the
 * offer tiles of the menu sheet, priced from `SolutionAreas` (prices are [SZEF]: panel only).
 */

const pathOf = (href: string) =>
  href.startsWith('/') && !href.startsWith('//') ? (href.split(/[?#]/)[0] ?? null) : null

/**
 * Index of the bottom bar item for the address, or -1: `/` only on the start page itself,
 * other paths also on their subpages (`/rozwiazania/…` → Oferta). Anchors (`#menu`) never.
 */
export function activeTab(items: readonly (readonly [string, string])[], pathname: string): number {
  return items.findIndex(([, href]) => {
    const path = pathOf(href)
    if (!path) return false
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(`${path}/`)
  })
}

export type MenuArea = {
  name: string
  key: string
  icon: IconName | null
  priceFrom: number | null
  priceLabel: string | null
}

const ASK_FOR_QUOTE = 'Zapytaj o wycenę'

/** Price text of an area, as the panel describes its fields: label, else „od {cena} zł”. */
export function areaPriceText({
  priceFrom,
  priceLabel,
}: Pick<MenuArea, 'priceFrom' | 'priceLabel'>) {
  const label = priceLabel?.trim()
  if (label) return label
  return priceFrom !== null ? `od ${formatPrice(priceFrom)} zł` : ASK_FOR_QUOTE
}

export type MenuTile = {
  name: string
  price: string
  href: string
  /** Area key for the icon tile's gradient (`--grad-area-<key>`); `null` without an area. */
  key: string | null
  icon: IconName | null
}

/**
 * Tiles of `navigation.mobileMenu.tiles` (`[name, price, href]`) joined with the area of the
 * same name, which gives the price. Prices are [SZEF], from the areas only: without a matching
 * area (renamed in the panel) the tile asks for a quote and has no key — the frame logs it.
 */
export function menuTiles(
  tiles: readonly (readonly [string, string, string])[],
  areas: readonly MenuArea[],
): MenuTile[] {
  return tiles.map(([name, , href]) => {
    const area = areas.find((candidate) => candidate.name === name)
    return area
      ? { name, price: areaPriceText(area), href, key: area.key, icon: area.icon }
      : { name, price: ASK_FOR_QUOTE, href, key: null, icon: null }
  })
}
