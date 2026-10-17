import type { Access, Where } from 'payload'

import { normalizeHost } from '../tenant/host'
import { tenantIdOf } from '../tenant/id'

type ResolveTenantId = (host: string) => Promise<number | null>

/** Public files of one tenant; a file that needs consent (e.g. a client's logo) never. */
export function publicMediaWhere(tenantId: number | null): Where | false {
  if (tenantId === null) return false
  return { and: [{ tenant: { equals: tenantId } }, { requiresConsent: { not_equals: true } }] }
}

/** Public logos: only partners shown on the tenant of the requesting domain. */
export function publicPartnerWhere(tenantId: number | null): Where | false {
  if (tenantId === null) return false
  return { tenants: { in: [tenantId] } }
}

const tenantIdForHost: ResolveTenantId = async (host) => {
  // Imported lazily: `byHost` loads the Payload config, which imports the collections.
  const { getTenantByHost } = await import('../tenant/byHost')
  return (await getTenantByHost(host))?.id ?? null
}

/**
 * `read` access of an upload collection. Payload also checks it when serving a file
 * (`/api/<collection>/file/<name>`), so an anonymous visitor gets only the files of the
 * tenant behind the `Host` header — a file of one line is not served on another line's domain.
 * Logged-in users (panel) read everything; the multi-tenant plugin narrows editors.
 */
export function createPublicReadAccess(
  whereFor: (tenantId: number | null) => Where | false,
  resolveTenantId: ResolveTenantId = tenantIdForHost,
): Access {
  return async ({ req }) => {
    if (req.user) return true
    const host = normalizeHost(req.headers.get('host'))
    return whereFor(host ? await resolveTenantId(host) : null)
  }
}

/**
 * `filterOptions` of an image field (Hero, OG image): only public images of the edited
 * document's tenant. The multi-tenant plugin narrows `relationship` fields but not `upload`
 * ones; Payload also re-checks `filterOptions` on save, so another line's image is rejected.
 */
export function tenantImageFilter({ data }: { data?: { tenant?: unknown } }): Where | false {
  return publicMediaWhere(tenantIdOf(data?.tenant))
}
