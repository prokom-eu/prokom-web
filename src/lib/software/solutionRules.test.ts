import { describe, expect, it } from 'vitest'

import {
  levelCellsError,
  includedError,
  lowestLevelPrice,
  relatedFilter,
  thumbnailError,
} from './solutionRules'

describe('lowestLevelPrice', () => {
  it('is the lowest price of the levels (care, audit)', () => {
    expect(lowestLevelPrice([{ price: 299 }, { price: 149 }, { price: 790 }])).toBe(149)
  })

  it('treats 0 as a price (free quick audit)', () => {
    expect(lowestLevelPrice([{ price: 0 }, { price: 990 }])).toBe(0)
  })

  it('is null without levels or without a price in them', () => {
    expect(lowestLevelPrice([])).toBeNull()
    expect(lowestLevelPrice(null)).toBeNull()
    expect(lowestLevelPrice(undefined)).toBeNull()
    expect(lowestLevelPrice([{ price: null }, { price: Number.NaN }, { price: -1 }])).toBeNull()
  })
})

describe('includedError', () => {
  it('asks for „W cenie” when a solution has a price and no levels', () => {
    expect(includedError([], { priceFrom: 2490, levels: [] })).toEqual(expect.any(String))
    expect(includedError(null, { priceFrom: 0 })).toEqual(expect.any(String))
    expect(includedError(['  '], { priceFrom: 990 })).toEqual(expect.any(String))
  })

  it('accepts a priced solution with the list filled', () => {
    expect(includedError(['Do 5 podstron'], { priceFrom: 2490 })).toBeNull()
  })

  it('does not ask without a price (quote) or with levels (care, audit)', () => {
    expect(includedError([], { priceFrom: null })).toBeNull()
    expect(includedError(undefined, { priceFrom: undefined })).toBeNull()
    expect(includedError([], { priceFrom: 149, levels: [{ price: 149 }] })).toBeNull()
  })
})

describe('levelCellsError', () => {
  it('wants one cell per level', () => {
    expect(levelCellsError(['tak', 'tak', 'tak'], 3)).toBeNull()
    expect(levelCellsError(['tak', 'nie'], 3)).toEqual(expect.any(String))
    expect(levelCellsError(null, 3)).toEqual(expect.any(String))
  })

  it('says the table needs levels when there are none (no cell count would fix it)', () => {
    expect(levelCellsError(['tak'], 0)).toMatch(/dodaj poziomy/)
    expect(levelCellsError(['tak'], 0)).not.toMatch(/\(0\)/)
  })
})

describe('thumbnailError', () => {
  it('accepts a path to a thumbnail in public/software/rozwiazania', () => {
    expect(thumbnailError('/software/rozwiazania/strona-firmowa-z-panelem.svg')).toBeNull()
    expect(thumbnailError('')).toBeNull()
    expect(thumbnailError(null)).toBeNull()
  })

  it('refuses other paths and addresses', () => {
    for (const path of [
      'software/rozwiazania/a.svg',
      '/software/rozwiazania/../a.svg',
      '/software/rozwiazania/A.svg',
      '/software/rozwiazania/a.png',
      'https://example.com/a.svg',
      '/media/a.svg',
    ]) {
      expect(thumbnailError(path), path).toEqual(expect.any(String))
    }
  })
})

describe('relatedFilter', () => {
  it('leaves the solution itself out', () => {
    expect(relatedFilter({ id: 7 })).toEqual({ id: { not_equals: 7 } })
  })

  it('lists everything for a new solution (the plugin narrows the tenant)', () => {
    expect(relatedFilter({ id: undefined })).toBe(true)
  })
})
