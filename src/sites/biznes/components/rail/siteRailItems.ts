import type { IconName } from '@/lib/catalog/options'

export type SiteRailItem = { href: string; label: string; icon: IconName }

/**
 * „Menu” of the side rail on Biznes subpages (K33 §2.4, board `g4rail`). Temporary addresses
 * like in the header: Konfigurator → `/kreator` until K4g, Plan → `/#plan` until K31d′;
 * „Marki” joins with `/marki` (K4f).
 */
export const SITE_RAIL: readonly SiteRailItem[] = [
  { href: '/', label: 'Strona główna', icon: 'home' },
  { href: '/oferta', label: 'Oferta', icon: 'store' },
  // TODO(krystian): /konfigurator after K4g, „Marki” (/marki) after K4f.
  { href: '/kreator', label: 'Konfigurator', icon: 'compass' },
  { href: '/#plan', label: 'Plan Twojej firmy', icon: 'map' },
  { href: '/zestawy', label: 'Gotowe zestawy', icon: 'box' },
  { href: '/opieka-it', label: 'Opieka IT', icon: 'shield' },
  { href: '/o-firmie', label: 'O firmie', icon: 'users' },
  { href: '/kontakt', label: 'Kontakt', icon: 'phone' },
]

const within = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`)

/** The rail entry of the current page (`href`), or `null` when none fits. */
export function siteRailCurrent(pathname: string): string | null {
  if (['/oferta', '/produkt', '/marki'].some((base) => within(pathname, base))) return '/oferta'
  if (within(pathname, '/zestawy')) return '/zestawy'
  const page = SITE_RAIL.find((item) => !item.href.includes('#') && item.href === pathname)
  return page?.href ?? null
}
