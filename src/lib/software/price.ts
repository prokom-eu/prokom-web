import { SOLUTION_SIZES, type SolutionSize } from './options'

/** `Solutions.prices` / `Solutions.leadTimes` as Payload returns them (empty = `null`). */
export type SizePrices = Partial<Record<SolutionSize, number | null>> | null | undefined
export type SizeTerms = Partial<Record<SolutionSize, string | null>> | null | undefined

const isPrice = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

/**
 * „Od” price of a solution: the lowest price given (ADR-014 rozstrz. SW0 5 — computed, never
 * stored). `0` is a price (free quick audit), not a missing one. `null` → the fallback text.
 */
export function priceFromOf(prices: SizePrices): number | null {
  const given = SOLUTION_SIZES.map((size) => prices?.[size]).filter(isPrice)
  return given.length > 0 ? Math.min(...given) : null
}

/** Term of a solution: the `start` size, otherwise the first size with a term. */
export function leadTimeOf(terms: SizeTerms): string | null {
  for (const size of SOLUTION_SIZES) {
    const term = terms?.[size]?.trim()
    if (term) return term
  }
  return null
}
