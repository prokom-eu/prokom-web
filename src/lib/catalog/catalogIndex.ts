import type {
  BiznesSetting,
  CatalogCategory,
  CatalogGroup,
  Industry,
  Page,
  Partner,
  Product,
} from '@/payload-types'

import { publicImage } from '../media/public'
import { imageSources, pickSource } from '../media/sizes'
import { tenantIdOf } from '../tenant/id'
import { HOME_SLUG } from '../pages/slug'
import type { IconName } from './options'
import { normalizeText } from './normalize'
import { wizardSchema } from './wizard'

/**
 * The catalog index (`GET /api/catalog-index`, ADR-012 §2.4): everything the search (B4) and
 * the catalog filters (B5) need on the client, in one small JSON. No prices exist in the model,
 * so none can leak; images only when public (own tenant, no consent needed).
 */

/** Card width × 2 for sharp screens: one file per product keeps the index small. */
const CARD_IMAGE_WIDTH = 480

/** Brand logos are ~20 px high on cards and filters: the small `logo` size is enough. */
const LOGO_WIDTH = 240

export type IndexImage = { url: string; alt: string; width: number; height: number }

/** A brand logo; its `alt` is the brand name, next to it in the index. */
export type IndexLogo = Omit<IndexImage, 'alt'>

export type IndexProduct = {
  slug: string
  name: string
  /** Slug of the brand (`brands`); `null` without a brand. */
  brand: string | null
  kind: Product['kind']
  /** Category slugs; the first is the main one. */
  categories: string[]
  /** Group of the main category. */
  group: string | null
  /** Subcategory and series (Lenovo, Dell): „Z tej samej rodziny” on the product page (K31b). */
  subcategory?: string
  series?: string
  /** Has an active producer's film: the „film” badge of the card (K31c). */
  video?: true
  industries: string[]
  /** "Skompletuj stanowisko" (`fitsWith`): slugs of products that go with this one. */
  fits?: string[]
  benefit?: string
  features: string[]
  badge?: string
  isNew: boolean
  authorized: boolean
  popularity: number
  registerTypes: NonNullable<Product['registerTypes']>
  /** Set for the products of the home page, in their order. */
  featuredOrder?: number
  image?: IndexImage
  /**
   * Normalized text the search matches against (spec. §8.2). Without the group name: the
   * search reads it from `groups`, with a lower weight (`lib/search.ts`).
   */
  hay: string
}

export type IndexSubcategory = { name: string; slug?: string; count: number }

export type ShowcaseStatus = { label: string; value: string; tone: 'ok' | 'warn' }

export type GroupShowcase = { images: IndexImage[]; statuses: ShowcaseStatus[] }

export type CatalogIndex = {
  products: IndexProduct[]
  /**
   * Brands of the listed products; `logo` only when the record has a file, `page` when the brand
   * has its page `/marki/[slug]` (K3b′).
   */
  brands: {
    slug: string
    name: string
    status: Partner['partnerStatus']
    logo?: IndexLogo
    page?: true
    /** The brand page is a showroom (K31c): „Nie wiesz, który?” leads to its wizard. */
    showroom?: true
  }[]
  /** Only categories with published products (rozstrzygnięcie 7); `count` = such products. */
  categories: {
    slug: string
    name: string
    group: string
    icon?: IconName
    count: number
    /**
     * Subcategories with listed products (K3b′), in the panel's order; `slug` only where the
     * subcategory has its own page `/oferta/<kategoria>/<slug>`.
     */
    subcategories?: IndexSubcategory[]
  }[]
  /** Only groups with a listed category. */
  groups: {
    slug: string
    name: string
    icon: IconName
    gradient: [string, string]
    /** Short list of what the department sells (home page wheel and cards). */
    description?: string
    /** Top of the department card on the home page: pictures or status rows. */
    showcase?: GroupShowcase
  }[]
  industries: { slug: string; name: string; active: boolean }[]
  /** Published pages of the site but home (the special pages: `/opieka-it`, `/gopos`, …). */
  pages: { slug: string; title: string }[]
  search: { synonyms: Record<string, string[]>; stopWords: string[]; popular: string[] }
}

/** Fields of a product the index reads (the `select` of `getCatalogIndex`). */
export type IndexedProductDoc = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'name'
  | 'kind'
  | 'brand'
  | 'categories'
  | 'subcategory'
  | 'series'
  | 'videos'
  | 'industries'
  | 'fitsWith'
  | 'benefit'
  | 'features'
  | 'badge'
  | 'keywords'
  | 'images'
  | 'isNew'
  | 'authorized'
  | 'popularity'
  | 'registerTypes'
  | 'featured'
  | 'featuredOrder'
>

