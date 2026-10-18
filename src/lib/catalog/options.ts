/**
 * Fixed option lists of the Biznes catalog (ADR-012). They are database enums, so a new
 * value needs a migration — fine for lists that change with the design, not with the content.
 */

/** Line icons of the design (`seed/prokombiznes/ikony.json`, rendered by `Icon` in B2). */
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
] as const

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

/** Post categories = filters of `/aktualnosci` (spec. §6.9). */
export const POST_CATEGORIES = [
  { label: 'KSeF', value: 'ksef' },
  { label: 'Kasy', value: 'kasy' },
  { label: 'Terminale', value: 'terminale' },
  { label: 'Dofinansowania', value: 'dofinansowania' },
  { label: 'Programy', value: 'programy' },
] as const

const HEX_COLOR = /^#[0-9a-f]{6}$/i

/** Gradient stops of a catalog group: data, not tokens (ADR-012 / ADR-013 exception). */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value)
}
