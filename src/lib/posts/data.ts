import config from '@payload-config'
import { cacheQuery } from '../cache'
import { getPayload, type Where } from 'payload'

import { catalogTag } from '../catalog/tags'
import { PAGE_CACHE_SECONDS } from '../pages/data'
import { postListCards, type PostListCard } from './cards'
import { ksefPanel, type KsefPanel } from './ksefPanel'
import { publishedUntil } from './publishedAt'
import type { PostCategory } from './list'
import { postsTag } from './tags'
import { buildPostView, type PostView } from './view'

/** Far above what the list shows for years; past it the list gets pages (`?strona=`). */
const MAX_POSTS = 200

/**
 * Public posts of exactly one tenant: published, dated today or earlier (Polish date,
 * `publishedUntil`). In PostgreSQL `DESC` puts empty dates first, and a post dated in the future
 * must not show yet.
 */
const publicPosts = (tenantId: number): Where => ({
  and: [
    { tenant: { equals: tenantId } },
    { _status: { equals: 'published' } },
    { publishedAt: { exists: true } },
    { publishedAt: { less_than_equal: publishedUntil(new Date()) } },
  ],
})

export type PostListItem = PostListCard & {
  categoryValue: PostCategory
  /** For the sitemap. */
  updatedAt: string
}

/** All public posts of one tenant, newest first — the list, its filters and the sitemap. */
export const getPostList = (tenantId: number): Promise<PostListItem[]> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'posts',
        where: publicPosts(tenantId),
        draft: false,
        sort: '-publishedAt',
        limit: MAX_POSTS,
        // 1: the cover comes populated (re-checked by `publicImage`).
        depth: 1,
        select: {
          slug: true,
          title: true,
          tenant: true,
          category: true,
          publishedAt: true,
          updatedAt: true,
          lead: true,
          cover: true,
        },
        overrideAccess: true,
      })
      const cards = new Map(postListCards(docs, tenantId).map((card) => [card.slug, card]))
      return docs.flatMap((doc) => {
        const card = cards.get(doc.slug)
        return card ? [{ ...card, categoryValue: doc.category, updatedAt: doc.updatedAt }] : []
      })
    },
    ['post-list', String(tenantId)],
    { tags: [postsTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/** One public post of the tenant as `PostView`, or `null` (unknown, draft, future, other site). */
export const getPostView = (tenantId: number, slug: string): Promise<PostView | null> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'posts',
        where: { and: [publicPosts(tenantId), { slug: { equals: slug } }] },
        draft: false,
        limit: 1,
        // 1: cover and related products come populated (re-checked in the view); of a product
        // only what the view reads, not the whole document into the cache.
        depth: 1,
        populate: {
          products: { slug: true, tenant: true },
          solutions: { slug: true, tenant: true },
        },
        overrideAccess: true,
      })
      const post = docs[0]
      return post ? buildPostView(post, tenantId, new Date()) : null
    },
    ['post-view', String(tenantId), slug],
    { tags: [postsTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * The KSeF panel of the Biznes news list (`BiznesSettings.news.ksef`). Settings changes mark
 * the catalog tag stale (their hooks), so that is the tag here.
 */
export const getKsefPanel = (tenantId: number): Promise<KsefPanel | null> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'biznes-settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        depth: 0,
        select: { news: true },
        overrideAccess: true,
      })
      return ksefPanel(docs[0]?.news?.ksef)
    },
    ['news-ksef', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
