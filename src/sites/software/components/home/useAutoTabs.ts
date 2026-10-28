'use client'

import { type FocusEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'

import { tabKeyTarget } from './tabs'

/**
 * Self-switching ARIA tabs of the Software start page (spec. §8.3: areas, previews, process):
 * the next tab every `intervalMs` until the visitor picks one (then never again), paused while
 * the pointer or focus is inside and while the browser tab is hidden, never with
 * `prefers-reduced-motion`. Spread `region` on the element around the tabs and panels.
 */
export function useAutoTabs(count: number, intervalMs: number) {
  const [active, setActive] = useState(0)
  const [picked, setPicked] = useState(false)
  const [paused, setPaused] = useState(false)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (picked || paused || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % count)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [picked, paused, count, intervalMs])

  /** Never past the list (the panel may lose an entry on a live preview). */
  const current = Math.min(active, Math.max(count - 1, 0))

  function pick(index: number) {
    setPicked(true)
    setActive(index)
  }

  function onKeyDown(event: KeyboardEvent) {
    const next = tabKeyTarget(event.key, current, count)
    if (next === null) return
    event.preventDefault()
    pick(next)
    buttons.current[next]?.focus()
    buttons.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  return {
    active: current,
    picked,
    paused,
    pick,
    onKeyDown,
    tabRef: (index: number) => (element: HTMLButtonElement | null) => {
      buttons.current[index] = element
    },
    region: {
      onPointerEnter: () => setPaused(true),
      onPointerLeave: () => setPaused(false),
      onFocus: () => setPaused(true),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      },
    },
  }
}
