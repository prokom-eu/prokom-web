import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { PAGE_CACHE_SECONDS } from '../pages/data'
import { pagesTag } from '../pages/tags'
import { buildBrandView, type BrandView } from './brand'
import { buildCatalogIndex, type CatalogIndex } from './catalogIndex'
import { buildCategoryView, type CategoryView } from './category'
import { buildIndustryView, type IndustryView } from './industry'
import type { Wizard } from './wizard'
import { readWizardRules } from './wizardRules'
import { buildProductView, isIndexableProduct, type ProductView } from './product'
import { buildShowroomView, type ShowroomView } from './showroom'
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
            subcategory: true,
            series: true,
            videos: true,
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
    // The key names the shape of `ProductView`: a cached entry of an older shape is never read.
    ['product-view-2.0', String(tenantId), slug],
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

/**
 * The brand page of one brand for `/marki/[slug]`, as `BrandView` — or `null` (no page, not a
 * brand of this site). `Partners` is shared, so the tenant is checked in `buildBrandView`;
 * cached under the catalog tag, which brand changes refresh (`catalogRevalidationHooks`).
 */
export const getBrandView = (tenantId: number, slug: string): Promise<BrandView | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'partners',
        where: { and: [{ slug: { equals: slug } }, { tenants: { in: [tenantId] } }] },
        limit: 1,
        depth: 0,
        // Server-side read of public brand data; only the fields of `BrandView` leave here.
        overrideAccess: true,
      })
      const partner = docs[0]
      return partner ? buildBrandView(partner, tenantId) : null
    },
    ['brand-view', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Showroom of a brand for `/marki/[slug]` (K31c) — or `null` (no showroom, not a brand of this
 * site). Of the related products only the slug and tenant; the page joins them with the index
 * (`listShowroom`), so unpublished cards never show. Cached under the catalog tag.
 */
export const getShowroomView = (tenantId: number, slug: string): Promise<ShowroomView | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'partners',
        where: { and: [{ slug: { equals: slug } }, { tenants: { in: [tenantId] } }] },
        limit: 1,
        depth: 1,
        populate: { products: { slug: true, tenant: true } },
        overrideAccess: true,
      })
      const partner = docs[0]
      return partner ? buildShowroomView(partner, tenantId) : null
    },
    ['showroom-view', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * One active industry of the tenant for `/branze/[branza]`, as `IndustryView` — or `null`
 * (unknown, inactive „Wkrótce” or another site's slug → 404). Cached under the catalog tag.
 */
export const getIndustryView = (tenantId: number, slug: string): Promise<IndustryView | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'industries',
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { slug: { equals: slug } },
            { active: { equals: true } },
          ],
        },
        limit: 1,
        // 1: pictures come populated (re-checked in the views); of the featured products only
        // the slug and tenant — the page takes the rest from the index.
        depth: 1,
        populate: { products: { slug: true, tenant: true } },
        overrideAccess: true,
      })
      const industry = docs[0]
      return industry ? buildIndustryView(industry, tenantId) : null
    },
    ['industry-view', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Valid wizard rules of the tenant (`BiznesSettings.wizard`) for `/kreator` — or `null` (none
 * saved yet, or of an older format). Cached under the catalog tag (`BiznesSettings` hooks).
 */
export const getWizardRules = (tenantId: number): Promise<Wizard | null> =>
  unstable_cache(
    async () => readWizardRules(await getPayload({ config }), tenantId),
    ['wizard-rules', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Published products of the tenant for the site maps: slug, name and last change only. Cards „Do
 * sprawdzenia” are left out — they are `noindex` (K3a, `isIndexableProduct`).
 */
export const getPublishedProductList = (
  tenantId: number,
): Promise<{ slug: string; name: string; updatedAt: string }[]> =>
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
        select: { slug: true, name: true, updatedAt: true, contentStatus: true },
        overrideAccess: true,
      })
      return docs
        .filter(isIndexableProduct)
        .map(({ slug, name, updatedAt }) => ({ slug, name, updatedAt }))
    },
    ['published-product-list', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
