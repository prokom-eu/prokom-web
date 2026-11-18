import { DARK_THEME_LINES, type Theme } from '../brand/theme'

/** A view transition may run: a line with a dark design, browser support, no reduced motion. */
function canTransition(): boolean {
  const root = document.documentElement
  return (
    (DARK_THEME_LINES as readonly string[]).includes(root.getAttribute('data-line') ?? '') &&
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Runs `apply` in a view transition marked with `attribute` (styles in `motion.css` §5). */
function transition(attribute: string, apply: () => void): void {
  const root = document.documentElement
  root.setAttribute(attribute, '')
  const running = document.startViewTransition(apply)
  void running.finished.finally(() => root.removeAttribute(attribute))
}

/**
 * Theme switch with the new theme opening in a circle from the clicked element (ADR-028, spec
 * §1.5): a view transition of the root, clipped from the click point, on every line with a dark
 * design. Without browser support or with reduced motion the theme changes at once.
 */
export function revealTheme(
  next: Theme,
  apply: (theme: Theme) => void,
  origin?: { x: number; y: number },
): void {
  if (!canTransition()) {
    apply(next)
    return
  }
  const root = document.documentElement
  root.style.setProperty('--reveal-x', origin ? `${origin.x}px` : '50%')
  root.style.setProperty('--reveal-y-origin', origin ? `${origin.y}px` : '0px')
  transition('data-theme-reveal', () => apply(next))
}

/** Auto changed on its own (back to the tab, spec §2.3): a 300 ms cross-fade, no circle. */
export function fadeTheme(apply: () => void): void {
  if (canTransition()) transition('data-theme-fade', apply)
  else apply()
}

/** Centre of the clicked element, the origin of the circle. */
export function centreOf(element: Element): { x: number; y: number } {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}
