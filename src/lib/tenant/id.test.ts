import { describe, expect, it } from 'vitest'

import { tenantIdOf } from './id'

describe('tenantIdOf', () => {
  it('reads an id or a populated tenant', () => {
    expect(tenantIdOf(3)).toBe(3)
    expect(tenantIdOf({ id: 4, name: 'x' })).toBe(4)
  })

  it('rejects anything else', () => {
    expect(tenantIdOf(undefined)).toBeNull()
    expect(tenantIdOf('3')).toBeNull()
    expect(tenantIdOf({})).toBeNull()
  })
})
