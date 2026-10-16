import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getTenantByHost, type SiteTenant } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

/**
 * Tenant for the `[domain]` segment, which `proxy.ts` fills with the request host.
 * Unknown or inactive domain → 404, never a default tenant.
 *
 * Defence in depth: the segment must equal the request's own `Host`, so a path like
 * `/<other domain>` can never render another tenant, whatever the proxy rules let through.
 */
export async function requireTenant(params: Promise<{ domain: string }>): Promise<SiteTenant> {
  const [{ domain }, requestHeaders] = await Promise.all([params, headers()])
  const host = normalizeHost(requestHeaders.get('host'))
  if (!host || domain !== host) notFound()

  const tenant = await getTenantByHost(host)
  if (!tenant) notFound()
  return tenant
}
