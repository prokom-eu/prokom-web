import { searchProducts, type PreparedSearch } from '../search'
import type { CatalogIndex, IndexProduct } from './catalogIndex'
import type { CatalogState } from './filters'

/**
 * What the catalog grid shows besides products (spec. §5.3, board `Katalog`): the wizard card
 * after the 5th position, the GoPOS / InsERT card after the 11th — only in a browsed list,
 * not in a search or a chosen category — and „Może chodziło o” for an empty result.
 */

/** Flagship partners with their own page (spec. §6.5, §6.6); brand slugs from the seed. */
export const PARTNERS = [
  { slug: 'gopos', group: 'sprzedaz' },
  { slug: 'insert', group: 'oprogramowanie' },
] as const

export type PartnerSlug = (typeof PARTNERS)[number]['slug']

export type CatalogSlot =
  | { type: 'product'; product: IndexProduct; position: number }
  | { type: 'wizard' }
  | { type: 'partners'; partners: PartnerSlug[] }

const WIZARD_AFTER = 5
const PARTNERS_AFTER = 11

/**
 * The grid in order. The partner card follows the 11th product, or ends a list of 6–10;
 * with a group chosen only that group's partner shows. `available`: partners in the catalog.
 */
export function catalogSlots(
  visible: IndexProduct[],
  state: Pick<CatalogState, 'query' | 'categories' | 'group'>,
  available: readonly PartnerSlug[],
): CatalogSlot[] {
  const browsing = !state.query && state.categories.length === 0
  const partners = PARTNERS.filter(
    (partner) =>
      available.includes(partner.slug) && (!state.group || partner.group === state.group),
  ).map((partner) => partner.slug)
  const partnersAfter = Math.min(PARTNERS_AFTER, visible.length)

  const slots: CatalogSlot[] = []
  visible.forEach((product, position) => {
    slots.push({ type: 'product', product, position })
    const count = position + 1
    if (!browsing) return
    if (count === WIZARD_AFTER) slots.push({ type: 'wizard' })
    if (count === partnersAfter && count > WIZARD_AFTER && partners.length > 0) {
      slots.push({ type: 'partners', partners })
    }
  })
  return slots
}

const SUGGESTIONS = 3

/**
 * „Może chodziło o” under an empty result: products matching the first word of the phrase,
 * then the home page's featured ones — three, without repeats.
 */
export function emptySuggestions(
  index: Pick<CatalogIndex, 'products'>,
  search: PreparedSearch,
  query: string,
): IndexProduct[] {
  const firstWord = query.trim().split(/\s+/)[0] ?? ''
  const matches = (firstWord && searchProducts(search, firstWord)) || []
  const featured = index.products
    .filter((product) => product.featuredOrder !== undefined)
    .sort((a, b) => a.featuredOrder! - b.featuredOrder!)
  const seen = new Set<string>()
  return [...matches, ...featured]
    .filter((product) => !seen.has(product.slug) && seen.add(product.slug))
    .slice(0, SUGGESTIONS)
}
