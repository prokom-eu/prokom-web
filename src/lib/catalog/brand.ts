import type { Partner } from '@/payload-types'

import type { PublicImage } from '../media/public'
import { imageSources } from '../media/sizes'
import { isHttpsUrl } from '../site/link'
import { tenantIdOf } from '../tenant/id'
import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { hasRichText } from './product'
import { isProducerSource } from './sources'

/**
 * Brand pages `/marki/[slug]` (K3-KATALOG §6, spec. §6.11, ADR-012 rozstrz. 15): the brand
 * template of K3b′, for brands without a salon 2.0 (K4f — salons take the same address).
 */

export const brandHref = (slug: string) => `/marki/${encodeURIComponent(slug)}`

/** Longest short description in the `<title>` (K3-KATALOG §6: „skrócony do 60 zn.”). */
export const TITLE_DESCRIPTION_LIMIT = 60

/**
 * Where a brand of the index leads: its salon 2.0 (K4f — a theme salon too: Kyocera → Druk),
 * else its brand page (`hasPage`, K3b′), else nowhere (`null`).
 */
export function brandTarget(brand: CatalogIndex['brands'][number]): string | null {
  if (brand.salon) return brandHref(brand.salon)
  return brand.page ? brandHref(brand.slug) : null
}

/**
 * Address of the brand's salon or page — or `null` when it has none. Only brands with listed
 * products on this site are in the index, like a category without products (rozstrzygnięcie 7).
 */
export function brandPageHref(index: Pick<CatalogIndex, 'brands'>, slug: string): string | null {
  const brand = index.brands.find((item) => item.slug === slug)
  return brand ? brandTarget(brand) : null
}

export type BrandFact = { label: string; value: string; sourceUrl: string | null }

/** What the brand page renders: only public fields, links re-checked (https only). */
export type BrandView = {
  slug: string
  name: string
  logo: PublicImage | null
  country: string | null
  shortDescription: string | null
  description: NonNullable<Partner['brandPage']>['description'] | null
  facts: BrandFact[]
  productLines: string[]
  /** The producer's site (`website`), https only. */
  website: string | null
}

const text = (value: string | null | undefined) => value?.trim() || null

const httpsOnly = (value: string | null | undefined) => {
  const url = text(value)
  return url && isHttpsUrl(url) ? url : null
}

/** Source of a fact: a producer's or an official site only (ADR-012 rozstrz. 19), never a shop. */
const factSource = (value: string | null | undefined) => {
  const url = httpsOnly(value)
  return url && isProducerSource(url) ? url : null
}

/**
 * Brand page of a partner on one tenant — or `null`: no page in the panel, no address, or not a
 * brand of this site (`Partners` is shared by the lines, read with `overrideAccess`).
 */
export function buildBrandView(partner: Partner, tenantId: number): BrandView | null {
  const page = partner.brandPage
  const slug = text(partner.slug)
  const ownTenant = partner.tenants?.some((tenant) => tenantIdOf(tenant) === tenantId)
  if (!page?.hasPage || !slug || !ownTenant) return null
  const sources = imageSources(partner)
  const logo =
    partner.width && partner.height && sources.length > 0
      ? { alt: `Logo ${partner.name}`, width: partner.width, height: partner.height, sources }
      : null
  return {
    slug,
    name: partner.name,
    logo,
    country: text(page.country),
    shortDescription: text(page.shortDescription),
    description: hasRichText(page.description) ? (page.description ?? null) : null,
    facts: (page.facts ?? []).flatMap(({ label, value, sourceUrl }) => {
      const factLabel = label.trim()
      const factValue = value.trim()
      return factLabel && factValue
        ? [{ label: factLabel, value: factValue, sourceUrl: factSource(sourceUrl) }]
        : []
    }),
    productLines: (page.productLines ?? []).map((line) => line.trim()).filter(Boolean),
    website: httpsOnly(partner.website),
  }
}

/** Cut at a word, under `limit` characters, with „…” when anything was cut. */
function clip(value: string, limit: number): string {
  if (value.length <= limit) return value
  const cut = value.slice(0, limit - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,.;:—–-]+$/u, '')}…`
}

/** „Lenovo — Producent laptopów, komputerów…” (the site's template adds „| PRO-KOM Biznes”). */
export function brandTitle(name: string, shortDescription: string | null): string {
  return shortDescription
    ? `${name} — ${clip(shortDescription, TITLE_DESCRIPTION_LIMIT)}`
    : `${name} w PRO-KOM`
}

export type BrandCategory = { slug: string; name: string; count: number }

/** Products of the brand on this site, in index order (popularity). */
export function brandProducts(index: Pick<CatalogIndex, 'products'>, slug: string): IndexProduct[] {
  return index.products.filter((product) => product.brand === slug)
}

/**
 * Main categories of the brand's products, most products first (the filter of the grid, shown
 * from 2 categories on — K3-KATALOG §6); ties keep the catalog order.
 */
export function brandCategories(
  products: readonly IndexProduct[],
  index: Pick<CatalogIndex, 'categories'>,
): BrandCategory[] {
  const counts = new Map<string, number>()
  for (const product of products) {
    const main = product.categories[0]
    if (main) counts.set(main, (counts.get(main) ?? 0) + 1)
  }
  return index.categories
    .flatMap(({ slug, name }) => {
      const count = counts.get(slug)
      return count ? [{ slug, name, count }] : []
    })
    .sort((a, b) => b.count - a.count)
}

type BrandJsonLdInput = {
  name: string
  url: string
  description: string | null
  logo: string | null
  website: string | null
}

/** `Brand` of the brand page; the producer's site as `sameAs`. Empty fields are left out. */
export function brandJsonLd({ name, url, description, logo, website }: BrandJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name,
    url,
    ...(description && { description }),
    ...(logo && { logo }),
    ...(website && { sameAs: [website] }),
  }
}
