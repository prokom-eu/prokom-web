import { log } from '@/lib/log'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'
import { getInstSearchIndex } from '@/sites/instalacje/powloka/searchData'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/inst-search-index` — the index of the search window of prokominstalacje.pl (L1-I,
 * spec §5.1), fetched when the window is first needed instead of riding along with every page.
 * Only on a domain of an Instalacje tenant: the tenant comes from `Host`, never from the request,
 * so one line's data cannot be read on another line's domain (as `/api/solutions-index`).
 */
export async function GET(request: Request) {
  const host = normalizeHost(request.headers.get('host'))
  let tenantId: number | undefined
  try {
    const tenant = host ? await getTenantByHost(host) : null
    if (!tenant || tenant.line !== 'instalacje') {
      return Response.json({ error: 'not_found' }, { status: 404, headers: NO_STORE })
    }
    tenantId = tenant.id
    return Response.json(await getInstSearchIndex(tenant.id), {
      // Short browser cache: a change in the panel shows up within a minute.
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Instalacje search index unavailable',
    )
    return Response.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE })
  }
}
