import { describe, expect, it } from 'vitest'

import {
  createPublicReadAccess,
  publicMediaWhere,
  publicPartnerWhere,
  tenantImageFilter,
} from './access'

type AccessArgs = Parameters<ReturnType<typeof createPublicReadAccess>>[0]

function argsFor(host: string | null, user: unknown = null): AccessArgs {
  const headers = new Headers(host ? { host } : {})
  return { req: { user, headers } } as unknown as AccessArgs
}

const tenantsByHost: Record<string, number> = { 'biznes.localhost': 1, 'software.localhost': 3 }
const resolveTenantId = async (host: string) => tenantsByHost[host] ?? null

describe('publicMediaWhere', () => {
  it('limits public files to the tenant and skips files that need consent', () => {
    expect(publicMediaWhere(1)).toEqual({
      and: [{ tenant: { equals: 1 } }, { requiresConsent: { not_equals: true } }],
    })
  })

  it('denies everything without a tenant', () => {
    expect(publicMediaWhere(null)).toBe(false)
  })
})

describe('publicPartnerWhere', () => {
  it('limits public logos to partners visible on the tenant', () => {
    expect(publicPartnerWhere(3)).toEqual({ tenants: { in: [3] } })
  })

  it('denies everything without a tenant', () => {
    expect(publicPartnerWhere(null)).toBe(false)
  })
})

describe('createPublicReadAccess', () => {
  const access = createPublicReadAccess(publicMediaWhere, resolveTenantId)

  it('lets a logged-in user read everything', async () => {
    expect(await access(argsFor('panel.localhost', { id: 1, role: 'editor' }))).toBe(true)
  })

  it('scopes an anonymous request to the tenant of its host (port ignored)', async () => {
    expect(await access(argsFor('Biznes.Localhost:3000'))).toEqual(publicMediaWhere(1))
  })

  it('denies an anonymous request from an unknown host', async () => {
    expect(await access(argsFor('obca.example'))).toBe(false)
  })

  it('denies an anonymous request without a Host header', async () => {
    expect(await access(argsFor(null))).toBe(false)
  })
})

describe('tenantImageFilter', () => {
  it('offers only public images of the edited document’s tenant', () => {
    expect(tenantImageFilter({ data: { tenant: 1 } })).toEqual(publicMediaWhere(1))
    expect(tenantImageFilter({ data: { tenant: { id: 3 } } })).toEqual(publicMediaWhere(3))
  })

  it('offers nothing before a tenant is chosen', () => {
    expect(tenantImageFilter({ data: {} })).toBe(false)
    expect(tenantImageFilter({})).toBe(false)
  })
})
