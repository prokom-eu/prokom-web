/**
 * Phrases fixed on the live Biznes site (audyt produkcji 15.11 wieczorem), frozen for the migration
 * `biznes_teksty_1511`: the seed's `TEXT_FIXES` never reach production (no seed there), and the
 * guide posts there were created before these fixes. Each pair is an exact sentence of the live
 * texts; a text without it stays as it is, so the migration is a no-op where it already changed.
 */
export const BIZNES_PHRASES_1511: readonly (readonly [from: string, to: string])[] = [
  // §3.1: the KSeF token stays with no end date (MF, ksef.podatki.gov.pl „Certyfikaty KSeF”).
  ['Certyfikat KSeF — zanim skończy się token', 'Certyfikat KSeF do programu i do trybu offline'],
  ['Stary token działa tylko do końca 2026 r.', 'Token zostaje — MF utrzymało go bezterminowo.'],
  ['Token działa tylko do końca 2026.', 'Token MF utrzymało bezterminowo.'],
  // Audyt 15.11 P2-6 and P2-1 (home page): the authorizations stand below the text on a phone;
  // no count of the lines.
  [
    'Uprawnienia producentów widzisz obok — to one pozwalają nam serwisować kasy i wdrażać programy.',
    'Uprawnienia producentów to podstawa — pozwalają nam serwisować kasy i wdrażać programy.',
  ],
  ['Jedna firma · cztery linie', 'Jedna firma — linie PRO-KOM'],
  // §3.2: no source for „3 dni od zgłoszenia” (post przeglad-kasy-fiskalnej-co-2-lata).
  [
    'Serwisant ma na niego 3 dni od zgłoszenia i wpisuje go do książki kasy.',
    'Serwisant wpisuje go do książki kasy — zgłoś go z wyprzedzeniem, najlepiej miesiąc przed terminem.',
  ],
  [
    'Powinien go wykonać w ciągu 3 dni od zgłoszenia, więc nie zostawiaj tego na ostatni dzień terminu.',
    'Zgłoś go z wyprzedzeniem, najlepiej miesiąc przed terminem — nie zostawiaj tego na ostatni dzień.',
  ],
  // §3.4: the notice to the tax office is still the relief's condition (art. 111 ust. 4), post
  // fiskalizacja-kasy-online-krok-po-kroku (summary, then the paragraph of step 3).
  [
    'Przy kasie online nie ma obowiązku zgłaszania kasy do naczelnika urzędu skarbowego.',
    'Przy kasie online nie ma obowiązku zgłaszania kasy do naczelnika urzędu skarbowego — chyba że chcesz skorzystać z ulgi na kasę.',
  ],
  [
    'z papierowym albo elektronicznym zapisem kopii.',
    'z papierowym albo elektronicznym zapisem kopii. Wyjątek: jeśli chcesz skorzystać z ulgi na zakup kasy, przed rozpoczęciem ewidencji złóż w urzędzie skarbowym zgłoszenie o liczbie i miejscu używania kas — to warunek ulgi.',
  ],
]

const SEPARATOR = '[ \\u00a0]'
const escape = (part: string) => part.replace(/[.*+?^${}()|[\]\\]/g, (char) => `\\${char}`)

/** A pair as a pattern whose spaces also match the seed's hard spaces (`hardSpaces`). */
const patterns = (pairs: readonly (readonly [string, string])[]) =>
  pairs.map(([from, to]) => ({
    pattern: new RegExp(from.split(' ').map(escape).join(SEPARATOR), 'g'),
    to,
  }))

const PATTERNS = patterns(BIZNES_PHRASES_1511)

/** One string with every frozen phrase replaced; a text that already says the new one stays. */
function replaceText(text: string): string {
  return PATTERNS.reduce((current, { pattern, to }) => {
    // Already fixed — and an added sentence (its „to” starts with the „from”) never twice.
    if (current.includes(to)) return current
    return current.replace(pattern, to)
  }, text)
}

/** `value` with the phrases replaced in every string inside it (objects and arrays copied). */
export function replacePhrases<T>(value: T): T {
  if (typeof value === 'string') return replaceText(value) as T
  if (Array.isArray(value)) return value.map((item: unknown) => replacePhrases(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replacePhrases(item)]),
    ) as T
  }
  return value
}
