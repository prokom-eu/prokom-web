'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { AUTOPLAY_IDLE, isRunning, type AutoplayState } from './autoplay'

type Options = {
  /** Milliseconds between steps (4 200 for hero slides, 9 000 for the line scene). */
  interval: number
  onStep: () => void
  /** `true` from the start = no autoplay (e.g. the „Razem” tab). */
  disabled?: boolean
}

/**
 * Calls `onStep` every `interval` while the element of `ref` runs (`autoplay.ts`). Hover and focus
 * come from the handlers it returns; tab visibility, view and reduced motion it watches itself.
 * Each pause restarts the full interval, so a slide never jumps right after the mouse leaves. On a
 * touch screen (no hover to pause) it does not run at all (WCAG 2.2.2).
 */
export function useAutoplay<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { interval, onStep, disabled = false }: Options,
) {
  const [state, setState] = useState<AutoplayState>(AUTOPLAY_IDLE)
  const step = useRef(onStep)
  useEffect(() => {
    step.current = onStep
  }, [onStep])

  const patch = useCallback(
    (part: Partial<AutoplayState>) => setState((prev) => ({ ...prev, ...part })),
    [],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    // A touch screen cannot pause on hover — no autoplay there (WCAG 2.2.2, decision 14.11).
    const touch = window.matchMedia('(hover: none)')
    const onMotion = () => patch({ reducedMotion: media.matches || touch.matches })
    const onVisibility = () => patch({ pageHidden: document.hidden })
    onMotion()
    onVisibility()
    media.addEventListener('change', onMotion)
    touch.addEventListener('change', onMotion)
    document.addEventListener('visibilitychange', onVisibility)
    const element = ref.current
    const observer =
      element && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => patch({ offScreen: !entry?.isIntersecting }))
        : null
    if (element) observer?.observe(element)
    return () => {
      media.removeEventListener('change', onMotion)
      touch.removeEventListener('change', onMotion)
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
    }
  }, [ref, patch])

  const running = !disabled && isRunning(state)
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => step.current(), interval)
    return () => window.clearInterval(timer)
  }, [running, interval])

  return {
    running,
    stop: useCallback(() => patch({ stopped: true }), [patch]),
    handlers: {
      onMouseEnter: () => patch({ hovered: true }),
      onMouseLeave: () => patch({ hovered: false }),
      onFocus: () => patch({ focused: true }),
      onBlur: (event: React.FocusEvent) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          patch({ focused: false })
        }
      },
    },
  }
}
