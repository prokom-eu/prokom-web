import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { PAGE_CACHE_SECONDS } from '../pages/data'
import { pagesTag } from '../pages/tags'
import { buildCatalogIndex, type CatalogIndex } from './catalogIndex'
import { catalogTag } from './tags'

/** Far above the catalog of stage 1 (~70); past ~500 the index is reconsidered (ADR-012 §2.4). */
const MAX_PRODUCTS = 1000
const MAX_RECORDS = 200

/**
 * Catalog index of one tenant, cached under `tenant:<id>:catalog` (catalog hooks) and the
 * pages tag (its page list), with the pages' TTL as a safety net. Every query filters by the
 * tenant; images are re-checked in `buildCatalogIndex` (`publicImage`).
 */
export const getCatalogIndex = (tenantId: number): Promise<CatalogIndex> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      // Server-side reads of public catalog data; drafts never leave here.
      const read = { overrideAccess: true, depth: 0 } as const
      const inTenant = { tenant: { equals: tenantId } }
      const [products, categories, groups, industries, pages, settings] = await Promise.all([
        payload.find({
          collection: 'products',
          where: { and: [inTenant, { _status: { equals: 'published' } }] },
          draft: false,
          limit: MAX_PRODUCTS,
          sort: '-popularity',
          // 1: brand, categories, industries and images come populated.
          depth: 1,
          select: {
            slug: true,
            name: true,
            kind: true,
            brand: true,
            categories: true,
            industries: true,
            fitsWith: true,
            benefit: true,
            features: true,
            badge: true,
            keywords: true,
            images: true,
            isNew: true,
            authorized: true,
            popularity: true,
            registerTypes: true,
            featured: true,
            featuredOrder: true,
          },
          overrideAccess: true,
        }),
        payload.find({
          collection: 'catalog-categories',
          where: inTenant,
          limit: MAX_RECORDS,
          sort: 'order',
          ...read,
        }),
        payload.find({
          collection: 'catalog-groups',
          where: inTenant,
          limit: MAX_RECORDS,
          sort: 'order',
          ...read,
        }),
        payload.find({
          collection: 'industries',
          where: inTenant,
          limit: MAX_RECORDS,
          sort: 'order',
          ...read,
        }),
        payload.find({
          collection: 'pages',
          where: { and: [inTenant, { _status: { equals: 'published' } }] },
          draft: false,
          limit: MAX_RECORDS,
          sort: 'title',
          select: { slug: true, title: true },
          ...read,
        }),
        payload.find({ collection: 'biznes-settings', where: inTenant, limit: 1, ...read }),
      ])
      return buildCatalogIndex({
        tenantId,
        products: products.docs,
        categories: categories.docs,
        groups: groups.docs,
        industries: industries.docs,
        pages: pages.docs,
        settings: settings.docs[0] ?? null,
      })
    },
    ['catalog-index', String(tenantId)],
    { tags: [catalogTag(tenantId), pagesTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
