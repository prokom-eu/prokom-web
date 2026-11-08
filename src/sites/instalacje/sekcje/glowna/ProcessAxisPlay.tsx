'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Plays the process axis once when it enters the screen (runda v6 §1.6, threshold 0.35).
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
      { threshold: 0.35 },
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
