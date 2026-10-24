import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { PAGE_CACHE_SECONDS } from '../pages/data'
import { postCards, type PostCard } from './cards'
import { postsTag } from './tags'

/**
 * The latest published posts of exactly one tenant (tenant filter mandatory, as for pages).
 * Marked stale on every change of a post (`Posts` hooks); the pages' TTL is the safety net.
 */
export const getLatestPosts = (tenantId: number, limit = 3): Promise<PostCard[]> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'posts',
        // Only posts with a publication date that has come: in PostgreSQL `DESC` puts empty
        // dates first, and a post dated in the future must not lead the list (B11 lists alike).
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { _status: { equals: 'published' } },
            { publishedAt: { exists: true } },
            { publishedAt: { less_than_equal: new Date().toISOString() } },
          ],
        },
        draft: false,
        sort: '-publishedAt',
        limit,
        depth: 0,
        select: { slug: true, title: true, tenant: true, category: true, publishedAt: true },
        // Server-side read of public content; drafts never leave here.
        overrideAccess: true,
      })
      return postCards(docs, tenantId)
    },
    ['latest-posts', String(tenantId), String(limit)],
    { tags: [postsTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
