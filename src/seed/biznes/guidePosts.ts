import type { Payload } from 'payload'

import type { Post } from '../../payload-types'
import { SEED_CONTEXT } from '../config'
import { richText } from './lexical'
import { BIZNES_GUIDE_POSTS, type BiznesGuidePost } from './wpisy'

type Report = (name: string, changed: boolean) => void

const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

/** The day a source was checked, as Payload stores a date. */
const isoDay = (day: string) => `${day}T00:00:00.000Z`

/**
 * The post as Payload stores it. `publishedAt` orders the list (newest first); `productIds` are
 * the cards found for `post.products`, in the post's order.
 */
export function guidePostData(
  post: BiznesGuidePost,
  productIds: readonly number[],
  publishedAt: string,
): Omit<Post, 'id' | 'tenant' | 'createdAt' | 'updatedAt' | 'line'> {
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    publishedAt,
    lead: post.lead,
    summary: post.summary,
    content: richText<Post['content']>(post.content),
    sources: post.sources.map((source) => ({ ...source, verifiedAt: isoDay(post.verifiedAt) })),
    ...(productIds.length > 0 && { relatedProducts: [...productIds].slice(0, 6) }),
    aside: { cta: post.cta },
    contact: post.contact,
    seo: post.seo,
    _status: 'published',
  }
}

/**
 * Publication dates of a batch created now: one minute apart, the first post the newest — so the
 * list keeps the order of `BIZNES_GUIDE_POSTS`.
 */
export function publishedDates(count: number, now: Date): string[] {
  return Array.from({ length: count }, (_, index) =>
    new Date(now.getTime() - index * 60_000).toISOString(),
  )
}

/**
 * Biznes guide posts (audyt 15.11 P1-3): a missing post is created and published, an existing one
 * is never touched — after the import the post belongs to the panel. Products are found by their
 * slug in this tenant; a missing card is skipped. Reports `posts <slug>`.
 */
export async function seedBiznesGuidePosts(
  payload: Payload,
  tenantId: number,
  report: Report,
  now = new Date(),
): Promise<void> {
  const { docs: existing } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { slug: { in: BIZNES_GUIDE_POSTS.map((post) => post.slug) } },
      ],
    },
    limit: BIZNES_GUIDE_POSTS.length,
    select: { slug: true },
    draft: true,
    ...local,
  })
  const stored = new Set(existing.map((post) => post.slug))
  const missing = BIZNES_GUIDE_POSTS.filter((post) => !stored.has(post.slug))
  for (const post of BIZNES_GUIDE_POSTS) report(`posts ${post.slug}`, !stored.has(post.slug))
  if (missing.length === 0) return

  const slugs = [...new Set(missing.flatMap((post) => post.products))]
  const { docs: products } = await payload.find({
    collection: 'products',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { in: slugs } }] },
    limit: slugs.length,
    select: { slug: true },
    ...local,
  })
  const productId = new Map(products.map((product) => [product.slug, product.id]))

  // Dates by the place in the whole list, so the posts of one run keep its order.
  const dates = publishedDates(BIZNES_GUIDE_POSTS.length, now)
  for (const post of missing) {
    const ids = post.products.flatMap((slug) => {
      const id = productId.get(slug)
      return id === undefined ? [] : [id]
    })
    const date = dates[BIZNES_GUIDE_POSTS.indexOf(post)]!
    await payload.create({
      collection: 'posts',
      data: { ...guidePostData(post, ids, date), tenant: tenantId },
      ...local,
    })
  }
}
