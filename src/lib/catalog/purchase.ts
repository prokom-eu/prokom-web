import { OWN_BRAND_SLUG } from './filters'

/**
 * What the product page promises around a purchase — the service strip of the hero and „Co
 * robimy przy zakupie” — by category (K4-FINAL §4.4, K36 §5 and §13; rules of the K4 board).
 * Pure functions: copy of the page, chosen by the card's category and brand, never invented.
 */

/** Categories where data transfer makes sense (K36 §13). Slugs of `CATEGORY_SLUGS` (seed). */
const DATA_CATEGORIES: ReadonlySet<string> = new Set([
  'laptopy',
  'komputery',
  'telefony',
  'tablety',
  'programy-sprzedazowe-erp',
  'programy-branzowe',
  'microsoft-365-licencje',
  'stanowiska-pos',
  'kioski-ekrany-kuchenne',
])
/** Servers and NAS: data transfer too — but not the UPS of the same category. */
const SERVER_CATEGORY = 'serwery-nas-ups'
const DATA_SUBCATEGORIES: ReadonlySet<string> = new Set(['Serwery', 'Serwery plików NAS'])
const FISCAL_CATEGORIES: ReadonlySet<string> = new Set(['kasy-fiskalne', 'drukarki-fiskalne'])
const VENDING_CATEGORY = 'automaty-vendingowe'

export type ServiceItem = { icon: string; title: string; text: string }

const ICON = {
  shield: 'M9 12l2 2 4-4 M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z',
  ready: 'M4 17l6-6 4 4 6-6 M14 9h6v6',
  pin: 'M12 21s-7-6-7-11a7 7 0 1114 0c0 5-7 11-7 11z M12 12a2 2 0 100-4 2 2 0 000 4z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  doc: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h5',
} as const

export type PurchaseInput = {
  /** Main category slug, or `null`. */
  category: string | null
  subcategory: string | null
  brand: string | null
}

/** A service of PRO-KOM itself: the own brand (K36 §5 — the board's `marka === 'PRO-KOM'`). */
export const isOwnService = ({ brand }: Pick<PurchaseInput, 'brand'>) => brand === OWN_BRAND_SLUG

function movesData({ category, subcategory }: PurchaseInput): boolean {
  if (!category) return false
  if (DATA_CATEGORIES.has(category)) return true
  return category === SERVER_CATEGORY && subcategory !== null && DATA_SUBCATEGORIES.has(subcategory)
}

/** The three items of the hero's service strip. */
export function serviceStrip(input: PurchaseInput): ServiceItem[] {
  if (isOwnService(input)) {
    return [
      { icon: ICON.doc, title: 'Usługa PRO-KOM', text: 'robimy to sami, bez podwykonawców' },
      { icon: ICON.phone, title: 'Oddzwaniamy w 60 min', text: 'w godzinach pracy' },
      { icon: ICON.pin, title: 'Na miejscu', text: 'Rabka-Zdrój, Podhale i Małopolska' },
    ]
  }
  const vending = input.category === VENDING_CATEGORY
  const ready = movesData(input)
    ? 'konfiguracja i przeniesienie danych'
    : vending
      ? 'dobór i uruchomienie z Optivendi'
      : input.category && FISCAL_CATEGORIES.has(input.category)
        ? 'fiskalizacja i szkolenie na miejscu'
        : 'uruchomienie i szkolenie na miejscu'
  return [
    { icon: ICON.shield, title: 'Gwarancja producenta', text: 'zgłoszenia prowadzimy za Ciebie' },
    { icon: ICON.ready, title: 'Gotowe do pracy', text: ready },
    vending
      ? { icon: ICON.pin, title: 'Serwis Optivendi', text: 'zdalnie i na miejscu' }
      : { icon: ICON.pin, title: 'Serwis na miejscu', text: 'Rabka-Zdrój i cała Małopolska' },
  ]
}

/** „Co robimy przy zakupie” in one sentence (the board's `coRob9`). */
export function purchaseSentence(input: PurchaseInput): string {
  if (input.category === VENDING_CATEGORY) {
    return 'Dobór automatu, uruchomienie z Optivendi i szkolenie w jednej ofercie.'
  }
  if (movesData(input)) {
    return 'Dobór wersji, konfiguracja, przeniesienie danych, szkolenie i serwis w jednej ofercie.'
  }
  if (input.category && FISCAL_CATEGORIES.has(input.category)) {
    return 'Dobór, fiskalizacja, szkolenie i serwis w jednej ofercie.'
  }
  return 'Dobór, dostawa, uruchomienie, szkolenie i serwis w jednej ofercie.'
}

/**
 * A card shown as the navy „Usługa PRO-KOM” tile when it has no photo (K36 §5, §10): a service,
 * or any card of the own brand („Tusze i tonery” is an information tile of PRO-KOM).
 */
export const serviceTile = (card: { kind: string; brand: string | null }) =>
  card.kind === 'service' || card.brand === OWN_BRAND_SLUG
