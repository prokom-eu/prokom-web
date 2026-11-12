import type { CatalogIndex, IndexProduct } from '../catalog/catalogIndex'
import type { Suggestion } from '../catalog/related'

/**
 * „Do tego zwykle dobierają” never shorter than 3 (PRODUKCJA-BIZNES-1211 §1, sesja 2: 333 cards
 * had fewer, a Kyocera got two navy „USŁUGA PRO-KOM” stand-ins). The card's own picks
 * (`polecane`, phrases) come first; the rest is filled in this order: consumables of the same
 * category → accessories of the same brand → products sold with it in a ready bundle → the
 * category's service. Only listed products (the index): never a draft or another site's card.
 */
export const MIN_SUGGESTIONS = 3

/** Services that go with a category (main category slug → service card slugs, in order). */
export const CATEGORY_SERVICES: Readonly<Record<string, readonly string[]>> = {
  'kasy-fiskalne': ['fiskalizacja', 'wymiana-kasy', 'integracja-kasy'],
  'drukarki-fiskalne': ['fiskalizacja', 'integracja-kasy'],
  'stanowiska-pos': ['integracja-kasy', 'fiskalizacja'],
  'kasoterminale-mobilne': ['fiskalizacja', 'integracja-kasy'],
  'terminale-platnicze': ['integracja-kasy'],
  'kioski-ekrany-kuchenne': ['integracja-kasy'],
  'wagi-sklepowe': ['integracja-kasy'],
  'skanery-kolektory-etykiety': ['integracja-kasy'],
  'drukarki-wielofunkcyjne': ['tusze-tonery', 'serwis-drukarek', 'siec-wifi-montaz'],
  laptopy: ['przygotowanie-komputera', 'kopie-zapasowe', 'modernizacja-komputera'],
  komputery: ['przygotowanie-komputera', 'modernizacja-komputera', 'kopie-zapasowe'],
  monitory: ['przygotowanie-komputera'],
  tablety: ['przygotowanie-komputera'],
  telefony: ['m365-poczta'],
  'serwery-nas-ups': ['kopie-zapasowe', 'przeglad-it'],
  'siec-wifi': ['siec-wifi-montaz', 'przeglad-it'],
  'antywirus-firewall': ['przeglad-it', 'pomoc-zdalna'],
  'programy-sprzedazowe-erp': ['pomoc-zdalna', 'przygotowanie-komputera'],
  'programy-branzowe': ['pomoc-zdalna', 'integracja-kasy'],
  'klawiatury-myszy-sluchawki': ['przygotowanie-komputera'],
  'ekrany-projektory': ['przeglad-it'],
}

/** Last resort for any category: help that fits every device and program of a firm. */
export const COMMON_SERVICES: readonly string[] = ['pomoc-zdalna', 'przeglad-it']

/** Main categories of accessories: a same-brand product there fits a device of the brand. */
const ACCESSORY_CATEGORIES = new Set(['akcesoria-pos', 'klawiatury-myszy-sluchawki'])

/** Subcategories of consumables (the PRO-KOM „Tusze i tonery” card lives in `tusze-tonery`). */
const CONSUMABLE_SUBCATEGORIES = new Set(['tusze-tonery'])

/**
 * A consumable: in a consumables subcategory, or named as one from its first word („Toner
 * Kyocera TK-4145”) — never a device whose name mentions ink tanks or labels.
 */
const isConsumable = (product: IndexProduct) =>
  CONSUMABLE_SUBCATEGORIES.has(product.subcategory ?? '') ||
  /^(toner|tusz|rolk|taśm|bęben|papier)/i.test(product.name.trim())

export type FillContext = {
  /** Products sold with this card in a ready bundle (`W zestawach`), in the bundles' order. */
  bundleMates?: readonly string[]
}

/**
 * `cards` filled up to `MIN_SUGGESTIONS` (never cut — a card with more keeps them all). Each
 * added card is labelled with why it is there: „Eksploatacja”, „Akcesoria”, „W zestawie”,
 * „Usługa”.
 */
export function fillSuggestions(
  index: CatalogIndex,
  slug: string,
  cards: readonly Suggestion[],
  { bundleMates = [] }: FillContext = {},
): Suggestion[] {
  const self = index.products.find((product) => product.slug === slug)
  const result = [...cards]
  if (!self || result.length >= MIN_SUGGESTIONS) return result
  const used = new Set([slug, ...result.map((card) => card.product.slug)])
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const add = (product: IndexProduct | undefined, label: string) => {
    if (!product || used.has(product.slug) || result.length >= MIN_SUGGESTIONS) return
    used.add(product.slug)
    result.push({ label, product })
  }
  const main = self.categories[0]
  const others = index.products.filter((product) => product.slug !== slug)

  // 1. Consumables of the same category: of the same brand, or PRO-KOM's own (no brand).
  for (const product of others) {
    if (
      product.categories[0] === main &&
      isConsumable(product) &&
      (!product.brand || product.brand === self.brand)
    )
      add(product, 'Eksploatacja')
  }

  // 2. Accessories of the same brand (a dock to a laptop, a drawer to a register).
  if (self.brand) {
    for (const product of others) {
      if (
        product.brand === self.brand &&
        product.kind === 'device' &&
        product.categories[0] !== main &&
        (ACCESSORY_CATEGORIES.has(product.categories[0] ?? '') ||
          /akcesori|stacj|dok/i.test(product.subcategory ?? ''))
      )
        add(product, 'Akcesoria')
    }
  }

  // 3. Products sold with it in a ready bundle.
  for (const mate of bundleMates) add(bySlug.get(mate), 'W zestawie')

  // 4. The category's service.
  for (const service of [...(CATEGORY_SERVICES[main ?? ''] ?? []), ...COMMON_SERVICES])
    add(bySlug.get(service), 'Usługa')
  return result
}
