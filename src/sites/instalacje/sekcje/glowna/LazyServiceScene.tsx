'use client'

import { useEffect, useRef, useState } from 'react'

import type { ServiceKey } from '../../dane/types'

/**
 * A service card scene of the home page loaded near the screen (runda v6 §1.8, LCP of `/`): the
 * scenes (`sceny.ts`) are not in the HTML nor in the RSC payload — a separate chunk fetched when
 * the grid comes within 400 px. The box keeps its size from `.ust` (aspect-ratio), so nothing
 * moves. Decoration only (the card is `aria-hidden`); without JS the card shows no scene.
 */
export function LazyServiceScene({ sceneKey }: { sceneKey: ServiceKey }) {
  const ref = useRef<SVGSVGElement>(null)
  const [markup, setMarkup] = useState<string | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let gone = false
    const load = () =>
      import('./sceny').then((m) => {
        if (!gone) setMarkup(m.SERVICE_SCENES[sceneKey])
      })
    if (typeof IntersectionObserver === 'undefined') {
      void load()
      return () => {
        gone = true
      }
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        void load()
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => {
      gone = true
      io.disconnect()
    }
  }, [sceneKey])
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid meet"
      {...(markup ? { dangerouslySetInnerHTML: { __html: markup } } : {})}
    />
  )
}
