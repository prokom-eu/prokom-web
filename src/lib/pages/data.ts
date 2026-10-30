import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type PopulateType } from 'payload'
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
/**
 * Fields of related documents the blocks read. Products (kits, B9b) need only the slug — the rest
 * comes from the catalog index; whole documents would bloat the cached page (2 MB per entry).
 * An Instalacje service page (`instService`) loads its service itself, fresh per request.
 */
const BLOCK_POPULATE: PopulateType = { products: { slug: true }, 'inst-services': { key: true } }

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
          // 1: images in blocks come populated; `publicImage` re-checks tenant and consent.
          depth: 1,
          populate: BLOCK_POPULATE,
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

export type PublishedPageEntry = Pick<Page, 'slug' | 'title' | 'updatedAt'>

/** Published pages of one tenant for its sitemaps; cached under `pagesTag` like the pages. */
export const getPublishedPageList = cache((tenantId: number): Promise<PublishedPageEntry[]> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'pages',
        where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
        draft: false,
        limit: 1000,
        depth: 0,
        sort: 'slug',
        select: { slug: true, title: true, updatedAt: true },
        overrideAccess: true,
      })
      return docs.map(({ slug, title, updatedAt }) => ({ slug, title, updatedAt }))
    },
    ['published-page-list', String(tenantId)],
    { tags: [pagesTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
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
    depth: 1,
    populate: BLOCK_POPULATE,
    overrideAccess: true,
  })
  const [doc] = docs
  // Checked twice on purpose: the query filter and the returned document.
  if (!doc || tenantIdOf(doc.tenant) !== tenantId) return null
  return toPublicPage(doc)
}
