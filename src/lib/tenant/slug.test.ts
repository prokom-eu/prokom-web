import { describe, expect, it } from 'vitest'

import { isValidTenantSlug } from './slug'

describe('isValidTenantSlug', () => {
  it.each(['biznes', 'instalacje', 'pro-kom', 'site2'])('accepts %j', (slug) => {
    expect(isValidTenantSlug(slug)).toBe(true)
  })

  it.each(['', 'Biznes', 'biznes ', '-biznes', 'biznes-', 'biz--nes', 'biznes.pl', 'żółw'])(
    'rejects %j',
    (slug) => {
      expect(isValidTenantSlug(slug)).toBe(false)
    },
  )
})
