import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Page } from '@/payload-types'

import { tenantIdOf } from '../tenant/id'
import { pageTag, pagesTag } from './tags'

/**
 * Safety net: cached pages expire after this time even when no revalidation reached them
 * (a scheduled publish runs in the jobs cron, outside a Next.js request — `revalidate.ts`).
 */
export const PAGE_CACHE_SECONDS = 60

/** What the public site renders from a page. */
export type PublicPage = Pick<Page, 'id' | 'title' | 'slug' | 'layout' | 'seo'>

const toPublicPage = ({ id, title, slug, layout, seo }: Page): PublicPage => ({
  id,
  title,
  slug,
  layout,
  seo,
})

/**
 * Published page of exactly one tenant — the tenant filter is mandatory, so a page of one
 * line can never render on another line's domain. Cached per tenant and slug (`unstable_cache`:
 * `'use cache'` would need Cache Components for the whole app). `null` → 404.
 */
export const getPublishedPage = cache(
  (tenantId: number, slug: string): Promise<PublicPage | null> =>
    unstable_cache(
      async () => {
        const payload = await getPayload({ config })
        const { docs } = await payload.find({
          collection: 'pages',
          where: {
            and: [
              { tenant: { equals: tenantId } },
              { slug: { equals: slug } },
              { _status: { equals: 'published' } },
            ],
          },
          draft: false,
          limit: 1,
          depth: 0,
          // Server-side read; drafts never leave here (`draft: false` + status filter).
          overrideAccess: true,
        })
        const [doc] = docs
        return doc ? toPublicPage(doc) : null
      },
      ['published-page', String(tenantId), slug],
      { tags: [pagesTag(tenantId), pageTag(tenantId, slug)], revalidate: PAGE_CACHE_SECONDS },
    )(),
)

/**
 * Latest draft of a page for the live preview — never cached. Only when the page belongs to
 * the tenant of the requesting domain; the caller has already verified the preview token.
 */
export async function getDraftPage(id: number, tenantId: number): Promise<PublicPage | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { and: [{ id: { equals: id } }, { tenant: { equals: tenantId } }] },
    draft: true,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const [doc] = docs
  // Checked twice on purpose: the query filter and the returned document.
  if (!doc || tenantIdOf(doc.tenant) !== tenantId) return null
  return toPublicPage(doc)
}
