import { describe, expect, it } from 'vitest'

import { CATALOG_LINES, INSTALACJE_CATALOG_ENABLED, isCatalogOpen } from './lines'

describe('catalog lines (ADR-029)', () => {
  it('serves the catalog on Biznes and Instalacje only', () => {
    expect([...CATALOG_LINES].sort()).toEqual(['biznes', 'instalacje'])
  })

  it('keeps Biznes open even with an empty index (no extra query on production)', () => {
    expect(isCatalogOpen('biznes', 0)).toBe(true)
  })

  it('keeps Instalacje closed until the switch of inst/k1-katalog, whatever the data', () => {
    expect(INSTALACJE_CATALOG_ENABLED).toBe(false)
    expect(isCatalogOpen('instalacje', 120)).toBe(false)
  })

  it('opens Instalacje, once switched on, only with published products', () => {
    expect(isCatalogOpen('instalacje', 0, true)).toBe(false)
    expect(isCatalogOpen('instalacje', 1, true)).toBe(true)
  })

  it('never opens on other lines', () => {
    expect(isCatalogOpen('software', 50)).toBe(false)
    expect(isCatalogOpen('prokom', 50)).toBe(false)
  })
})
