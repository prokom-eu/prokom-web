'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Sections whose scenes pause off screen: page content, the CTA band and the footer. */
const WATCHED = '#tresc section, #top > section, #top > footer'
/** A section starts moving a little before it comes into view. */
const MARGIN = '100px 0px'

/**
 * Stops the work on everything the visitor cannot see (report 11.11.2026: 263 looping
 * animations on `/` kept the CPU at 98–100 % with the hero scrolled away). Marks each watched
 * section off screen with `data-off` — `ruch.css` gives it `content-visibility: auto`, so the
 * browser skips its style, layout and paint — and the whole document while the tab is hidden
 * (animations paused). The scenes' timers stop on their own off screen (`useInterval`). Renders
 * nothing; without JS everything is simply rendered and moving.
 */
export function PauseOffscreen() {
  const pathname = usePathname()
  useEffect(() => {
    const root = document.documentElement
    const onVisibility = () => root.toggleAttribute('data-off', document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    if (typeof IntersectionObserver === 'undefined') {
      return () => document.removeEventListener('visibilitychange', onVisibility)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute('data-off', !entry.isIntersecting)
      },
      { rootMargin: MARGIN },
    )
    const watched = new Set<Element>()
    const scan = () => {
      for (const el of document.querySelectorAll(WATCHED)) {
        if (watched.has(el)) continue
        watched.add(el)
        io.observe(el)
      }
    }
    scan()
    // A client navigation swaps the children of `<main>` after the path has changed.
    const main = document.getElementById('tresc')
    const mo = main ? new MutationObserver(scan) : null
    if (main) mo?.observe(main, { childList: true })

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      io.disconnect()
      mo?.disconnect()
      for (const el of watched) el.removeAttribute('data-off')
    }
  }, [pathname])
  return null
}
