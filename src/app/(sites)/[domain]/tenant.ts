import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getEnv } from '@/lib/env'
import { siteOrigin } from '@/lib/seo/origin'
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
  const tenant = await findTenant(params)
  if (!tenant) notFound()
  return tenant
}

/** Same checks as `requireTenant`, but `null` instead of `notFound()` — for route handlers. */
export async function findTenant(params: Promise<{ domain: string }>): Promise<SiteTenant | null> {
  const [{ domain }, requestHeaders] = await Promise.all([params, headers()])
  const host = normalizeHost(requestHeaders.get('host'))
  if (!host || domain !== host) return null
  return getTenantByHost(host)
}

/** Origin of the request's domain (`lib/seo/origin`), for canonical, sitemap and JSON-LD. */
export async function requestOrigin(): Promise<string> {
  const origin = siteOrigin((await headers()).get('host'), getEnv().SITE_ENV)
  if (!origin) notFound()
  return origin
}
