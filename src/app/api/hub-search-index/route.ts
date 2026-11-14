import { log } from '@/lib/log'
import { getHubSearchIndex } from '@/lib/prokom/searchData'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/hub-search-index` — the index of the search window of pro-kom.eu (spec §5.6), fetched
 * apart from the page (when the browser is idle or at the first search), so the HTML of every
 * page stays without it; under 50 KB gzip, cached for a minute. Only on a domain of the
 * hub's tenant: the tenant comes from `Host`, never from the request, so the hub's data cannot be
 * read on a line's domain (as `/api/inst-search-index`).
 */
export async function GET(request: Request) {
  const host = normalizeHost(request.headers.get('host'))
  let tenantId: number | undefined
  try {
    const tenant = host ? await getTenantByHost(host) : null
    if (!tenant || tenant.line !== 'prokom') {
      return Response.json({ error: 'not_found' }, { status: 404, headers: NO_STORE })
    }
    tenantId = tenant.id
    return Response.json(await getHubSearchIndex(tenant.id), {
      // Short browser cache: a change in the panel shows up within a minute.
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Hub search index unavailable',
    )
    return Response.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE })
  }
}
