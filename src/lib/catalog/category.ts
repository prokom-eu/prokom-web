import type { CatalogCategory } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { plural } from '../plural'
import { isHttpsUrl, isValidNavHref } from '../site/link'
import { tenantIdOf } from '../tenant/id'
import type { CatalogIndex, IndexImage, IndexProduct, IndexSubcategory } from './catalogIndex'
import type { IconName } from './options'
import { seriesSlug } from './showroom'

/**
 * Category page `/oferta/[kategoria]` (spec. §6.1, board `Kategoria`). Products come from the
 * catalog index — only this site's published ones — so the page shows what the menu counts.
 */

type RegisterType = IndexProduct['registerTypes'][number]

/** „Wybierz, a pokażemy pasujące kasy” — texts of the board; only cash registers have types. */
export const REGISTER_PICKER: readonly { value: RegisterType; title: string; text: string }[] = [
  {
    value: 'mobile',
    title: 'W drodze i u klienta',
    text: 'Mechanik, food truck, dostawy, gabinet z wizytami.',
  },
  {
    value: 'small',
    title: 'Mały sklep, salon, usługi',
    text: 'Kilkaset towarów, jedno stanowisko, prosta obsługa.',
  },
  {
    value: 'system',
    title: 'Sklep z dużą liczbą towarów',
    text: 'Tysiące kodów, skaner, szuflada, szybka kolejka.',
  },
  {
    value: 'touch',
    title: 'Wolę ekran dotykowy',
    text: 'Nowoczesna obsługa jak w telefonie, w kolorach.',
  },
]

/** Address of a category page (indexed, unlike the filtered `/oferta?kategoria=`). */
export const categoryHref = (slug: string) => `/oferta/${encodeURIComponent(slug)}`

/** Address of a subcategory page (K3b′, ADR-012 rozstrz. 14), e.g. `/oferta/komputery-monitory/laptopy`. */
export const subcategoryHref = (category: string, subcategory: string) =>
  `${categoryHref(category)}/${encodeURIComponent(subcategory)}`

type ListedCategory = CatalogIndex['categories'][number]

/** A subcategory with its own page, with its listed category — or `null` (404). */
export function findSubcategory(
  index: Pick<CatalogIndex, 'categories'>,
  categorySlug: string,
  subcategorySlug: string,
): { category: ListedCategory; subcategory: IndexSubcategory & { slug: string } } | null {
  const category = index.categories.find((item) => item.slug === categorySlug)
  const subcategory = category?.subcategories?.find((item) => item.slug === subcategorySlug)
  return category && subcategory?.slug
    ? { category, subcategory: { ...subcategory, slug: subcategory.slug } }
    : null
}

/** Products of a subcategory: its name on cards whose main category it belongs to (K3a). */
export function subcategoryProducts(
  index: Pick<CatalogIndex, 'products'>,
  categorySlug: string,
  name: string,
): IndexProduct[] {
  return index.products.filter(
    (product) => product.categories[0] === categorySlug && product.subcategory === name,
  )
}

/** Subcategory navigation: pages of the category's subcategories, chips for the others. */
export function subcategoryLinks(category: ListedCategory): {
  pages: (IndexSubcategory & { href: string })[]
  chips: IndexSubcategory[]
} {
  const all = category.subcategories ?? []
  return {
    pages: all.flatMap((item) =>
      item.slug ? [{ ...item, href: subcategoryHref(category.slug, item.slug) }] : [],
    ),
    chips: all.filter((item) => !item.slug),
  }
}

/**
 * H1 of a subcategory page (K3-KATALOG §9: „Laptopy dla firm — Lenovo i Dell”): the name and up
 * to 3 brands with the most products.
 */
export function subcategoryTitle(name: string, brands: readonly { name: string }[]): string {
  const names = brands.slice(0, 3).map((brand) => brand.name)
  return names.length > 0 ? `${name} dla firm — ${listNames(names)}` : `${name} dla firm`
}

/** „Do … często dobierane”: as many tiles as the board has. */
export const BOUGHT_WITH_LIMIT = 4

export type RegisterOption = (typeof REGISTER_PICKER)[number] & {
  count: number
  image?: IndexImage
}

