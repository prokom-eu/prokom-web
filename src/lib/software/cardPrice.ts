import { SOLUTION_SIZES, type SolutionSize } from './options'
import { formatPrice } from './price'
import type { IndexSolution } from './solutionsIndex'
import type { PriceDisplay } from './wizard'

/**
 * Price lines of a solution card (spec. §5; catalog and later „12 rzeczy”): the „od” price split
 * around the amount (the board sets it larger), the term of its size and the versions of the
 * expanded card. Prices and terms only from `Solutions`, words only from `priceDisplay` — nothing
 * in code (spec. §1 pkt 1). `0` is a price (free), an empty price asks for a quote.
 */

/** Version names when the panel leaves them empty (the wizard sizes). */
export const DEFAULT_SIZE_NAMES: Record<SolutionSize, string> = {
  start: 'Na start',
  std: 'Standard',
  full: 'Pełna',
}

export type CardPrice = {
  head: { before: string; amount: string; after: string }
  /** „Na start: 2 tygodnie”, or `termFallback`. */
  term: string
  /** Sizes with a price or a term, in order; empty when nothing is priced. */
  versions: { size: SolutionSize; name: string; price: string; term: string | null }[]
  /** No price at all: the card asks for a quote. */
  ask: boolean
}

function split(template: string, amount: string): CardPrice['head'] {
  const [before = '', after = ''] = template.split('{cena}')
  return { before: before.trim(), amount, after: after.trim() }
}

/** `{cena}` out of a template with the „od” word dropped: „od {cena} zł / mies.” → „{cena} zł / mies.”. */
const versionTemplate = (template: string) => `{cena}${template.split('{cena}')[1] ?? ''}`

export function cardPrice(
  solution: Pick<
    IndexSolution,
    'prices' | 'leadTimes' | 'priceMonthly' | 'sizeNames' | 'priceFrom' | 'leadTime'
  >,
  display: PriceDisplay,
): CardPrice {
  const name = (size: SolutionSize) => solution.sizeNames[size] ?? DEFAULT_SIZE_NAMES[size]
  const fromTemplate = solution.priceMonthly ? display.monthTemplate : display.templateFrom
  const priceTemplate = solution.priceMonthly
    ? versionTemplate(display.monthTemplate)
    : // The versions list the plain amount („2 490 zł”, board `Katalog`); netto is on the head.
      display.template.replace(/\s*netto\s*$/, '')

  const termSize = SOLUTION_SIZES.find((size) => solution.leadTimes[size] === solution.leadTime)
  const term =
    solution.leadTime && termSize ? `${name(termSize)}: ${solution.leadTime}` : display.termFallback

  const versions = SOLUTION_SIZES.flatMap((size) => {
    const price = solution.prices[size]
    const sizeTerm = solution.leadTimes[size] ?? null
    if (price === undefined && sizeTerm === null) return []
    return [
      {
        size,
        name: name(size),
        price:
          price === undefined
            ? display.fallback
            : priceTemplate.replace('{cena}', formatPrice(price)).trim(),
        term: sizeTerm,
      },
    ]
  })

  if (solution.priceFrom === null) {
    return { head: split('{cena}', display.fallback), term, versions: [], ask: true }
  }
  // Free (the quick audit): no „od”, no „netto” — just 0 zł.
  if (solution.priceFrom === 0) {
    return { head: { before: '', amount: '0', after: 'zł' }, term, versions, ask: false }
  }
  return {
    head: split(fromTemplate, formatPrice(solution.priceFrom)),
    term,
    versions,
    ask: false,
  }
}
