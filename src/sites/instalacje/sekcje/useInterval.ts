'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

import { shouldTick } from './interval'

/**
 * `setInterval` of a widget (the prototype's `this.every(ms, fn)`, ADR-I003 §2), paused while
 * the tab is hidden, the element is off screen, the visitor prefers reduced motion or `enabled`
 * is false (touched). `fn` may change on every render; the latest one runs.
 */
export function useInterval(
  fn: () => void,
  ms: number,
  { enabled, target }: { enabled: boolean; target: RefObject<Element | null> },
) {
  const latest = useRef(fn)
  const [visible, setVisible] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    latest.current = fn
  })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReducedMotion(motion.matches)
    const onVisibility = () => setHidden(document.hidden)
    onMotion()
    onVisibility()
    motion.addEventListener('change', onMotion)
    document.addEventListener('visibilitychange', onVisibility)
    const element = target.current
    const observer = element
      ? new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)))
      : null
    if (element) observer?.observe(element)
    return () => {
      motion.removeEventListener('change', onMotion)
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
    }
  }, [target])

  const ticking = shouldTick({ enabled, hidden, visible, reducedMotion })
  useEffect(() => {
    if (!ticking) return
    const timer = window.setInterval(() => latest.current(), ms)
    return () => window.clearInterval(timer)
  }, [ticking, ms])
}
