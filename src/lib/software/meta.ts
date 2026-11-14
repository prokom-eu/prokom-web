import { META_DESCRIPTION_MAX, metaDescription } from '../seo/description'

// TODO(krystian): opisy meta do akceptacji przed produkcją (spec. §9) — propozycje SW12.
/** Meta descriptions of the Software routes built in code (pages of the panel: `seed/software/seo`). */
export const SOFTWARE_ROUTE_DESCRIPTIONS = {
  catalog:
    'Strony, sklepy, systemy zleceń, CRM i aplikacje dla firm z Podhala. Przy każdym rozwiązaniu cena „od”, termin i to, co jest w cenie.',
  wizard:
    'Kilka kliknięć i wiesz, co dla Ciebie zbudujemy: rozwiązanie, cena „od”, termin i co jest w cenie. Wycena na piśmie, gdy zechcesz.',
} as const

/** What the title template adds on subpages (`%s | PRO-KOM Software`, `SiteSettings.seo`); a new
 * template in the panel needs this changed too. */
const TITLE_SUFFIX = ' | PRO-KOM Software'
/** Longest title results show in full (audyt 01.11 P2: ~60–65 characters). */
export const TITLE_MAX = 65

/**
 * The page title for the template: the full one when it fits `TITLE_MAX` with the suffix, else
 * the short one — Google cuts long titles mid-word (audyt 01.11 P2).
 */
export function fitTitle(full: string, short: string): string {
  return full.length + TITLE_SUFFIX.length <= TITLE_MAX ? full : short
}

/** The places a local search names („strona wizytówka Rabka”, „… Podhale”), SEO etap 1. */
const PLACE_TITLES = [' — Rabka-Zdrój i Podhale', ' — Rabka-Zdrój'] as const
/** Where we work, the longest that fits: Rabka, Podhale, Małopolska and remotely all Poland. */
const PLACE_SENTENCES = [
  'Rabka-Zdrój, Podhale, Małopolska i zdalnie cała Polska.',
  'Rabka-Zdrój, Podhale i cała Małopolska.',
  'Rabka-Zdrój i całe Podhale.',
] as const
const NAMES_PLACE = /rabk|podhal/i

/**
 * A page title with its place: „Strona wizytówka — Rabka-Zdrój i Podhale”, shorter when that does
 * not fit `TITLE_MAX` with the suffix, the name alone when nothing does.
 */
export function localTitle(name: string): string {
  for (const place of PLACE_TITLES) {
    const full = `${name}${place}`
    if (full.length + TITLE_SUFFIX.length <= TITLE_MAX) return full
  }
  return name
}

/**
 * Whether a text names a town in any case: by the first four letters of its name („Rabki-Zdroju”
 * and „w Nowym Targu” name Rabka-Zdrój and Nowy Targ).
 */
export function namesTown(text: string, town: string): boolean {
  const stem = town.toLowerCase().split(/[\s-]/)[0]?.slice(0, 4) ?? ''
  return stem.length > 0 && text.toLowerCase().includes(stem)
}

/**
 * A town page's description with the town in it: „<lead>. <miasto> i okolice.” when the lead does
 * not name it and there is room.
 */
export function withTown(lead: string, town: string): string {
  if (namesTown(lead, town)) return lead
  const base = /[.!?…]$/.test(lead) ? lead : `${lead}.`
  const next = `${base} ${town} i okolice.`
  return next.length <= META_DESCRIPTION_MAX ? next : lead
}

/**
 * A description that names the place: the longest sentence of `PLACE_SENTENCES` that fits, added
 * when it names none.
 */
export function withPlace(text: string): string {
  if (NAMES_PLACE.test(text)) return text
  // A full stop before the added sentence, unless the text already ends one (or with „…”).
  const base = /[.!?…]$/.test(text) ? text : `${text}.`
  for (const sentence of PLACE_SENTENCES) {
    const next = `${base} ${sentence}`
    if (next.length <= META_DESCRIPTION_MAX) return next
  }
  return text
}

/** Below this a description wastes the snippet (audyt 01.11 P2: 120–155 characters). */
const DESCRIPTION_MIN = 120
/** Whole sentences that may follow a short lead — with an „od” price or without one. */
const DESCRIPTION_TAIL = {
  priced: ['Cena „od” i termin od razu.', 'Wycena w 5–7 dni.', 'PRO-KOM Software, Rabka-Zdrój.'],
  ask: ['Wycena po krótkiej rozmowie, w 5–7 dni.', 'PRO-KOM Software, Rabka-Zdrój.'],
} as const

/**
 * A meta description from a lead: as it is when long enough, else followed by whole sentences
 * that fit `META_DESCRIPTION_MAX` — never cut with „…” — and only promising a price where there
 * is one (`priced: false` = „Zapytaj o wycenę”; review of SWV8 B).
 */
export function richDescription(lead: string, { priced }: { priced: boolean }): string {
  const clean = lead.replace(/\s+/g, ' ').trim()
  if (clean.length >= DESCRIPTION_MIN) return withPlace(metaDescription(clean))
  let text = /[.!?]$/.test(clean) ? clean : `${clean}.`
  for (const sentence of DESCRIPTION_TAIL[priced ? 'priced' : 'ask']) {
    if (text.length + 1 + sentence.length <= META_DESCRIPTION_MAX) text = `${text} ${sentence}`
  }
  return withPlace(text)
}
