import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CatalogIndex } from './catalogIndex'
import { loadCatalogIndex, primeCatalogIndex } from './useCatalogIndex'

const index = { products: [] } as unknown as CatalogIndex

describe('primeCatalogIndex', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores nothing on the server, where the module is shared by every request', async () => {
    // No `window` in this test environment: the same as server rendering.
    primeCatalogIndex(index)
    const fetch = vi.fn().mockRejectedValue(new Error('offline'))
    vi.stubGlobal('fetch', fetch)
    await expect(loadCatalogIndex()).rejects.toThrow('offline')
    expect(fetch).toHaveBeenCalledWith('/api/catalog-index')
  })

  it('hands the index to the search in the browser, without a fetch', async () => {
    vi.stubGlobal('window', {})
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    primeCatalogIndex(index)
    await expect(loadCatalogIndex()).resolves.toBe(index)
    expect(fetch).not.toHaveBeenCalled()
  })
})
