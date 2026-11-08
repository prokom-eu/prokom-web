'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Plays the process axis once when it enters the screen (runda v6 §1.6): when its top reaches the
 * upper 65 % of the screen — by position, not by a share of the axis, which on a phone is taller
 * than a low screen and would never be 35 % visible.
 * `data-ready` hides the start state only when the play can happen (JS, motion allowed,
 * IntersectionObserver); `data-on` starts it. Without either the axis is drawn in full.
 */
export function ProcessAxisPlay({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.dataset.ready = '1'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.dataset.on = '1'
        io.disconnect()
      },
      { threshold: 0, rootMargin: '0px 0px -35% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="procw">
      {children}
    </div>
  )
}
