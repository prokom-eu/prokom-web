/**
 * Rising in on scroll (SWV7, `src/styles/motion.css` §3): which elements wait hidden and in what
 * order cards follow. Pure, so the rule is tested; `RevealObserver` applies it to the page.
 */

/** Share of the screen height below which an element starts hidden and rises in once seen. */
export const REVEAL_LINE = 0.92

/**
 * Does the element start below the screen? Only those wait hidden — what the visitor already
 * sees on load is never hidden (no flash), and without JavaScript nothing is.
 */
export function startsBelow(top: number, viewportHeight: number): boolean {
  return top > viewportHeight * REVEAL_LINE
}

/**
 * Order of each element among those that came into view together under the same parent: cards
 * of one row follow one another, a row seen later starts from 0 again. Keys are any objects.
 */
export function batchOrder<T>(items: readonly T[], parentOf: (item: T) => unknown): Map<T, number> {
  const seen = new Map<unknown, number>()
  const order = new Map<T, number>()
  for (const item of items) {
    const parent = parentOf(item)
    const index = seen.get(parent) ?? 0
    order.set(item, index)
    seen.set(parent, index + 1)
  }
  return order
}
