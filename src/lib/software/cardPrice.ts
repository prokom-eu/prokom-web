import { formatPrice } from './price'
import type { IndexSolution } from './solutionsIndex'
import type { PriceDisplay } from './wizard'

/**
 * Price lines of a solution card (spec. §5; catalog and later „12 rzeczy”): the one „od” price
 * split around the amount (the board sets it larger) and the „od” term (ADR-014 v22 pkt 1).
 * Prices and terms only from `Solutions`, words only from `priceDisplay` — nothing in code
 * (spec. §1 pkt 1). `0` is a price (free), an empty price asks for a quote.
 */

export type CardPrice = {
  head: { before: string; amount: string; after: string }
  /** „od 2 tygodni” as stored, or `termFallback`. */
  term: string
  /** No price at all: the card asks for a quote. */
  ask: boolean
}

function split(template: string, amount: string): CardPrice['head'] {
  const [before = '', after = ''] = template.split('{cena}')
  return { before: before.trim(), amount, after: after.trim() }
}

export function cardPrice(
  solution: Pick<IndexSolution, 'priceMonthly' | 'priceFrom' | 'leadTime'>,
  display: PriceDisplay,
): CardPrice {
  const term = solution.leadTime ?? display.termFallback
  if (solution.priceFrom === null) {
    return { head: split('{cena}', display.fallback), term, ask: true }
  }
  // Free (the quick audit): no „od”, no „netto” — just 0 zł.
  if (solution.priceFrom === 0) {
    return { head: { before: '', amount: '0', after: 'zł' }, term, ask: false }
  }
  const template = solution.priceMonthly ? display.monthTemplate : display.template
  return { head: split(template, formatPrice(solution.priceFrom)), term, ask: false }
}
