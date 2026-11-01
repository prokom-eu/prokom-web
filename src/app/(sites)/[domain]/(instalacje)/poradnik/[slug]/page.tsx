import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ogImages } from '@/lib/pages/metadata'
import { getPostView } from '@/lib/posts/data'
import { getSiteSettings } from '@/lib/site/data'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { GuidePost } from '@/sites/instalacje/poradnik/GuidePost'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'instalacje')
  const { slug } = await params
  // Invalid, unknown, draft, future or another site's slug → 404.
  const post = isValidSlug(slug) ? await getPostView(tenant.id, slug, 'instalacje') : null
  return { tenant, post }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, post } = await load(params)
  if (!post) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = post.seo.title ?? post.title
  const description = post.seo.description ?? post.lead ?? undefined
  return {
    title,
    description,
    alternates: { canonical: post.href },
    openGraph: {
      type: 'article',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: post.href,
      title,
      description,
      ...(post.published && { publishedTime: post.published.dateTime }),
      images: ogImages(post.cover ?? settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * A guide post of the Instalacje line (`/poradnik/<slug>`, ADR-I002 §0): a published post of this
 * tenant, otherwise 404. The list `/poradnik` is a page of `Pages` (block `instGuide`).
 */
export default async function GuidePostRoute({ params }: Props) {
  const { tenant, post } = await load(params)
  if (!post) notFound()
  const origin = await requestOrigin()
  return <GuidePost post={post} tenantId={tenant.id} origin={origin} />
}
