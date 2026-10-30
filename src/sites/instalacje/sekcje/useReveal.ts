'use client'

import { type RefObject, useEffect, useState } from 'react'

/** After this time every section is shown, seen or not (the prototype's `allSeen`). */
const SHOW_ALL_MS = 900

/**
 * Entry animation of a section (the prototype's `rv` / `data-rv`, ADR-I003 §2): `true` once the
 * section is 6 % on screen, or after 900 ms anyway. The CSS (`.rv .ri`) shows everything at once
 * with `prefers-reduced-motion`.
 */
export function useReveal(target: RefObject<Element | null>): boolean {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const element = target.current
    const timer = window.setTimeout(() => setOn(true), SHOW_ALL_MS)
    if (!element || typeof IntersectionObserver === 'undefined') return () => clearTimeout(timer)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setOn(true)
        observer.disconnect()
      },
      { threshold: 0.06 },
    )
    observer.observe(element)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [target])

  return on
}
