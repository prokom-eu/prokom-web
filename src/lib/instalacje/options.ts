/**
 * Fixed vocabularies of the Instalacje line (ADR-I002 §2). Keys come from the design prototype
 * and are used by the planner and inquiries, so they never change; labels may.
 */

export const SERVICE_KEYS = [
  { label: 'Monitoring i kamery', value: 'kam' },
  { label: 'Alarmy i wideodomofony', value: 'alarm' },
  { label: 'Kontrola dostępu', value: 'kd' },
  { label: 'Sieci i Wi-Fi', value: 'wifi' },
  { label: 'Teletechnika', value: 'tel' },
  { label: 'Anteny RTV/SAT', value: 'ant' },
  { label: 'Smart home', value: 'smart' },
  { label: 'Nagłośnienie', value: 'snd' },
  { label: 'Ekrany', value: 'scr' },
  { label: 'Ładowarki EV', value: 'ev' },
] as const

export type ServiceKey = (typeof SERVICE_KEYS)[number]['value']

/** Columns of the mega menu. */
export const SERVICE_GROUPS = [
  { label: 'Bezpieczeństwo', value: 'security' },
  { label: 'Sieci i technika', value: 'networks' },
  { label: 'Komfort i obraz', value: 'comfort' },
] as const

/** Families of the full offer — on purpose not the mega menu columns (ADR-I002 §2). */
export const OFFER_FAMILIES = [
  { label: 'Bezpieczeństwo', value: 'security' },
  { label: 'Łączność', value: 'connectivity' },
  { label: 'Komfort i obraz', value: 'comfort' },
  { label: 'E-mobilność', value: 'emobility' },
] as const

export const OBJECT_KEYS = [
  { label: 'Dom i domek letniskowy', value: 'dom' },
  { label: 'Apartament na wynajem', value: 'apt' },
  { label: 'Pensjonat', value: 'pens' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Restauracja', value: 'rest' },
  { label: 'Sklep', value: 'sklep' },
  { label: 'Firma i hala', value: 'firma' },
  { label: 'Kościół', value: 'kosc' },
  { label: 'Szkoła', value: 'szk' },
  { label: 'Gmina', value: 'gmina' },
  { label: 'Deweloper', value: 'dev' },
  { label: 'Budowa', value: 'bud' },
] as const

export const OBJECT_GROUPS = [
  { label: 'Dom i noclegi', value: 'homes' },
  { label: 'Firmy', value: 'business' },
  { label: 'Instytucje', value: 'institutions' },
  { label: 'Budownictwo', value: 'construction' },
] as const

/** Filter of the full offer — not the keys of `InstObjects` (`inst` = church, school, commune). */
export const OFFER_CATEGORIES = [
  { label: 'Dom', value: 'dom' },
  { label: 'Apartament', value: 'apt' },
  { label: 'Pensjonat i hotel', value: 'pens' },
  { label: 'Restauracja', value: 'rest' },
  { label: 'Sklep', value: 'sklep' },
  { label: 'Firma i hala', value: 'firma' },
  { label: 'Kościół, szkoła, gmina', value: 'inst' },
  { label: 'Deweloper', value: 'dev' },
] as const

/** Promises of the line as the boss decided them (spec §2); the panel can change them. */
export const SETTINGS_DEFAULTS = {
  noPriceText: 'Wycena po wizji lokalnej',
  warrantyMonths: 24,
  responseText: 'Do 24 h odpowiadamy na zgłoszenia w dni robocze.',
} as const