export type CategoryBrand = { slug: string; name: string; count: number }

export type BoughtWithTile = {
  slug: string
  name: string
  count: number
  group: string
  icon?: IconName
  image?: IndexImage
}

/** Listed products of the category, in index order (popularity) — any of their categories. */
export function categoryProducts(index: CatalogIndex, slug: string): IndexProduct[] {
  return index.products.filter((product) => product.categories.includes(slug))
}

/** Brands of the products (the segments of the grid), most products first. */
export function categoryBrands(
  products: readonly IndexProduct[],
  index: CatalogIndex,
): CategoryBrand[] {
  const counts = new Map<string, number>()
  for (const { brand } of products) if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1)
  return index.brands
    .flatMap(({ slug, name }) => {
      const count = counts.get(slug)
      return count ? [{ slug, name, count }] : []
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl'))
}

const STATUS_LABEL = {
  'authorized-service': 'autoryzowany serwis',
  'authorized-partner': 'autoryzowany partner',
} as const

/** „Kasy, Elzab i Posnet”: commas, then „i” before the last name. */
const listNames = (names: string[]) =>
  names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} i ${names.at(-1)}`

/**
 * Label of the hero (board: „Kasy i sprzedaż · 7 modeli · autoryzowany serwis Posnet i Elzab”):
 * the group, the count — models when all are devices — and partner statuses confirmed in the
 * panel ([SZEF], spec. §13), most products first.
 */
export function categoryPill(
  group: string | null,
  products: readonly IndexProduct[],
  index: CatalogIndex,
): string {
  const count = products.length
  const devices = products.every((product) => product.kind === 'device')
  const parts = [
    group,
    `${count} ${plural(count, devices ? ['model', 'modele', 'modeli'] : ['pozycja', 'pozycje', 'pozycji'])}`,
  ]
  const status = new Map(index.brands.map((brand) => [brand.slug, brand.status]))
  for (const [key, label] of Object.entries(STATUS_LABEL)) {
    const names = categoryBrands(products, index)
      .filter((brand) => status.get(brand.slug) === key)
      .map((brand) => brand.name)
    if (names.length > 0) parts.push(`${label} ${listNames(names)}`)
  }
  return parts.filter(Boolean).join(' · ')
}

/** The 4 picker options with counts, or `null` while fewer than 2 products have a type. */
export function registerOptions(products: readonly IndexProduct[]): RegisterOption[] | null {
  if (products.filter((product) => product.registerTypes.length > 0).length < 2) return null
  return REGISTER_PICKER.map((option) => {
    const matching = products.filter((product) => product.registerTypes.includes(option.value))
    const image = matching.find((product) => product.image)?.image
    return { ...option, count: matching.length, ...(image && { image }) }
  })
}

/**
 * Choice in the grid: the register type, a brand segment (category page) or a category segment
 * (brand page, its main category) and a subcategory chip without its own address (K3b′).
 */
export type CategoryChoice = {
  registerType?: RegisterType
  brand?: string
  category?: string
  subcategory?: string
  /** K31c: the series (`?seria=`), any of the brands and any of the uses („Do czego”). */
  series?: string
  brands?: string[]
  industries?: string[]
}

export function filterCategoryProducts(
  products: readonly IndexProduct[],
  { registerType, brand, category, subcategory, series, brands, industries }: CategoryChoice,
): IndexProduct[] {
  return products.filter(
    (product) =>
      (!registerType || product.registerTypes.includes(registerType)) &&
      (!brand || product.brand === brand) &&
      (!category || product.categories[0] === category) &&
      (!subcategory || product.subcategory === subcategory) &&
      (!series || product.series === series) &&
      (!brands?.length || (product.brand !== null && brands.includes(product.brand))) &&
      (!industries?.length || product.industries.some((slug) => industries.includes(slug))),
  )
}

/** Query parameter of the series filter; the canonical address never carries it (K31c). */
export const SERIES_PARAM = 'seria'

export type CategorySeries = { name: string; slug: string; count: number }

/** Series of the cards (Lenovo, Dell) with counts: most cards first, ties in index order. */
export function categorySeries(products: readonly IndexProduct[]): CategorySeries[] {
  const counts = new Map<string, number>()
  for (const { series } of products) if (series) counts.set(series, (counts.get(series) ?? 0) + 1)
  return [...counts]
    .map(([name, count]) => ({ name, slug: seriesSlug(name), count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Series of the filter row — or none: the page did not ask for it (only category pages do; a
 * brand page keeps its category filter) or the cards have fewer than 2 series.
 */
export function seriesFilter(
  enabled: boolean,
  products: readonly IndexProduct[],
): CategorySeries[] {
  const series = enabled ? categorySeries(products) : []
  return series.length > 1 ? series : []
}

/** The series a `?seria=` value names — or `undefined` (none, or not in this list). */
export function seriesFromParam(
  value: string | null | undefined,
  series: readonly CategorySeries[],
): string | undefined {
  return value ? series.find((item) => item.slug === value)?.name : undefined
}

/** „Do czego”: active industries of the cards, with counts, in the index order. */
export function categoryIndustries(
  products: readonly IndexProduct[],
  index: Pick<CatalogIndex, 'industries'>,
): CategoryBrand[] {
  const counts = new Map<string, number>()
  for (const product of products)
    for (const slug of new Set(product.industries)) counts.set(slug, (counts.get(slug) ?? 0) + 1)
  return index.industries.flatMap(({ slug, name, active }) => {
    const count = counts.get(slug)
    return active && count ? [{ slug, name, count }] : []
  })
}

/**
 * „Nie wiesz, który?” → the wizard of a showroom (`/marki/<marka>#dobor`): the chosen brand when
 * it has a showroom, else the showroom brand with most cards here; `null` without any.
 */
