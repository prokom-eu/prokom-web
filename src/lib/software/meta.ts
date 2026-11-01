import { metaDescription } from '../seo/description'

// TODO(krystian): opisy meta do akceptacji przed produkcją (spec. §9) — propozycje SW12.
/** Meta descriptions of the Software routes built in code (pages of the panel: `seed/software/seo`). */
export const SOFTWARE_ROUTE_DESCRIPTIONS = {
  catalog:
    'Strony, sklepy, systemy zleceń, CRM i aplikacje dla firm z Podhala. Przy każdym rozwiązaniu cena „od”, termin i to, co jest w cenie.',
  wizard:
    'Kilka kliknięć i wiesz, co dla Ciebie zbudujemy: rozwiązanie, cena „od”, termin i co jest w cenie. Wycena na piśmie, gdy zechcesz.',
} as const

/** What the title template adds on subpages (`%s | PRO-KOM Software`). */
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
const DESCRIPTION_TAIL =
  'Cena „od” i termin od razu, wycena w 5–7 dni. PRO-KOM Software, Rabka-Zdrój.'

/** A meta description from a lead: as it is when long enough, else with price, term and place. */
export function richDescription(lead: string): string {
  const clean = lead.replace(/\s+/g, ' ').trim()
  if (clean.length >= DESCRIPTION_MIN) return metaDescription(clean)
  const sentence = /[.!?]$/.test(clean) ? clean : `${clean}.`
  return metaDescription(`${sentence} ${DESCRIPTION_TAIL}`)
}
