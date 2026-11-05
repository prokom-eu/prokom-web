'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { useHideOnScroll } from './useHideOnScroll'

type Props = {
  children: ReactNode
  /** A sheet is open: the capsule does not hide on phones. */
  paused?: boolean
  /** A fixed state for the preview page (`/_wspolne`): not sticky, no observer. */
  state?: 'top' | 'scrolled'
}

/**
 * The client part of `SiteHeader` (NAGLOWEK-KAPSULA §5): a sentinel 24 px under the brand bar
 * sets `data-scrolled` through an `IntersectionObserver` (no scroll listener), and on phones the
 * capsule hides while scrolling down. The wrapper keeps a fixed height, so the smaller capsule
 * never moves the page (CLS 0).
 */
export function CapsuleShell({ children, paused, state }: Props) {
  const sentinel = useRef<HTMLSpanElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const hidden = useHideOnScroll(paused)

  useEffect(() => {
    const target = sentinel.current
    if (state || !target) return
    const observer = new IntersectionObserver(([entry]) => {
      // Above the viewport = scrolled past it; below (a short window) is still the top.
      if (entry) setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [state])

  const isScrolled = state ? state === 'scrolled' : scrolled
  return (
    <>
      {!state && (
        <div className="cap-sentinel" aria-hidden="true">
          <span ref={sentinel} />
        </div>
      )}
      <div
        className="cap-wrap"
        data-scrolled={isScrolled ? '' : undefined}
        data-hidden={hidden && !state ? '' : undefined}
        data-static={state ? '' : undefined}
        data-site-header
      >
        {children}
      </div>
    </>
  )
}
