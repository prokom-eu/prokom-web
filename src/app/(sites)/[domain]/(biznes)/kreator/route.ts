import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import { getEnv } from '@/lib/env'
import { siteOrigin } from '@/lib/seo/origin'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

/**
 * `/kreator` → 301 `/konfigurator` (ADR-017 D-K4-1), with the query (`?firma=` of the industry
 * pages and old links). A route, not a rule in „Przekierowania”: the proxy's rules drop the query
 * and would have to be typed into the panel on every environment. Biznes only.
 */
export async function GET(request: Request) {
  const rawHost = request.headers.get('host')
  const host = normalizeHost(rawHost)
  const tenant = host ? await getTenantByHost(host) : null
  const origin = siteOrigin(rawHost, getEnv().SITE_ENV)
  if (!tenant || tenant.line !== 'biznes' || !origin) {
    return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }
  const target = new URL(CONFIGURATOR_PATH, origin)
  target.search = new URL(request.url).search
  return new Response(null, {
    status: 301,
    headers: {
      Location: target.toString(),
      // Like the proxy's 301: a day, so a mistake can still be undone.
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
