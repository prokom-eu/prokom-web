/**
 * Areas of the Software mock-ups a point of „W cenie” can light up (OKNO-OFERTY-PREMIUM §2.2):
 * a point (`Solutions.included`, plain text) and a part of the mock-up (its own sample text) are
 * matched by the same key words, so no schema field is needed. No match → a plain point.
 *
 * Order matters only for the phone: „na telefonie” is the phone version of the site (`mobile`),
 * „telefon” alone is the call button (`telefon`).
 */
export const SPOT_KEYS = [
  'mobile',
  'telefon',
  'mapa',
  'formularz',
  'google',
  'panel',
  'galeria',
  'opinie',
  'rezerwacja',
  'jezyki',
  'sklep',
  'blog',
] as const
export type SpotKey = (typeof SPOT_KEYS)[number]

/** Lower-case stems; a Polish word matches by its beginning („formularz”, „formularza”). */
export const SPOT_WORDS: Record<SpotKey, readonly RegExp[]> = {
  mobile: [/na telefonie/, /mobiln/, /responsywn/, /komputera i telefonu/],
  telefon: [/\btelefon(?!ie|u\b)/, /zadzwo/, /dzwoni/, /jednym kliknięciem/],
  mapa: [/\bmap(a|ie|y|ą)(?![a-ząćęłńóśźż])/, /dojazd/, /\bgodzin/],
  formularz: [/formularz/, /zapyta/, /wyślij/, /kontakt/],
  google: [/google/, /\bseo\b/, /wyszukiwar/],
  panel: [/\bpanel/, /zmieniasz sam/, /\brole\b/, /kont(a|ami) dla/],
  galeria: [/galeri/, /zdjęci/, /realizacj/],
  opinie: [/opini/, /recenzj/],
  rezerwacja: [/rezerw/, /zapisy/, /\btermin/],
  jezyki: [/język/, /\bpl · en/, /\ben\b/],
  sklep: [/koszyk/, /płatnoś/, /produkt/, /\bblik\b/, /odbi[óo]r/],
  blog: [/\bblog/, /wpis/, /poradnik/, /aktualnoś/],
}

/** Every area the text names, in `SPOT_KEYS` order; „na telefonie” never counts as the call. */
export function spotsOf(text: string): SpotKey[] {
  const value = text.toLowerCase()
  return SPOT_KEYS.filter((key) => SPOT_WORDS[key].some((word) => word.test(value)))
}

/** `data-spot` of a mock-up part: the areas its sample text names, or nothing. */
export function spotAttr(...texts: string[]): string | undefined {
  const keys = spotsOf(texts.join(' '))
  return keys.length > 0 ? keys.join(' ') : undefined
}
