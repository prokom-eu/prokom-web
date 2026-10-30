/** What decides whether a widget's timer ticks (ADR-I003 §2: `this.every` → `useInterval`). */
export type TickState = {
  /** The widget still plays by itself (false once the visitor touched it). */
  enabled: boolean
  /** `document.hidden` — the browser tab is in the background. */
  hidden: boolean
  /** The widget is on screen (IntersectionObserver). */
  visible: boolean
  /** `prefers-reduced-motion: reduce`. */
  reducedMotion: boolean
}

/** The timer ticks only for a visible, untouched widget in a visible tab, without reduced motion. */
export function shouldTick({ enabled, hidden, visible, reducedMotion }: TickState): boolean {
  return enabled && !hidden && visible && !reducedMotion
}
