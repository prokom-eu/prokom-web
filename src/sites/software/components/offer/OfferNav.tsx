'use client'

import { useEffect, useRef, useState } from 'react'

import { SlidingMark } from '../ui/SlidingMark'

/**
 * Navigation of the offer window (OKNO-OFERTY-PREMIUM §2.1): dots of the offers in the current
 * category, tabs of the window's sections lit while scrolling, a one-time shortcut hint.
 */

export type DotItem = { slug: string; name: string }

/**
 * One dot per offer of the category next to „4 / 29”: the current one glows, a hover or focus
 * shows the name, a click opens it. Fewer than two offers in the category: nothing.
 */
export function CategoryDots({
  items,
  current,
  label,
  onPick,
}: {
  items: readonly DotItem[]
  current: string
  label: string
  onPick: (slug: string) => void
}) {
  if (items.length < 2) return null
  return (
    <nav aria-label={`Oferty: ${label}`} className="sw-offer-dots">
      <span className="sw-eyebrow">{label}</span>
      <ul className="flex items-center">
        {items.map((item) => {
          const on = item.slug === current
          return (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => onPick(item.slug)}
                aria-current={on ? 'true' : undefined}
                // The tip is CSS content: the name comes from `aria-label` alone.
                aria-label={item.name}
                data-tip={item.name}
                className="sw-offer-dot"
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export type TabItem = { id: string; label: string }

/** How far below the window's top a section counts as „being read” (header + a margin). */
const SPY_OFFSET = 150

/**
 * Tabs of the window's sections in its glass header: the one being read is marked (the sliding
 * pill of the rail, `SlidingMark`), a click scrolls the window to its section.
 */
export function SectionTabs({ items, resetKey }: { items: readonly TabItem[]; resetKey: string }) {
  const nav = useRef<HTMLElement>(null)
  const [active, setActive] = useState(items[0]?.id ?? '')
  const ids = items.map((item) => item.id).join(' ')

  useEffect(() => {
    const scroller = nav.current?.closest('dialog')
    if (!scroller) return
    const sections = ids.split(' ').flatMap((id) => {
      const element = document.getElementById(id)
      return element ? [element] : []
    })
    let frame = 0
    const spy = () => {
      frame = 0
      const top = scroller.getBoundingClientRect().top + SPY_OFFSET
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4
      let current: HTMLElement | undefined = sections[0]
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= top) current = section
      }
      if (atEnd) current = sections.at(-1)
      if (current) setActive(current.id)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(spy)
    }
    spy()
    scroller.addEventListener('scroll', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', schedule)
    }
  }, [ids, resetKey])

  if (items.length < 2) return null
  return (
    <nav ref={nav} aria-label="Sekcje oferty" className="sw-offer-tabs">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={item.id === active ? 'location' : undefined}
          onClick={(event) => {
            event.preventDefault()
            const target = document.getElementById(item.id)
            if (!target) return
            const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            target.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' })
            setActive(item.id)
          }}
        >
          {item.label}
        </a>
      ))}
      <SlidingMark selector="[aria-current='location']" />
    </nav>
  )
}

const HINT_KEY = 'pk-offer-hint'
const HINT_MS = 4000

/**
 * „← → oferty · Esc zamknij” once per session, at the first opening: gone after 4 s or the
 * first key. Storage may be blocked (private mode) — then the hint simply shows once per load.
 */
export function ShortcutHint() {
  const hint = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(HINT_KEY)) return
      window.sessionStorage.setItem(HINT_KEY, '1')
    } catch {
      // No storage: show it anyway.
    }
    // Only where there is a keyboard to use it.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const element = hint.current
    if (!element) return
    element.classList.add('is-on')
    const hide = () => element.classList.remove('is-on')
    const timer = window.setTimeout(hide, HINT_MS)
    window.addEventListener('keydown', hide, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', hide)
    }
  }, [])

  return (
    <p ref={hint} aria-hidden="true" className="sw-offer-hint">
      <kbd>←</kbd> <kbd>→</kbd> oferty · <kbd>Esc</kbd> zamknij
    </p>
  )
}
