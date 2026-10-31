import { describe, expect, it } from 'vitest'

import { umamiWebsiteId } from './config'

const ID = '7f3c2a1e-0b4d-4c6e-9a8f-1d2e3f4a5b6c'

describe('umamiWebsiteId (ADR-020)', () => {
  it('returns the id of a counted line', () => {
    expect(
      umamiWebsiteId(
        { UMAMI_URL: 'http://umami:3000', UMAMI_WEBSITES: { software: ID } },
        'software',
      ),
    ).toBe(ID)
  })

  it('returns null for a line without an id or without the container address', () => {
    expect(
      umamiWebsiteId(
        { UMAMI_URL: 'http://umami:3000', UMAMI_WEBSITES: { software: ID } },
        'biznes',
      ),
    ).toBeNull()
    expect(
      umamiWebsiteId({ UMAMI_URL: undefined, UMAMI_WEBSITES: { software: ID } }, 'software'),
    ).toBeNull()
  })
})
