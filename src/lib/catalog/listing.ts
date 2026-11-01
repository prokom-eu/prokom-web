import { searchProducts, type PreparedSearch } from '../search'
import type { CatalogIndex, IndexProduct } from './catalogIndex'

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
