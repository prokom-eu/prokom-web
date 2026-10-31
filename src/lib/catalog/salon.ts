import type { Partner, Showroom } from '@/payload-types'

import { plural } from '../plural'
import { isHttpsUrl } from '../site/link'
import { tenantIdOf } from '../tenant/id'
import { bindShortWords } from '../typography'
import { brandLogo, type IndexLogo, type IndexProduct } from './catalogIndex'

/**
 * Salon 2.0 (K4-FINAL §6, board `Strona.dc.html` „SALON MARKI 2.0”): one template for every
 * showroom of `Showrooms`. Each block is optional — no data, no section. Products come only
 * when listed on this site (published, own tenant), as in the rest of the catalog.
 */

/** The only tag a model card may show (K4-FINAL §6). */
export const ALLOWED_PLAN_TAG = 'polecamy na start'

/** Longest `<title>` before the site name (K33 §8: ≤ 60). */
const TITLE_LIMIT = 60

/** Hero photos (board: up to 3). */
const HERO_PHOTOS = 3

export type SalonBrand = {
  id: number
  name: string
  slug: string | null
  logo: IndexLogo | null
  website: string | null
  description: string | null
}

export type PlanCard = {
  name: string
  audience: string | null
  /** `null` when the card has no product listed here: „Zapytaj” opens the inquiry. */
  product: IndexProduct | null
  features: string[]
  tag: string | null
}

export type PlanSection = {
  eyebrow: string | null
  title: string | null
  lead: string | null
  big: boolean
  altTitle: string | null
  main: PlanCard[]
  alt: PlanCard[]
}

export type CompareCell = { kind: 'yes' } | { kind: 'no' } | { kind: 'text'; text: string }

export type SalonView = {
  slug: string
  name: string
  brands: SalonBrand[]
  /** Several brands (Druk, Sieć, NAS, Niszczarki): neutral default headings. */
  multi: boolean
  pill: string | null
  pillMobile: string | null
  h1a: string
  h1b: string | null
  lead: string | null
  hero: { product: IndexProduct; label: string | null }[]
  heroCard: {
    title: string | null
    items: { title: string; text: string | null }[]
    chips: string[]
  } | null
  facts: { value: string; label: string | null }[]
  plans: PlanSection | null
  morePlans: PlanSection | null
  compare: {
    title: string | null
    columns: string[]
    rows: { label: string; cells: CompareCell[] }[]
  } | null
  family: { title: string; iconPath: string | null; products: IndexProduct[] }[]
  /** Products of the full offer, each once. */
  familyCount: number
  chooser: {
    question: string | null
    options: { label: string; why: string | null; products: IndexProduct[] }[]
  } | null
  service: {
    title: string | null
    description: string | null
    items: { title: string; text: string | null }[]
    /** „Zgłoś kasę do serwisu” adds this service card. */
    product: IndexProduct | null
  } | null
  rollout: {
    title: string | null
    description: string | null
    steps: { title: string; text: string | null }[]
    button: string | null
    /** `null`: the button adds `products` to the inquiry, or opens it without them. */
    href: string | null
    products: IndexProduct[]
  } | null
  about: {
    facts: { label: string; value: string; sourceUrl: string | null }[]
    paragraphs: string[]
    sources: { host: string; url: string }[]
  } | null
  faq: { question: string; answer: string }[]
  headings: { offer: string; facts: string; faq: string; ask: string; more: string }
}

const text = (value: string | null | undefined) => value?.trim() || null
/** A heading from the data, with no-break spaces after one-letter words (K4-FINAL §1). */
const heading = (value: string | null | undefined) => {
  const trimmed = text(value)
  return trimmed && bindShortWords(trimmed)
}

/** A hero fact that is a count of the catalog („44 pozycje”, „16 modeli”, „17 serii”). */
const COUNT_FACT = /^\d+\s+(pozycj|model|seri)/i

const COUNT_FORMS: Record<string, [string, string, string]> = {
  pozycj: ['pozycja', 'pozycje', 'pozycji'],
  model: ['model', 'modele', 'modeli'],
  seri: ['seria', 'serie', 'serii'],
}

/**
 * Hero facts; a count of the catalog is counted from the listed products, never shown as typed
 * (K4-FINAL §4.4) — and left out when there is nothing to count.
 */
