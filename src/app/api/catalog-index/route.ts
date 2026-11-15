import { searchIndex } from '@/lib/catalog/catalogIndex'
import { getCatalogIndex } from '@/lib/catalog/data'
import { log } from '@/lib/log'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/catalog-index` — the catalog of the Biznes site for its search and filters
 * (ADR-012 §2.4). Only on a domain of a Biznes tenant: the tenant comes from `Host`, never
 * from the request, so one line's catalog cannot be read on another line's domain.
 * Fetched by the browser only when the search opens or on `/oferta` (plan B, §4).
 */
export async function GET(request: Request) {
  const host = normalizeHost(request.headers.get('host'))
  let tenantId: number | undefined
  try {
    const tenant = host ? await getTenantByHost(host) : null
    if (!tenant || tenant.line !== 'biznes') {
      return Response.json({ error: 'not_found' }, { status: 404, headers: NO_STORE })
    }
    tenantId = tenant.id
    return Response.json(searchIndex(await getCatalogIndex(tenant.id)), {
      // Short browser cache: a change in the panel shows up within a minute.
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Catalog index unavailable',
    )
    return Response.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE })
  }
}
