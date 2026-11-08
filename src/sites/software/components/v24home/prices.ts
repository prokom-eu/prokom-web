import { cardPrice } from '@/lib/software/cardPrice'
import type { SoftwareHome } from '@/lib/software/home'
import type { MockupKind } from '@/lib/software/mockups'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

/** „od 2 490 zł” and the term of a solution (`cardPrice`); a missing one asks for a quote. */
export type PriceLine = { price: string; term: string }

export function priceLine(slug: string, index: SolutionsIndex): PriceLine {
  const solution = index.solutions.find((item) => item.slug === slug)
  if (!solution)
    return { price: index.priceDisplay.fallback, term: index.priceDisplay.termFallback }
  const { head, term } = cardPrice(solution, index.priceDisplay)
  return { price: [head.before, head.amount, head.after].filter(Boolean).join(' '), term }
}

/** Price lines of the given solutions, for a client section (no index shipped to the browser). */
export function priceLines(slugs: string[], index: SolutionsIndex): Record<string, PriceLine> {
  return Object.fromEntries(slugs.map((slug) => [slug, priceLine(slug, index)]))
}

/** Address of the offer window of a solution (catalog, `?rozwiazanie=`). */
export const offerHref = (slug: string) => `/rozwiazania?rozwiazanie=${slug}`

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
  mockup: { kind: MockupKind; variant: string | null } | null
}

/** Cards of the price list: the published solutions of each group, in the group's order. */
export function pricingCards(
  pricing: NonNullable<SoftwareHome['pricing']>,
  index: SolutionsIndex,
): PricingCard[] {
  return pricing.groups.flatMap((group) =>
    group.solutions.flatMap((slug) => {
      const solution = index.solutions.find((item) => item.slug === slug)
      if (!solution) return []
      return [
        {
          slug,
          name: solution.name,
          lead: solution.lead ?? '',
          group: group.label,
          ...priceLine(slug, index),
          mockup: solution.preview ?? null,
        },
      ]
    }),
  )
}
