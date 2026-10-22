import { describe, expect, it } from 'vitest'

import { prepareSearch } from '../search'
import { buildCatalogIndex } from './catalogIndex'
import { DEFAULT_STATE, runCatalog, type CatalogState } from './filters'
import { catalogSlots, emptySuggestions, PARTNERS, type CatalogSlot } from './listing'
import { sourceFromSeed } from './seedSource.fixture'

const index = buildCatalogIndex(sourceFromSeed())
const search = prepareSearch(index)
const both = PARTNERS.map((partner) => partner.slug)

const slots = (state: Partial<CatalogState>, available = both) => {
  const view = { ...DEFAULT_STATE, ...state }
  return catalogSlots(runCatalog(index, search, view).visible, view, available)
}
const kinds = (list: CatalogSlot[]) => list.map((slot) => slot.type)

describe('catalogSlots (promo cards in the grid, as in the Katalog board)', () => {
  it('puts the wizard after the 5th product and the partners after the 11th', () => {
    const list = slots({})
    expect(kinds(list).slice(0, 7)).toEqual([
      'product',
      'product',
      'product',
      'product',
      'product',
      'wizard',
      'product',
    ])
    expect(list[12]).toEqual({ type: 'partners', partners: ['gopos', 'insert'] })
    expect(list.filter((slot) => slot.type === 'product')).toHaveLength(12)
  })

  it('keeps every product with its position in the list', () => {
    const positions = slots({ page: 2 }).flatMap((slot) =>
      slot.type === 'product' ? [slot.position] : [],
    )
    expect(positions).toEqual([...Array(24).keys()])
  })

  it('shows no promo card with a phrase or with categories ticked', () => {
    expect(kinds(slots({ query: 'kasa' }))).not.toContain('wizard')
    expect(kinds(slots({ categories: ['kasy-fiskalne'] }))).not.toContain('partners')
  })

  it('picks the partner by group: sales → GoPOS, software → InsERT, others none', () => {
    const partnersOf = (group: string) =>
      slots({ group }).flatMap((slot) => (slot.type === 'partners' ? slot.partners : []))
    expect(partnersOf('sprzedaz')).toEqual(['gopos'])
    expect(partnersOf('oprogramowanie')).toEqual(['insert'])
    expect(partnersOf('komputery-biuro')).toEqual([])
  })

  it('ends a shorter list with the partner card (InsERT in software: 8 positions)', () => {
    expect(kinds(slots({ group: 'oprogramowanie', brands: ['insert'] }))).toEqual([
      ...Array(5).fill('product'),
      'wizard',
      ...Array(3).fill('product'),
      'partners',
    ])
  })

  it('leaves out a partner missing from the catalog', () => {
    expect(slots({}, ['insert'])[12]).toEqual({ type: 'partners', partners: ['insert'] })
    expect(kinds(slots({}, []))).not.toContain('partners')
  })

  it('needs enough products: no promo card in a list shorter than 5', () => {
    const list = slots({ brands: ['fawag'] })
    expect(list.length).toBeLessThan(5)
    expect(kinds(list).every((kind) => kind === 'product')).toBe(true)
    // Exactly 5 (Lenovo): the wizard closes the list, no partner card.
    expect(kinds(slots({ brands: ['lenovo'] }))).toEqual([...Array(5).fill('product'), 'wizard'])
  })
})

describe('emptySuggestions („Może chodziło o”)', () => {
  it('starts with matches of the first word, then the featured products — 3, no repeats', () => {
    const list = emptySuggestions(index, search, 'terminal zzzbrak')
    expect(list).toHaveLength(3)
    expect(list[0]!.name).toMatch(/Terminal/)
    expect(new Set(list.map((p) => p.slug)).size).toBe(3)
  })

  it('falls back to the featured products in their order', () => {
    const featured = index.products
      .filter((p) => p.featuredOrder !== undefined)
      .sort((a, b) => a.featuredOrder! - b.featuredOrder!)
      .slice(0, 3)
    expect(emptySuggestions(index, search, 'zzzbrak')).toEqual(featured)
    expect(emptySuggestions(index, search, '')).toEqual(featured)
  })
})
