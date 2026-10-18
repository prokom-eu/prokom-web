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
import { pickSource } from '../media/sizes'
import { tenantIdOf } from '../tenant/id'
import { HOME_SLUG } from '../pages/slug'
import type { IconName } from './options'
import { normalizeText } from './normalize'

/**
 * The catalog index (`GET /api/catalog-index`, ADR-012 §2.4): everything the search (B4) and
 * the catalog filters (B5) need on the client, in one small JSON. No prices exist in the model,
 * so none can leak; images only when public (own tenant, no consent needed).
 */

/** Card width × 2 for sharp screens: one file per product keeps the index small. */
const CARD_IMAGE_WIDTH = 480

export type IndexImage = { url: string; alt: string; width: number; height: number }

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
  industries: string[]
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
  /** Normalized text the search matches against (spec. §8.2). */
  hay: string
}

export type CatalogIndex = {
  products: IndexProduct[]
  /** Brands of the listed products. */
  brands: { slug: string; name: string; status: Partner['partnerStatus'] }[]
  /** Only categories with published products (rozstrzygnięcie 7); `count` = such products. */
  categories: { slug: string; name: string; group: string; icon?: IconName; count: number }[]
  /** Only groups with a listed category. */
  groups: { slug: string; name: string; icon: IconName; gradient: [string, string] }[]
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
  | 'industries'
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
  settings: Pick<BiznesSetting, 'search'> | null
}

/** Populated documents of a relation; ids (unpopulated or not readable) are left out. */
function docs<T extends object>(values: (number | T)[] | null | undefined): T[] {
  return (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)
}

const doc = <T extends object>(value: number | T | null | undefined): T | null =>
  typeof value === 'object' && value !== null ? value : null

function cardImage(images: Product['images'], tenantId: number): IndexImage | undefined {
  for (const value of images ?? []) {
    const image = publicImage(value, tenantId)
    if (image) {
      const { alt, width, height, sources } = image
      return { url: pickSource(sources, CARD_IMAGE_WIDTH), alt, width, height }
    }
  }
  return undefined
}

const optional = (value: string | null | undefined) => (value?.trim() ? value.trim() : undefined)

export function buildCatalogIndex(source: CatalogSource): CatalogIndex {
  const { tenantId } = source
  const groupSlugById = new Map(source.groups.map((group) => [group.id, group.slug]))
  const groupSlugOf = (category: CatalogCategory) => {
    const group = category.group
    return typeof group === 'number' ? groupSlugById.get(group) : group?.slug
  }

  const ownTenant = (record: { tenant?: unknown }) => tenantIdOf(record.tenant) === tenantId
  const brands = new Map<string, CatalogIndex['brands'][number]>()
  const products: IndexProduct[] = source.products.map((product) => {
    // Read with `overrideAccess`: relations are re-checked here like images in `publicImage`,
    // so a record of another site never reaches this index, whatever the panel allowed.
    const listedBrand = doc(product.brand)
    const brand = listedBrand?.tenants?.some((t) => tenantIdOf(t) === tenantId) ? listedBrand : null
    if (brand?.slug) {
      brands.set(brand.slug, { slug: brand.slug, name: brand.name, status: brand.partnerStatus })
    }
    const categories = docs(product.categories).filter(ownTenant)
    const industries = docs(product.industries).filter(ownTenant)
    const main = categories[0]
    const benefit = optional(product.benefit)
    const badge = optional(product.badge)
    const image = cardImage(product.images, tenantId)
    const features = product.features ?? []
    const hay = normalizeText(
      [
        product.name,
        brand?.name,
        ...categories.map((category) => category.name),
        ...features,
        benefit,
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
      industries: industries.map((industry) => industry.slug),
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
  for (const product of products) {
    for (const slug of new Set(product.categories)) counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }
  const categories: CatalogIndex['categories'] = []
  for (const category of source.categories) {
    const count = counts.get(category.slug) ?? 0
    const group = groupSlugOf(category)
    if (count === 0 || !group) continue
    categories.push({
      slug: category.slug,
      name: category.name,
      group,
      ...(category.icon && { icon: category.icon }),
      count,
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
      .map((group) => ({
        slug: group.slug,
        name: group.name,
        icon: group.icon,
        gradient: [group.gradientFrom, group.gradientTo],
      })),
    industries: source.industries.map((industry) => ({
      slug: industry.slug,
      name: industry.name,
      active: Boolean(industry.active),
    })),
    pages: source.pages
      .filter(({ slug }) => slug !== HOME_SLUG)
      .map(({ slug, title }) => ({ slug, title })),
    search: {
      synonyms: Object.fromEntries(
        (search?.synonyms ?? []).map(({ phrase, expansions }) => [phrase, expansions]),
      ),
      stopWords: search?.stopWords ?? [],
      popular: search?.popular ?? [],
    },
  }
}
