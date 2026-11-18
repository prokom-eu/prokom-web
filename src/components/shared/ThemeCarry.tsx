'use client'

import { useEffect } from 'react'

import { autoThemeNow, storedTheme, THEME_CHANGE_EVENT } from '@/components/useTheme'
import { LINE_THEME_COLORS } from '@/lib/brand/themeColor'
import { fadeTheme } from '@/lib/motion/themeReveal'
import { cleanThemeParam, withThemeParam } from '@/lib/shared/themeCarry'
import type { Line } from '@/lib/tenant/lines'

/**
 * The page-wide part of the shared theme (ADR-028), mounted once in the `(sites)` layout on lines
 * with a dark design. Renders nothing:
 * 1. carries the choice to our other domains — `motyw=` is added to the link only for the moment
 *    of the click and restored at once, so the HTML, copied links and robots see clean addresses
 *    (spec §3.2);
 * 2. removes `motyw` from the address bar after hydration (spec §3.3) with the native
 *    `history.replaceState(null, …)`: Next.js 16 syncs it with the router (docs „Linking and
 *    Navigating” → Native History API). Not `window.history.state`: with Next's own marker in it
 *    the router skips the sync. Not `router.replace`: that would fetch the page again;
 * 3. in Auto re-checks the theme on return to the tab and on a system change — never while
 *    reading (spec §2.3);
 * 4. keeps `<meta name="theme-color">` in step with the theme on screen (spec §1.5).
 */
export function ThemeCarry({ line }: { line: Line }) {
  useEffect(() => {
    // A task later: this effect runs before the router's own (children first), and only the
    // router's effect patches `replaceState` — called earlier, the router would keep `?motyw` and
    // lose its history state (Back would then show the wrong page).
    const timer = setTimeout(() => {
      const clean = cleanThemeParam(window.location.href)
      if (clean !== null) window.history.replaceState(null, '', clean)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(link instanceof HTMLAnchorElement)) return
      const original = link.getAttribute('href') ?? ''
      const carried = withThemeParam(original, storedTheme() ?? 'auto', window.location.href)
      if (carried === null) return
      link.setAttribute('href', carried)
      // Restored only if React has not changed the link meanwhile.
      setTimeout(() => {
        if (link.getAttribute('href') === carried) link.setAttribute('href', original)
      }, 0)
    }
    // Capture: before any handler that could navigate; `auxclick` = middle button, a new tab.
    document.addEventListener('click', onClick, true)
    document.addEventListener('auxclick', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('auxclick', onClick, true)
    }
  }, [])

  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState !== 'visible' || storedTheme()) return
      const next = autoThemeNow()
      const root = document.documentElement
      if (root.getAttribute('data-theme') === next) return
      fadeTheme(() => {
        root.setAttribute('data-theme', next)
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
      })
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    document.addEventListener('visibilitychange', recheck)
    media.addEventListener('change', recheck)
    return () => {
      document.removeEventListener('visibilitychange', recheck)
      media.removeEventListener('change', recheck)
    }
  }, [])

  useEffect(() => {
    const colors = LINE_THEME_COLORS[line]
    if (!colors) return
    const sync = () => {
      const theme =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
        meta.content = colors[theme]
      }
    }
    // Another tab: `useTheme` applies the new choice in its own listener, so read it a tick later.
    const later = () => setTimeout(sync, 0)
    sync()
    window.addEventListener(THEME_CHANGE_EVENT, sync)
    window.addEventListener('storage', later)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, sync)
      window.removeEventListener('storage', later)
    }
  }, [line])

  return null
}
