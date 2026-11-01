import type { BzOrderFlowBlock, BzTimelineBlock, Industry } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { tenantIdOf } from '../tenant/id'
import type { CatalogIndex, IndexProduct } from './catalogIndex'

/**
 * Industry page `/branze/[branza]` (spec. §6.7, board `Branza`). Products come from the catalog
 * index — only this site's published ones; the call to action opens the wizard with the business
 * type of the industry (ADR-012 rozstrzygnięcie 8).
 */

export const INDUSTRY_PATH = '/branze'

export const industryHref = (slug: string) => `${INDUSTRY_PATH}/${encodeURIComponent(slug)}`

const WIZARD_PATH = '/konfigurator'

/** `/konfigurator?firma=<type>`; without a type the configurator starts at step 1. */
export function wizardHref(businessType: string | null | undefined): string {
  return businessType ? `${WIZARD_PATH}?firma=${encodeURIComponent(businessType)}` : WIZARD_PATH
}

/** Featured products in the panel order (listed only, no repeats) and the industry's total. */
export function industryProducts(
  index: CatalogIndex,
  slug: string,
  featured: readonly string[],
): { featured: IndexProduct[]; total: number } {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const seen = new Set<string>()
  const products: IndexProduct[] = []
  for (const item of featured) {
    const product = bySlug.get(item)
    if (!product || seen.has(item)) continue
    seen.add(item)
    products.push(product)
  }
  const total = index.products.filter((product) => product.industries.includes(slug)).length
  return { featured: products, total }
}

export type OtherIndustries = {
  active: { slug: string; name: string; href: string; current: boolean }[]
  /** Inactive industries — named as „Wkrótce”, without a page. */
  soon: string[]
}

/** „Inne branże”: the active industries in the panel order and the rest as „Wkrótce”. */
export function otherIndustries(index: CatalogIndex, current: string): OtherIndustries {
  return {
    active: index.industries
      .filter((industry) => industry.active)
      .map(({ slug, name }) => ({
        slug,
        name,
        href: industryHref(slug),
        current: slug === current,
      })),
    soon: index.industries.filter((industry) => !industry.active).map((industry) => industry.name),
  }
}

type Heading = { eyebrow: string; title: string }

export type IndustryView = {
  slug: string
  name: string
  active: boolean
  title: string
  lead: string | null
  image: PublicImage | null
  chips: string[]
  cta: { label: string; href: string }
  products: Heading & { lead: string | null }
  /** Slugs of the featured products of this tenant; the page keeps the published ones. */
  featured: string[]
  /** „Dzień w lokalu” as the `bzTimeline` block — `null` without a heading or 2 steps. */
  day: BzTimelineBlock | null
  /** „Jak to działa” as the `bzOrderFlow` block — `null` without a heading. */
  flow: BzOrderFlowBlock | null
  faq: Heading & { lead: string | null; items: { question: string; answer: string }[] }
  contact: { heading: string; lead: string }
  seo: { title: string | null; description: string | null }
}

/** General texts for an industry without its own. */
const DEFAULTS = {
  cta: 'Przygotuj zapytanie',
  products: { eyebrow: 'Zestaw dla branży', title: 'Sprzęt i programy, które wdrażamy.' },
  faq: { eyebrow: 'Pytania i odpowiedzi', title: 'Zanim zdecydujesz' },
  contact: {
    heading: 'Powiedz, czego potrzebujesz, a resztę dobierzemy',
    lead: 'Przygotujemy zestaw na piśmie, bez zobowiązań.',
  },
} as const

const text = (value: string | null | undefined) => value?.trim() || null

export function buildIndustryView(industry: Industry, tenantId: number): IndustryView {
  const day = industry.day
  const dayHeading = text(day?.heading)
  const daySteps = day?.steps ?? []
  const flow = industry.flow
  const flowHeading = text(flow?.heading)
  return {
    slug: industry.slug,
    name: industry.name,
    active: Boolean(industry.active),
    title: text(industry.hero?.title) ?? industry.name,
    lead: text(industry.hero?.lead),
    image: publicImage(industry.hero?.image, tenantId),
    chips: (industry.hero?.chips ?? []).map((chip) => chip.trim()).filter(Boolean),
    cta: {
      label: text(industry.hero?.ctaLabel) ?? DEFAULTS.cta,
      href: wizardHref(industry.wizardBusinessType),
    },
    products: {
      eyebrow: text(industry.productsSection?.eyebrow) ?? DEFAULTS.products.eyebrow,
      title: text(industry.productsSection?.title) ?? DEFAULTS.products.title,
      lead: text(industry.productsSection?.lead),
    },
    // Read with `overrideAccess`: only this site's products; the page keeps the published ones.
    featured: (industry.featuredProducts ?? []).flatMap((value) =>
      typeof value === 'object' && value !== null && tenantIdOf(value.tenant) === tenantId
        ? [value.slug]
        : [],
    ),
    day:
      dayHeading && daySteps.length >= 2
        ? { blockType: 'bzTimeline', eyebrow: day?.eyebrow, heading: dayHeading, steps: daySteps }
        : null,
    flow: flowHeading && flow ? { ...flow, blockType: 'bzOrderFlow', heading: flowHeading } : null,
    faq: {
      eyebrow: text(industry.faqIntro?.eyebrow) ?? DEFAULTS.faq.eyebrow,
      title: text(industry.faqIntro?.title) ?? DEFAULTS.faq.title,
      lead: text(industry.faqIntro?.lead),
      items: (industry.faq ?? []).map(({ question, answer }) => ({ question, answer })),
    },
    contact: {
      heading: text(industry.contact?.heading) ?? DEFAULTS.contact.heading,
      lead: text(industry.contact?.lead) ?? DEFAULTS.contact.lead,
    },
    seo: { title: text(industry.seo?.title), description: text(industry.seo?.description) },
  }
}
