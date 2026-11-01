import { searchProducts, type PreparedSearch } from '../search'
import type { CatalogIndex, IndexProduct } from './catalogIndex'

/**
 * Products shown under the product page (spec. §6.2, K31-ZMIANY §4 pkt 7). Every one comes from
 * the catalog index, which holds only this site's published products — so a draft or another
 * site's product never shows up, whatever the relation in the panel points at.
 */

/** „Z tej samej rodziny”: at most 4 (K31-ZMIANY §4 pkt 7). */
export const FAMILY_LIMIT = 4

/** „Do tego zwykle dobierają”: cards in one row (4) and its second half. */
export const SUGGESTION_LIMIT = 8

/** Listed products for slugs, in their order: no repeats, none missing, not the product itself. */
function listed(index: CatalogIndex, self: string, slugs: readonly string[]): IndexProduct[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const seen = new Set([self])
  const products: IndexProduct[] = []
  for (const slug of slugs) {
    const product = bySlug.get(slug)
    if (!product || seen.has(slug)) continue
    seen.add(slug)
    products.push(product)
  }
  return products
}

/**
 * „Z tej samej rodziny” (K31-ZMIANY §4 pkt 7): the same brand and series first, then the same
 * subcategory of the main category; most popular first (the index is sorted by popularity).
 * A product of a series without a subcategory takes its main category instead — K4 made the
 * former subcategories „Laptopy”, „Komputery”, „Monitory” categories of their own (D-K4-2).
 */
export function familyProducts(index: CatalogIndex, slug: string): IndexProduct[] {
  const self = index.products.find((product) => product.slug === slug)
  if (!self) return []
  const others = index.products.filter((product) => product.slug !== slug)
  const series = self.series
    ? others.filter((product) => product.brand === self.brand && product.series === self.series)
    : []
  const subcategory =
    self.subcategory || self.series
      ? others.filter(
          (product) =>
            (!self.subcategory || product.subcategory === self.subcategory) &&
            product.categories[0] === self.categories[0] &&
            !series.includes(product),
        )
      : []
  return [...series, ...subcategory].slice(0, FAMILY_LIMIT)
}

export type Suggestion = { label: string | null; product: IndexProduct }

/**
 * „Do tego zwykle dobierają” (K31-ZMIANY §4 pkt 7, decision 28.10): each phrase of
 * `suggestions` („szuflada kasowa”) as the best search hit — of the product's brand when it has
 * one (a ThinkBook gets a Lenovo dock) — then the products of „pasuje do” (`fitsWith`). A phrase
 * without a hit stays a text chip. No product twice, never the product itself.
 */
export function suggestedProducts(
  index: CatalogIndex,
  prepared: PreparedSearch,
  slug: string,
  phrases: readonly string[],
): { cards: Suggestion[]; chips: string[] } {
  const brand = index.products.find((product) => product.slug === slug)?.brand ?? null
  const used = new Set([slug])
  const cards: Suggestion[] = []
  const chips: string[] = []
  for (const phrase of phrases) {
    const hits = (searchProducts(prepared, phrase) ?? []).filter(
      (product) => !used.has(product.slug),
    )
    const hit = (brand && hits.find((product) => product.brand === brand)) || hits[0]
    if (hit) {
      used.add(hit.slug)
      cards.push({ label: phrase, product: hit })
    } else chips.push(phrase)
  }
  const fits = index.products.find((product) => product.slug === slug)?.fits ?? []
  for (const product of listed(index, slug, fits)) {
    if (used.has(product.slug)) continue
    used.add(product.slug)
    cards.push({ label: null, product })
  }
  return { cards: cards.slice(0, SUGGESTION_LIMIT), chips }
}

/**
 * „Do tego zwykle dobierają” of K4 (`polecane`, K36 §13 W14): the panel's cards with their
 * labels, each once, listed only — then „pasuje do” (`fitsWith`), up to `SUGGESTION_LIMIT`.
 * Empty when none of the `polecane` is listed: the page then falls back to the phrases.
 */
export function recommendedProducts(
  index: CatalogIndex,
  slug: string,
  recommended: readonly { slug: string; label: string }[],
): Suggestion[] {
  const labels = new Map<string, string>()
  for (const item of recommended) if (!labels.has(item.slug)) labels.set(item.slug, item.label)
  const cards = listed(index, slug, [...labels.keys()])
  if (cards.length === 0) return []
  const fits = index.products.find((product) => product.slug === slug)?.fits ?? []
  const extra = listed(index, slug, fits).filter((product) => !labels.has(product.slug))
  return [
    ...cards.map((product) => ({ label: labels.get(product.slug)!, product })),
    ...extra.map((product) => ({ label: null, product })),
  ].slice(0, SUGGESTION_LIMIT)
}
