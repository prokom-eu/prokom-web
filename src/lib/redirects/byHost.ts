import { createTenantCache } from '../tenant/cache'
import { createRedirectLookup } from './lookup'
import { buildRedirectMap } from './rules'

type RuleMap = Map<string, string>

const TTL_MS = 60_000

async function lookup(host: string): Promise<RuleMap | null> {
  // Imported lazily, like `lib/tenant/byHost`: the collection imports this module.
  const [{ getPayload }, { default: config }, { getTenantByHost }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
    import('../tenant/byHost'),
  ])
  const tenant = await getTenantByHost(host)
  if (!tenant) return null
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'redirects',
    // The tenant filter is mandatory: a rule of one line never applies on another domain.
    where: { tenant: { equals: tenant.id } },
    limit: 5000,
    depth: 0,
    select: { from: true, to: true },
    overrideAccess: true,
  })
  return buildRedirectMap(docs)
}

// On `globalThis`, so the proxy and the Payload hooks share one instance (see `byHost` of tenants).
const KEY = Symbol.for('prokom.redirectsByHost')
type Cache = ReturnType<typeof createTenantCache<RuleMap>>
const store = globalThis as typeof globalThis & { [KEY]?: Cache }
const cache: Cache = (store[KEY] ??= createTenantCache(lookup, { ttlMs: TTL_MS }))

/** Redirect rules of the tenant behind a normalized host; none for unknown hosts or on errors. */
export const getRedirectsByHost = createRedirectLookup(cache, (host, error) => {
  // TODO(S9): the JSON logger from `lib/` (with `requestId`); no personal data here either way.
  console.error(
    JSON.stringify({
      level: 'error',
      msg: 'Redirect rules not loaded; request passed on without redirects.',
      host,
      error: error instanceof Error ? error.message : String(error),
    }),
  )
})

/** Called after any change to `Redirects`, so a new rule applies without waiting for the TTL. */
export function clearRedirectCache(): void {
  cache.clear()
}
