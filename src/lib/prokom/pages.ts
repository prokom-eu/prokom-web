/**
 * Pages of the hub (spec §2, §4). Version 1 pages always exist; v1.1 pages are switched on in
 * `HubSettings.pages` once built — until then no menu, footer or search links to them (no dead
 * links, spec §2.2).
 */
export const HUB_OPTIONAL_PAGES = [
  { key: 'forHome', path: '/dla-domu', label: 'Dla domu' },
  { key: 'online', path: '/zalatw-online', label: 'Załatw online' },
  { key: 'help', path: '/pomoc', label: 'Pomoc' },
  { key: 'cooperation', path: '/wspolpraca', label: 'Współpraca' },
  { key: 'partners', path: '/partnerzy', label: 'Partnerzy' },
  { key: 'coverage', path: '/gdzie-dzialamy', label: 'Gdzie działamy' },
  { key: 'news', path: '/aktualnosci', label: 'Aktualności' },
  { key: 'sitemap', path: '/mapa-strony', label: 'Mapa strony' },
] as const

export type HubOptionalPage = (typeof HUB_OPTIONAL_PAGES)[number]['key']
export type HubPageFlags = Record<HubOptionalPage, boolean>

export const NO_OPTIONAL_PAGES: HubPageFlags = Object.fromEntries(
  HUB_OPTIONAL_PAGES.map(({ key }) => [key, false]),
) as HubPageFlags

const OPTIONAL_BY_PATH = new Map<string, HubOptionalPage>(
  HUB_OPTIONAL_PAGES.map(({ key, path }) => [path, key]),
)

/**
 * Whether a link of the hub may be shown: external addresses and v1 pages always; a v1.1 page (or
 * its subpage, `/pomoc/kasa`) only when switched on. Anchors and queries count by their path.
 */
export function isHubLinkLive(href: string, flags: HubPageFlags): boolean {
  if (!href.startsWith('/')) return true
  const path = href.split(/[?#]/)[0] ?? ''
  const top = `/${path.split('/')[1] ?? ''}`
  const key = OPTIONAL_BY_PATH.get(top)
  return key === undefined || flags[key]
}

/** Built pages of the hub for the site maps (`/mapa-strony`, `sitemap.xml`; spec §4 „Indeks”). */
const HUB_MAP_PAGES = [
  { path: '/', label: 'Strona główna' },
  { path: '/linie', label: 'Cała oferta' },
  { path: '/dla-firm', label: 'Dla firm' },
  { path: '/dla-domu', label: 'Dla domu' },
  { path: '/inwestycje-i-dostawy', label: 'Inwestycje i dostawy' },
  { path: '/wspolpraca', label: 'Współpraca' },
  { path: '/kontakt', label: 'Kontakt' },
  { path: '/o-firmie', label: 'O firmie' },
] as const

/** Hub pages for the maps: v1 always, a v1.1 page only while switched on (no 404 in the map). */
export function hubMapPages(flags: HubPageFlags): { href: string; label: string }[] {
  return HUB_MAP_PAGES.filter((page) => isHubLinkLive(page.path, flags)).map((page) => ({
    href: page.path,
    label: page.label,
  }))
}

/** Panel pages of the hub kept out of the maps and search until accepted (spec §6.13). */
export const HUB_NOINDEX_SLUGS = ['polityka-prywatnosci', 'cookies', 'dostepnosc'] as const
