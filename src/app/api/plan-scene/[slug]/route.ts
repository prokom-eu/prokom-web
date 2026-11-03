import { getFloorPlans } from '@/lib/catalog/data'
import { log } from '@/lib/log'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'
import { loadFloorPlan } from '@/sites/biznes/components/plan/planData'
import { scenePayload } from '@/sites/biznes/components/plan/planScenes'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/plan-scene/<scena>` — products and bundles of one scene of „Plan Twojej firmy”. The home
 * page sends them for the first scene only (ADR-023, „Dane planu firmy poza HTML głównej”); the
 * plan asks here when another scene is picked. Biznes domain only; the plan is read with the
 * tenant of the host (`loadFloorPlan`), so another site's scenes and products never answer.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const host = normalizeHost(request.headers.get('host'))
  let tenantId: number | undefined
  try {
    const tenant = host ? await getTenantByHost(host) : null
    if (!tenant || tenant.line !== 'biznes')
      return new Response(null, { status: 404, headers: NO_STORE })
    tenantId = tenant.id
    // Unknown slugs cost no plan build (cached list of scenes, as in `/api/plan-svg`).
    const { records } = await getFloorPlans(tenant.id)
    if (!records.some((record) => record.slug === slug)) {
      return new Response(null, { status: 404, headers: NO_STORE })
    }
    const plan = await loadFloorPlan(tenant.id, { firstSvg: false })
    const payload = plan ? scenePayload(plan, slug) : null
    if (!payload) return new Response(null, { status: 404, headers: NO_STORE })
    return Response.json(payload, { headers: { 'Cache-Control': 'public, max-age=300' } })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Plan scene unavailable',
    )
    return new Response(null, { status: 503, headers: NO_STORE })
  }
}
