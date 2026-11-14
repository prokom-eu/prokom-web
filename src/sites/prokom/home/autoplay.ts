/**
 * When an autoplaying element of the home page (hero slides, line scene) may move on — spec §8:
 * pause on hover or focus, when the browser tab is hidden and when the element is off screen;
 * never with reduced motion or after the visitor picked something by hand.
 */
export type AutoplayState = {
  hovered: boolean
  focused: boolean
  pageHidden: boolean
  offScreen: boolean
  reducedMotion: boolean
  /** A manual choice stops the line scene for good (spec §6.1 pkt 2). */
  stopped: boolean
}

export const AUTOPLAY_IDLE: AutoplayState = {
  hovered: false,
  focused: false,
  pageHidden: false,
  offScreen: false,
  reducedMotion: false,
  stopped: false,
}

export function isRunning(state: AutoplayState): boolean {
  return !(
    state.hovered ||
    state.focused ||
    state.pageHidden ||
    state.offScreen ||
    state.reducedMotion ||
    state.stopped
  )
}

/** The next index of a list of `count`, wrapping around (`step` may be negative). */
export function stepIndex(index: number, count: number, step = 1): number {
  if (count <= 0) return 0
  return (((index + step) % count) + count) % count
}
