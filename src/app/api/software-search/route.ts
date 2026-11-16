import { log } from '@/lib/log'
import { getPostList } from '@/lib/posts/data'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'
import { getCityList, getIndustryPageList } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { buildSearchExtras } from '@/lib/software/searchExtras'
import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'
import { softwareTextContext } from '@/sites/software/components/textContext'

const NO_STORE = { 'Cache-Control': 'no-store' }

/**
 * `GET /api/software-search` — the posts, industry and city pages the Software search window
 * finds (`lib/software/searchExtras.ts`). Only on a domain of a Software tenant: the tenant comes
 * from `Host`, never from the request, so one line's pages cannot be read on another's domain.
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
    const [posts, industries, cities, context] = await Promise.all([
      getPostList(tenant.id, 'software'),
      getIndustryPageList(tenant.id),
      getCityList(tenant.id),
      softwareTextContext(tenant.id),
    ])
    const extras = buildSearchExtras({
      // A lead with a price token is filled as on the post page; one that cannot be is left out.
      posts: posts.map((post) => ({ ...post, lead: fillText(post.lead, context) })),
      industries,
      cities,
    })
    return Response.json(extras, {
      // Short browser cache, as the solutions index: a change in the panel shows within a minute.
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (error) {
    log.error(
      { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)), tenant: tenantId, error },
      'Software search extras unavailable',
    )
    return Response.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE })
  }
}
