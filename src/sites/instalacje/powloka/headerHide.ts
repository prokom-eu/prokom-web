/** Below this scroll position (px) the header is always shown. */
const TOP_ZONE = 90
/** Moves (px) smaller than this neither hide nor show it — no flicker on a shaky thumb. */
const THRESHOLD = 8

type Input = {
  /** Current `scrollY`. */
  y: number
  /** `scrollY` at the last move that counted. */
  lastY: number
  hidden: boolean
  /** Phone layout (≤ 760 px, MOBILE-APLIKACJA §1). */
  narrow: boolean
  sheetOpen: boolean
}

/**
 * Phone header hidden while scrolling down, back when scrolling up (MOBILE-APLIKACJA §2) — the
 * prototype's `_onS` (`zrodlo/common.js`) as a pure function: next state and reference point.
 */
export function nextHeaderHidden({ y, lastY, hidden, narrow, sheetOpen }: Input): {
  hidden: boolean
  lastY: number
} {
  const delta = y - lastY
  let next = hidden
  if (!narrow || sheetOpen || y < TOP_ZONE) next = false
  else if (delta > THRESHOLD) next = true
  else if (delta < -THRESHOLD) next = false
  const counts = Math.abs(delta) > THRESHOLD || y < TOP_ZONE
  return { hidden: next, lastY: counts ? y : lastY }
}
