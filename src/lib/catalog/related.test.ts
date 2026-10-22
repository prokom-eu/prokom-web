import { describe, expect, it } from 'vitest'

import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { alternativeProducts, kitProducts, similarProducts } from './related'

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

describe('similarProducts', () => {
  const catalog = index([
    product('a'),
    product('ergo'),
    product('b', { categories: ['akcesoria', 'kasy'] }),
    product('obca', { categories: ['terminale'] }),
    product('c'),
    product('d'),
    product('e'),
  ])

  it('takes the 4 most popular of the main category, without the product itself', () => {
    expect(similarProducts(catalog, 'ergo').map((item) => item.slug)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('is empty for a product missing from the index', () => {
    expect(similarProducts(catalog, 'nie-ma')).toEqual([])
  })
})

describe('kitProducts', () => {
  it('keeps the panel order of „pasuje do”, only listed products, no repeats and not itself', () => {
    const catalog = index([
      product('ergo', { fits: ['szuflada', 'szkic', 'ergo', 'terminal', 'szuflada'] }),
      product('terminal'),
      product('szuflada'),
    ])
    expect(kitProducts(catalog, 'ergo').map((item) => item.slug)).toEqual(['szuflada', 'terminal'])
  })

  it('shows at most 5', () => {
    const fits = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
    const catalog = index([product('ergo', { fits }), ...fits.map((slug) => product(slug))])
    expect(kitProducts(catalog, 'ergo')).toHaveLength(5)
  })

  it('is empty without „pasuje do”', () => {
    expect(kitProducts(index([product('ergo')]), 'ergo')).toEqual([])
  })
})

describe('alternativeProducts', () => {
  it('maps slugs to listed products in their order, skipping missing ones and itself', () => {
    const catalog = index([product('ergo'), product('neo'), product('mini')])
    expect(
      alternativeProducts(catalog, 'ergo', ['mini', 'szkic', 'ergo', 'neo', 'mini']).map(
        (item) => item.slug,
      ),
    ).toEqual(['mini', 'neo'])
  })
})
