import { getPostView } from '@/lib/posts/data'
import { getSharedData } from '@/lib/shared/getSharedData'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { biznesOgImage, ogDomain, ogNotFound } from '@/sites/biznes/og/card'

import { findTenant } from '../../../tenant'

type Params = { params: Promise<{ domain: string; slug: string }> }

/**
 * Sharing image of a Biznes post `/aktualnosci/<slug>` (audyt 15.11 wieczorem §3.3): category,
 * title, the domain and the reading time, 1200 × 630. Another line's domain, an unknown or a
 * draft post → 404, as the post page itself.
 */
export async function GET(_request: Request, { params }: Params): Promise<Response> {
  const tenant = await findTenant(params)
  if (!tenant || tenant.line !== 'biznes') return ogNotFound()
  const { domain, slug } = await params
  const post = isValidSlug(slug) ? await getPostView(tenant.id, slug) : null
  if (!post) return ogNotFound()
  const shared = await getSharedData(tenant.id)
  return biznesOgImage({
    eyebrow: [post.category, 'Poradnik'].filter(Boolean).join(' · '),
    title: post.title,
    footer: `${ogDomain(domain)} · ${post.minutes} min czytania`,
    footerRight: shared?.line.phone ?? null,
  })
}
