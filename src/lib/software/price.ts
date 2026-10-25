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

const NBSP = String.fromCharCode(0xa0) // non-breaking space

/**
 * Price in zł as on the boards: thousands grouped with a non-breaking space („2 990”, not
 * `Intl`'s „2990” — Polish grouping starts at 5 digits), grosze only when given.
 */
export function formatPrice(price: number): string {
  const [whole = '0', fraction] = (
    Number.isInteger(price) ? String(price) : price.toFixed(2)
  ).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return fraction ? `${grouped},${fraction}` : grouped
}
