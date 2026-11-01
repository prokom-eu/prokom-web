/**
 * Keyboard of the ARIA tabs on the Software start page (spec. §8.3): arrows move by one and
 * wrap around, Home and End jump to the ends. `null` = the key is not ours.
 */
export function tabKeyTarget(key: string, index: number, count: number): number | null {
  if (count < 1) return null
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

/**
 * Do the self-switching tabs move on (audyt 01.11 P1 #19)? Only on the desktop — on a phone the
 * visitor is reading and three sections switching at once jump under the thumb — and only until
 * the first pick or hover (then never again); a focus inside only pauses them.
 */
export function autoRotates(state: {
  count: number
  reducedMotion: boolean
  desktop: boolean
  picked: boolean
  stopped: boolean
  paused: boolean
}): boolean {
  return (
    state.count > 1 &&
    !state.reducedMotion &&
    state.desktop &&
    !state.picked &&
    !state.stopped &&
    !state.paused
  )
}
