import config from '@payload-config'
import type { Showroom } from '@/payload-types'
import { cacheQuery } from '../cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import { PAGE_CACHE_SECONDS } from '../pages/data'
import { pagesTag } from '../pages/tags'
import { buildBrandView, type BrandView } from './brand'
import { buildBundleView, type BundleView } from './bundle'
import type { BrandsPageInput } from './brandsPage'
import { brandLogo, buildCatalogIndex, type CatalogIndex } from './catalogIndex'
import { buildCategoryView, type CategoryView } from './category'
import { planParams, type FloorPlanRecord, type PlanProductDetails } from './floorPlan'
import { buildIndustryView, type IndustryView } from './industry'
import type { Wizard } from './wizard'
import { readWizardRules } from './wizardRules'
import { buildProductView, isIndexableProduct, type ProductView } from './product'
import { catalogTag } from './tags'
import { tenantIdOf } from '../tenant/id'

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
      const [products, categories, groups, industries, pages, settings, bundles, salons] =
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
              categoryOrder: true,
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
          payload.find({
            collection: 'showrooms',
            where: inTenant,
            limit: MAX_RECORDS,
            sort: 'order',
            select: { slug: true, brands: true, chooser: { options: true } },
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
        salons: salons.docs.map(({ slug, brands, chooser }) => ({
          slug,
          brandIds: idsOf(brands),
          chooser: (chooser?.options ?? []).length > 0,
        })),
      })
    },
    ['catalog-index-k4d', String(tenantId)],
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
    ['product-view-k4e', String(tenantId), slug],
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

/**
 * Scenes of „Plan Twojej firmy” (K31d′), in their order, without the drawings (they are big —
 * `getFloorPlanSvg` reads one), plus the popup details of every product on a point: 4 key
 * parameters and the first active film. Products of another tenant are dropped here; hidden
 * cards drop out in `buildPlanScenes` against the catalog index. Cached under the catalog tag.
 */
