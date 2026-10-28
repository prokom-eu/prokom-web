/**
 * Fixed option lists of the Biznes catalog (ADR-012). They are database enums, so a new
 * value needs a migration — fine for lists that change with the design, not with the content.
 */

/**
 * Line icons of the design, one set for every line (ADR-014 rozstrz. 8): Biznes
 * (`seed/prokombiznes/ikony.json`, B2) and Software (`seed/prokomsoftware/ikony.json`, SW3).
 */
export const ICON_NAMES = [
  'shield',
  'cal',
  'users',
  'store',
  'bolt',
  'doc',
  'life',
  'arrow',
  'check',
  'phone',
  'mail',
  'pin',
  'clock',
  'monitor',
  'remote',
  'bell',
  'wallet',
  'chat',
  'wrench',
  'rocket',
  'map',
  'star',
  'q',
  'flash',
  'grad',
  'server',
  'compass',
  // Software (`seed/prokomsoftware/ikony.json`, SW3).
  'panel',
  'site',
  'grid',
  'plug',
  'ticket',
  'lifebuoy',
  'chart',
  'sign',
  'cash',
  'search',
  'x',
  'bed',
  'food',
  'refresh',
  'globe',
  'box',
  'car',
  'home',
  'mountain',
  'heart',
  'bag',
  'card',
  'target',
  'key',
  'mega',
  'mount',
  'brief',
] as const

export type IconName = (typeof ICON_NAMES)[number]

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && (ICON_NAMES as readonly string[]).includes(value)
}

export const ICON_OPTIONS = ICON_NAMES.map((name) => ({ label: name, value: name }))

export const PRODUCT_KINDS = [
  { label: 'Urządzenie', value: 'device' },
  { label: 'Program', value: 'software' },
  { label: 'Usługa', value: 'service' },
] as const

/** `typ_kasy` in the seed; the cash-register picker of the category page (spec. §6.1). */
export const REGISTER_TYPES = [
  { label: 'Mobilna / na baterii', value: 'mobile' },
  { label: 'Mała, do lady', value: 'small' },
  { label: 'Systemowa, do dużego sklepu', value: 'system' },
  { label: 'Z ekranem dotykowym', value: 'touch' },
] as const

/** `status_tresci` in the seed (katalog v2): a temporary description from the source sheet. */
export const CONTENT_STATUSES = [
  { label: 'Gotowe', value: 'ready' },
  { label: 'Do sprawdzenia', value: 'needs-review' },
] as const

/**
 * Areas of ready bundles = filter chips of `/zestawy` (K3c; board `Web-Zestawy-1440`: 8 areas —
 * backups belong to „Biuro i usługi”). The import maps the bundle `seria` onto an area.
 */
export const BUNDLE_AREAS = [
  { label: 'Sklep', value: 'sklep' },
  { label: 'Gastronomia', value: 'gastronomia' },
  { label: 'Noclegi', value: 'noclegi' },
  { label: 'Biuro i usługi', value: 'biuro' },
  { label: 'Gabinet', value: 'gabinet' },
  { label: 'Szkoła', value: 'szkola' },
  { label: 'Sieć i Wi-Fi', value: 'siec' },
  { label: 'Ekrany', value: 'ekrany' },
] as const

export type BundleArea = (typeof BUNDLE_AREAS)[number]['value']

/** `partia` in the seed (katalog v2): content planning only — every batch is in the catalog. */
export const CONTENT_BATCHES = [
  { label: 'Na start', value: '0' },
  { label: 'Partia 1', value: '1' },
  { label: 'Partia 2', value: '2' },
] as const

/** `rodzaje_firm[].id` in `seed/prokombiznes/kreator.json` (ADR-012, rozstrzygnięcie 8). */
export const WIZARD_BUSINESS_TYPES = [
  { label: 'Sklep', value: 'sklep' },
  { label: 'Gastronomia', value: 'gastro' },
  { label: 'Pensjonat lub hotel', value: 'hotel' },
  { label: 'Biuro i usługi', value: 'biuro' },
  { label: 'Warsztat lub serwis', value: 'warsztat' },
  { label: 'Gabinet, beauty', value: 'gabinet' },
  { label: 'Szkoła lub instytucja', value: 'szkola' },
  { label: 'Produkcja, hurtownia', value: 'produkcja' },
  { label: 'Food truck, stoisko', value: 'truck' },
  { label: 'Inna firma', value: 'inna' },
] as const

/**
 * Post categories = filters of `/aktualnosci` (spec. §6.9). One list for all lines (ADR-014
 * rozstrz. SW0 2); a post may only take a category of its tenant's line (`lib/posts/list`).
 */
export const POST_CATEGORIES = [
  { label: 'KSeF', value: 'ksef', line: 'biznes' },
  { label: 'Kasy', value: 'kasy', line: 'biznes' },
  { label: 'Terminale', value: 'terminale', line: 'biznes' },
  { label: 'Dofinansowania', value: 'dofinansowania', line: 'biznes' },
  { label: 'Programy', value: 'programy', line: 'biznes' },
  { label: 'Poradnik', value: 'poradnik', line: 'software' },
  { label: 'Nowości', value: 'nowosci', line: 'software' },
  { label: 'Realizacje', value: 'realizacje', line: 'software' },
] as const

const HEX_COLOR = /^#[0-9a-f]{6}$/i

/** Gradient stops of a catalog group: data, not tokens (ADR-012 / ADR-013 exception). */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value)
}
