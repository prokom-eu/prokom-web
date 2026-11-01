import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import type { IconName } from '@/lib/catalog/options'

export type SiteRailItem = { href: string; label: string; icon: IconName }

/**
 * „Menu” of the side rail on Biznes subpages (K33 §2.4, board `g4rail`).
 */
export const SITE_RAIL: readonly SiteRailItem[] = [
  { href: '/', label: 'Strona główna', icon: 'home' },
  { href: '/oferta', label: 'Oferta', icon: 'store' },
  { href: '/marki', label: 'Marki', icon: 'ticket' },
  { href: CONFIGURATOR_PATH, label: 'Konfigurator', icon: 'compass' },
  { href: PLAN_PATH, label: 'Plan Twojej firmy', icon: 'map' },
  { href: '/zestawy', label: 'Gotowe zestawy', icon: 'box' },
  { href: '/opieka-it', label: 'Opieka IT', icon: 'shield' },
  { href: '/o-firmie', label: 'O firmie', icon: 'users' },
  { href: '/kontakt', label: 'Kontakt', icon: 'phone' },
]

const within = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`)

/** The rail entry of the current page (`href`), or `null` when none fits. */
export function siteRailCurrent(pathname: string): string | null {
  if (['/oferta', '/produkt'].some((base) => within(pathname, base))) return '/oferta'
  if (within(pathname, '/marki')) return '/marki'
  if (within(pathname, '/zestawy')) return '/zestawy'
  const page = SITE_RAIL.find((item) => !item.href.includes('#') && item.href === pathname)
  return page?.href ?? null
}
