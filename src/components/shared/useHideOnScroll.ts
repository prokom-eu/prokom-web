'use client'

import { useEffect, useState } from 'react'

import { nextHidden } from '@/lib/shared/hideOnScroll'

/** Layout in which the capsule hides while scrolling down (NAGLOWEK-KAPSULA §3, §5). */
export const NARROW_QUERY = '(max-width: 1080px)'

/**
 * `true` while the visitor scrolls down on a phone or tablet (≤ 1080 px); `false` near the top,
 * on wider screens and while `paused` (an open sheet). One passive listener; state changes only
 * when the answer does.
 */
export function useHideOnScroll(paused = false): boolean {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const narrow = window.matchMedia(NARROW_QUERY)
    let lastY = window.scrollY
    let current = false
    const update = () => {
      const next = nextHidden({
        y: window.scrollY,
        lastY,
        hidden: current,
        narrow: narrow.matches,
        paused,
      })
      lastY = next.lastY
      if (next.hidden !== current) {
        current = next.hidden
        setHidden(current)
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    narrow.addEventListener('change', update)
    const first = window.setTimeout(update, 0)
    return () => {
      window.clearTimeout(first)
      window.removeEventListener('scroll', update)
      narrow.removeEventListener('change', update)
    }
  }, [paused])

  return hidden
}
