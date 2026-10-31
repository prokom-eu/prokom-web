import config from '@payload-config'
import { cacheQuery } from '../cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import { PAGE_CACHE_SECONDS } from '../pages/data'
import { pagesTag } from '../pages/tags'
import { buildBrandView, type BrandView } from './brand'
import { buildBundleView, type BundleView } from './bundle'
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
// `cache`: one build per request — the home page reads the index in several sections, and
// `pnpm dev` has no data cache (`lib/cache.ts`).
export const getCatalogIndex = cache((tenantId: number): Promise<CatalogIndex> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      // Server-side reads of public catalog data; drafts never leave here.
      const read = { overrideAccess: true, depth: 0 } as const
      const inTenant = { tenant: { equals: tenantId } }
      const [products, categories, groups, industries, pages, settings, bundles] =
        await Promise.all([
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
              featuredGroup: true,
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
          payload.find({
            collection: 'bundles',
            where: inTenant,
            limit: MAX_RECORDS,
            sort: 'order',
            select: { slug: true, name: true, items: { product: true, mandatory: true } },
            ...read,
          }),
        ])
      return buildCatalogIndex({
        tenantId,
        products: products.docs,
        categories: categories.docs,
        groups: groups.docs,
        industries: industries.docs,
        pages: pages.docs,
        settings: settings.docs[0] ?? null,
        bundles: bundles.docs.map(({ slug, name, items }) => ({
          slug,
          name,
          required: (items ?? []).flatMap((item) =>
            item.mandatory !== false && typeof item.product === 'number' ? [item.product] : [],
          ),
        })),
      })
    },
    ['catalog-index', String(tenantId)],
    { tags: [catalogTag(tenantId), pagesTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )(),
)

/**
 * One published product of the tenant for `/produkt/[slug]`, as `ProductView` — or `null`
 * (unknown, draft or another site's slug → 404). Cached like the index, under the catalog tag.
 */
export const getProductView = (tenantId: number, slug: string): Promise<ProductView | null> =>
  cacheQuery(
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
  cacheQuery(
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
  cacheQuery(
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
  cacheQuery(
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
  cacheQuery(
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
  cacheQuery(
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
  cacheQuery(
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

/**
 * Ready bundles of the tenant (K3c), in their order, as `BundleView` — public fields only. Of the
 * related records only the slug and tenant; the pages join the items with the catalog index
 * (`listBundle`), so unpublished cards never show. Cached under the catalog tag.
 */
export const getBundles = (tenantId: number): Promise<BundleView[]> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'bundles',
        where: { tenant: { equals: tenantId } },
        limit: MAX_RECORDS,
        sort: 'order',
        depth: 1,
        populate: {
          products: { slug: true, tenant: true },
          industries: { slug: true, tenant: true },
          'catalog-categories': { slug: true, tenant: true },
        },
        // Internal fields stay in the panel: `buildBundleView` copies public fields only.
        select: {
          tenant: true,
          slug: true,
          name: true,
          area: true,
          level: true,
          series: true,
          audience: true,
          benefit: true,
          description: true,
          items: {
            product: true,
            role: true,
            quantity: true,
            mandatory: true,
            suggestedVersion: true,
          },
          swaps: true,
          services: true,
          reasons: true,
          faq: true,
          related: true,
          industries: true,
          contentStatus: true,
        },
        overrideAccess: true,
      })
      return docs.flatMap((doc) => buildBundleView(doc, tenantId) ?? [])
    },
    ['bundles', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/** Scenes of „Plan Twojej firmy” of the tenant (home page „Szybki start”, K36 §11). */
export const countFloorPlans = (tenantId: number): Promise<number> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { totalDocs } = await payload.count({
        collection: 'floor-plans',
        where: { tenant: { equals: tenantId } },
        overrideAccess: true,
      })
      return totalDocs
    },
    ['floor-plans-count', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
