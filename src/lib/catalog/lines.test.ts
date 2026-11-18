import { describe, expect, it } from 'vitest'

import { CATALOG_LINES, isCatalogOpen } from './lines'

describe('catalog lines (ADR-029)', () => {
  it('serves the catalog on Biznes and Instalacje only', () => {
    expect([...CATALOG_LINES].sort()).toEqual(['biznes', 'instalacje'])
  })

  it('keeps Biznes open even with an empty index (no extra query on production)', () => {
    expect(isCatalogOpen('biznes', 0)).toBe(true)
  })

  it('opens Instalacje only once it has published products (INST-K1 import)', () => {
    expect(isCatalogOpen('instalacje', 0)).toBe(false)
    expect(isCatalogOpen('instalacje', 1)).toBe(true)
  })

  it('never opens on other lines', () => {
    expect(isCatalogOpen('software', 50)).toBe(false)
    expect(isCatalogOpen('prokom', 50)).toBe(false)
  })
})
