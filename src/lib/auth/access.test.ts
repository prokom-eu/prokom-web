import { describe, expect, it } from 'vitest'

import { adminOrSelfWhere, isAdmin } from './access'

const admin = { id: 1, role: 'admin' as const }
const editor = { id: 2, role: 'editor' as const }

describe('isAdmin', () => {
  it('is true only for the admin role', () => {
    expect(isAdmin(admin)).toBe(true)
    expect(isAdmin(editor)).toBe(false)
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin(undefined)).toBe(false)
  })
})

describe('adminOrSelfWhere', () => {
  it('gives admins access to every user', () => {
    expect(adminOrSelfWhere(admin)).toBe(true)
  })

  it('limits editors to their own document', () => {
    expect(adminOrSelfWhere(editor)).toEqual({ id: { equals: 2 } })
  })

  it('denies anonymous requests', () => {
    expect(adminOrSelfWhere(null)).toBe(false)
  })
})
