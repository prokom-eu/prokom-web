/** Below this scroll position (px) the header is always shown. */
const TOP_ZONE = 90
/** Moves (px) smaller than this neither hide nor show it — no flicker on a shaky thumb. */
const THRESHOLD = 8

export type HideOnScrollInput = {
  /** Current `scrollY`. */
  y: number
  /** `scrollY` at the last move that counted. */
  lastY: number
  hidden: boolean
  /** Phone/tablet layout (≤ 1080 px, NAGLOWEK-KAPSULA §5). */
  narrow: boolean
  /** A sheet or dialog is open: the header stays. */
  paused: boolean
}

/**
 * Header hidden while scrolling down, back when scrolling up (NAGLOWEK-KAPSULA §5) — the rule of
 * the Instalacje shell (`powloka/headerHide.ts`) moved to the shared elements: next state and
 * reference point. The Instalacje copy goes away when the line moves to `SiteHeader` (D3-I).
 */
export function nextHidden({ y, lastY, hidden, narrow, paused }: HideOnScrollInput): {
  hidden: boolean
  lastY: number
} {
  const delta = y - lastY
  let next = hidden
  if (!narrow || paused || y < TOP_ZONE) next = false
  else if (delta > THRESHOLD) next = true
  else if (delta < -THRESHOLD) next = false
  const counts = Math.abs(delta) > THRESHOLD || y < TOP_ZONE
  return { hidden: next, lastY: counts ? y : lastY }
}
