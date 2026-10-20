import { describe, expect, it } from 'vitest'

import { buildCatalogIndex } from './catalog/catalogIndex'
import { sourceFromSeed } from './catalog/seedSource.fixture'
import {
  damerauLevenshtein,
  matchCategories,
  matchPages,
  prepareSearch,
  resultsLabel,
  searchProducts,
  tokenize,
} from './search'

const index = buildCatalogIndex(sourceFromSeed())
const prepared = prepareSearch(index)
const slugs = (query: string) => searchProducts(prepared, query)?.map((p) => p.slug) ?? null
const top = (query: string, n = 3) => slugs(query)?.slice(0, n) ?? []
const productOf = (slug: string) => index.products.find((p) => p.slug === slug)
const categoryOf = (slug: string) => productOf(slug)?.categories[0]
const nameOf = (slug: string) => productOf(slug)?.name

describe('damerauLevenshtein', () => {
  it('counts edits, a swap of neighbours as one', () => {
    expect(damerauLevenshtein('kasa', 'kasa')).toBe(0)
    expect(damerauLevenshtein('kasa', 'kasy')).toBe(1)
    expect(damerauLevenshtein('fiskalne', 'fiskalen')).toBe(1)
    expect(damerauLevenshtein('fiskalan', 'fiskalne')).toBe(2)
    expect(damerauLevenshtein('', 'abc')).toBe(3)
  })

  it('gives up early on words of very different length', () => {
    expect(damerauLevenshtein('ab', 'abcdef')).toBeGreaterThan(2)
  })
})

describe('tokenize', () => {
  it('normalizes, splits on non-alphanumerics and drops stop words', () => {
    expect(tokenize('Szukam kasy  NA baterię!', new Set(['szukam', 'na']))).toEqual([
      'kasy',
      'baterie',
    ])
    expect(tokenize('Wi-Fi / łączność', new Set())).toEqual(['wi', 'fi', 'lacznosc'])
  })
})

describe('searchProducts on the seed catalog (spec. §9 pkt 2)', () => {
  it('returns null for an empty or stop-word-only query', () => {
    expect(slugs('')).toBeNull()
    expect(slugs('   ')).toBeNull()
    expect(slugs('szukam dla')).toBeNull()
  })

  it('„kasa fiskalan” finds fiscal registers despite the typo', () => {
    // Registers first; register service and inspection follow (they match "kas" and "fiskaln").
    expect(top('kasa fiskalan', 2).map(categoryOf)).toEqual(['kasy-fiskalne', 'kasy-fiskalne'])
  })

  it('„terminal” finds payment terminals', () => {
    expect(top('terminal').map(categoryOf)).toContain('terminale-platnicze')
  })

  it('„subiekt” puts Subiekt first', () => {
    expect(nameOf(top('subiekt', 1)[0]!)).toMatch(/Subiekt/)
  })

  it('„kasa na baterie” finds a mobile register', () => {
    const found = top('kasa na baterie')
    expect(found).toContain('posnet-ergo-online')
    for (const slug of found) expect(categoryOf(slug)).toBe('kasy-fiskalne')
  })

  it('„restauracja” finds gastronomy products through synonyms', () => {
    expect(top('restauracja', 5).map(nameOf)).toContain('GoPOS')
  })

  it('„wifi” finds Ubiquiti', () => {
    const results = searchProducts(prepared, 'wifi') ?? []
    expect(results.map((product) => product.name)).toContain('Ubiquiti UniFi U7 Pro')
    // Registers with a Wi-Fi module rank above it on popularity; the category shows next to them.
    expect(matchCategories(index, results).map((category) => category.slug)).toContain(
      categoryOf('ubiquiti-unifi-u7-pro'),
    )
  })

  it('„ksef” finds products for KSeF', () => {
    expect(top('ksef').map(nameOf)).toContain('Wdrożenie KSeF w firmie')
  })

  it('every token must match (AND)', () => {
    const both = slugs('kasa terminal') ?? []
    const kasa = new Set(slugs('kasa'))
    const terminal = new Set(slugs('terminal'))
    for (const slug of both) {
      expect(kasa.has(slug) && terminal.has(slug)).toBe(true)
    }
  })

  it('a nonsense phrase finds nothing', () => {
    expect(slugs('zxqvbn')).toEqual([])
  })

  it('a name hit outranks a description hit', () => {
    const results = searchProducts(prepared, 'posnet') ?? []
    expect(results[0]?.name.toLowerCase()).toContain('posnet')
  })
})

describe('matchCategories and matchPages', () => {
  it('counts the hits of a query by category, most first', () => {
    const results = searchProducts(prepared, 'kasa') ?? []
    const categories = matchCategories(index, results)
    expect(categories[0]).toMatchObject({ slug: 'kasy-fiskalne' })
    expect(categories[0]!.hits).toBeGreaterThan(0)
    const total = categories.reduce((sum, category) => sum + category.hits, 0)
    expect(total).toBeGreaterThanOrEqual(results.length)
  })

  it('finds pages by title, accent-insensitive, every token', () => {
    expect(matchPages(index, 'opieka').map((page) => page.slug)).toEqual(['opieka-it'])
    expect(matchPages(index, 'OPIEKA it')).toHaveLength(1)
    expect(matchPages(index, 'opieka kasa')).toEqual([])
    expect(matchPages(index, '')).toEqual([])
  })
})

describe('resultsLabel', () => {
  it.each([
    [1, '1 wynik'],
    [2, '2 wyniki'],
    [4, '4 wyniki'],
    [5, '5 wyników'],
    [12, '12 wyników'],
    [14, '14 wyników'],
    [22, '22 wyniki'],
    [0, '0 wyników'],
  ])('%i → %s', (count, label) => {
    expect(resultsLabel(count)).toBe(label)
  })
})
