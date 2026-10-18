import { describe, expect, it } from 'vitest'

import { isValidSlug, sameTenantSlugWhere } from './uniqueSlug'

describe('isValidSlug', () => {
  it.each(['kasy-fiskalne', 'posnet-ergo-online', 'm365'])('accepts %s', (slug) => {
    expect(isValidSlug(slug)).toBe(true)
  })

  it.each(['', 'Kasy', 'kasy fiskalne', 'a--b', '-a', 'a-', 'a/b', 'łódź'])(
    'rejects %j',
    (slug) => {
      expect(isValidSlug(slug)).toBe(false)
    },
  )
})

describe('sameTenantSlugWhere', () => {
  it('always filters by tenant and slug', () => {
    expect(sameTenantSlugWhere(3, 'kasy', undefined)).toEqual({
      and: [{ tenant: { equals: 3 } }, { slug: { equals: 'kasy' } }],
    })
  })

  it('excludes the edited document', () => {
    expect(sameTenantSlugWhere(3, 'kasy', 7)).toEqual({
      and: [{ tenant: { equals: 3 } }, { slug: { equals: 'kasy' } }, { id: { not_equals: 7 } }],
    })
  })
})
