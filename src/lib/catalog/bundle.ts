import type { Bundle } from '@/payload-types'

import { MAX_NOTE } from '../cart/cart'
import type { IndexImage, IndexProduct } from './catalogIndex'
import { tenantIdOf } from '../tenant/id'
import { BUNDLE_AREAS, type BundleArea } from './options'

/**
 * Ready bundles (K3c, spec. §6.10, K3-KATALOG §7). Built from `Bundles` with public fields only —
 * `toConfirm`, `internalNotes` and the notes of `compatChecks` never leave here; of a settled pair
 * only its name and official source (`sources`, BIZ-3 §9.2). Products are slugs, joined
 * with the catalog index on the page (`listBundle`), so unpublished cards never show.
 */

export type BundleItem = {
  product: string
  role: string
  /** A number („1”) or a description („wg stanowisk”, „1–2”). */
  quantity: string
  mandatory: boolean
  suggestedVersion: string | null
}

export type BundleView = {
  slug: string
  name: string
  area: BundleArea
  areaLabel: string
  level: string | null
  /** Wizard match (`seria` of the package). */
  series: string
  audience: string
  benefit: string
  description: string[]
  items: BundleItem[]
  swaps: { from: string; to: string; when: string }[]
  services: string[]
  reasons: string[]
  faq: { question: string; answer: string }[]
  /** Category slugs („Zobacz też”). */
  related: string[]
  industries: string[]
  /** Official sources of settled compat pairs — „Źródło ↗” on the bundle page. */
  sources: { pair: string; url: string }[]
  /** „Gotowe”: in Google, the site maps, under the plan and on industry pages. */
  indexable: boolean
}

/** Pairs that are settled: confirmed, or working on their own and said so (BIZ-3 §9.1). */
const SETTLED_PAIRS = new Set(['potwierdzona', 'bez-integracji'])

const text = (value: string | null | undefined) => value?.trim() || null

export const BUNDLES_PATH = '/zestawy'
export const bundleHref = (slug: string) => `${BUNDLES_PATH}/${encodeURIComponent(slug)}`

const AREA_LABELS: Record<string, string> = Object.fromEntries(
  BUNDLE_AREAS.map(({ value, label }) => [value, label]),
)

export const bundleAreaLabel = (area: BundleArea) => AREA_LABELS[area] ?? area

/** Slugs of populated records of this site; ids (not populated) and other sites are left out. */
function slugOf(value: unknown, tenantId: number): string | null {
  if (typeof value !== 'object' || value === null) return null
  const { slug, tenant } = value as { slug?: unknown; tenant?: unknown }
  return typeof slug === 'string' && tenantIdOf(tenant) === tenantId ? slug : null
}

function slugsOf(values: readonly unknown[] | null | undefined, tenantId: number): string[] {
  return [...new Set((values ?? []).flatMap((value) => slugOf(value, tenantId) ?? []))]
}

/**
 * A bundle of one tenant — or `null` for another site's record. Relations come populated with
 * their slug and tenant (`getBundles`).
 */
export function buildBundleView(
  bundle: Pick<
    Bundle,
    | 'tenant'
    | 'slug'
    | 'name'
    | 'area'
    | 'level'
    | 'series'
    | 'audience'
    | 'benefit'
    | 'description'
    | 'items'
    | 'swaps'
    | 'services'
    | 'reasons'
    | 'faq'
    | 'related'
    | 'industries'
    | 'contentStatus'
  > & { compatChecks?: Bundle['compatChecks'] },
  tenantId: number,
): BundleView | null {
  if (tenantIdOf(bundle.tenant) !== tenantId) return null
  return {
    slug: bundle.slug,
    name: bundle.name.trim(),
    area: bundle.area,
    areaLabel: bundleAreaLabel(bundle.area),
    level: text(bundle.level),
    series: bundle.series,
    audience: bundle.audience.trim(),
    benefit: bundle.benefit.trim(),
    description: (bundle.description ?? []).flatMap(({ text: paragraph }) => text(paragraph) ?? []),
    items: (bundle.items ?? []).flatMap((item) => {
      const product = slugOf(item.product, tenantId)
      return product
        ? [
            {
              product,
              role: item.role.trim(),
              quantity: item.quantity.trim() || '1',
              mandatory: item.mandatory !== false,
              suggestedVersion: text(item.suggestedVersion),
            },
          ]
        : []
    }),
    swaps: (bundle.swaps ?? []).flatMap((swap) => {
      const from = slugOf(swap.from, tenantId)
      const to = slugOf(swap.to, tenantId)
      return from && to ? [{ from, to, when: swap.when.trim() }] : []
    }),
    services: slugsOf(bundle.services, tenantId),
    reasons: (bundle.reasons ?? []).flatMap((reason) => text(reason) ?? []),
    faq: (bundle.faq ?? []).map(({ question, answer }) => ({ question, answer })),
    related: slugsOf(bundle.related, tenantId),
    industries: slugsOf(bundle.industries, tenantId),
    sources: (bundle.compatChecks ?? []).flatMap(({ pair, status, url }) =>
      status && SETTLED_PAIRS.has(status) && url?.startsWith('https://')
        ? [{ pair: pair.trim(), url }]
        : [],
    ),
    indexable: bundle.contentStatus === 'ready',
  }
}

/**
 * The bundle with only the cards listed on the site (published, of this tenant): an item, swap or
 * service of a hidden card disappears; `null` when no required item is left (spec. §6.10).
 */
export function listBundle(view: BundleView, listed: ReadonlySet<string>): BundleView | null {
  const items = view.items.filter((item) => listed.has(item.product))
  if (!items.some((item) => item.mandatory)) return null
  return {
    ...view,
    items,
    swaps: view.swaps.filter((swap) => listed.has(swap.from) && listed.has(swap.to)),
    services: view.services.filter((slug) => listed.has(slug)),
  }
}

