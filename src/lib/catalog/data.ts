import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { PAGE_CACHE_SECONDS } from '../pages/data'
import { pagesTag } from '../pages/tags'
import { buildCatalogIndex, type CatalogIndex } from './catalogIndex'
import { buildCategoryView, type CategoryView } from './category'
import { buildProductView, type ProductView } from './product'
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
          // 1: the showcase pictures come populated (checked by `publicImage`).
          depth: 1,
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

/**
 * One published product of the tenant for `/produkt/[slug]`, as `ProductView` — or `null`
 * (unknown, draft or another site's slug → 404). Cached like the index, under the catalog tag.
 */
export const getProductView = (tenantId: number, slug: string): Promise<ProductView | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { slug: { equals: slug } },
            { _status: { equals: 'published' } },
          ],
        },
        draft: false,
        limit: 1,
        // 1: brand, categories, industries and images come populated (re-checked in the view).
        depth: 1,
        overrideAccess: true,
      })
      const product = docs[0]
      return product ? buildProductView(product, tenantId) : null
    },
    ['product-view', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * One category of the tenant for `/oferta/[kategoria]`, as `CategoryView` — or `null`. The page
 * asks only for slugs listed in the index (categories with published products, rozstrz. 7).
 */
export const getCategoryView = (tenantId: number, slug: string): Promise<CategoryView | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'catalog-categories',
        where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
        limit: 1,
        // 1: the hero picture comes populated (re-checked in the view); of the related
        // products only the slug and tenant — the page takes the rest from the index.
        depth: 1,
        populate: { products: { slug: true, tenant: true } },
        overrideAccess: true,
      })
      const category = docs[0]
      return category ? buildCategoryView(category, tenantId) : null
    },
    ['category-view', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/** Published products of the tenant for `sitemap.xml`: slug and last change only. */
export const getPublishedProductList = (
  tenantId: number,
): Promise<{ slug: string; updatedAt: string }[]> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
        draft: false,
        limit: MAX_PRODUCTS,
        depth: 0,
        sort: 'slug',
        select: { slug: true, updatedAt: true },
        overrideAccess: true,
      })
      return docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
    },
    ['published-product-list', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
