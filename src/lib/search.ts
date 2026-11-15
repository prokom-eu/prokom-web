import type { CatalogIndex, IndexProduct } from './catalog/catalogIndex'
import { normalizeText } from './catalog/normalize'
import { brandTarget } from './catalog/brand'
import { plural } from './plural'
import {
  prepareItems,
  searchItems,
  searchText,
  textHit,
  tokenize,
  type PreparedItems,
} from './shared/search/engine'

/**
 * Search of the Biznes catalog (spec. §8.2) on the shared engine (`lib/shared/search/engine.ts`,
 * moved there in D2-2 for the shared search dialog). The engine is re-exported here, so callers
 * and tests of Biznes keep their imports.
 */
export * from './shared/search/engine'

/** The Biznes catalog prepared for search. */
export type PreparedSearch = PreparedItems<IndexProduct>

/** The Biznes catalog: a product is found by its name and brand, then its group. */
export function prepareSearch(index: CatalogIndex): PreparedSearch {
  const brandNames = new Map(index.brands.map((brand) => [brand.slug, brand.name]))
  const groupNames = new Map(index.groups.map((group) => [group.slug, group.name]))
  const categoryNames = new Map(index.categories.map((category) => [category.slug, category.name]))
  return prepareItems(
    index.products.map((product) => ({
      item: product,
      name: `${product.name} ${(product.brand && brandNames.get(product.brand)) ?? ''}`,
      // The index keeps the benefit out of `hay` (size); the search still matches it.
      hay: product.benefit ? `${product.hay} ${normalizeText(product.benefit)}` : product.hay,
      popularity: product.popularity,
      group: product.group ? groupNames.get(product.group) : null,
      category: product.categories[0] ? categoryNames.get(product.categories[0]) : null,
    })),
    index.search,
  )
}

/** Products of the Biznes catalog matching every token, best first. */
export const searchProducts: (prepared: PreparedSearch, query: string) => IndexProduct[] | null =
  searchItems

/**
 * Categories of the results with the number of hits in each. A category whose name holds more
 * tokens of the query comes first („kasa” → „Kasy fiskalne” before 74 scanners), then the one
 * with more hits; ties keep the catalog order.
 */
export function matchCategories(
  index: CatalogIndex,
  prepared: PreparedSearch,
  results: IndexProduct[],
  query: string,
): (CatalogIndex['categories'][number] & { hits: number })[] {
  const hits = new Map<string, number>()
  for (const product of results) {
    for (const slug of new Set(product.categories)) hits.set(slug, (hits.get(slug) ?? 0) + 1)
  }
  const tokens = tokenize(query, prepared.stopWords)
  const nameHits = (name: string) => {
    const text = searchText(normalizeText(name))
    return tokens.filter((token) => textHit(text, token, prepared.synonyms)).length
  }
  return index.categories
    .filter((category) => hits.has(category.slug))
    .map((category) => ({
      category: { ...category, hits: hits.get(category.slug)! },
      nameHits: nameHits(category.name),
    }))
    .sort((a, b) => b.nameHits - a.nameHits || b.category.hits - a.category.hits)
    .map(({ category }) => category)
}

/** Pages of the site whose title holds every token of the query. */
export function matchPages(index: CatalogIndex, query: string): CatalogIndex['pages'] {
  const tokens = tokenize(query, new Set(index.search.stopWords.map(normalizeText)))
  if (tokens.length === 0) return []
  return index.pages.filter((page) => {
    const title = normalizeText(page.title)
    return tokens.every((token) => title.includes(token))
  })
}

/**
 * Brands with a page whose name holds every token of the query (K3-KATALOG §9: the search
 * covers the brands), most listed products first — „lenovo” → the page of Lenovo.
 */
export function matchBrands(index: CatalogIndex, query: string): CatalogIndex['brands'] {
  const tokens = tokenize(query, new Set(index.search.stopWords.map(normalizeText)))
  if (tokens.length === 0) return []
  const counts = new Map<string, number>()
  for (const { brand } of index.products) if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1)
  return index.brands
    .filter((brand) => {
      if (!brandTarget(brand)) return false
      const name = normalizeText(brand.name)
      return tokens.every((token) => name.includes(token))
    })
    .sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0))
}

/** „1 wynik”, „2–4 wyniki”, „5+ wyników” (12–14 → „wyników”). */
export function resultsLabel(count: number): string {
  return `${count} ${plural(count, ['wynik', 'wyniki', 'wyników'])}`
}
