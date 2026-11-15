/**
 * Motion of a row of „Najczęściej wybierane” (runda 1411 R5, board `Wybierane.dc.html`): the row
 * holds its cards twice; it moves by ONE card, in its own direction, and when it reaches the copy
 * it jumps back to the same picture without animation — an endless loop either way.
 */

/** A move every 4.5 s, the rows 1.5 s apart, 0.8 s each (board). */
export const ROW_STEP_MS = 4500
export const ROW_OFFSET_MS = 1500
export const ROW_MOVE_MS = 800
/** Directions of the rows: 1 ←, 2 →, 3 ← (1 = the track moves left). */
export const ROW_DIRECTIONS = [1, -1, 1] as const

export type RowStep = {
  /** The index to animate to. */
  index: number
  /** After the animation: the same picture at this index, without animation (`null` = none). */
  resetTo: number | null
}

/**
 * The first index of a row: a row moving left starts at its first card, a row moving right at
 * the copy (index `count`), so both have room to move in their own direction.
 */
export const startIndex = (direction: number, count: number) => (direction > 0 ? 0 : count)

/**
 * One move from `index` by `direction` (±1) in a row of `count` cards (shown twice): at the copy's
 * start (`count`) or at 0 the next picture is the same as the other end, so the row jumps there
 * without animation once the move ends.
 */
export function stepRow(index: number, direction: number, count: number): RowStep {
  if (count <= 0) return { index: 0, resetTo: null }
  const next = Math.min(count, Math.max(0, index + Math.sign(direction)))
  // Before moving on from an end the row is already at the other end (see `resetTo`); a click
  // on an arrow against the row's direction is handled the same way.
  if (next === index) {
    const from = index === count ? 0 : count
    return stepRow(from, direction, count)
  }
  const resetTo = next === count ? 0 : next === 0 && direction < 0 ? count : null
  return { index: next, resetTo }
}

/** The card shown first in the view, 0 … count − 1 (the progress dots). */
export const activeCard = (index: number, count: number) =>
  count > 0 ? ((index % count) + count) % count : 0

/** Delay of a row's first move: its offset, then a full step (a row moves only when it may). */
export const firstDelay = (row: number) => ROW_STEP_MS + row * ROW_OFFSET_MS
