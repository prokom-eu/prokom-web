import type { CatalogIndex, IndexImage, IndexLogo, IndexProduct } from './catalogIndex'
import { serviceTile } from './purchase'

/**
 * Covers of the cards without a photo (runda 1411 R8, board `Karty.dc.html`), built from the
 * card's data — no hand-made pictures:
 * - a licence („klucz licencji”): a white card with the producer's logo and the plan's name on a
 *   grid in the producer's tone, and the licence model;
 * - a service: a navy cover with the picture of what it is about (a product photo of the
 *   catalog), the „Autoryzowany serwis” badge at the fiscal registers only and three words.
 */

/** Tone of a producer's grid (a token of the brand palette, `--tone-*`). */
export type CoverTone = 'blue' | 'green' | 'red' | 'violet'

export type LicenceCover = {
  kind: 'licence'
  /** Text of the cover's picture: the card's name (search engines, a failed load). */
  alt: string
  brand: string | null
  logo: IndexLogo | null
  /** The plan: the card's name without the producer in front („Business Standard”). */
  plan: string
  /** „Subskrypcja · na użytkownika”, „Licencja bezterminowa · jednorazowo” or „Licencja elektroniczna”. */
  /** `null`: a producer whose licence model the site does not state (SaaS, certificates). */
  terms: string | null
  perpetual: boolean
  tone: CoverTone
}

export type ServiceCover = {
  kind: 'service'
  /** Text of the cover's picture: the card's name. */
  alt: string
  /** The picture of what the service is about; none → the card's icon stays in the middle. */
  image: IndexImage | null
  authorized: boolean
  /** `null`: no words for a service missing from `SERVICE_VISUALS` (no generic promise). */
  words: readonly [string, string, string] | null
}

export type CardCover = LicenceCover | ServiceCover

/** Producer → tone of its grid. Others: the accent blue. */
const BRAND_TONE: Record<string, CoverTone> = {
  microsoft: 'blue',
  eset: 'green',
  adobe: 'red',
  insert: 'violet',
}

/** Licences paid once (Office 2024, Windows): „Licencja bezterminowa”, never „dożywotnia”. */
const PERPETUAL = /\b(2021|2024|ltsc|windows|cal)\b/i
/** Subscriptions per user (Microsoft 365, Adobe for teams). */
const SUBSCRIPTION = /\b(365|for teams|teams)\b/i

export const SUBSCRIPTION_TERMS = 'Subskrypcja · na użytkownika'
export const PERPETUAL_TERMS = 'Licencja bezterminowa · jednorazowo'
export const ELECTRONIC_TERMS = 'Licencja elektroniczna'

/** The product a service shows and its three words; the badge only at the fiscal registers. */
type ServiceVisual = {
  product: string | null
  words: readonly [string, string, string]
  authorized?: true
}

const KASA = 'posnet-ergo-online'
const LAPTOP = 'lenovo-thinkbook-14-g8-g9'
const REGISTERS = ['Posnet', 'Elzab', 'w Rabce'] as const
const COMPUTERS = ['Komputery', 'Kopie', 'Aktualizacje'] as const

/**
 * Service → its picture (a product of the catalog) and words (board: register, KSeF, IT check,
 * IT care; the rest by the same rule). A service missing here keeps its icon and generic words.
 */
