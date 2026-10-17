import { describe, expect, it, vi } from 'vitest'

import { createRedirectLookup } from './lookup'

describe('createRedirectLookup', () => {
  it('returns the cached rules of a host', async () => {
    const rules = new Map([['/a', '/b']])
    const lookup = createRedirectLookup({ get: async () => rules }, vi.fn())
    expect(await lookup('biznes.localhost')).toBe(rules)
  })

  it('returns no rules for an unknown host', async () => {
    const lookup = createRedirectLookup({ get: async () => null }, vi.fn())
    expect((await lookup('obca.example')).size).toBe(0)
  })

  it('lets the page through when the rules cannot be read (database down)', async () => {
    const onError = vi.fn()
    const lookup = createRedirectLookup(
      {
        get: async () => {
          throw new Error('connection refused')
        },
      },
      onError,
    )
    expect((await lookup('biznes.localhost')).size).toBe(0)
    expect(onError).toHaveBeenCalledWith('biznes.localhost', expect.any(Error))
  })
})