export type CatalogSource = {
  tenantId: number
  /** Published products with `brand`, `categories`, `industries` and `images` populated. */
  products: IndexedProductDoc[]
  /** Categories with `group` populated. */
  categories: CatalogCategory[]
  groups: CatalogGroup[]
  industries: Industry[]
  pages: Pick<Page, 'slug' | 'title'>[]
  /**
   * Ready bundles (K3c): in the search as pages `zestawy/<slug>`. `required`: product ids of the
   * required items — a bundle with none of them listed has no page (`listBundle`), so no result.
   */
  bundles?: { slug: string; name: string; required: number[] }[]
  settings: Pick<BiznesSetting, 'search' | 'wizard'> | null
}

/** The wizard is a route, not a page from blocks: listed in the search while it has rules. */
export const WIZARD_PAGE = { slug: 'kreator', title: 'Dobierz zestaw w 60 s — kreator' }

/** `/zestawy` in the search (K3c), with the bundles when there are any. */
export const BUNDLES_PAGE = { slug: 'zestawy', title: 'Gotowe zestawy dla firm' }

/** Populated documents of a relation; ids (unpopulated or not readable) are left out. */
function docs<T extends object>(values: (number | T)[] | null | undefined): T[] {
  return (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)
}

const doc = <T extends object>(value: number | T | null | undefined): T | null =>
  typeof value === 'object' && value !== null ? value : null

/** Public images of this tenant from a relation, as small card files. */
function indexImages(
  values: readonly unknown[] | null | undefined,
  tenantId: number,
): IndexImage[] {
  return (values ?? []).flatMap((value) => {
    const image = publicImage(value, tenantId)
    if (!image) return []
    const { alt, width, height, sources } = image
    return [{ url: pickSource(sources, CARD_IMAGE_WIDTH), alt, width, height }]
  })
}

function cardImage(images: Product['images'], tenantId: number): IndexImage | undefined {
  return indexImages(images, tenantId)[0]
}

/** `CatalogGroups.showcase`: up to 2 pictures, or the status rows; nothing when empty. */
function groupShowcase(group: CatalogGroup, tenantId: number): GroupShowcase | undefined {
  const showcase = group.showcase
  const statuses = showcase?.mode === 'statuses'
  const result: GroupShowcase = {
    images: statuses ? [] : indexImages(showcase?.images, tenantId).slice(0, 2),
    statuses: statuses
      ? (showcase?.statuses ?? []).map(({ label, value, tone }) => ({ label, value, tone }))
      : [],
  }
  return result.images.length > 0 || result.statuses.length > 0 ? result : undefined
}

/** Small logo of a brand (cards, filters, the product box); none without a file. */
export function brandLogo(brand: Partner): IndexLogo | undefined {
  const sources = imageSources(brand)
  if (!brand.width || !brand.height || sources.length === 0) return undefined
  return { url: pickSource(sources, LOGO_WIDTH), width: brand.width, height: brand.height }
}

const subcategoryKey = (category: string, name: string) => `${category}/${name.trim()}`

const optional = (value: string | null | undefined) => (value?.trim() ? value.trim() : undefined)

/** The brand page is a showroom (K31c): its showroom lists at least one listed card. */
function showsShowroom(brand: Partner, listedIds: ReadonlySet<number>): boolean {
  return (brand.showroom?.segments ?? []).some((segment) =>
    (segment.series ?? []).some((series) =>
      (series.products ?? []).some((value) => {
        const id = typeof value === 'number' ? value : value?.id
        return id !== undefined && listedIds.has(id)
      }),
    ),
  )
}

