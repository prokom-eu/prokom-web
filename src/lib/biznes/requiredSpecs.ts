/**
 * Required parameters of a Biznes card, per catalog category (PRODUKCJA-BIZNES-1211 §1, sesja 2):
 * what a buyer compares before asking — an MFP without its speed or monthly volume, a laptop
 * without its weight is not ready for production. A slot is met when any parameter's key matches
 * its pattern: the package names the same thing in different words („Waga”, „Masa”, „Wymiary /
 * waga”), and one combined key may meet two slots. Pure; the test and
 * `scripts/parametry-braki.ts` read `katalog-k4.json` with it.
 */

export type SpecSlot = { label: string; match: RegExp }

const slot = (label: string, pattern: string): SpecSlot => ({
  label,
  match: new RegExp(pattern, 'i'),
})

const SIZE = slot('Wymiary', 'wymiar')
const WEIGHT = slot('Waga', 'wag|mas')

/** Category code of the package (`kategoria`) → its required slots. */
export const REQUIRED_SPECS: Readonly<Record<string, readonly SpecSlot[]>> = {
  // Printing and scanning.
  mfp: [
    slot('Typ', '^typ'),
    slot('Format', 'format'),
    slot('Prędkość druku', 'prędkość'),
    slot('Rozdzielczość', 'rozdzielczo'),
    slot('Druk dwustronny', 'dwustronn|dupleks'),
    slot('Papier', 'papier|pojemność|kaset'),
    slot('Łączność', 'łączność|interfejs'),
    slot('Obciążenie miesięczne', 'obciążeni'),
    slot('Pamięć', 'pamięć'),
    slot('Panel', 'panel|ekran'),
    SIZE,
    WEIGHT,
  ],
  // Fiscal: printers, registers, terminals, POS.
  druk: [
    slot('Typ', '^typ'),
    slot('Mechanizm i papier', 'mechanizm|papier'),
    slot('Łączność z CRK', 'crk'),
    slot('Komunikacja z komputerem', 'komunikac|interfejs|złącz|port'),
    slot('Ekran klienta', 'ekran'),
    slot('Zasilanie', 'zasila|akumulator'),
    SIZE,
    WEIGHT,
  ],
  kasy: [
    slot('Typ', '^typ'),
    slot('Ekran operatora', 'ekran operatora'),
    slot('Ekran klienta', 'ekran klienta'),
    slot('Baza towarów', 'baza towarów|plu'),
    slot('Liczba kasjerów', 'kasjer'),
    slot('Mechanizm i papier', 'mechanizm|papier'),
    slot('Łączność z CRK', 'crk|łączność'),
    slot('Zasilanie', 'zasila|akumulator'),
    SIZE,
    WEIGHT,
  ],
  term: [
    slot('Płatności', 'płatnoś'),
    slot('Łączność', 'łączność|operator|telefon'),
    slot('Zasilanie', 'akumulator|zasila|telefon'),
  ],
  pos: [
    slot('System', 'system'),
    slot('Ekran', 'ekran'),
    slot('Procesor', 'procesor'),
    slot('Pamięć', 'pamięć'),
    slot('Łączność', 'łączność'),
    SIZE,
  ],
  mob: [
    slot('System', 'system|typ'),
    slot('Ekran', 'ekran'),
    slot('Łączność', 'łączność|crk'),
    slot('Akumulator', 'akumulator'),
    slot('Drukarka', 'drukark|mechanizm'),
    SIZE,
  ],
  kiosk: [
    slot('System', 'system'),
    slot('Ekran', 'ekran'),
    slot('Procesor', 'procesor'),
    slot('Pamięć', 'pamięć'),
    slot('Łączność', 'łączność'),
    slot('Montaż', 'montaż'),
    SIZE,
  ],
  wagi: [
    slot('Zakres ważenia', 'zakres'),
    slot('Legalizacja', 'legalizac'),
    slot('Wymiary szalki', 'szalk'),
    slot('Wyświetlacze', 'wyświetlacz'),
    slot('Łączność', 'łączność|interfejs|port'),
    slot('Zasilanie', 'zasila|akumulator'),
  ],
  kody: [
    slot('Typ', '^typ|technika|sposób|odczyt|klasa'),
    slot('Rozdzielczość', 'rozdzielczo|odczyt'),
    slot('Interfejsy', 'interfejs|łączność'),
    SIZE,
    WEIGHT,
  ],
  // Computers and screens.
  laptopy: [
    slot('Procesor', 'procesor'),
    slot('Pamięć RAM', 'ram|pamięć'),
    slot('Dysk', 'dysk'),
    slot('Ekran', 'ekran'),
    slot('Porty', 'port|złącz'),
    slot('Łączność', 'łączność'),
    slot('Bateria', 'bateri'),
    slot('System', 'system'),
    SIZE,
    WEIGHT,
  ],
  komputery: [
    slot('Procesor', 'procesor'),
    slot('Pamięć RAM', 'ram|pamięć'),
    slot('Dysk', 'dysk'),
    slot('Porty', 'port|złącz'),
    slot('Łączność', 'łączność|sieć'),
    slot('Zasilacz', 'zasila'),
    slot('System', 'system'),
    slot('Obudowa i wymiary', 'obudow|wymiar'),
  ],
  monitory: [
    slot('Przekątna', 'przekątn|ekran'),
    slot('Rozdzielczość', 'rozdzielczo'),
    slot('Matryca', 'matryc|panel'),
    slot('Jasność', 'jasność'),
    slot('Odświeżanie', 'odświeżan'),
    slot('Złącza', 'złącz|wejści|port|podłączenie'),
    slot('Regulacja', 'regulac|stop|podstaw'),
    slot('Montaż VESA', 'vesa|montaż'),
  ],
  tablety: [
    slot('Ekran', 'ekran'),
    slot('Procesor', 'chip|procesor'),
    slot('Pamięć', 'pamięć'),
    slot('Łączność', 'łączność'),
    slot('Bateria', 'bateri'),
    slot('Wymiary i masa', 'wymiar|grubość|mas'),
  ],
  telefony: [
    slot('Ekran', 'ekran'),
    slot('Procesor', 'chip|procesor'),
    slot('Pamięć', 'pamięć'),
    slot('Łączność', 'łączność'),
    slot('Bateria', 'bateri'),
    slot('Aparaty', 'aparat'),
    slot('Wymiary i masa', 'wymiar|mas'),
  ],
  'akcesoria-biuro': [
    slot('Łączność', 'łączność|złącz'),
    slot('Kompatybilność', 'kompatybil|system'),
    slot('Gwarancja', 'gwarancj'),
  ],
  akc: [slot('Typ / przeznaczenie', '^typ|współprac|złącz|interfejs|funkcj|pojemność'), SIZE],
  niszczarki: [
    slot('Poziom bezpieczeństwa', 'din|bezpieczeńst'),
    slot('Ścinek', 'ścin'),
    slot('Kartek naraz', 'kartek'),
    slot('Szerokość wejścia', 'szerokość'),
    slot('Pojemność kosza', 'kosz'),
    slot('Praca', 'praca|chłodz|cykl'),
    slot('Głośność', 'głośn'),
    SIZE,
    WEIGHT,
  ],
  // Network, servers, AV, vending.
  siec: [
    slot('Porty', 'port'),
    slot('Zasilanie', 'zasila|poe'),
    slot('Zarządzanie', 'zarządz'),
    slot('Montaż', 'montaż|obudow'),
    SIZE,
  ],
  // Servers, NAS and UPS share one category: only what all of them have.
  serw: [slot('Obudowa / montaż', 'obudow|wymiar|montaż|typ|topologi')],
  av: [
    slot('Przekątna', 'przekątn|ekran|rozmiar|matryc'),
    slot('Rozdzielczość', 'rozdzielczo'),
    slot('Złącza', 'złącz|wejści|port|łączność'),
    slot('Montaż', 'vesa|montaż|uchwyt'),
  ],
  vend: [
    slot('Płatności', 'płatnoś'),
    slot('Zasilanie', 'zasila|pobór'),
    slot('Montaż', 'montaż'),
    SIZE,
  ],
  // Software: the licence and what it needs.
  progs: [
    slot('Licencja', 'licencj|pakiet|edycj|wersj'),
    slot('Sposób pracy / wymagania', 'sposób pracy|wymag|system|baza danych'),
  ],
  progb: [
    slot('Rodzaj', 'rodzaj|licencj|pakiet'),
    slot('Wymagania / urządzenia', 'wymag|urządzen|drukark|integrac'),
  ],
  m365: [slot('Licencja', 'licencj|edycj|model'), slot('Okres', 'okres')],
  ochr: [slot('Licencja / pakiety', 'licencj|pakiet|typ')],
  podpis: [slot('Forma', 'forma'), slot('Ważność certyfikatu', 'ważność')],
  // Services: the facts of the package (scope, where).
  serwis: [
    slot('Zakres', 'zakres|obszar|urządzen|marki|sprzęt'),
    slot('Miejsce', 'miejsce|gdzie|forma|obszar'),
  ],
  it: [
    slot('Zakres', 'zakres|obszar|co chronimy|sprawdzenie'),
    slot('Dla kogo / forma', 'dla kogo|forma|gdzie|sprzęt|programy'),
  ],
  dof: [slot('Zakres', 'zakres|obszar'), slot('Forma', 'forma')],
}

/**
 * Labels of the required slots a card's parameters leave empty; `null` for a category without
 * required parameters (a new category must get them — the test says so).
 */
export function missingSpecs(
  category: string,
  params: readonly { k: string; v?: string }[],
): string[] | null {
  const slots = REQUIRED_SPECS[category]
  if (!slots) return null
  return slots
    .filter((s) => !params.some((param) => (param.v ?? '').trim() !== '' && s.match.test(param.k)))
    .map((s) => s.label)
}

/**
 * „Czym różnią się wersje” must say what differs — not a placeholder of the sheet
 * („model z tej samej serii”, „wspólna karta katalogowa”, „jak wyżej”).
 */
export const PLACEHOLDER_DIFFERENCE =
  /wspólna karta katalogowa|model z tej samej serii|^\s*jak wyżej\b/i
