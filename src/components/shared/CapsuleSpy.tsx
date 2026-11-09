'use client'

import { useEffect, useRef } from 'react'

import { type SpyEntry, spyKey } from '@/lib/shared/capsuleSpy'
import { activeSection } from '@/lib/site/railActive'

type Props = {
  entries: readonly SpyEntry[]
  /** Every anchored section of the page in order (the boundaries between the entries' sections). */
  stops: readonly string[]
}

/**
 * The capsule's scroll-spy on a home page (plan 0611 §8.1 pkt 2): the section being read (the
 * rail's rule, `activeSection`) picks a menu entry, and one pill glides under it — moved with
 * `transform`, so it slides between the links instead of jumping. The entry gets `data-spy`
 * (text colour); the pill is decoration only — the rail announces the section
 * (`aria-current="location"`), so the menu does not say it twice.
 */
export function CapsuleSpy({ entries, stops }: Props) {
  const pill = useRef<HTMLSpanElement>(null)
  // Stable inputs for the effect: the line builds these arrays on every render.
  const entriesKey = JSON.stringify(entries)
  const stopsKey = stops.join(' ')

  useEffect(() => {
    const element = pill.current
    const nav = element?.parentElement
    if (!element || !nav) return
    const spyEntries = JSON.parse(entriesKey) as SpyEntry[]
    const sections = stopsKey
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    let frame = 0
    let marked: HTMLElement | null = null

    const update = () => {
      frame = 0
      const root = document.scrollingElement ?? document.documentElement
      const atBottom = window.scrollY >= root.scrollHeight - window.innerHeight - 2
      const id = activeSection(
        sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top })),
        window.innerHeight,
        atBottom,
      )
      const key = spyKey(spyEntries, id)
      const item = key
        ? nav.querySelector<HTMLElement>(`[data-cap-key="${CSS.escape(key)}"]`)
        : null
      if (marked !== item) {
        marked?.removeAttribute('data-spy')
        item?.setAttribute('data-spy', '')
        marked = item
      }
      if (!item) {
        element.removeAttribute('data-on')
        return
      }
      // The link, not the list item: the pill takes the link's own box (padding included).
      const box = (item.querySelector('.cap-link') ?? item).getBoundingClientRect()
      const origin = nav.getBoundingClientRect()
      element.style.setProperty('--pill-x', `${box.left - origin.left}px`)
      element.style.setProperty('--pill-w', `${box.width}px`)
      element.style.setProperty('--pill-h', `${box.height}px`)
      element.setAttribute('data-on', '')
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      marked?.removeAttribute('data-spy')
    }
  }, [entriesKey, stopsKey])

  return <span ref={pill} className="cap-pill" aria-hidden="true" />
}