export const getFloorPlans = (
  tenantId: number,
): Promise<{ records: FloorPlanRecord[]; details: Record<string, PlanProductDetails> }> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'floor-plans',
        where: { tenant: { equals: tenantId } },
        limit: MAX_RECORDS,
        sort: 'order',
        depth: 1,
        populate: {
          products: { slug: true, tenant: true, keyParams: true, specs: true, videos: true },
          bundles: { slug: true, tenant: true },
        },
        select: {
          slug: true,
          name: true,
          title: true,
          lead: true,
          iconPath: true,
          viewBox: true,
          bundles: true,
          points: true,
        },
        overrideAccess: true,
      })
      const details: Record<string, PlanProductDetails> = {}
      const ownSlug = (value: unknown) => {
        if (!value || typeof value !== 'object') return null
        const { slug, tenant } = value as { slug?: unknown; tenant?: unknown }
        return typeof slug === 'string' && tenantIdOf(tenant) === tenantId ? slug : null
      }
      const records = docs.map((doc): FloorPlanRecord => ({
        slug: doc.slug,
        name: doc.name,
        title: doc.title,
        lead: doc.lead,
        iconPath: doc.iconPath,
        viewBox: doc.viewBox,
        bundles: (doc.bundles ?? []).map((bundle) => {
          const slug = ownSlug(bundle)
          return slug ? { slug } : null
        }),
        points: (doc.points ?? []).map((point) => {
          const slug = ownSlug(point.product)
          if (slug && typeof point.product === 'object' && point.product && !details[slug]) {
            const video = (point.product.videos ?? []).find((v) => v.active !== false)
            details[slug] = {
              params: planParams(point.product.keyParams, point.product.specs),
              video: video
                ? {
                    id: video.youtubeId,
                    title: video.title,
                    channel: video.channel ?? null,
                    lang: video.lang ?? null,
                  }
                : null,
            }
          }
          return {
            x: point.x,
            y: point.y,
            product: slug ? { slug } : null,
            label: point.label,
            description: point.description,
          }
        }),
      }))
      return { records, details }
    },
    ['floor-plans', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/** The drawing of one scene (checked on save by `validateSvg`), or `null`. Cached like the scenes. */
export const getFloorPlanSvg = (tenantId: number, slug: string): Promise<string | null> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'floor-plans',
        where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
        limit: 1,
        depth: 0,
        select: { svg: true },
        overrideAccess: true,
      })
      return docs[0]?.svg ?? null
    },
    ['floor-plan-svg', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Data of `/marki` but the index (`buildBrandsPage`): the groups of `BiznesSettings.brands`,
 * their brands (`Partners` is shared — tenant filter) and which brands each showroom of this
 * tenant has. Cached under the catalog tag, which all three collections refresh.
 */
export const getBrandsPageInput = (tenantId: number): Promise<Omit<BrandsPageInput, 'index'>> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      // Server-side reads of public brand data; only the fields of the input leave here.
      const read = { overrideAccess: true, depth: 0 } as const
      const [settings, showrooms] = await Promise.all([
        payload.find({
          collection: 'biznes-settings',
          where: { tenant: { equals: tenantId } },
          limit: 1,
          select: { brands: true },
          ...read,
        }),
        payload.find({
          collection: 'showrooms',
          where: { tenant: { equals: tenantId } },
          limit: MAX_RECORDS,
          sort: 'order',
          select: { slug: true, brands: true },
          ...read,
        }),
      ])
      const groups = (settings.docs[0]?.brands?.groups ?? []).map((group) => ({
        title: group.title,
        iconPath: group.iconPath?.trim() || null,
        description: group.description?.trim() || null,
        partnerIds: idsOf(group.partners),
      }))
      const ids = [...new Set(groups.flatMap((group) => group.partnerIds))]
      const partners =
        ids.length === 0
          ? []
          : (
              await payload.find({
                collection: 'partners',
                where: { and: [{ id: { in: ids } }, { tenants: { in: [tenantId] } }] },
                limit: ids.length,
                ...read,
              })
            ).docs.map((partner) => ({
              id: partner.id,
              slug: partner.slug ?? null,
              name: partner.name,
              status: partner.partnerStatus,
              description: partner.brandPage?.shortDescription?.trim() || null,
              logo: brandLogo(partner) ?? null,
            }))
      return {
        groups,
        partners,
        showrooms: showrooms.docs.flatMap((showroom) =>
          showroom.slug ? [{ slug: showroom.slug, brandIds: idsOf(showroom.brands) }] : [],
        ),
      }
    },
    ['brands-page', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/** Ids of a relationship read with `depth: 0` (or populated). */
function idsOf(values: readonly (number | { id: number } | null | undefined)[] | null | undefined) {
  return (values ?? []).flatMap((value) =>
    typeof value === 'number' ? [value] : value ? [value.id] : [],
  )
}

/**
 * Salon 2.0 `/marki/[slug]` (K4f): the showroom of this tenant with that slug — or `null`.
 * Products come with only the slug and tenant (the page joins them with the index); brands
 * populated, their tenant re-checked in `buildSalonView`. Cached under the catalog tag.
 */
export const getSalonDoc = (tenantId: number, slug: string): Promise<Showroom | null> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'showrooms',
        where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenantId } }] },
        limit: 1,
        depth: 1,
        populate: { products: { slug: true, tenant: true } },
        overrideAccess: true,
      })
      return docs[0] ?? null
    },
    ['salon-doc', String(tenantId), slug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Slug of the showroom a brand of this tenant belongs to (Kyocera → `druk`) — or `null`.
 * `/marki/<brand>` of such a brand redirects there (ADR-017 D-K4-1).
 */
export const getSalonSlugOfBrand = (tenantId: number, brandSlug: string): Promise<string | null> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const read = { overrideAccess: true, depth: 0, limit: 1 } as const
      const { docs: partners } = await payload.find({
        collection: 'partners',
        where: { and: [{ slug: { equals: brandSlug } }, { tenants: { in: [tenantId] } }] },
        select: { slug: true },
        ...read,
      })
      const partner = partners[0]
      if (!partner) return null
      const { docs } = await payload.find({
        collection: 'showrooms',
        where: { and: [{ tenant: { equals: tenantId } }, { brands: { in: [partner.id] } }] },
        sort: 'order',
        select: { slug: true },
        ...read,
      })
      return docs[0]?.slug ?? null
    },
    ['salon-of-brand', String(tenantId), brandSlug],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