export function salonFacts(
  facts: Showroom['facts'],
  counts: { products: number; series: number },
): { value: string; label: string | null }[] {
  return (facts ?? []).flatMap((fact) => {
    const value = fact.value.trim()
    if (!value) return []
    const kind = COUNT_FACT.exec(value)?.[1]?.toLowerCase()
    if (!kind) return [{ value, label: text(fact.label) }]
    const count = kind === 'seri' ? counts.series : counts.products
    if (count === 0) return []
    return [{ value: `${count} ${plural(count, COUNT_FORMS[kind]!)}`, label: text(fact.label) }]
  })
}

const items = <T extends { title: string; text?: string | null }>(
  list: readonly T[] | null | undefined,
) =>
  (list ?? []).flatMap((item) =>
    item.title.trim() ? [{ title: item.title.trim(), text: text(item.text) }] : [],
  )

export function buildSalonView(
  doc: Showroom,
  tenantId: number,
  listed: readonly IndexProduct[],
): SalonView | null {
  if (tenantIdOf(doc.tenant) !== tenantId) return null
  const bySlug = new Map(listed.map((product) => [product.slug, product]))
  /** A populated product of this site that is listed — or `null`. */
  const pick = (value: unknown): IndexProduct | null => {
    if (typeof value !== 'object' || value === null) return null
    const { slug, tenant } = value as { slug?: unknown; tenant?: unknown }
    if (typeof slug !== 'string' || tenantIdOf(tenant) !== tenantId) return null
    return bySlug.get(slug) ?? null
  }
  const pickAll = (values: readonly unknown[] | null | undefined) => [
    ...new Map(
      (values ?? [])
        .flatMap((value) => pick(value) ?? [])
        .map((product) => [product.slug, product]),
    ).values(),
  ]

  const brands = doc.brands.flatMap((value): SalonBrand[] => {
    if (typeof value !== 'object') return []
    const partner = value as Partner
    if (!partner.tenants?.some((tenant) => tenantIdOf(tenant) === tenantId)) return []
    return [
      {
        id: partner.id,
        name: partner.name,
        slug: partner.slug ?? null,
        logo: brandLogo(partner) ?? null,
        website: partner.website && isHttpsUrl(partner.website) ? partner.website : null,
        description: text(partner.brandPage?.shortDescription),
      },
    ]
  })
  const multi = brands.length > 1
  const brand = brands[0]?.name ?? doc.name
  // Listed products of the salon's brands: the count facts of the hero.
  const brandSlugs = new Set(brands.flatMap((item) => item.slug ?? []))
  const brandProducts = listed.filter((product) => product.brand && brandSlugs.has(product.brand))
  const brandCounts = {
    products: brandProducts.length,
    series: new Set(brandProducts.flatMap((product) => product.series ?? [])).size,
  }

  const plansOf = (section: Showroom['plans']): PlanSection | null => {
    const cards = (section?.items ?? []).map((item) => ({
      card: {
        name: item.name,
        audience: text(item.audience),
        product: pick(item.product),
        features: (item.features ?? []).map((feature) => feature.trim()).filter(Boolean),
        tag: text(item.tag) === ALLOWED_PLAN_TAG ? ALLOWED_PLAN_TAG : null,
      },
      alt: Boolean(item.alt),
    }))
    if (cards.length === 0) return null
    return {
      eyebrow: text(section?.eyebrow),
      title: heading(section?.title),
      lead: text(section?.lead),
      big: Boolean(section?.big),
      altTitle: heading(section?.altTitle),
      main: cards.filter((card) => !card.alt).map(({ card }) => card),
      alt: cards.filter((card) => card.alt).map(({ card }) => ({ ...card, tag: null })),
    }
  }

  const columns = (doc.compare?.columns ?? []).map((column) => column.trim())
  const rows = (doc.compare?.rows ?? []).map((row) => ({
    label: row.label,
    cells: (row.values ?? []).map((value): CompareCell => {
      const cell = value.trim()
      if (cell === '1') return { kind: 'yes' }
      if (cell === '0') return { kind: 'no' }
      return { kind: 'text', text: cell }
    }),
  }))

  const family = (doc.family ?? []).flatMap((tab) => {
    const products = pickAll(tab.products)
    return products.length > 0 ? [{ title: tab.title, iconPath: text(tab.iconPath), products }] : []
  })

  const options = (doc.chooser?.options ?? []).map((option) => ({
    label: option.label,
    why: text(option.why),
    products: pickAll(option.products),
  }))

  const serviceItems = items(doc.service?.items)
  const steps = items(doc.rollout?.steps)
  const href = text(doc.rollout?.buttonHref)

  const facts = (doc.brandFacts ?? []).flatMap((fact) =>
    fact.label.trim() && fact.value.trim()
      ? [
          {
            label: fact.label.trim(),
            value: fact.value.trim(),
            sourceUrl: fact.sourceUrl && isHttpsUrl(fact.sourceUrl) ? fact.sourceUrl : null,
          },
        ]
      : [],
  )
  const paragraphs = (doc.about ?? []).map((item) => item.text.trim()).filter(Boolean)
  const sources = new Map<string, string>()
  for (const { sourceUrl } of facts) {
    if (!sourceUrl) continue
    const host = new URL(sourceUrl).hostname.replace(/^www\./, '')
    if (!sources.has(host)) sources.set(host, sourceUrl)
  }

  const heroCardItems = items(doc.heroCard?.items)
  const headings = doc.headings ?? {}

  return {
    slug: doc.slug,
    name: doc.name,
    brands,
    multi,
    pill: text(doc.pill),
    pillMobile: text(doc.pillMobile),
    h1a: bindShortWords(doc.h1a.trim()),
    h1b: heading(doc.h1b),
    lead: text(doc.lead),
    hero: (doc.hero ?? [])
      .flatMap((item) => {
        const product = pick(item.product)
        return product ? [{ product, label: text(item.label) }] : []
      })
      .slice(0, HERO_PHOTOS),
    heroCard:
      heroCardItems.length > 0
        ? {
            title: text(doc.heroCard?.title),
            items: heroCardItems,
            chips: (doc.heroCard?.chips ?? []).map((chip) => chip.trim()).filter(Boolean),
          }
        : null,
    facts: salonFacts(doc.facts, brandCounts),
    plans: plansOf(doc.plans),
    morePlans: plansOf(doc.morePlans),
    compare:
      columns.length > 0 && rows.length > 0
        ? { title: text(doc.compare?.title), columns, rows }
        : null,
    family,
    familyCount: new Set(family.flatMap((tab) => tab.products.map((product) => product.slug))).size,
    chooser: options.some((option) => option.products.length > 0 || option.why)
      ? { question: heading(doc.chooser?.question), options }
      : null,
    service:
      serviceItems.length > 0
        ? {
            title: heading(doc.service?.title),
            description: text(doc.service?.description),
            items: serviceItems,
            product: pickAll(doc.service?.products)[0] ?? null,
          }
        : null,
    rollout:
      steps.length > 0 || text(doc.rollout?.title)
        ? {
            title: heading(doc.rollout?.title),
            description: text(doc.rollout?.description),
            steps,
            button: text(doc.rollout?.button),
            href: href && (href.startsWith('/') || isHttpsUrl(href)) ? href : null,
            products: pickAll(doc.rollout?.products),
          }
        : null,
    about:
      facts.length > 0 || paragraphs.length > 0
        ? { facts, paragraphs, sources: [...sources].map(([host, url]) => ({ host, url })) }
        : null,
    faq: (doc.faq ?? []).flatMap((item) =>
      item.question.trim() && item.answer.trim()
        ? [{ question: item.question.trim(), answer: item.answer.trim() }]
        : [],
    ),
    headings: {
      offer: heading(headings.offer) ?? bindShortWords(multi ? 'Oferta' : `Oferta ${brand}`),
      facts:
        heading(headings.facts) ??
        bindShortWords(multi ? 'W kilku faktach' : `${brand} w kilku faktach`),
      faq:
        heading(headings.faq) ??
        bindShortWords(multi ? 'Najczęstsze pytania' : `Zanim wybierzesz ${brand}`),
      ask:
        heading(headings.ask) ?? bindShortWords(multi ? 'Zapytaj o ofertę' : `Zapytaj o ${brand}`),
      more:
        heading(headings.more) ??
        bindShortWords(multi ? 'Więcej o markach' : `Więcej o marce ${brand}`),
    },
  }
}

/** `<title>` of a salon: both H1 halves, cut on a word to 60 characters. */
export function salonTitle(h1a: string, h1b: string | null): string {
  const full = [h1a, h1b].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  if (full.length <= TITLE_LIMIT) return full
  const cut = full.slice(0, TITLE_LIMIT - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}
