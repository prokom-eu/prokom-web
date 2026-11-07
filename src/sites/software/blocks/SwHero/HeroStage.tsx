'use client'

import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { RESUME_MS, SLIDE_MS, rankOf, stepSlide } from '@/lib/software/heroStage'

export type StageSlide = {
  word: string
  name: string
  text: string
  icon: string
  /** „od 2 490 zł” — from `Solutions` (`cardPrice`). */
  price: string
  term: string
  href: string
}

type Props = {
  title: string
  lead: string
  query: string
  queryHint: string
  offer: string
  slides: StageSlide[]
  /** The mock-ups, rendered on the server; one per slide, in the same order. */
  windows: ReactNode[]
  /** `h1` when the hero opens the page (it always does on the start page), else `h2`. */
  isFirst?: boolean
}

const SWIPE_PX = 40

/**
 * The moving part of the v24 hero (ZMIANY-v24 §4.1a): H1 with the word of the slide, the choice
 * panel (tabs), the 3D carousel and the caption. A new slide every 4.2 s; a click, a key or a
 * swipe takes over and the clock comes back 12 s later. Stopped while the visitor points at or
 * focuses the hero, off screen, on a hidden tab and with reduced motion (slides by hand only).
 */
export function HeroStage({
  title,
  lead,
  query,
  queryHint,
  offer,
  slides,
  windows,
  isFirst = true,
}: Props) {
  const count = slides.length
  const ids = useId()
  const Title = isFirst ? 'h1' : 'h2'
  const [current, setCurrent] = useState(0)
  const [held, setHeld] = useState(false)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const resume = useRef<number | undefined>(undefined)
  const swipe = useRef<number | null>(null)
  const pointer = useRef(false)
  const focus = useRef(false)
  const offscreen = useRef(false)

  const syncPause = useCallback(() => {
    setPaused(pointer.current || focus.current || offscreen.current || document.hidden)
  }, [])

  // Reduced motion: no clock (ZMIANY-v24 §4.1a); the tiles still switch by hand.
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setStill(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  // Off screen and on a hidden tab the clock and the cosmic layer stop, and come back at once.
  useEffect(() => {
    const hero = root.current?.closest<HTMLElement>('.hx')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => {
      offscreen.current = !entry?.isIntersecting
      syncPause()
    })
    observer.observe(hero)
    document.addEventListener('visibilitychange', syncPause)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPause)
    }
  }, [syncPause])

  // The section carries the state, so the CSS of the cosmic layer and the band can follow it.
  useEffect(() => {
    const hero = root.current?.closest<HTMLElement>('.hx')
    if (!hero) return
    hero.toggleAttribute('data-paused', paused)
    // While the clock rests the progress bar of the tile stands full; it starts again from zero
    // together with the clock (a paused CSS bar would run ahead of the restarted clock).
    hero.toggleAttribute('data-hold', held || still || paused)
  }, [paused, held, still])

  useEffect(() => {
    if (still || held || paused || count < 2) return
    const timer = window.setTimeout(() => setCurrent((i) => stepSlide(i, 1, count)), SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [current, still, held, paused, count])

  useEffect(() => () => window.clearTimeout(resume.current), [])

  /** The visitor chose: show that slide and let the clock rest for 12 s. */
  const choose = useCallback(
    (index: number) => {
      setCurrent(((index % count) + count) % count)
      setHeld(true)
      window.clearTimeout(resume.current)
      resume.current = window.setTimeout(() => setHeld(false), RESUME_MS)
    },
    [count],
  )

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: count - 1,
    }
    const target = keys[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = ((target % count) + count) % count
    choose(next)
    tabs.current[next]?.focus()
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swipe.current = event.clientX
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (swipe.current === null) return
    const dx = event.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) >= SWIPE_PX) choose(stepSlide(current, dx < 0 ? 1 : -1, count))
  }

  const slide = slides[current] ?? slides[0]
  if (!slide) return null

  return (
    <div
      ref={root}
      onPointerEnter={() => {
        pointer.current = true
        syncPause()
      }}
      onPointerLeave={() => {
        pointer.current = false
        syncPause()
      }}
      onFocus={(event) => {
        // Only keyboard focus pauses: a click also focuses the tile, and the clock must come back
        // 12 s after it (ZMIANY-v24 §4.1).
        if (!(event.target as Element).matches(':focus-visible')) return
        focus.current = true
        syncPause()
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        focus.current = false
        syncPause()
      }}
    >
      <div className="hx-wrap">
        <Title className="hx-h1">
          {title}{' '}
          <span className="hx-word">
            <span key={current}>{slide.word}</span>
          </span>
        </Title>
        <p className="hx-lead">{lead}</p>
        <div className="hx-cmd">
          <div className="hx-q">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span>
              {query} <b>{slide.name}</b>
              <i className="hx-typ" aria-hidden="true" />
            </span>
            <kbd aria-hidden="true">{queryHint}</kbd>
          </div>
          <div
            className="hx-tiles"
            role="tablist"
            aria-label={query}
            style={{ '--hx-n': count } as React.CSSProperties}
          >
            {slides.map((item, index) => {
              const selected = index === current
              return (
                <button
                  key={`${index}-${item.name}`}
                  ref={(element) => {
                    tabs.current[index] = element
                  }}
                  type="button"
                  role="tab"
                  id={`${ids}-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={`${ids}-stage`}
                  tabIndex={selected ? 0 : -1}
                  className="hx-tile"
                  onClick={() => choose(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >
                  <span className="si" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </span>
                  <span className="sn" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div id={`${ids}-stage`} role="tabpanel" aria-labelledby={`${ids}-tab-${current}`}>
        <div
          className="hx-flow"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipe.current = null
          }}
        >
          {windows.map((mockup, index) => (
            <div
              key={`${index}-${slides[index]?.name ?? ''}`}
              className="hx-win"
              data-rank={rankOf(index, current, count)}
            >
              {mockup}
            </div>
          ))}
        </div>

        {/* Announced only after the visitor's own choice, not on every turn of the clock. */}
        <div className="hx-cap" aria-live={held || still ? 'polite' : 'off'}>
          <span className="ic" aria-hidden="true">
            {String(current + 1).padStart(2, '0')}
          </span>
          <div>
            <b>{slide.name}</b>
            <span>{slide.text}</span>
          </div>
          <div className="div">
            <b>{slide.price}</b>
            <span>{slide.term}</span>
          </div>
          <Link href={slide.href}>{offer}</Link>
        </div>
      </div>
    </div>
  )
}
