import type { CatalogCategory, Industry, Partner, Product } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { tenantIdOf } from '../tenant/id'
import { brandLogo, type IndexLogo } from './catalogIndex'
import { buildConfigurator, type Configurator } from './configurator'
import { displayName } from './productName'
import { sourceLinks, type SourceLink } from './sourceLabels'

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
  /** H1: the short name of a card with many models (K31-ZMIANY §13.5). */
  heading: string
  subtitle: string | null
  kind: Product['kind']
  benefit: string | null
  /** „Wyróżnia się” and the three highlights of the hero. */
  features: string[]
  brand: { slug: string; name: string; status: Partner['partnerStatus']; logo?: IndexLogo } | null
  /** Main category (the first one): breadcrumbs, family. */
  category: { slug: string; name: string } | null
  subcategory: string | null
  series: string | null
  industries: { slug: string; name: string }[]
  images: PublicImage[]
  /** „Pełne parametry” and the „W skrócie” tiles, in the panel's order. */
  specs: LabelValue[]
  description: Product['description'] | null
  /** „Co robimy przy zakupie”: the product's own list, else its main category's. */
  included: string[]
  faq: { question: string; answer: string }[]
  /** Versions of one card („G8 IRL (Intel)”) with what differs, once per name. */
  variants: { name: string; difference: string | null }[]
  configurator: Configurator | null
  /** Active videos of official producer channels, at most 2 (ADR-016). */
  videos: ProductVideo[]
  /** „Do tego zwykle dobierają”: phrases the page matches to catalog cards. */
  suggestions: string[]
  /** Producers' sources only, with labels (K31-ZMIANY §4 pkt 9). */
  sources: SourceLink[]
  /** „sprawdzono” of the sources (ISO date) or `null`. */
  checkedAt: string | null
  seo: { title: string | null; description: string | null }
  indexable: boolean
}

export type ProductVideo = {
  id: string
  title: string
  channel: string | null
  lang: string | null
}

/** Videos of the product section: „Film” lists at most 2 (K31-ZMIANY §4 pkt 6). */
export const MAX_VIDEOS = 2

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
  const specs = (product.specs ?? [])
    .map(({ label, value }) => ({ label: label.trim(), value: value.trim() }))
    .filter((row) => row.label && row.value)
  const faq = (product.faq ?? []).map(({ question, answer }) => ({ question, answer }))
  const ownIncluded = unique(product.included)
  const videos = (product.videos ?? [])
    .filter((video) => video.active !== false)
    .slice(0, MAX_VIDEOS)
    .map(({ youtubeId, title, channel, lang }) => ({
      id: youtubeId,
      title,
      channel: text(channel),
      lang: text(lang),
    }))

  return {
    slug: product.slug,
    name: product.name,
    heading: displayName(product.name, text(product.shortName)),
    subtitle: text(product.subtitle),
    kind: product.kind,
    benefit: text(product.benefit),
    features: unique(product.features),
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
    series: text(product.series),
    industries: docs<Industry>(product.industries)
      .filter(ownTenant)
      .map(({ slug, name }) => ({ slug, name })),
    images,
    specs,
    description,
    included: ownIncluded.length > 0 ? ownIncluded : unique(main?.included),
    faq,
    variants: uniqueVariants(product.variants),
    configurator: buildConfigurator(product.configurator),
    videos,
    suggestions: unique(product.suggestions),
    sources: sourceLinks(
      {
        datasheets: unique(product.sources?.datasheets),
        productPages: unique(product.sources?.productPages),
      },
      brand?.name ?? null,
    ),
    checkedAt: product.sources?.checkedAt ?? null,
    seo: { title: text(product.seo?.title), description: text(product.seo?.description) },
    indexable: isIndexableProduct(product),
  }
}
