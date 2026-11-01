/**
 * Numbers that count up once (SWV7, „PRO-KOM w liczbach”): the figure of a text like „100+”
 * or „2004” and the frames of the count. Pure, so the rules are tested; `CountUp` draws them.
 */

export const COUNT_MS = 900

/** A leading whole number and the rest („100+” → 100, „+”); `null` when it does not start so. */
export function parseCount(text: string): { value: number; suffix: string } | null {
  const match = /^(\d+)(.*)$/.exec(text.trim())
  if (!match) return null
  return { value: Number(match[1]), suffix: match[2] ?? '' }
}

/**
 * Where the count starts: from 0 for counts, close below for a year (2004 counts up from 1984,
 * not through two thousand numbers in under a second).
 */
export function countStart(value: number): number {
  return value >= 1000 ? value - 20 : 0
}

/** Ease-out (cubic): fast at first, slowing to the figure. */
export function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}

/** The number shown at `elapsed` ms. */
export function countAt(value: number, elapsed: number): number {
  const t = Math.min(1, Math.max(0, elapsed / COUNT_MS))
  const start = countStart(value)
  return Math.round(start + (value - start) * easeOut(t))
}
