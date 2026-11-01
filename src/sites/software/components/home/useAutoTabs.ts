'use client'

import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { DESKTOP_QUERY } from '../layer'
import { autoRotates, tabKeyTarget } from './tabs'

/**
 * Self-switching ARIA tabs of the Software start page (spec. §8.3: areas, previews, process):
 * the next tab every `intervalMs`, only on the desktop, until the visitor picks one or points at
 * the section (then never again — audyt 01.11 P1 #19), paused while focus is inside and while
 * the browser tab is hidden, never with `prefers-reduced-motion` (`autoRotates`). `rotating`
 * drives the progress bar. Spread `region` on the element around the tabs and panels.
 */
const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Whether this screen lets tabs switch by themselves: desktop and motion allowed. */
function subscribeScreen(onChange: () => void) {
  const queries = [window.matchMedia(DESKTOP_QUERY), window.matchMedia(MOTION_QUERY)]
  for (const query of queries) query.addEventListener('change', onChange)
  return () => {
    for (const query of queries) query.removeEventListener('change', onChange)
  }
}
const screenAllows = () =>
  window.matchMedia(DESKTOP_QUERY).matches && !window.matchMedia(MOTION_QUERY).matches

export function useAutoTabs(count: number, intervalMs: number) {
  const [active, setActive] = useState(0)
  const [picked, setPicked] = useState(false)
  const [paused, setPaused] = useState(false)
  const [stopped, setStopped] = useState(false)
  // `false` on the server and in hydration: nothing claims to switch before the screen is known.
  const screen = useSyncExternalStore(subscribeScreen, screenAllows, () => false)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const rotate = autoRotates({
      count,
      reducedMotion: window.matchMedia(MOTION_QUERY).matches,
      desktop: window.matchMedia(DESKTOP_QUERY).matches,
      picked,
      stopped,
      paused,
    })
    if (!rotate) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % count)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [picked, stopped, paused, count, intervalMs, screen])

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
    /** Switching by itself right now — the progress bar and the „switches by itself” hint. */
    rotating: autoRotates({
      count,
      reducedMotion: !screen,
      desktop: screen,
      picked,
      stopped,
      paused,
    }),
    /** Will switch by itself on this screen once nothing holds it (focus only pauses). */
    selfSwitching: screen && count > 1 && !picked && !stopped,
    pick,
    onKeyDown,
    tabRef: (index: number) => (element: HTMLButtonElement | null) => {
      buttons.current[index] = element
    },
    region: {
      // A mouse over the section stops it for good; a touch is not hovering.
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse') setStopped(true)
      },
      onFocus: () => setPaused(true),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      },
    },
  }
}
