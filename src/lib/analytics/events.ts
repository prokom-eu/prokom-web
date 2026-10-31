import { normalizeText } from '../catalog/normalize'

/**
 * Analytics events of the sites (ADR-020; Software: spec. §8.4, v20, v22). Names are Polish, as in
 * the spec, because they are read in the Umami panel. Data carries identifiers only — a slug, an
 * option id, a step number, a field name — never what a visitor typed.
 */
export type AnalyticsEvents = {
  kreator_start: undefined
  /** Step the visitor reached, from 1. */
  kreator_krok: { krok: number }
  /** Result id from `SoftwareSettings.wizard`. */
  kreator_wynik: { wynik: string }
  kreator_wyslij: undefined
  /** „Potrzebujesz czegoś więcej?” — id of the ticked add-on. */
  kreator_dodatek: { id: string }
  /** „+ Dodaj do wyceny” on a card or in the offer window. */
  projekt_dodaj: { slug: string }
  /** The „Twój projekt” list sent with the contact form; `liczba` = number of items. */
  projekt_wyslij: { liczba: number }
  audyt_wyslij: undefined
  kontakt_wyslij: undefined
  /** Tab of the live previews on the start page. */
  podglad_otworz: { podglad: string }
  /** The phone menu sheet. */
  menu_otworz: undefined
  /** Item of the phone bottom bar (its key, e.g. `oferta`). */
  pasek_klik: { pozycja: string }
  /** A form rejected a field: the form and the field name, without the value. */
  formularz_blad: { formularz: AnalyticsForm; pole: string }
  /** The offer details window opened. */
  oferta_okno: { slug: string }
  /** „+ Dodaj do wyceny” inside the offer window. */
  oferta_dodaj: { slug: string }
}

export type AnalyticsForm = 'kontakt' | 'audyt' | 'kreator'

export type AnalyticsEvent = keyof AnalyticsEvents

export type AnalyticsData = Record<string, string | number>

// An identifier starting with a letter: slugs, ids (some in camelCase, e.g. `opiekaSys`), field
// names. Rules out e-mail addresses, phone numbers and free text.
const IDENTIFIER = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/
const MAX_NUMBER = 99

/** Whether event data holds only identifiers and small whole numbers (no personal data). */
export function isSafeEventData(data: AnalyticsData | undefined): boolean {
  if (data === undefined) return true
  return Object.entries(data).every(([key, value]) => {
    if (!IDENTIFIER.test(key)) return false
    if (typeof value === 'number')
      return Number.isInteger(value) && value >= 0 && value <= MAX_NUMBER
    return typeof value === 'string' && IDENTIFIER.test(value)
  })
}

/**
 * A panel label as event data: „Strona firmowa” → `strona-firmowa`. For labels only — never for
 * what a visitor typed.
 */
export function labelKey(label: string): string {
  const key = normalizeText(label)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[^a-z]+|-+$/g, '')
    .slice(0, 64)
  return key || 'bez-nazwy'
}
