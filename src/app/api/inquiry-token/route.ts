import { getEnv } from '@/lib/env'
import { INSTALACJE_CATALOG_ENABLED } from '@/lib/catalog/lines'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/inquiry-token` — a fresh form token (minimum fill time, ADR-003) for forms on
 * cached pages: the Biznes drawer lives in the layout, so a token rendered there could be
 * older than its 24 h. Only on a domain with the catalog drawer (Biznes, Instalacje — ADR-029);
 * the token is a signed time, no data.
 */
export async function GET(request: Request) {
  const host = normalizeHost(request.headers.get('host'))
  const tenant = host ? await getTenantByHost(host) : null
  // Only the catalog drawer needs it (like the catalog index): other lines answer 404.
  const drawer =
    tenant?.line === 'biznes' || (tenant?.line === 'instalacje' && INSTALACJE_CATALOG_ENABLED)
  if (!tenant || !drawer)
    return Response.json({ error: 'not_found' }, { status: 404, headers: NO_STORE })
  return Response.json(
    { formToken: issueFormToken(getEnv().PAYLOAD_SECRET) },
    { headers: NO_STORE },
  )
}