export function showroomHelpHref(
  products: readonly IndexProduct[],
  index: Pick<CatalogIndex, 'brands'>,
  chosen: readonly string[],
): string | null {
  const showrooms = new Set(index.brands.filter((brand) => brand.showroom).map(({ slug }) => slug))
  const counts = new Map<string, number>()
  for (const { brand } of products)
    if (brand && showrooms.has(brand)) counts.set(brand, (counts.get(brand) ?? 0) + 1)
  const pick =
    chosen.find((slug) => counts.has(slug)) ??
    [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    null
  return pick ? `/marki/${encodeURIComponent(pick)}#dobor` : null
}

/** Columns the „Nie wiesz, którą wybrać?” card takes: the rest of the last row, or a full row. */
export function helpCardSpan(count: number, columns: number): number {
  return columns - (count % columns)
}

/** Tiles of the main categories of the related products: each once, not this category. */
export function boughtWithTiles(
  index: CatalogIndex,
  self: string,
  slugs: readonly string[],
): BoughtWithTile[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const categories = new Map(index.categories.map((category) => [category.slug, category]))
  const tiles = new Map<string, BoughtWithTile>()
  for (const slug of slugs) {
    const product = bySlug.get(slug)
    const main = product?.categories[0]
    const category = main ? categories.get(main) : undefined
    if (!product || !category || category.slug === self) continue
    const tile = tiles.get(category.slug)
    if (tile) {
      if (!tile.image && product.image) tile.image = product.image
      continue
    }
    if (tiles.size === BOUGHT_WITH_LIMIT) continue
    const { slug: categorySlug, name, count, group, icon } = category
    tiles.set(categorySlug, {
      slug: categorySlug,
      name,
      count,
      group,
      ...(icon && { icon }),
      ...(product.image && { image: product.image }),
    })
  }
  return [...tiles.values()]
}

type Heading = { eyebrow: string; title: string }

export type CategoryFact = {
  value: string
  title: string
  text: string
  source: string
  sourceUrl: string
  link: { label: string; href: string } | null
}

/** What the page renders: only public, own-tenant data, with general texts for empty fields. */
export type CategoryView = {
  slug: string
  name: string
  title: string
  lead: string | null
  highlights: string[]
  image: PublicImage | null
  included: Heading & {
    cards: { icon: IconName | null; title: string; text: string | null }[]
  }
  facts: Heading & { items: CategoryFact[] }
  faq: Heading & { lead: string | null; items: { question: string; answer: string }[] }
  help: { title: string; text: string }
  contact: { heading: string; lead: string }
  /** Slugs of the related products; the page keeps those in the index (published, own site). */
  boughtWith: string[]
  seo: { title: string | null; description: string | null }
}

/**
 * General texts for a category without its own (the board's, without the cash register); the
 * help card and contact panel of a brand page use them too (K3b′) — one copy in the code.
 */
export const DEFAULTS = {
  // Without „w cenie” (spec. §1, K3b′) — the name of the product page's panel (K31b).
  included: { eyebrow: 'Co robimy przy zakupie', title: 'Kupujesz u nas, dostajesz spokój.' },
  facts: { eyebrow: 'Przepisy w pigułce', title: 'Co warto wiedzieć przed zakupem.' },
  faq: { eyebrow: 'Pytania i odpowiedzi', title: 'Zanim zdecydujesz' },
  help: {
    title: 'Powiedz, czego potrzebujesz — dobierzemy w 5 minut rozmowy.',
    text: 'Bez przepłacania za funkcje, których nie użyjesz.',
  },
  contact: {
    heading: 'Nie wiesz, co wybrać? Zadzwoń — dobierzemy w 5 minut rozmowy.',
    lead: 'Powiedz, czego potrzebujesz. Przygotujemy propozycję na piśmie, bez zobowiązań.',
  },
} as const

const text = (value: string | null | undefined) => value?.trim() || null

export function buildCategoryView(category: CatalogCategory, tenantId: number): CategoryView {
  const ownCards = (category.includedSection?.cards ?? []).map(({ icon, title, text: body }) => ({
    icon: icon ?? null,
    title,
    text: text(body),
  }))
  const listCards = (category.included ?? []).flatMap((item) => {
    const title = item.trim()
    return title ? [{ icon: null, title, text: null }] : []
  })
  const facts = (category.facts?.items ?? []).flatMap((fact) => {
    const source = text(fact.source)
    const sourceUrl = text(fact.sourceUrl)
    // Read with `overrideAccess`: a link saved past the panel's validation is dropped here.
    if (!source || !sourceUrl || !isHttpsUrl(sourceUrl)) return []
    const label = text(fact.link?.label)
    const href = text(fact.link?.href)
    return [
      {
        value: fact.value,
        title: fact.title,
        text: fact.text,
        source,
        sourceUrl,
        link: label && href && isValidNavHref(href) ? { label, href } : null,
      },
    ]
  })
  return {
    slug: category.slug,
    name: category.name,
    title: text(category.hero?.title) ?? category.name,
    lead: text(category.hero?.lead) ?? text(category.description),
    highlights: (category.hero?.highlights ?? []).map((item) => item.trim()).filter(Boolean),
    image: publicImage(category.hero?.image, tenantId),
    included: {
      eyebrow: text(category.includedSection?.eyebrow) ?? DEFAULTS.included.eyebrow,
      title: text(category.includedSection?.title) ?? DEFAULTS.included.title,
      cards: ownCards.length > 0 ? ownCards : listCards,
    },
    facts: {
      eyebrow: text(category.facts?.eyebrow) ?? DEFAULTS.facts.eyebrow,
      title: text(category.facts?.title) ?? DEFAULTS.facts.title,
      items: facts,
    },
    faq: {
      eyebrow: text(category.faqIntro?.eyebrow) ?? DEFAULTS.faq.eyebrow,
      title: text(category.faqIntro?.title) ?? DEFAULTS.faq.title,
      lead: text(category.faqIntro?.lead),
      items: (category.faq ?? []).map(({ question, answer }) => ({ question, answer })),
    },
    help: {
      title: text(category.help?.title) ?? DEFAULTS.help.title,
      text: text(category.help?.text) ?? DEFAULTS.help.text,
    },
    contact: {
      heading: text(category.contact?.heading) ?? DEFAULTS.contact.heading,
      lead: text(category.contact?.lead) ?? DEFAULTS.contact.lead,
    },
    // Read with `overrideAccess`: only this site's products; the page keeps the published ones.
    boughtWith: (category.frequentlyBoughtWith ?? []).flatMap((value) =>
      typeof value === 'object' && value !== null && tenantIdOf(value.tenant) === tenantId
        ? [value.slug]
        : [],
    ),
    seo: { title: text(category.seo?.title), description: text(category.seo?.description) },
  }
}
