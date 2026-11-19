import type { HubSetting } from '../../payload-types'

/*
 * Runda 1811 (HUB-R1) — the hub's new texts for databases the seed does not write (production runs
 * since 16.11; `prod-line-content.sh prokom` would need PO_STARCIE=1 and overwrite panel edits).
 * A frozen copy of the package (`seed/prokomeu/model/Marki.json` → `network`, `Main.json` →
 * `procurement`); the test keeps it equal to the package of this commit. Every step only ADDS what
 * is missing — a value written in the panel always stays.
 */

export const NETWORK_1811 = {
  name: 'ALSEN',
  slug: 'alsen',
  status: 'Autoryzowany partner',
  fact: 'ALSEN',
  line: 'biznes',
  label: 'Sieć partnerska',
  text: 'Ogólnopolska sieć sklepów komputerowych. Sprzęt z sieci ALSEN dobierzemy, skonfigurujemy i obsłużymy na miejscu.',
  website: 'https://www.alsen.pl/',
  linkLabel: 'Strona sieci ALSEN',
  aboutTitle: 'Autoryzowany partner ALSEN',
  paragraphs: [
    {
      text: 'PRO-KOM jest autoryzowanym partnerem ALSEN — ogólnopolskiej sieci sklepów komputerowych. Dla klienta to dostęp do szerokiej oferty sprzętu i akcesoriów bez szukania po wielu sklepach.',
      facts: ['ALSEN'],
    },
    {
      text: 'ALSEN to ponad 350 sklepów w całej Polsce, związanych z dystrybutorem AB.',
      facts: ['ALSEN', 'ALSEN 350+'],
    },
    {
      text: 'Sprzęt dobieramy do zadania, konfigurujemy i zostajemy pod telefonem po zakupie — tak jak przy wszystkim, co robimy.',
      facts: ['ALSEN'],
    },
  ],
  salonNote: {
    text: 'Punkt partnerski ALSEN',
    facts: ['ALSEN', 'ALSEN Rabka'],
  },
} as const

export const PROCUREMENT_1811 = {
  eyebrow: 'Zamówienia publiczne i większe dostawy',
  title: 'Szkoły, gminy, szpitale i firmy — jedna oferta na całe zamówienie.',
  lead: 'Odpowiadamy na zapytania ofertowe i przetargi, realizujemy dostawy sprzętu dla szkół, gmin i firm. Sprzęt IT, AV i wyposażenie z linii Biznes, Instalacje i Tech zbieramy w jedną ofertę — z dokumentami do odbioru i rozliczenia.',
  points: [
    {
      icon: 'doc',
      title: 'Przetargi i zapytania ofertowe',
      text: 'Ofertę przygotowujemy według SWZ albo opisu przedmiotu zamówienia.',
    },
    {
      icon: 'box',
      title: 'Większe dostawy sprzętu',
      text: 'Pracownie, stanowiska, sprzęt AV i wyposażenie pod adres. Konfiguracja, montaż i szkolenie — jeśli są w ofercie.',
    },
    {
      icon: 'users',
      title: 'Jedna faktura i jeden opiekun',
      text: 'Całe zamówienie prowadzi jedna osoba — bez szukania kilku dostawców.',
    },
    {
      icon: 'receipt',
      title: 'Dokumenty do dofinansowań',
      text: 'Do zamówień z dofinansowaniem przygotowujemy kosztorys i dokumenty potrzebne do rozliczenia.',
    },
  ],
  stepsLabel: 'Jak to przebiega',
  forLabel: 'Dla kogo',
  audiences: [
    {
      icon: 'grad',
      label: 'Szkoły',
    },
    {
      icon: 'building',
      label: 'Gminy i urzędy',
    },
    {
      icon: 'heart',
      label: 'Szpitale i uzdrowiska',
    },
    {
      icon: 'bed',
      label: 'Hotele',
    },
    {
      icon: 'brief',
      label: 'Firmy',
    },
  ],
  examplesLabel: 'Realizowaliśmy dla',
  examples: [],
  cta: {
    label: 'Wyślij zapytanie ofertowe',
    href: '/inwestycje-i-dostawy#formularz',
  },
  more: {
    label: 'Zobacz zamówienia i dostawy',
    href: '/inwestycje-i-dostawy#przetargi',
  },
} as const

/** The note under the brands: the old wording of the package is replaced, a panel one stays. */
export const BRANDS_NOTE_OLD =
  'Status autoryzowanego serwisu lub partnera dotyczy tylko czterech marek u góry.'
export const BRANDS_NOTE_1811 =
  'Status autoryzowanego serwisu lub partnera producenta dotyczy tylko czterech marek u góry.'

type Trust = NonNullable<HubSetting['trust']>[number]

export const TRUST_1811: Trust[] = [
  { value: 'ALSEN', label: 'Autoryzowany partner', source: 'runda-1811 D4', approved: true },
  { value: 'ALSEN 350+', label: 'sklepów sieci ALSEN', source: 'runda-1811 D4', approved: false },
  {
    value: 'ALSEN Rabka',
    label: 'salon = punkt partnerski ALSEN',
    source: 'runda-1811 D4',
    approved: false,
  },
]

export const EXTRA_EMAILS_1811 = [
  { label: 'Biuro (ogólny)', email: 'biuro@pro-kom.eu', published: true },
  { label: 'Zamówienia', email: 'sklep@pro-kom.pl', published: false },
]

type JsonObject = Record<string, unknown>
const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** `brands` with the network added (only while missing) and the old note updated; `null` = no change. */
export function brandsWith1811(brands: unknown): JsonObject | null {
  if (!isObject(brands)) return null
  const next: JsonObject = { ...brands }
  if (!next.network) next.network = NETWORK_1811
  if (next.note === BRANDS_NOTE_OLD) next.note = BRANDS_NOTE_1811
  return JSON.stringify(next) === JSON.stringify(brands) ? null : next
}

/** `home` with the procurement section (only while missing); `null` = no change. */
export function homeWith1811(home: unknown): JsonObject | null {
  if (!isObject(home) || home.procurement) return null
  return { ...home, procurement: PROCUREMENT_1811 }
}

/** Facts after: the stored ones as they are, the round's facts added by value when missing. */
export function trustWith1811(stored: readonly Trust[] | null | undefined): Trust[] | null {
  const values = new Set((stored ?? []).map((row) => row.value))
  const missing = TRUST_1811.filter((row) => !values.has(row.value))
  return missing.length ? [...(stored ?? []), ...missing] : null
}

/** Rail of the hub's home page with „Zamówienia” after „Współpraca” (only while missing). */
export function railWith1811<T extends { anchorId?: string | null }>(
  sections: readonly T[] | null | undefined,
): (T | { anchorId: string; label: string; icon: string })[] | null {
  if (!sections?.length || sections.some((row) => row.anchorId === 'zamowienia')) return null
  const at = sections.findIndex((row) => row.anchorId === 'wspolpraca')
  const item = { anchorId: 'zamowienia', label: 'Zamówienia', icon: 'doc' }
  const index = at < 0 ? sections.length : at + 1
  return [...sections.slice(0, index), item, ...sections.slice(index)]
}
