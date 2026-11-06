import { cardPrice } from '@/lib/software/cardPrice'
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
