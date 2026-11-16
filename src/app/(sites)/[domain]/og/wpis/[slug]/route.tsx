import { getPostList, getPostView } from '@/lib/posts/data'
import { getSharedData } from '@/lib/shared/getSharedData'
import { softwareOgCategory } from '@/lib/software/ogColors'
import { coverMotif } from '@/lib/software/postCovers'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { biznesOgImage, ogDomain, ogNotFound } from '@/sites/biznes/og/card'
import { softwareOgImage } from '@/sites/software/og/card'

import { findTenant } from '../../../tenant'

type Params = { params: Promise<{ domain: string; slug: string }> }

/**
 * Sharing image of a post `/aktualnosci/<slug>`, 1200 × 630. Biznes (audyt 15.11 wieczorem §3.3):
 * category, title, the domain and the reading time. Software: the same with the post's own cover
 * scene (`news/PostCover`). Another line's domain, an unknown or a draft post → 404, as the post
 * page itself.
 */
export async function GET(_request: Request, { params }: Params): Promise<Response> {
  const tenant = await findTenant(params)
  if (!tenant || (tenant.line !== 'biznes' && tenant.line !== 'software')) return ogNotFound()
  const { domain, slug } = await params
  const post = isValidSlug(slug) ? await getPostView(tenant.id, slug) : null
  if (!post) return ogNotFound()
  if (tenant.line === 'software') {
    // The category value as the page reads it: from the post list (the view carries the label).
    const own = (await getPostList(tenant.id)).find((item) => item.slug === post.slug)
    const category = softwareOgCategory(own?.categoryValue)
    return softwareOgImage({
      motif: coverMotif(post.slug, category),
      category,
      eyebrow: post.category ?? 'Poradnik',
      title: post.title,
      footer: `${ogDomain(domain)} · ${post.minutes} min czytania`,
    })
  }
  const shared = await getSharedData(tenant.id)
  return biznesOgImage({
    eyebrow: [post.category, 'Poradnik'].filter(Boolean).join(' · '),
    title: post.title,
    footer: `${ogDomain(domain)} · ${post.minutes} min czytania`,
    footerRight: shared?.line.phone ?? null,
  })
}
