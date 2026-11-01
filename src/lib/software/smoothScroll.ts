/**
 * Gliding jump to a section of the Software start page (SWV5, MOBILE-APLIKACJA §4 pkt 10;
 * pattern `docs/design/prokomsoftware/v23/pkScroll.js`): longer for a longer way (520–1100 ms),
 * easing in and out, then the section's heading „arrives” (`data-arrive`, globals.css). With
 * reduced motion it is a plain jump.
 */

/** Room for the sticky header above the section. */
export const HEADER_OFFSET = 84
const ARRIVE_MS = 1400

/** Duration of the glide for a distance in px. */
export function scrollDuration(distance: number): number {
  return Math.round(Math.min(1100, Math.max(520, Math.abs(distance) * 0.35)))
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Glides to the element, then marks it as arrived for a moment. */
export function glideTo(element: HTMLElement): void {
  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
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
  const finish = () => {
    if (done) return
    done = true
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
