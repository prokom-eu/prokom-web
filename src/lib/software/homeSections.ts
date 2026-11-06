/**
 * Sections of the Software start page placed by `swHomeSection` blocks (ADR-014 rozstrz. v20 6):
 * the value stored in the block, the panel label and the anchor of the section (spec. §4) — the
 * header links „Kreator” / „Bezpłatna wycena” and the section rail point to these anchors. The
 * full list goes in at once (SW5), so the later sessions add components, not a migration.
 */
export const HOME_SECTIONS = [
  { value: 'areas', label: 'Oferta — 8 obszarów (v23)', anchor: 'obszary' },
  { value: 'popular', label: '12 rzeczy', anchor: 'popularne' },
  { value: 'livePreviews', label: 'Podglądy na żywo (v23)', anchor: 'podglady-na-zywo' },
  { value: 'process', label: 'Jak pracujemy i cena', anchor: 'proces' },
  { value: 'wizard', label: 'Kreator', anchor: 'dobierz' },
  { value: 'whyNotWordpress', label: 'Dlaczego nie WordPress', anchor: 'bez-wordpressa' },
  { value: 'guarantees', label: 'Zasady', anchor: 'zasady' },
  // SWR5 (v21): back from `/o-firmie` to the start page.
  { value: 'howWeBuild', label: 'Jak robimy', anchor: 'jak-robimy' },
  { value: 'technologies', label: 'Z czego budujemy', anchor: 'technologie' },
  // SW11b: „Freelancer, agencja czy PRO-KOM?” on `/o-firmie` — the value goes in now (one migration).
  { value: 'compare', label: 'Porównanie (O firmie)', anchor: 'porownanie' },
  // SWA2 (v24, ZMIANY-v24 §4): the new start page sections; bento and showroom take the anchors
  // of the v23 areas and previews.
  { value: 'promises', label: 'Obietnice (v24)', anchor: 'obietnice' },
  { value: 'situations', label: 'Z czym do nas przychodzisz (v24)', anchor: 'sytuacje' },
  { value: 'bento', label: 'Oferta — cztery rzeczy (v24)', anchor: 'oferta' },
  { value: 'showroom', label: 'Podglądy branż (v24)', anchor: 'podglady' },
  { value: 'tech', label: 'Jak budujemy (v24)', anchor: 'technologia' },
  { value: 'pricing', label: 'Cennik na głównej (v24)', anchor: 'cennik' },
] as const

export type HomeSectionValue = (typeof HOME_SECTIONS)[number]['value']

/**
 * Sections rendered on the page — the seed places only these blocks, the section rail lists only
 * these and a block of any other section renders nothing.
 */
export const BUILT_HOME_SECTIONS: readonly HomeSectionValue[] = [
  // v24 (SWA2): the v23 sections (areas, popular, livePreviews, howWeBuild, whyNotWordpress,
  // technologies, guarantees) are no longer rendered; their blocks and code go with the clean-up
  // migration after Krystian's decision D6 (PRZEKAZANIE-v24 §0.1).
  'promises',
  'situations',
  'bento',
  'showroom',
  'tech',
  'wizard',
  'pricing',
  'process',
  // SW11b: on `/o-firmie` only — not in the start page order, so not in the rail.
  'compare',
]

/** Order of the Software start page v24 (ZMIANY-v24 §4); faq and contact are their own blocks. */
export const HOME_ORDER_V24 = [
  'hero',
  'promises',
  'situations',
  'bento',
  'showroom',
  'tech',
  'wizard',
  'pricing',
  'process',
  'faq',
  'contact',
] as const

export function homeSectionAnchor(value: string): string | null {
  return HOME_SECTIONS.find((section) => section.value === value)?.anchor ?? null
}
