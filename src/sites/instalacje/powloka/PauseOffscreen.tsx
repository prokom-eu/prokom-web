'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Sections whose scenes pause off screen: page content, the CTA band and the footer. */
const WATCHED = '#tresc section, #top > section, #top > footer'
/** A section starts moving a little before it comes into view. */
const MARGIN = '100px 0px'
/** Sections skipped from the first render on a fresh visit (`data-cve`, `ruch.css`). */
const EARLY = '#tresc > section ~ section, #top > section'

/**
 * Before any paint, on a fresh visit without an anchor: sections below the hero are skipped from
 * the first render (`data-cve` on `<html>`, `ruch.css`; TBT of `/` on a phone 447 → 275 ms). Not
 * after a reload or „back” to the page: the browser puts the scroll back by pixels, and sections
 * never rendered have no height of their own yet (only the 900 px placeholder) — it would land
 * elsewhere. Inline in the frame (`Frame.tsx`), before the sections are parsed.
 */
export const EARLY_SKIP_SCRIPT =
  "try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='navigate'&&!location.hash)document.documentElement.setAttribute('data-cve','')}catch(e){}"

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

  // After an early-skipped load: each section is rendered once, one per idle moment, so it keeps
  // its real height (`contain-intrinsic-size: auto`) — a later „back” after a client navigation
  // then puts the scroll where it was. Then `data-cve` goes and off-screen sections are skipped
  // under `data-off` only, as on any other visit. Only for the first document: a client
  // navigation ends the early skip at once (`stopEarly`), so the next page renders in full.
  const stopEarly = useRef<() => void>(() => {})
  useEffect(() => {
    const root = document.documentElement
    if (!root.hasAttribute('data-cve')) return
    const idle: (cb: () => void) => number = window.requestIdleCallback
      ? (cb) => window.requestIdleCallback(cb, { timeout: 5000 })
      : (cb) => window.setTimeout(cb, 200)
    const cancelIdle = (id: number) =>
      window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id)
    const pending = [...document.querySelectorAll(EARLY)]
    let current: Element | undefined
    let handle = 0
    let frame = 0
    const next = () => {
      current = pending.shift()
      if (!current) {
        root.removeAttribute('data-cve')
        return
      }
      const el = current
      el.setAttribute('data-measure', '')
      // Two frames: the section is laid out and painted once, and its size is remembered.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          el.removeAttribute('data-measure')
          handle = idle(next)
        })
      })
    }
    handle = idle(next)
    const cancel = () => {
      cancelIdle(handle)
      cancelAnimationFrame(frame)
      current?.removeAttribute('data-measure')
      pending.length = 0
    }
    stopEarly.current = () => {
      cancel()
      root.removeAttribute('data-cve')
    }
    return cancel
  }, [])
  // The path the document was loaded with; any other one is a client navigation.
  const firstPath = useRef(pathname)
  useEffect(() => {
    if (pathname !== firstPath.current) stopEarly.current()
  }, [pathname])
  return null
}
