import { getFloorPlanSvg } from '@/lib/catalog/data'
import { isSafeSvg } from '@/lib/catalog/svg'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

const NOT_FOUND = { status: 404, headers: { 'Cache-Control': 'no-store' } }

/**
 * `GET /api/plan-svg/<scena>` — the drawing of one scene of „Plan Twojej firmy” (K31d′): the page
 * renders only the active scene, the others load when picked (spec. §6.12). Biznes domain only;
 * the record is read with the tenant filter and re-checked as a drawing before it goes out.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const host = normalizeHost(request.headers.get('host'))
  const tenant = host ? await getTenantByHost(host) : null
  if (!tenant || tenant.line !== 'biznes' || !/^[a-z0-9-]{1,60}$/.test(slug))
    return new Response(null, NOT_FOUND)
  const svg = await getFloorPlanSvg(tenant.id, slug)
  if (!svg || !isSafeSvg(svg)) return new Response(null, NOT_FOUND)
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
