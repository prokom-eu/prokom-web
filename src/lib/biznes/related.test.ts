import { describe, expect, it } from 'vitest'

import type { CatalogIndex, IndexProduct } from '../catalog/catalogIndex'
import { fillSuggestions, MIN_SUGGESTIONS } from './related'

const product = (slug: string, fields: Partial<IndexProduct> = {}): IndexProduct => ({
  slug,
  name: slug,
  brand: null,
  kind: 'device',
  categories: ['drukarki-wielofunkcyjne'],
  group: 'komputery-biuro',
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 50,
  registerTypes: [],
  hay: slug,
  ...fields,
})

const index = (products: IndexProduct[]): CatalogIndex => ({
  products,
  brands: [],
  categories: [],
  groups: [],
  industries: [],
  pages: [],
  search: { synonyms: {}, stopWords: [], popular: [] },
})

const kyocera = product('kyocera-taskalfa', { brand: 'kyocera', name: 'Kyocera TASKalfa 2320' })
const catalog = index([
  kyocera,
  product('toner-kyocera', { brand: 'kyocera', name: 'Toner Kyocera TK-4145' }),
  product('toner-brother', { brand: 'brother', name: 'Toner Brother TN-2420' }),
  product('brother-mfc', { brand: 'brother', name: 'Brother MFC-L2922DW' }),
  product('tusze-tonery', { kind: 'service', name: 'Tusze i tonery' }),
  product('serwis-drukarek', { kind: 'service', name: 'Serwis drukarek' }),
  product('lenovo-thinkbook', { brand: 'lenovo', categories: ['laptopy'] }),
  product('lenovo-stacja', {
    brand: 'lenovo',
    categories: ['komputery'],
    subcategory: 'stacje-dokujace',
  }),
  product('przygotowanie-komputera', { kind: 'service', categories: ['opieka-it-wdrozenia'] }),
])

describe('„Do tego zwykle dobierają” — at least 3 (PRODUKCJA-BIZNES-1211 §1)', () => {
  it('fills an MFP with its consumable first (own brand), then the category’s service', () => {
    const cards = fillSuggestions(catalog, 'kyocera-taskalfa', [])
    expect(cards.map((card) => [card.product.slug, card.label])).toEqual([
      ['toner-kyocera', 'Eksploatacja'],
      ['toner-brother', 'Eksploatacja'],
      ['tusze-tonery', 'Usługa'],
    ])
  })

  it('keeps the card’s own picks first and never repeats one', () => {
    const own = [{ label: 'Toner', product: catalog.products[1]! }]
    const cards = fillSuggestions(catalog, 'kyocera-taskalfa', own)
    expect(cards).toHaveLength(MIN_SUGGESTIONS)
    expect(cards[0]).toBe(own[0])
    expect(new Set(cards.map((card) => card.product.slug)).size).toBe(cards.length)
  })

  it('adds a same-brand accessory and bundle mates before a service', () => {
    const cards = fillSuggestions(catalog, 'lenovo-thinkbook', [], { bundleMates: ['brother-mfc'] })
    expect(cards.map((card) => [card.product.slug, card.label])).toEqual([
      ['lenovo-stacja', 'Akcesoria'],
      ['brother-mfc', 'W zestawie'],
      ['przygotowanie-komputera', 'Usługa'],
    ])
  })

  it('never cuts a longer list and skips what is not listed', () => {
    const many = catalog.products.slice(1, 5).map((item) => ({ label: null, product: item }))
    expect(fillSuggestions(catalog, 'kyocera-taskalfa', many)).toHaveLength(4)
    expect(fillSuggestions(catalog, 'nie-ma', [])).toEqual([])
    expect(
      fillSuggestions(index([kyocera]), 'kyocera-taskalfa', [], { bundleMates: ['nie-ma'] }),
    ).toEqual([])
  })
})
