/**
 * Logic of the v24 hero carousel (ZMIANY-v24 §4.1, §4.1a): which place each window takes and how
 * the slide moves. Pure functions, so the client component stays small and the rules are tested.
 */

/** A new slide every 4.2 s; after a click or a swipe the clock waits 12 s. */
export const SLIDE_MS = 4200
export const RESUME_MS = 12000
/** One move of the drum (= `--dur-hx-slide` in tokens.css, SWA14 §1). */
export const SLIDE_MOVE_MS = 700

/**
 * Places of the continuous carousel (SWA14 §1, a drum): `r0` middle, `r1` / `rl` right / left,
 * `r2` / `rl2` far right / far left — behind the stage's edge, under its mask — and `rx` hidden.
 * A step moves every window one place at once, so a window leaves and comes in behind the edge
 * and never fades out in sight (with 6 slides or more; fewer have no place to hide).
 */
export type Rank = 'r0' | 'r1' | 'r2' | 'rl' | 'rl2' | 'rx'

/** Place of window `k` while slide `current` is shown, out of `count` windows. */
export function rankOf(k: number, current: number, count: number): Rank {
  const r = (((k - current) % count) + count) % count
  // Signed distance from the middle: half of the drum on each side.
  const d = r <= count / 2 ? r : r - count
  if (d === 0) return 'r0'
  if (d === 1) return 'r1'
  if (d === -1) return 'rl'
  if (d === 2) return 'r2'
  if (d === -2) return 'rl2'
  return 'rx'
}

const FAR: ReadonlySet<Rank> = new Set(['r2', 'rl2', 'rx'])

/**
 * The window goes from one unseen place to another (behind the edge or hidden): it jumps there
 * at once instead of flying across the stage (`data-jump`, no transition in `hero.css`).
 */
export function jumps(k: number, from: number, to: number, count: number): boolean {
  return FAR.has(rankOf(k, from, count)) && FAR.has(rankOf(k, to, count))
}

/** Next (`+1`) or previous (`-1`) slide, wrapping around. */
export function stepSlide(current: number, step: 1 | -1, count: number): number {
  return (((current + step) % count) + count) % count
}
