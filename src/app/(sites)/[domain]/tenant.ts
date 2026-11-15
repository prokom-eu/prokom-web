import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getEnv } from '@/lib/env'
import { hasNews } from '@/lib/posts/list'
import { siteOrigin } from '@/lib/seo/origin'
import { getTenantByHost, type SiteTenant } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'
import type { Line } from '@/lib/tenant/lines'

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

/**
 * Tenant of a route that exists for one line only (Biznes catalog, ADR-012 rozstrzygnięcie 5):
 * on any other line's domain the route answers 404, as if it did not exist.
 */
export async function requireLine(
  params: Promise<{ domain: string }>,
  line: Line,
): Promise<SiteTenant> {
  const tenant = await requireTenant(params)
  if (tenant.line !== line) notFound()
  return tenant
}

/**
 * Tenant of `/aktualnosci` — one route for all lines (ADR-012 rozstrz. 5, change 22.10.2026):
 * on a line without news (`lib/posts/list` → `NEWS_LINES`) it answers 404.
 */
export async function requireNewsTenant(params: Promise<{ domain: string }>): Promise<SiteTenant> {
  const tenant = await requireTenant(params)
  if (!hasNews(tenant.line)) notFound()
  return tenant
}

/** Same checks as `requireTenant`, but `null` instead of `notFound()` — for route handlers. */
export async function findTenant(params: Promise<{ domain: string }>): Promise<SiteTenant | null> {
  const [{ domain }, requestHeaders] = await Promise.all([params, headers()])
  const host = normalizeHost(requestHeaders.get('host'))
  if (!host || domain !== host) return null
  return getTenantByHost(host)
}

/**
 * Tenant of the request's `Host`, for `not-found.tsx`, which gets no `params` (Next.js 16 docs:
 * file conventions → not-found → Data Fetching). The layout already checked the domain.
 */
export async function tenantFromRequest(): Promise<SiteTenant | null> {
  const host = normalizeHost((await headers()).get('host'))
  return host ? getTenantByHost(host) : null
}

/** Origin of the request's domain (`lib/seo/origin`), for canonical, sitemap and JSON-LD. */
export async function requestOrigin(): Promise<string> {
  const origin = siteOrigin((await headers()).get('host'), getEnv().SITE_ENV)
  if (!origin) notFound()
  return origin
}
