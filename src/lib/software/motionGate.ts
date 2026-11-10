/** Elements whose endless motion runs only near the screen: the mock-ups (`Mockup`, `.mk`). */
export const GATED = '.mk'

/** The part of an element the gate uses (a fake one in the tests). */
export type GateElement = {
  matches(selector: string): boolean
  querySelectorAll(selector: string): ArrayLike<GateElement>
  toggleAttribute(name: string, force: boolean): boolean
}

type Watcher = {
  observe(target: GateElement): void
  unobserve(target: GateElement): void
}

/** Every gated element of a subtree, its root included; nothing for a text node. */
function gatedIn(node: GateElement): GateElement[] {
  if (typeof node.matches !== 'function') return []
  return [...(node.matches(GATED) ? [node] : []), ...Array.from(node.querySelectorAll(GATED))]
}

/**
 * Endless animations only on the screen (AUDYT-PROD-TELEFON §1 #1): each mock-up away from the
 * screen gets `data-still`, which pauses everything inside it (`mockups.css`). `add`/`remove`
 * take subtrees as they enter and leave the page (an offer window, the next page), `sync` takes
 * the entries of the intersection observer that `watcher` is.
 */
export function createMotionGate(watcher: Watcher) {
  return {
    add(node: GateElement) {
      gatedIn(node).forEach((element) => watcher.observe(element))
    },
    remove(node: GateElement) {
      gatedIn(node).forEach((element) => watcher.unobserve(element))
    },
    sync(entries: readonly { target: GateElement; isIntersecting: boolean }[]) {
      for (const entry of entries) entry.target.toggleAttribute('data-still', !entry.isIntersecting)
    },
  }
}
