import type { Theme } from '../brand/theme'

/** Lines whose `motion.css` draws the circle (`[data-theme-reveal]`). */
const LINES_WITH_REVEAL = new Set(['software', 'instalacje'])

/**
 * Theme switch with the new theme opening in a circle from the button (SWV7, `motion.css` §5):
 * a View Transition of the root, clipped from the click point. Software and Instalacje only —
 * other lines keep the instant switch — and never with reduced motion or without browser support.
 */
export function revealTheme(
  next: Theme,
  apply: (theme: Theme) => void,
  origin?: { x: number; y: number },
): void {
  const root = document.documentElement
  const canReveal =
    LINES_WITH_REVEAL.has(root.getAttribute('data-line') ?? '') &&
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!canReveal) {
    apply(next)
    return
  }
  root.style.setProperty('--reveal-x', origin ? `${origin.x}px` : '50%')
  root.style.setProperty('--reveal-y-origin', origin ? `${origin.y}px` : '0px')
  root.setAttribute('data-theme-reveal', '')
  const transition = document.startViewTransition(() => apply(next))
  void transition.finished.finally(() => root.removeAttribute('data-theme-reveal'))
}

/** Centre of the clicked element, the origin of the circle. */
export function centreOf(element: Element): { x: number; y: number } {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}
