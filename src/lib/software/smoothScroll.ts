/**
 * Gliding jump to a section of the Software start page (SWV5, MOBILE-APLIKACJA §4 pkt 10;
 * pattern `docs/design/prokomsoftware/v23/pkScroll.js`): longer for a longer way (520–1100 ms),
 * easing in and out, then the section's heading „arrives” (`data-arrive`, globals.css). With
 * reduced motion it is a plain jump; the visitor's own wheel, touch or key stops the glide.
 */

/** Room for the sticky header when the section has no `scroll-margin-top` of its own. */
export const HEADER_OFFSET = 84
const ARRIVE_MS = 1400
const STOP_EVENTS = ['wheel', 'touchstart', 'keydown'] as const

/** Duration of the glide for a distance in px. */
export function scrollDuration(distance: number): number {
  return Math.round(Math.min(1100, Math.max(520, Math.abs(distance) * 0.35)))
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Room above the section: its own `scroll-margin-top` (the sections' `scroll-mt-24`), so a
 * glide ends where a plain anchor jump would.
 */
export function sectionOffset(scrollMarginTop: string): number {
  const margin = Number.parseFloat(scrollMarginTop)
  return Number.isFinite(margin) && margin > 0 ? margin : HEADER_OFFSET
}

/** Glides to the element, then marks it as arrived for a moment. */
export function glideTo(element: HTMLElement): void {
  const offset = sectionOffset(getComputedStyle(element).scrollMarginTop)
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  const from = window.scrollY
  const distance = top - from
  // `instant`: the page has `scroll-behavior: smooth`, which would smooth every frame again.
  const jump = (y: number) => window.scrollTo({ top: y, behavior: 'instant' })
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(distance) < 4) {
    jump(top)
    return
  }
  const duration = scrollDuration(distance)
  const start = performance.now()
  let done = false
  const stop = () => {
    done = true
    STOP_EVENTS.forEach((type) => window.removeEventListener(type, stop))
  }
  const finish = () => {
    if (done) return
    stop()
    jump(top)
    arrive(element)
  }
  const step = (now: number) => {
    if (done) return
    const t = Math.min(1, (now - start) / duration)
    jump(from + distance * easeInOutCubic(t))
    if (t < 1) requestAnimationFrame(step)
    else finish()
  }
  // The visitor takes over: the page stays where they scrolled it.
  STOP_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }))
  requestAnimationFrame(step)
  // A tab that paints no frames (in the background) still ends up at the section.
  window.setTimeout(finish, duration + 150)
}

function arrive(element: HTMLElement) {
  element.removeAttribute('data-arrive')
  // Reading the layout restarts the animation when the same section is picked twice.
  void element.offsetWidth
  element.setAttribute('data-arrive', '')
  window.setTimeout(() => element.removeAttribute('data-arrive'), ARRIVE_MS)
}
