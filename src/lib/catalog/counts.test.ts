import { describe, expect, it } from 'vitest'

import { fillCatalogCounts } from './counts'

describe('fillCatalogCounts', () => {
  it('puts the numbers from the catalog into the editor text', () => {
    expect(
      fillCatalogCounts('{produkty} produktów i usług od {marki} marek.', {
        products: 225,
        brands: 31,
      }),
    ).toBe('225 produktów i usług od 31 marek.')
  })

  it('leaves text without placeholders and unknown ones as they are', () => {
    expect(fillCatalogCounts('Bez liczb {inne}', { products: 1, brands: 1 })).toBe(
      'Bez liczb {inne}',
    )
  })

  it('replaces every occurrence', () => {
    expect(fillCatalogCounts('{produkty}/{produkty}', { products: 7, brands: 0 })).toBe('7/7')
  })
})
