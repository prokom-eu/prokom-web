import { log } from '@/lib/log'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getSolutionsIndex } from '@/lib/software/data'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/solutions-index` — the solutions of the Software site for its catalog, menu sheet
 * and 404 search (ADR-014 §4). Only on a domain of a Software tenant: the tenant comes from
 * `Host`, never from the request, so one line's data cannot be read on another line's domain.
 */
export async function GET(request: Request) {
  const host = normalizeHost(request.headers.get('host'))
  let tenantId: number | undefined
  try {
    const tenant = host ? await getTenantByHost(host) : null
    if (!tenant || tenant.line !== 'software') {
      return Response.json({ error: 'not_found' }, { status: 404, headers: NO_STORE })
    }
    tenantId = tenant.id
    return Response.json(await getSolutionsIndex(tenant.id), {
      // Short browser cache: a change in the panel shows up within a minute.
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Solutions index unavailable',
    )
    return Response.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE })
  }
}