/**
 * „Gotowe” bundles listing a card (any item), in their order — „W zestawach” of the product page.
 * A bundle still „Do sprawdzenia” is never linked (BIZ-3 §9.2).
 */
export const bundlesWithProduct = (bundles: readonly BundleView[], slug: string) =>
  bundles.filter((bundle) => bundle.indexable && bundle.items.some((item) => item.product === slug))

/** „Gotowe” bundles of an industry — the section of the industry page (K3-KATALOG §9, max 6). */
export const bundlesOfIndustry = (bundles: readonly BundleView[], slug: string, limit = 6) =>
  bundles.filter((bundle) => bundle.indexable && bundle.industries.includes(slug)).slice(0, limit)

/**
 * Whole-number quantity for the inquiry list (1–999); a description („wg stanowisk”) or a number
 * out of range counts as 1, and the note says the text (`itemNote`).
 */
export const itemQuantity = (quantity: string) =>
  /^[1-9]\d{0,2}$/.test(quantity) ? Number(quantity) : 1

/** Note of a bundle item on the inquiry list: „Zestaw: {nazwa}; wersja: {wersja}”. */
export function itemNote(bundle: Pick<BundleView, 'name'>, item: BundleItem): string {
  const parts = [`Zestaw: ${bundle.name}`]
  if (item.suggestedVersion) parts.push(`wersja: ${item.suggestedVersion}`)
  if (itemQuantity(item.quantity) === 1 && item.quantity !== '1') {
    parts.push(`ilość: ${item.quantity}`)
  }
  return parts.join('; ').slice(0, MAX_NOTE)
}

/**
 * „Zapytaj o ten zestaw”: every required item and the chosen optional ones, with quantity and
 * note (spec. §6.10). No prices, no sums.
 */
export function bundleCartItems(
  bundle: Pick<BundleView, 'name' | 'items'>,
  optional: ReadonlySet<string>,
): { id: string; q: number; uwaga: string }[] {
  return bundle.items
    .filter((item) => item.mandatory || optional.has(item.product))
    .map((item) => ({
      id: item.product,
      q: itemQuantity(item.quantity),
      uwaga: itemNote(bundle, item),
    }))
}

/** Bundles with their items joined with the listed cards (`listBundle`), hidden ones dropped. */
export const listBundles = (bundles: readonly BundleView[], listed: ReadonlySet<string>) =>
  bundles.flatMap((bundle) => listBundle(bundle, listed) ?? [])

/** Photos of the items for tiles and the hero: required items first, each card once. */
export function bundlePhotos(
  bundle: Pick<BundleView, 'items'>,
  products: ReadonlyMap<string, Pick<IndexProduct, 'image'>>,
  limit: number,
): IndexImage[] {
  const ordered = [
    ...bundle.items.filter((item) => item.mandatory),
    ...bundle.items.filter((item) => !item.mandatory),
  ]
  const photos = ordered.flatMap((item) => products.get(item.product)?.image ?? [])
  return [...new Map(photos.map((photo) => [photo.url, photo])).values()].slice(0, limit)
}

/** „Obszar · Poziom” label of a tile and the hero. */
export const bundleLabel = (bundle: Pick<BundleView, 'areaLabel' | 'level'>) =>
  [bundle.areaLabel, bundle.level].filter(Boolean).join(' · ')

/** Sizes of the `/zestawy` filter (BIZ-3 §9.2); other levels („Standard”, „UniFi”) — no chip. */
export const BUNDLE_SIZES = ['Mały', 'Średni', 'Duży'] as const

/** Items named on a tile: required first, up to 4; the rest is a count. */
const TILE_ITEMS = 4

/** What a bundle tile needs (serializable: `/zestawy` filters them in the browser). */
export type BundleCardData = {
  slug: string
  href: string
  name: string
  area: BundleArea
  label: string
  level: string | null
  audience: string
  benefit: string
  count: number
  photos: IndexImage[]
  /** Names of up to 4 items, required first. */
  items: string[]
  more: number
  industries: string[]
  /** „Dodaj zestaw do zapytania”: the required items with the bundle note. */
  cartItems: { id: string; q: number; uwaga: string }[]
}

export function bundleCard(
  bundle: BundleView,
  products: ReadonlyMap<string, Pick<IndexProduct, 'image'> & { name?: string }>,
): BundleCardData {
  const ordered = [
    ...bundle.items.filter((item) => item.mandatory),
    ...bundle.items.filter((item) => !item.mandatory),
  ]
  const names = [...new Set(ordered.flatMap((item) => products.get(item.product)?.name ?? []))]
  return {
    slug: bundle.slug,
    href: bundleHref(bundle.slug),
    name: bundle.name,
    area: bundle.area,
    label: bundleLabel(bundle),
    level: bundle.level,
    audience: bundle.audience,
    benefit: bundle.benefit,
    count: bundle.items.length,
    photos: bundlePhotos(bundle, products, 3),
    items: names.slice(0, TILE_ITEMS),
    more: Math.max(0, names.length - TILE_ITEMS),
    industries: bundle.industries,
    cartItems: bundleCartItems(bundle, new Set()),
  }
}

export type BundleFilter = {
  area: BundleArea | null
  industry: string | null
  size: string | null
}

/** `/zestawy` filters, all at once; `null` = any. */
export const filterBundleCards = <T extends Pick<BundleCardData, 'area' | 'level' | 'industries'>>(
  cards: readonly T[],
  { area, industry, size }: BundleFilter,
): T[] =>
  cards.filter(
    (card) =>
      (area === null || card.area === area) &&
      (industry === null || card.industries.includes(industry)) &&
      (size === null || card.level === size),
  )
