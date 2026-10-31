/**
 * Sections of the Software start page placed by `swHomeSection` blocks (ADR-014 rozstrz. v20 6):
 * the value stored in the block, the panel label and the anchor of the section (spec. §4) — the
 * header links „Kreator” / „Bezpłatna wycena” and the section rail point to these anchors. The
 * full list goes in at once (SW5), so the later sessions add components, not a migration.
 */
export const HOME_SECTIONS = [
  { value: 'areas', label: 'Oferta — 8 obszarów', anchor: 'oferta' },
  { value: 'popular', label: '12 rzeczy', anchor: 'popularne' },
  { value: 'livePreviews', label: 'Podglądy na żywo', anchor: 'podglady' },
  { value: 'process', label: 'Jak pracujemy i cena', anchor: 'proces' },
  { value: 'wizard', label: 'Kreator', anchor: 'dobierz' },
  { value: 'whyNotWordpress', label: 'Dlaczego nie WordPress', anchor: 'bez-wordpressa' },
  { value: 'guarantees', label: 'Zasady', anchor: 'zasady' },
  { value: 'showcase', label: 'Realizacje', anchor: 'realizacje' },
  // SWR5 (v21): back from `/o-firmie` to the start page.
  { value: 'howWeBuild', label: 'Jak robimy', anchor: 'jak-robimy' },
  { value: 'technologies', label: 'Z czego budujemy', anchor: 'technologie' },
  // SW11b: „Freelancer, agencja czy PRO-KOM?” on `/o-firmie` — the value goes in now (one migration).
  { value: 'compare', label: 'Porównanie (O firmie)', anchor: 'porownanie' },
] as const

export type HomeSectionValue = (typeof HOME_SECTIONS)[number]['value']

/**
 * Sections whose components exist (SW5, SW6, SW8a, SW8b; SWR5: „Jak robimy”, „Z czego budujemy”)
 * — the seed places only these blocks and the section rail lists only these.
 */
export const BUILT_HOME_SECTIONS: readonly HomeSectionValue[] = [
  'areas',
  'popular',
  'livePreviews',
  'process',
  'wizard',
  'whyNotWordpress',
  'guarantees',
  'showcase',
  'howWeBuild',
  'technologies',
  // SW11b: on `/o-firmie` only — not in the start page order (`homeOrder`), so not in the rail.
  'compare',
]

export function homeSectionAnchor(value: string): string | null {
  return HOME_SECTIONS.find((section) => section.value === value)?.anchor ?? null
}
