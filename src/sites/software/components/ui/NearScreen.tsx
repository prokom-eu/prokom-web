'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

/** Mounted this far before it scrolls into view: a fast thumb never sees the frame empty. */
const MARGIN = '900px 0px'

/**
 * Children mounted only once they come near the screen, then kept (AUDYT-WYDAJNOSC-1111 #7:
 * the start page held 2 100 elements of mock-ups at load). For decoration whose box the parent
 * sizes (`aria-hidden` mock-ups of the price cards): until then an empty element holds its place,
 * so nothing moves. Server and hydration render the empty element too.
 */
export function NearScreen({ children, eager = false }: { children: ReactNode; eager?: boolean }) {
  // `eager`: drawn at once (the same component where the page has few of them).
  const [near, setNear] = useState(eager)
  const holder = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = holder.current
    if (near || !element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: MARGIN },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [near])

  return near ? children : <span ref={holder} className="block size-full" aria-hidden="true" />
}