export const SERVICE_VISUALS: Record<string, ServiceVisual> = {
  'przeglad-kasy-fiskalnej': { product: KASA, words: REGISTERS, authorized: true },
  fiskalizacja: { product: KASA, words: REGISTERS, authorized: true },
  'przejecie-serwisu-kasy': { product: KASA, words: REGISTERS, authorized: true },
  'serwis-kas-i-drukarek-fiskalnych': { product: KASA, words: REGISTERS, authorized: true },
  'wymiana-kasy': {
    product: 'elzab-k10-online',
    words: ['Odczyt pamięci', 'Protokół', 'Fiskalizacja'],
  },
  'integracja-kasy': { product: 'polcard-move-3500', words: ['Kasa', 'Terminal', 'Program'] },
  'serwis-pos-i-terminali': {
    product: 'polcard-move-3500',
    words: ['POS', 'Terminale', 'Drukarki'],
  },
  'wdrozenie-ksef-w-firmie': {
    product: 'insert-inspunkty-ksef',
    words: ['Uprawnienia', 'Program', 'Biuro rachunkowe'],
  },
  'przeglad-it': { product: LAPTOP, words: COMPUTERS },
  'bezplatny-przeglad-it': { product: LAPTOP, words: COMPUTERS },
  'opieka-informatyczna': { product: LAPTOP, words: ['Komputery', 'Sieć', 'Kasy'] },
  'serwis-komputerow-dla-firm': { product: LAPTOP, words: ['Laptopy', 'Komputery', 'Serwery'] },
  'modernizacja-komputera': {
    product: 'lenovo-thinkcentre-neo-50s-55s',
    words: ['Dysk', 'Pamięć', 'System'],
  },
  'przygotowanie-komputera': { product: LAPTOP, words: ['System', 'Programy', 'Dane'] },
  'pomoc-zdalna': { product: LAPTOP, words: ['Zdalnie', 'Szybko', 'Z Rabki'] },
  'odzysk-danych': { product: 'synology-diskstation-plus-2-4', words: ['Dyski', 'Pliki', 'Kopie'] },
  'kopie-zapasowe': {
    product: 'synology-diskstation-plus-2-4',
    words: ['Kopia', 'Harmonogram', 'Odtworzenie'],
  },
  'kopie-zapasowe-z-testem-odtworzenia': {
    product: 'synology-diskstation-plus-2-4',
    words: ['Kopia', 'Test', 'Odtworzenie'],
  },
  'siec-wifi-montaz': {
    product: 'ubiquiti-unifi-u7-pro',
    words: ['Wi-Fi dla gości', 'Montaż', 'Konfiguracja'],
  },
  'serwis-drukarek': {
    product: 'konica-minolta-bizhub-c3321i',
    words: ['Konfiguracja', 'Skanowanie', 'Naprawa'],
  },
  'm365-poczta': { product: LAPTOP, words: ['Domena', 'Poczta', 'Konta'] },
  'szkolenia-zespolu': { product: LAPTOP, words: ['Kasa', 'Program', 'Zespół'] },
  'wdrozenie-programu-z-przeniesieniem-danych': {
    product: 'insert-subiekt-nexo',
    words: ['Instalacja', 'Dane', 'Szkolenie'],
  },
}

/** The plan: the name without its producer in front (case-insensitive), unless it starts with a number. */
function planOf(name: string, brand: string | null): string {
  if (!brand) return name
  const lower = name.toLowerCase()
  const prefix = brand.toLowerCase()
  if (!lower.startsWith(`${prefix} `)) return name
  const plan = name.slice(prefix.length + 1)
  // „365 Business Basic” says nothing without the producer: keep the whole name.
  return /^\d/.test(plan) ? name : plan
}

/** Producers selling licences: only they get „Licencja elektroniczna” when the model is unclear. */
const LICENCE_BRANDS: ReadonlySet<string> = new Set([
  'microsoft',
  'eset',
  'adobe',
  'insert',
  'comarch',
  'insoft',
])

/**
 * The licence model from the name: a subscription first (a „365 … Windows” plan is still one),
 * then a licence paid once; else „Licencja elektroniczna” for a licence producer, nothing for the
 * rest (a SaaS subscription or a certificate is not a licence).
 */
export function licenceTerms(
  name: string,
  brand: string | null = null,
): { terms: string | null; perpetual: boolean } {
  if (SUBSCRIPTION.test(name)) return { terms: SUBSCRIPTION_TERMS, perpetual: false }
  if (PERPETUAL.test(name)) return { terms: PERPETUAL_TERMS, perpetual: true }
  return { terms: brand && LICENCE_BRANDS.has(brand) ? ELECTRONIC_TERMS : null, perpetual: false }
}

/**
 * The cover of a card without a photo: a licence (`software`) or a service (or an own-brand card,
 * as `serviceTile`); anything else keeps the category icon (`null`).
 */
export function cardCover(
  card: Pick<IndexProduct, 'slug' | 'name' | 'kind' | 'brand'>,
  index: Pick<CatalogIndex, 'products' | 'brands'>,
): CardCover | null {
  if (serviceTile(card)) {
    const visual = SERVICE_VISUALS[card.slug]
    const image = visual?.product
      ? (index.products.find((item) => item.slug === visual.product)?.image ?? null)
      : null
    return {
      kind: 'service',
      alt: card.name,
      image,
      authorized: visual?.authorized === true,
      words: visual?.words ?? null,
    }
  }
  if (card.kind !== 'software') return null
  const brand = card.brand ? index.brands.find((item) => item.slug === card.brand) : undefined
  return {
    kind: 'licence',
    alt: card.name,
    brand: brand?.name ?? null,
    logo: brand?.logo ?? null,
    plan: planOf(card.name, brand?.name ?? null),
    ...licenceTerms(card.name, card.brand),
    tone: (card.brand && BRAND_TONE[card.brand]) || 'blue',
  }
}
