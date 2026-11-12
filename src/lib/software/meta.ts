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
  if (clean.length >= DESCRIPTION_MIN) return metaDescription(clean)
  let text = /[.!?]$/.test(clean) ? clean : `${clean}.`
  for (const sentence of DESCRIPTION_TAIL[priced ? 'priced' : 'ask']) {
    if (text.length + 1 + sentence.length <= META_DESCRIPTION_MAX) text = `${text} ${sentence}`
  }
  return text
}
