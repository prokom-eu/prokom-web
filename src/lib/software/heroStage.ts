/**
 * Logic of the v24 hero carousel (ZMIANY-v24 §4.1, §4.1a): which place each window takes and how
 * the slide moves. Pure functions, so the client component stays small and the rules are tested.
 */

/** A new slide every 4.2 s; after a click or a swipe the clock waits 12 s. */
export const SLIDE_MS = 4200
export const RESUME_MS = 12000

/** `r0` middle, `r1` right, `rl` left, `rx` hidden (classes of `hero.css`). */
export type Rank = 'r0' | 'r1' | 'rl' | 'rx'

/** Place of window `k` while slide `current` is shown, out of `count` windows. */
export function rankOf(k: number, current: number, count: number): Rank {
  const r = (((k - current) % count) + count) % count
  if (r === 0) return 'r0'
  if (r === 1) return 'r1'
  if (r === count - 1) return 'rl'
  return 'rx'
}

/** Next (`+1`) or previous (`-1`) slide, wrapping around. */
export function stepSlide(current: number, step: 1 | -1, count: number): number {
  return (((current + step) % count) + count) % count
}
