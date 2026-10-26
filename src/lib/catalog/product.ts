import type { CatalogCategory, Industry, Partner, Product } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { tenantIdOf } from '../tenant/id'
import { brandLogo, type IndexLogo } from './catalogIndex'
import type { IconName } from './options'

/** Tabs of the product page in the order of the board `Produkt` (spec. §6.2). */
export type ProductTab = 'opis' | 'specyfikacja' | 'dokumenty' | 'pytania'

type LabelValue = { label: string; value: string }

/**
 * Whether search engines may index the product and the site maps list it. A card „Do
 * sprawdzenia” stays visible but out of Google and the maps (K3a, spec. §5, ADR-012 rozstrz. 15).
 */
export function isIndexableProduct(product: Pick<Product, 'contentStatus'>): boolean {
  return product.contentStatus !== 'needs-review'
}

/**
 * What the product page renders (`/produkt/[slug]`): only public, own-tenant data and never a
 * price (there is none in the model). `contentStatus` itself stays out — a product „Do
 * sprawdzenia” looks the same, only `indexable` differs.
 */
export type ProductView = {
  slug: string
  name: string
  kind: Product['kind']
  benefit: string | null
  features: string[]
  badge: string | null
  brand: { slug: string; name: string; status: Partner['partnerStatus']; logo?: IndexLogo } | null
  /** Main category (the first one): breadcrumbs, „Podobne”. */
  category: { slug: string; name: string } | null
  subcategory: string | null
  industries: { slug: string; name: string }[]
  images: PublicImage[]
  /** Points over the first image, in % of its size; empty when that image is not public. */
  hotspots: { x: number; y: number; title: string; description: string | null }[]
  modules: { name: string; description: string | null; icon: IconName | null }[]
  keyParams: LabelValue[]
  specs: { group: string | null; rows: LabelValue[] }[]
  description: Product['description'] | null
  /** „W PRO-KOM w cenie”: the product's own list, else its main category's. */
  included: string[]
  faq: { question: string; answer: string }[]
  /** Versions of one card („Jota ONLINE BT/WiFi”) with what differs, once per name. */
  variants: { name: string; difference: string | null }[]
  /**
   * „Kiedy wybrać coś innego?” (`alternatives`): slugs of this tenant's products; the page keeps
   * only those in the catalog index (published).
   */
  alternatives: string[]
  documents: { datasheets: string[]; productPages: string[] }
  tabs: ProductTab[]
  seo: { title: string | null; description: string | null }
  indexable: boolean
}

const docs = <T extends object>(values: (number | T)[] | null | undefined): T[] =>
  (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)

const text = (value: string | null | undefined) => value?.trim() || null

const unique = (values: string[] | null | undefined) => [
  ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
]

type EditorNode = { type?: string; text?: string; children?: EditorNode[] }

/** Nodes that show something without text of their own. */
const EMBEDDED = new Set(['upload', 'horizontalrule', 'relationship', 'block'])

const nodeHasContent = (node: EditorNode): boolean =>
  Boolean(node.text?.trim()) ||
  EMBEDDED.has(node.type ?? '') ||
  (node.children ?? []).some(nodeHasContent)

/** Whether a rich text field shows anything: an emptied editor still keeps one paragraph. */
export function hasRichText(value: unknown): boolean {
  const root = (value as { root?: EditorNode } | null | undefined)?.root
  return Boolean(root && nodeHasContent(root))
}

function uniqueVariants(rows: Product['variants']): ProductView['variants'] {
  const seen = new Set<string>()
  return (rows ?? []).flatMap(({ name, difference }) => {
    const label = name.trim()
    if (!label || seen.has(label)) return []
    seen.add(label)
    return [{ name: label, difference: text(difference) }]
  })
}

function groupSpecs(rows: Product['specs']): ProductView['specs'] {
  const groups: ProductView['specs'] = []
  for (const { group, label, value } of rows ?? []) {
    const name = text(group)
    const last = groups.at(-1)
    const row = { label, value }
    if (last && last.group === name) last.rows.push(row)
    else groups.push({ group: name, rows: [row] })
  }
  return groups
}

export function buildProductView(product: Product, tenantId: number): ProductView {
  // Read with `overrideAccess`: relations are re-checked here, as in `buildCatalogIndex`.
  const ownTenant = (record: { tenant?: unknown }) => tenantIdOf(record.tenant) === tenantId
  const listedBrand =
    typeof product.brand === 'object' && product.brand !== null ? product.brand : null
  const brand = listedBrand?.tenants?.some((t) => tenantIdOf(t) === tenantId) ? listedBrand : null
  const logo = brand ? brandLogo(brand) : undefined
  const categories = docs<CatalogCategory>(product.categories).filter(ownTenant)
  const main = categories[0]
  const images = (product.images ?? []).flatMap((value) => {
    const image = publicImage(value, tenantId)
    return image ? [image] : []
  })
  const description = hasRichText(product.description) ? product.description : null
  const specs = groupSpecs(product.specs)
  const faq = (product.faq ?? []).map(({ question, answer }) => ({ question, answer }))
  const documents = {
    datasheets: unique(product.sources?.datasheets),
    productPages: unique(product.sources?.productPages),
  }
  const ownIncluded = unique(product.included)

  const tabs: ProductTab[] = []
  if (description) tabs.push('opis')
  if (specs.length > 0) tabs.push('specyfikacja')
  if (documents.datasheets.length + documents.productPages.length > 0) tabs.push('dokumenty')
  if (faq.length > 0) tabs.push('pytania')

  return {
    slug: product.slug,
    name: product.name,
    kind: product.kind,
    benefit: text(product.benefit),
    features: unique(product.features),
    badge: text(product.badge),
    brand: brand?.slug
      ? {
          slug: brand.slug,
          name: brand.name,
          status: brand.partnerStatus,
          ...(logo && { logo }),
        }
      : null,
    category: main ? { slug: main.slug, name: main.name } : null,
    subcategory: text(product.subcategory),
    industries: docs<Industry>(product.industries)
      .filter(ownTenant)
      .map(({ slug, name }) => ({ slug, name })),
    images,
    // Points are set in % of the panel's first photo: shown only while that one is public.
    hotspots: publicImage(product.images?.[0], tenantId)
      ? (product.hotspots ?? []).map(({ x, y, title, description }) => ({
          x,
          y,
          title,
          description: text(description),
        }))
      : [],
    modules: (product.modules ?? []).map(({ name, description, icon }) => ({
      name,
      description: text(description),
      icon: icon ?? null,
    })),
    keyParams: (product.keyParams ?? []).map(({ label, value }) => ({ label, value })),
    specs,
    description,
    included: ownIncluded.length > 0 ? ownIncluded : unique(main?.included),
    faq,
    variants: uniqueVariants(product.variants),
    alternatives: docs<Product>(product.alternatives)
      .filter(ownTenant)
      .map(({ slug }) => slug),
    documents,
    tabs,
    seo: { title: text(product.seo?.title), description: text(product.seo?.description) },
    indexable: isIndexableProduct(product),
  }
}
