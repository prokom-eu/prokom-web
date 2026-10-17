import type { Env } from '../env'
import { normalizeHost } from '../tenant/host'

/**
 * Origin of the site for absolute addresses (canonical, sitemap, OG, JSON-LD), from the
 * `Host` header the tenant was resolved from. Locally `http://` with the dev port; on the
 * server `https://` without a port (Nginx terminates TLS). `null` for a malformed `Host`.
 */
export function siteOrigin(rawHost: string | null, siteEnv: Env['SITE_ENV']): string | null {
  const host = normalizeHost(rawHost)
  if (!host) return null
  if (siteEnv !== 'local') return `https://${host}`
  const port = rawHost?.trim().match(/:(\d+)$/)?.[1]
  return `http://${host}${port ? `:${port}` : ''}`
}
