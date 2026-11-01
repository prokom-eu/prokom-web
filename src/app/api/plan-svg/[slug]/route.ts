import { getFloorPlans, getFloorPlanSvg } from '@/lib/catalog/data'
import { log } from '@/lib/log'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/plan-svg/<scena>` — the drawing of one scene of „Plan Twojej firmy” (K31d′): the page
 * renders only the active scene, the others load when picked (spec. §6.12). Biznes domain only;
 * the slug must be a scene of this tenant (cached list) before the drawing is read, so unknown
 * slugs cost no query and no cache entry. The drawing is checked in `getFloorPlanSvg`.
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
    const { records } = await getFloorPlans(tenant.id)
    if (!records.some((record) => record.slug === slug)) {
      return new Response(null, { status: 404, headers: NO_STORE })
    }
    const svg = await getFloorPlanSvg(tenant.id, slug)
    if (!svg) return new Response(null, { status: 404, headers: NO_STORE })
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
        // Opened directly, the drawing stays a picture: no scripts, no loads (defence in depth).
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
      },
    })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Plan drawing unavailable',
    )
    return new Response(null, { status: 503, headers: NO_STORE })
  }
}
