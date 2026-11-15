import { createTenantCache } from './cache'
import type { Line } from './lines'

/** What the public site may know about a tenant — no notification e-mail, no domains. */
export type SiteTenant = {
  id: number
  name: string
  slug: string
  line: Line
}

const TTL_MS = 60_000

async function lookup(host: string): Promise<SiteTenant | null> {
  // Imported lazily: the Tenants collection imports this module to clear the cache,
  // and a static import of the config here would close a cycle.
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { and: [{ 'domains.host': { equals: host } }, { active: { equals: true } }] },
    limit: 1,
    depth: 0,
    // Server-side lookup of public tenant metadata; nothing beyond `SiteTenant` leaves here.
    overrideAccess: true,
  })
  const [tenant] = docs
  if (!tenant) return null
  return { id: tenant.id, name: tenant.name, slug: tenant.slug, line: tenant.line }
}

// Kept on `globalThis` so the page renderer and Payload hooks share one instance even when
// Next.js bundles this module more than once.
const KEY = Symbol.for('prokom.tenantByHost')
type Cache = ReturnType<typeof createTenantCache<SiteTenant>>
const store = globalThis as typeof globalThis & { [KEY]?: Cache }
const cache: Cache = (store[KEY] ??= createTenantCache(lookup, { ttlMs: TTL_MS }))

/** Active tenant for a normalized host, or `null` (→ 404). Cached for 60 s. */
export function getTenantByHost(host: string): Promise<SiteTenant | null> {
  return cache.get(host)
}

/** Called after any change to `Tenants`, so domain edits apply without waiting for the TTL. */
export function clearTenantCache(): void {
  cache.clear()
}
