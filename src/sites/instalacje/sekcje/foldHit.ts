/** Height of the tap zone above „Pokaż całą sekcję” (the faded edge, `sekcje.css`). */
export const FOLD_HIT = 120
/** The smallest visible part of a control (WCAG 2.2 target size, axe `target-size`). */
export const MIN_TARGET = 24
/** The zone never reaches above the faded edge (the mask's gradient, `sekcje.css`). */
export const FOLD_FADE = 170

type Box = { top: number; bottom: number }

/**
 * The fold's tap zone (part of the button): 120 px above the button, or more when a control (FAQ
 * question, link) would stay above it as a sliver lower than 24 px; and below the button's top as
 * far as a control cut by the fold reaches (audit 10.11, axe `target-size` at 320 px on
 * `/dla-kogo/apartamenty`: a question cut by the fold and the button showed 7–18 px around them).
 * A tap anywhere there unfolds the section. `top`/`bottom` are measured from the button's top edge
 * (negative above it); `below` is how far the zone reaches under the button's top (0: not at
 * all, the zone ends at the button).
 */
export function foldHitBox(
  controls: readonly Box[],
  buttonHeight: number,
  /** The section's bottom edge (from the button's top): the zone stays in its section. */
  maxBelow = Number.POSITIVE_INFINITY,
): { above: number; below: number } {
  let above = FOLD_HIT
  // Taking one control may cut the next one up, so until nothing changes.
  for (let grown = true; grown;) {
    grown = false
    for (const { top, bottom } of controls) {
      const edge = -above
      if (top < edge && bottom > edge && edge - top < MIN_TARGET) {
        above = Math.min(FOLD_FADE, Math.ceil(-top) + 1)
        grown = above > -edge
      }
    }
  }
  // A control cut by the button's top edge: the zone also spans the button (and reaches as low
  // as the control), so no side or bottom strip of it is left to tap.
  let below = 0
  for (const { top, bottom } of controls) {
    if (top < 0 && bottom > 0) below = Math.max(below, buttonHeight, Math.ceil(bottom) + 1)
  }
  return { above, below: Math.min(below, Math.floor(maxBelow)) }
}
