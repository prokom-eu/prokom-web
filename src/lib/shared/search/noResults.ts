/** How long a phrase without results must stay before it counts (the person stopped typing). */
export const NO_RESULTS_DELAY_MS = 1200

export type NoResultsReporter = {
  /** Call after every change of the results: `true` = a phrase is typed and nothing matches. */
  update(noResults: boolean): void
  /** A new opening of the window: it may report again. */
  reset(): void
  dispose(): void
}

/**
 * Reports a search without results at most once per opening of the window, and only when the
 * empty state stayed on screen for `delay` — not for every prefix typed on the way („ka” → „kamera”).
 * The phrase itself is never passed on (ADR-020: no typed text in analytics).
 */
export function createNoResultsReporter(
  report: () => void,
  delay = NO_RESULTS_DELAY_MS,
): NoResultsReporter {
  let timer: ReturnType<typeof setTimeout> | undefined
  let reported = false
  const stop = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }
  return {
    update(noResults) {
      stop()
      if (!noResults || reported) return
      timer = setTimeout(() => {
        timer = undefined
        reported = true
        report()
      }, delay)
    },
    reset() {
      stop()
      reported = false
    },
    dispose: stop,
  }
}
