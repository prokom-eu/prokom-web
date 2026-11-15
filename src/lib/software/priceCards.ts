import { cardPrice } from './cardPrice'
import type { SoftwareHome } from './home'
import type { MockupKind } from './mockups'
import type { IndexSolution, SolutionsIndex } from './solutionsIndex'

/**
 * „od 2 490 zł” and the term of a solution (`cardPrice`). `ask`: no price — the slot shows a small
 * „Wycena po rozmowie” badge, not the price's type (SWA14 §4.1).
 */
export type PriceLine = { price: string; term: string; ask: boolean }

export function priceLine(slug: string, index: SolutionsIndex): PriceLine {
  const solution = index.solutions.find((item) => item.slug === slug)
  if (!solution)
    return { price: index.priceDisplay.fallback, term: index.priceDisplay.termFallback, ask: true }
  return solutionPriceLine(solution, index.priceDisplay)
}

function solutionPriceLine(
  solution: IndexSolution,
  display: SolutionsIndex['priceDisplay'],
): PriceLine {
  const { head, term, ask } = cardPrice(solution, display)
  return { price: [head.before, head.amount, head.after].filter(Boolean).join(' '), term, ask }
}

/** Price lines of the given solutions, for a client section (no index shipped to the browser). */
export function priceLines(slugs: string[], index: SolutionsIndex): Record<string, PriceLine> {
  return Object.fromEntries(slugs.map((slug) => [slug, priceLine(slug, index)]))
}

/** Address of the offer window of a solution (catalog, `?rozwiazanie=`). */
export const offerHref = (slug: string) => `/rozwiazania?rozwiazanie=${slug}`

/** The solution's own, indexable page — the `href` of links to a solution (SEO etap 1). */
export const solutionHref = (slug: string) => `/rozwiazania/${slug}`

/** Every solution the bento points to (its prices are counted on the server). */
export function bentoSlugs(bento: NonNullable<SoftwareHome['bento']>): string[] {
  return [
    ...bento.sites.variants.map((v) => v.solution),
    bento.rebuild.solution,
    ...bento.systems.variants.map((v) => v.solution),
    ...bento.automations.variants.map((v) => v.solution),
  ]
}

/** One card of the price list: everything from `Solutions`, counted on the server. */
export type PricingCard = {
  slug: string
  name: string
  lead: string
  group: string
  price: string
  term: string
  /** No price: a „Wycena po rozmowie” badge instead of the amount. */
  ask: boolean
  mockup: { kind: MockupKind; variant: string | null } | null
}

/** The card of one solution under a group label (catalog, price page, start page). */
export function solutionCard(
  solution: IndexSolution,
  display: SolutionsIndex['priceDisplay'],
  group: string,
): PricingCard {
  return {
    slug: solution.slug,
    name: solution.name,
    lead: solution.lead ?? '',
    group,
    ...solutionPriceLine(solution, display),
    mockup: solution.preview ?? null,
  }
}

/** Cards of the price list: the published solutions of each group, in the group's order. */
export function pricingCards(
  pricing: NonNullable<SoftwareHome['pricing']>,
  index: SolutionsIndex,
): PricingCard[] {
  return pricing.groups.flatMap((group) =>
    group.solutions.flatMap((slug) => {
      const solution = index.solutions.find((item) => item.slug === slug)
      return solution ? [solutionCard(solution, index.priceDisplay, group.label)] : []
    }),
  )
}