export function buildCatalogIndex(source: CatalogSource): CatalogIndex {
  const { tenantId } = source
  const groupById = new Map(source.groups.map((group) => [group.id, group]))
  const groupOf = (category: CatalogCategory) => {
    const group = category.group
    return typeof group === 'number' ? groupById.get(group) : group
  }
  const groupSlugOf = (category: CatalogCategory) => groupOf(category)?.slug

  const ownTenant = (record: { tenant?: unknown }) => tenantIdOf(record.tenant) === tenantId
  // Published cards of this site: a showroom shows only while one of its cards is listed.
  const listedIds = new Set(source.products.map((product) => product.id))
  const shownBundles = (source.bundles ?? []).filter(({ required }) =>
    required.some((id) => listedIds.has(id)),
  )
  const brands = new Map<string, CatalogIndex['brands'][number]>()
  const products: IndexProduct[] = source.products.map((product) => {
    // Read with `overrideAccess`: relations are re-checked here like images in `publicImage`,
    // so a record of another site never reaches this index, whatever the panel allowed.
    const listedBrand = doc(product.brand)
    const brand = listedBrand?.tenants?.some((t) => tenantIdOf(t) === tenantId) ? listedBrand : null
    if (brand?.slug) {
      const logo = brandLogo(brand)
      brands.set(brand.slug, {
        slug: brand.slug,
        name: brand.name,
        status: brand.partnerStatus,
        ...(logo && { logo }),
        ...(brand.brandPage?.hasPage && { page: true as const }),
        ...(brand.brandPage?.hasPage &&
          showsShowroom(brand, listedIds) && { showroom: true as const }),
      })
    }
    const categories = docs(product.categories).filter(ownTenant)
    const industries = docs(product.industries).filter(ownTenant)
    const fits = docs(product.fitsWith)
      .filter(ownTenant)
      .map((fit) => fit.slug)
    const main = categories[0]
    const benefit = optional(product.benefit)
    const subcategory = optional(product.subcategory)
    const series = optional(product.series)
    const badge = optional(product.badge)
    const image = cardImage(product.images, tenantId)
    const features = product.features ?? []
    const hay = normalizeText(
      [
        product.name,
        brand?.name,
        ...categories.map((category) => category.name),
        // „laptop” finds the laptops even when a card never says the word (K3b′).
        subcategory,
        series,
        ...features,
        // Not `benefit`: the index carries it once and `prepareSearch` joins it to the hay — the
        // copy here cost ~4 KB of the 50 KB gzip budget (K3c).
        badge,
        product.keywords,
        ...industries.map((industry) => industry.name),
      ]
        .filter(Boolean)
        .join(' '),
    )
    return {
      slug: product.slug,
      name: product.name,
      brand: brand?.slug ?? null,
      kind: product.kind,
      categories: categories.map((category) => category.slug),
      group: (main && groupSlugOf(main)) ?? null,
      ...(subcategory && { subcategory }),
      ...(series && { series }),
      ...(product.videos?.some((video) => video.active !== false) && { video: true as const }),
      industries: industries.map((industry) => industry.slug),
      ...(fits.length > 0 && { fits }),
      ...(benefit && { benefit }),
      features,
      ...(badge && { badge }),
      isNew: Boolean(product.isNew),
      authorized: Boolean(product.authorized),
      popularity: product.popularity ?? 0,
      registerTypes: product.registerTypes ?? [],
      ...(product.featured && { featuredOrder: product.featuredOrder ?? 0 }),
      ...(image && { image }),
      hay,
    }
  })

  const counts = new Map<string, number>()
  // `Products.subcategory` is a name from the list of the main category (K3a).
  const subcategoryCounts = new Map<string, number>()
  for (const product of products) {
    for (const slug of new Set(product.categories)) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    const main = product.categories[0]
    if (main && product.subcategory) {
      const key = subcategoryKey(main, product.subcategory)
      subcategoryCounts.set(key, (subcategoryCounts.get(key) ?? 0) + 1)
    }
  }
  const categories: CatalogIndex['categories'] = []
  for (const category of source.categories) {
    const count = counts.get(category.slug) ?? 0
    const group = groupSlugOf(category)
    if (count === 0 || !group) continue
    const subcategories = (category.subcategories ?? []).flatMap(({ name, slug }) => {
      const label = name.trim()
      const subcategoryCount = subcategoryCounts.get(subcategoryKey(category.slug, label))
      const address = optional(slug)
      return label && subcategoryCount
        ? [{ name: label, ...(address && { slug: address }), count: subcategoryCount }]
        : []
    })
    categories.push({
      slug: category.slug,
      name: category.name,
      group,
      ...(category.icon && { icon: category.icon }),
      count,
      ...(subcategories.length > 0 && { subcategories }),
    })
  }
  const usedGroups = new Set(categories.map((category) => category.group))

  const search = source.settings?.search
  return {
    products,
    brands: [...brands.values()].sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    categories,
    groups: source.groups
      .filter((group) => usedGroups.has(group.slug))
      .map((group) => {
        const description = optional(group.description)
        const showcase = groupShowcase(group, source.tenantId)
        return {
          slug: group.slug,
          name: group.name,
          icon: group.icon,
          gradient: [group.gradientFrom, group.gradientTo] as [string, string],
          ...(description && { description }),
          ...(showcase && { showcase }),
        }
      }),
    industries: source.industries.map((industry) => ({
      slug: industry.slug,
      name: industry.name,
      active: Boolean(industry.active),
    })),
    pages: [
      ...source.pages
        .filter(({ slug }) => slug !== HOME_SLUG)
        .map(({ slug, title }) => ({ slug, title })),
      ...(wizardSchema.safeParse(source.settings?.wizard).success ? [WIZARD_PAGE] : []),
      ...(shownBundles.length
        ? [
            BUNDLES_PAGE,
            ...shownBundles.map(({ slug, name }) => ({
              slug: `zestawy/${slug}`,
              title: `Zestaw: ${name}`,
            })),
          ]
        : []),
    ],
    search: {
      synonyms: Object.fromEntries(
        (search?.synonyms ?? []).map(({ phrase, expansions }) => [phrase, expansions]),
      ),
      stopWords: search?.stopWords ?? [],
      popular: search?.popular ?? [],
    },
  }
}

/**
 * The index the browser fetches (`GET /api/catalog-index`: search, inquiry drawer — no cards):
 * without the „film” badge, which only server-rendered cards show (K31c), so it stays within
 * its 50 KB gzip budget (ADR-012 §2.4).
 */
export function searchIndex(index: CatalogIndex): CatalogIndex {
  return { ...index, products: index.products.map(({ video: _video, ...product }) => product) }
}
