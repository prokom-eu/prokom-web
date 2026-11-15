/** Pull distance (px) that closes a bottom sheet (Instalacje MOBILE-APLIKACJA §4). */
const CLOSE_DISTANCE = 80
/** A flick (px/ms) closes it too, once it moved at least `FLICK_MIN` px. */
const FLICK_SPEED = 0.5
const FLICK_MIN = 20

/** Whether a downward drag of the sheet by `dy` px at `velocity` px/ms should close it. */
export function shouldCloseOnDrag(dy: number, velocity: number): boolean {
  if (dy > CLOSE_DISTANCE) return true
  return dy >= FLICK_MIN && velocity >= FLICK_SPEED
}
