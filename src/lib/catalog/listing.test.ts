import { describe, expect, it } from 'vitest'

import { prepareSearch } from '../search'
import { buildCatalogIndex } from './catalogIndex'
import { emptySuggestions } from './listing'
import { sourceFromSeed } from './seedSource.fixture'

const index = buildCatalogIndex(sourceFromSeed())
const search = prepareSearch(index)

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
