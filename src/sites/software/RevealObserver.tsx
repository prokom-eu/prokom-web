'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'

import { batchOrder, startsBelow } from '@/lib/motion/reveal'

/** Asks the observer to look for reveal targets again (content that hydrated late). */
const SCAN_EVENT = 'reveal:scan'

const noop = () => () => {}

/**
 * For a card list inside a `Suspense` boundary (the catalog): React may hydrate it after the
 * observer's first pass, and a `data-reveal-pending` or `style` it finds on a card it has not
 * hydrated yet is a hydration mismatch (SWV8 P0 #1). The list carries `data-reveal-cards` only
 * once it has hydrated — spread the returned props on it — and then asks for a new pass.
 */
export function useRevealCards(): { 'data-reveal-cards'?: '' } {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  useEffect(() => {
    if (hydrated) window.dispatchEvent(new Event(SCAN_EVENT))
  }, [hydrated])
  return hydrated ? { 'data-reveal-cards': '' } : {}
}

/**
 * Sections and cards of Software rise in once as they come into view (SWV7, `motion.css` §3):
 * `data-reveal` elements and the children of `data-reveal-cards`. On each page only what starts
 * below the screen waits hidden (`data-reveal-pending`); once seen it gets `data-revealed` (the
 * animation) and stays — no hiding again on the way up. Nothing with reduced motion or without
 * `IntersectionObserver`. Runs again after every page change and when a late list asks for it
 * (`useRevealCards`).
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
        const order = batchOrder(seen, (element) => element.parentElement)
        for (const element of seen) {
          observer.unobserve(element)
          element.style.setProperty('--reveal-i', String(order.get(element) ?? 0))
          element.removeAttribute('data-reveal-pending')
          element.setAttribute('data-revealed', '')
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    const scan = () => {
      const targets = [
        ...document.querySelectorAll<HTMLElement>('[data-reveal]'),
        ...[...document.querySelectorAll<HTMLElement>('[data-reveal-cards]')].flatMap((list) =>
          [...list.children].filter((child): child is HTMLElement => child instanceof HTMLElement),
        ),
      ]
      const height = window.innerHeight
      const width = window.innerWidth
      for (const element of targets) {
        if (element.hasAttribute('data-revealed') || element.hasAttribute('data-reveal-pending'))
          continue
        const box = element.getBoundingClientRect()
        if (!startsBelow(box.top, height)) continue
        // A card of a phone carousel beyond the right edge: its scroller clips it, so it would
        // only be „seen” when swiped to — it stays as it is instead of rising in sideways.
        if (box.left >= width) continue
        element.setAttribute('data-reveal-pending', '')
        observer.observe(element)
      }
    }
    scan()
    window.addEventListener(SCAN_EVENT, scan)
    return () => {
      window.removeEventListener(SCAN_EVENT, scan)
      observer.disconnect()
      // A page left before its sections were seen: nothing may stay hidden for the next visit.
      for (const element of document.querySelectorAll('[data-reveal-pending]'))
        element.removeAttribute('data-reveal-pending')
    }
  }, [pathname])

  return null
}
