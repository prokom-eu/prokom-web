/**
 * „+ do zapytania” flies to the inquiry counter (plan 0611 §7.1, B3-3): a small accent dot leaves
 * the button and lands on the visible counter of the shell (`data-cart-count` on `CartCount` —
 * capsule, rail or bottom bar, whichever is on screen). Transform and opacity only, ~550 ms; with
 * reduced motion, without the Web Animations API or without a visible counter — nothing.
 * The dot is decoration (`aria-hidden`); the counter's own bump and the list are the feedback.
 */

const FLY_MS = 550
const DOT = 14

/** The counter the visitor sees now: the first `data-cart-count` with a box inside the window. */
function visibleCounter(): HTMLElement | null {
  const width = window.innerWidth
  const height = window.innerHeight
  for (const element of document.querySelectorAll<HTMLElement>('[data-cart-count]')) {
    const box = element.getBoundingClientRect()
    if (box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < height) {
      if (box.right > 0 && box.left < width) return element
    }
  }
  return null
}

export function flyToCart(from: Element): void {
  if (
    typeof window === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    typeof document.body.animate !== 'function'
  )
    return
  const target = visibleCounter()
  if (!target) return
  const start = from.getBoundingClientRect()
  const end = target.getBoundingClientRect()
  const x0 = start.left + start.width / 2 - DOT / 2
  const y0 = start.top + start.height / 2 - DOT / 2
  const dx = end.left + end.width / 2 - DOT / 2 - x0
  const dy = end.top + end.height / 2 - DOT / 2 - y0

  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  dot.setAttribute('data-cart-fly', '')
  Object.assign(dot.style, {
    position: 'fixed',
    left: `${x0}px`,
    top: `${y0}px`,
    width: `${DOT}px`,
    height: `${DOT}px`,
    borderRadius: '9999px',
    background: 'var(--accent-text)',
    boxShadow: '0 6px 14px -4px var(--glow)',
    pointerEvents: 'none',
    zIndex: '60',
  })
  document.body.append(dot)
  // An arc: up a little first, then down onto the counter (the middle frame lifts the dot).
  const lift = Math.min(-40, dy / 2 - 60)
  const animation = dot.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx / 2}px, ${lift}px) scale(1.1)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.2 },
    ],
    { duration: FLY_MS, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
  )
  const remove = () => dot.remove()
  animation.addEventListener('finish', remove)
  animation.addEventListener('cancel', remove)
}
