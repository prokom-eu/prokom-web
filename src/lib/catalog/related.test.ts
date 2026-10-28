import { describe, expect, it } from 'vitest'

import { prepareSearch } from '../search'
import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { FAMILY_LIMIT, familyProducts, suggestedProducts } from './related'

const product = (slug: string, fields: Partial<IndexProduct> = {}): IndexProduct => ({
  slug,
  name: slug.toUpperCase(),
  brand: null,
  kind: 'device',
  categories: ['kasy'],
  group: 'sprzedaz',
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 50,
  registerTypes: [],
  hay: slug,
  ...fields,
})

/** Index order = popularity, as `getCatalogIndex` sorts it; only published products are in it. */
const index = (products: IndexProduct[]): CatalogIndex => ({
  products,
  brands: [],
  categories: [],
  groups: [],
  industries: [],
  pages: [],
  search: { synonyms: {}, stopWords: [], popular: [] },
})

describe('familyProducts', () => {
  const lenovo = (slug: string, series: string | undefined, subcategory = 'Laptopy') =>
    product(slug, { brand: 'lenovo', series, subcategory, categories: ['komputery'] })

  it('takes the same brand and series first, then the same subcategory', () => {
    const catalog = index([
      lenovo('tb14', 'ThinkBook'),
      lenovo('t14', 'ThinkPad T'),
      lenovo('tb16', 'ThinkBook'),
      product('dell', {
        brand: 'dell',
        series: 'ThinkBook',
        subcategory: 'Laptopy',
        categories: ['komputery'],
      }),
      lenovo('tbmon', 'ThinkBook', 'Monitory'),
    ])
    expect(familyProducts(catalog, 'tb14').map((item) => item.slug)).toEqual([
      'tb16',
      'tbmon',
      't14',
      'dell',
    ])
  })

  it('shows at most 4, never the product itself, nothing for a product without either', () => {
    const many = index(Array.from({ length: 7 }, (_, i) => lenovo(`m${i}`, 'ThinkBook')))
    expect(familyProducts(many, 'm0')).toHaveLength(FAMILY_LIMIT)
    expect(familyProducts(many, 'm0').map((item) => item.slug)).not.toContain('m0')
    expect(familyProducts(index([product('a'), product('b')]), 'a')).toEqual([])
    expect(familyProducts(many, 'brak')).toEqual([])
  })
})

describe('suggestedProducts', () => {
  const catalog = index([
    product('ergo', { fits: ['szuflada', 'rolki', 'brak'] }),
    product('szuflada', { name: 'Szuflada kasowa SK-500', hay: 'szuflada kasowa' }),
    product('rolki', { name: 'Rolki termiczne 57 mm', hay: 'rolki papier' }),
    product('czytnik', { name: 'Czytnik kodów', hay: 'czytnik kodow skaner' }),
  ])
  const prepared = prepareSearch(catalog)

  it('matches phrases to cards, then adds „pasuje do”, without repeats', () => {
    const { cards, chips } = suggestedProducts(catalog, prepared, 'ergo', [
      'szuflada kasowa',
      'czytnik kodów',
      'terminal płatniczy',
    ])
    expect(cards.map(({ label, product }) => [label, product.slug])).toEqual([
      ['szuflada kasowa', 'szuflada'],
      ['czytnik kodów', 'czytnik'],
      [null, 'rolki'],
    ])
    expect(chips).toEqual(['terminal płatniczy'])
  })

  it('prefers a hit of the same brand', () => {
    const lenovo = index([
      product('tb14', { brand: 'lenovo' }),
      product('dell-dock', {
        brand: 'dell',
        name: 'Dell stacja dokująca',
        hay: 'stacja dokujaca',
        popularity: 90,
      }),
      product('lenovo-dock', {
        brand: 'lenovo',
        name: 'Lenovo stacja dokująca',
        hay: 'stacja dokujaca',
        popularity: 10,
      }),
    ])
    const { cards } = suggestedProducts(lenovo, prepareSearch(lenovo), 'tb14', ['stacja dokująca'])
    expect(cards.map((card) => card.product.slug)).toEqual(['lenovo-dock'])
  })

  it('never suggests the product itself', () => {
    const { cards } = suggestedProducts(catalog, prepared, 'szuflada', ['szuflada kasowa'])
    expect(cards).toEqual([])
  })
})
