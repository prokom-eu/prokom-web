import { describe, expect, it, vi } from 'vitest'

import { createTenantCache } from './cache'

type Tenant = { id: number; slug: string }

function setup(options: { maxEntries?: number } = {}) {
  let now = 0
  const lookup = vi.fn(async (host: string): Promise<Tenant | null> =>
    host === 'biznes.localhost' ? { id: 1, slug: 'biznes' } : null,
  )
  const cache = createTenantCache(lookup, { ttlMs: 60_000, now: () => now, ...options })
  return { cache, lookup, advance: (ms: number) => (now += ms) }
}

describe('createTenantCache', () => {
  it('looks a host up once within the TTL', async () => {
    const { cache, lookup } = setup()
    expect(await cache.get('biznes.localhost')).toEqual({ id: 1, slug: 'biznes' })
    expect(await cache.get('biznes.localhost')).toEqual({ id: 1, slug: 'biznes' })
    expect(lookup).toHaveBeenCalledTimes(1)
  })

  it('caches unknown hosts too', async () => {
    const { cache, lookup } = setup()
    expect(await cache.get('unknown.localhost')).toBeNull()
    expect(await cache.get('unknown.localhost')).toBeNull()
    expect(lookup).toHaveBeenCalledTimes(1)
  })

  it('looks the host up again after the TTL', async () => {
    const { cache, lookup, advance } = setup()
    await cache.get('biznes.localhost')
    advance(60_001)
    await cache.get('biznes.localhost')
    expect(lookup).toHaveBeenCalledTimes(2)
  })

  it('forgets everything on clear', async () => {
    const { cache, lookup } = setup()
    await cache.get('biznes.localhost')
    cache.clear()
    await cache.get('biznes.localhost')
    expect(lookup).toHaveBeenCalledTimes(2)
  })

  it('does not grow beyond maxEntries', async () => {
    const { cache } = setup({ maxEntries: 2 })
    await cache.get('a.localhost')
    await cache.get('b.localhost')
    await cache.get('c.localhost')
    expect(cache.size()).toBeLessThanOrEqual(2)
  })
})
