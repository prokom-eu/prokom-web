import type { CatalogIndex, IndexProduct } from './catalog/catalogIndex'
import { normalizeText } from './catalog/normalize'
import { plural } from './plural'

/**
 * Search of the Biznes catalog (spec. §8.2), on the client over the catalog index. A port of
 * `__pk17` from `docs/design/prokombiznes/boards/Main.dc.html`: every token must match, a hit
 * in the name or brand weighs 3, elsewhere 1, through a synonym 1, a typo 0.6, plus
 * `popularity / 200`.
 */

const NAME_HIT = 3
const HAY_HIT = 1
const SYNONYM_HIT = 1
const TYPO_HIT = 0.6

/** Words shorter than this are not compared for typos (spec. §8.2: from 4 characters). */
const TYPO_MIN_TOKEN = 4

type SearchProduct = { product: IndexProduct; name: string; words: string[] }

export type PreparedSearch = {
  products: SearchProduct[]
  synonyms: Map<string, string[]>
  stopWords: Set<string>
}

/** Optimal string alignment distance: insertions, deletions, substitutions, adjacent swaps. */
export function damerauLevenshtein(a: string, b: string): number {
  // Typos are allowed up to 2 edits: past that the exact count does not matter.
  if (Math.abs(a.length - b.length) > 2) return Math.max(a.length, b.length)
  const rows: number[][] = []
  for (let i = 0; i <= a.length; i++) rows.push([i])
  for (let j = 1; j <= b.length; j++) rows[0]![j] = j
  for (let i = 1; i <= a.length; i++) {
    const row = rows[i]!
    const prev = rows[i - 1]!
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, rows[i - 2]![j - 2]! + 1)
      }
      row[j] = value
    }
  }
  return rows[a.length]![b.length]!
}

/** Tokens of a query: normalized, split on non-alphanumerics, without stop words. */
export function tokenize(query: string, stopWords: Set<string>): string[] {
  return normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !stopWords.has(token))
}

/** Work done once per index: normalized names, words for typos, normalized settings. */
export function prepareSearch(index: CatalogIndex): PreparedSearch {
  const brandNames = new Map(index.brands.map((brand) => [brand.slug, brand.name]))
  return {
    products: index.products.map((product) => ({
      product,
      name: normalizeText(
        `${product.name} ${(product.brand && brandNames.get(product.brand)) ?? ''}`,
      ),
      words: product.hay.split(/[^a-z0-9]+/).filter((word) => word.length > 2),
    })),
    synonyms: new Map(
      Object.entries(index.search.synonyms).map(([phrase, expansions]) => [
        normalizeText(phrase),
        expansions.map(normalizeText).filter(Boolean),
      ]),
    ),
    stopWords: new Set(index.search.stopWords.map(normalizeText)),
  }
}

function typoLimit(token: string): number {
  return token.length >= 7 ? 2 : 1
}

function tokenScore(entry: SearchProduct, token: string, synonyms: Map<string, string[]>): number {
  const { hay } = entry.product
  if (hay.includes(token)) return entry.name.includes(token) ? NAME_HIT : HAY_HIT
  if (synonyms.get(token)?.some((expansion) => hay.includes(expansion))) return SYNONYM_HIT
  if (token.length >= TYPO_MIN_TOKEN) {
    const limit = typoLimit(token)
    for (const word of entry.words) {
      if (
        damerauLevenshtein(token, word.slice(0, token.length)) <= limit ||
        damerauLevenshtein(token, word) <= limit
      ) {
        return TYPO_HIT
      }
    }
  }
  return 0
}

/** Products matching every token, best first; `null` when the query has no tokens. */
export function searchProducts(prepared: PreparedSearch, query: string): IndexProduct[] | null {
  const tokens = tokenize(query, prepared.stopWords)
  if (tokens.length === 0) return null
  const scored: { product: IndexProduct; score: number }[] = []
  for (const entry of prepared.products) {
    let score = 0
    for (const token of tokens) {
      const hit = tokenScore(entry, token, prepared.synonyms)
      if (hit === 0) {
        score = 0
        break
      }
      score += hit
    }
    if (score > 0)
      scored.push({ product: entry.product, score: score + entry.product.popularity / 200 })
  }
  // Stable sort: equal scores keep the catalog order.
  return scored.sort((a, b) => b.score - a.score).map(({ product }) => product)
}

/** Categories of the results with the number of hits in each, most first. */
export function matchCategories(
  index: CatalogIndex,
  results: IndexProduct[],
): (CatalogIndex['categories'][number] & { hits: number })[] {
  const hits = new Map<string, number>()
  for (const product of results) {
    for (const slug of new Set(product.categories)) hits.set(slug, (hits.get(slug) ?? 0) + 1)
  }
  return index.categories
    .filter((category) => hits.has(category.slug))
    .map((category) => ({ ...category, hits: hits.get(category.slug)! }))
    .sort((a, b) => b.hits - a.hits)
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

/** „1 wynik”, „2–4 wyniki”, „5+ wyników” (12–14 → „wyników”). */
export function resultsLabel(count: number): string {
  return `${count} ${plural(count, ['wynik', 'wyniki', 'wyników'])}`
}
