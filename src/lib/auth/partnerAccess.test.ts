import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { adminOnly, adminOnlyField } from './access'
import { partnerUpdateAccess } from './partnerAccess'

// Audit AB4 (W-02). Partners.ts uses adminOnly for create, partnerUpdateAccess for update and
// adminOnlyField for the `tenants` field.
const editor = { id: 2, role: 'editor', tenants: [{ tenant: 1 }, { tenant: { id: 3 } }] }
const editorWithoutSites = { id: 4, role: 'editor', tenants: [] }
const admin = { id: 1, role: 'admin', tenants: [] }
const req = (user: unknown) => ({ req: { user } as unknown as PayloadRequest })

describe('partner access', () => {
  it('an editor updates only partners shown on his own sites', () => {
    expect(partnerUpdateAccess(req(admin))).toBe(true)
    expect(partnerUpdateAccess(req(editor))).toEqual({ tenants: { in: [1, 3] } })
    expect(partnerUpdateAccess(req(editorWithoutSites))).toBe(false)
    expect(partnerUpdateAccess(req(null))).toBe(false)
  })

  it('creating partners and choosing their sites is for an admin', () => {
    expect(adminOnly(req(editor))).toBe(false)
    expect(adminOnly(req(admin))).toBe(true)
    expect(adminOnlyField(req(editor) as Parameters<typeof adminOnlyField>[0])).toBe(false)
  })
})
