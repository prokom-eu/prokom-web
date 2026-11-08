'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

import { ProcIcon } from './icons'

type Props = {
  /** Name of the strip for screen readers (and the visible label when `showLabel`). */
  label: string
  showLabel?: boolean
  /** Pixels per second (ZAOPATRZENIE §9: 34 for the upper strip, 28 for the lower). */
  speed?: number
  /** −1 moves left, 1 moves right. */
  direction?: -1 | 1
  /** `<li>` items of one copy of the strip. */
  children: ReactNode
  className?: string
}

const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** How fast the speed eases towards its target (prototype `marquee()`: 3.2 per second). */
const EASE = 3.2

/**
 * A strip of logos moving in a loop (ZAOPATRZENIE §2 pkt 2, §9): a `requestAnimationFrame` loop,
 * not a CSS animation, so it eases to a stop under the mouse and starts again from the same
 * place. Stops on keyboard focus inside and with the pause button (WCAG 2.2.2); with reduced
 * motion it stands still and the button goes. The second copy (for the loop) is `aria-hidden`
 * and `inert`, so screen readers and the Tab key get one list. The loop runs only while the
 * strip is on screen. Dragging (B2-3, home page) plugs into `drag` — the offset is already kept
 * in `x` and wrapped by `wrap()`.
 */
export function BrandMarquee({
  label,
  showLabel = false,
  speed = 34,
  direction = -1,
  children,
  className,
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const aimRef = useRef<() => void>(() => {})
  const [paused, setPaused] = useState(false)
  // Server and reduced motion: a still strip without the pause button.
  const moving = useSyncExternalStore(
    subscribeMotion,
    () => !window.matchMedia(REDUCED).matches,
    () => false,
  )

  useEffect(() => {
    const row = rowRef.current
    const track = trackRef.current
    if (!row || !track || !moving) return
    let x = 0
    let v = 0
    let target = speed
    let last = 0
    let frame = 0
    let hover = false
    let focus = false
    let visible = false
    const drag = false // B2-3: pointer drag sets this and moves `x` by the pointer.
    const half = () => (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0
    const wrap = () => {
      const h = half()
      if (!h) return
      while (x <= -h) x += h
      while (x > 0) x -= h
    }
    const aim = () => {
      target = hover || focus || drag || pausedRef.current ? 0 : speed
    }
    aimRef.current = aim
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000)
      last = t
      v += (target - v) * Math.min(1, dt * EASE)
      x += direction * v * dt
      wrap()
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
      frame = visible ? requestAnimationFrame(tick) : 0
    }
    if (direction > 0) x = -1
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      hover = true
      aim()
    }
    const onLeave = () => {
      hover = false
      aim()
    }
    const onFocusIn = (event: FocusEvent) => {
      focus = (event.target as HTMLElement).matches(':focus-visible')
      aim()
    }
    const onFocusOut = () => {
      focus = false
      aim()
    }
    row.addEventListener('pointerenter', onEnter)
    row.addEventListener('pointerleave', onLeave)
    row.addEventListener('focusin', onFocusIn)
    row.addEventListener('focusout', onFocusOut)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible && !frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    })
    observer.observe(row)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      row.removeEventListener('pointerenter', onEnter)
      row.removeEventListener('pointerleave', onLeave)
      row.removeEventListener('focusin', onFocusIn)
      row.removeEventListener('focusout', onFocusOut)
    }
  }, [speed, direction, moving])

  const toggle = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
    aimRef.current()
  }

  return (
    <div className={cx('zp-marq', className)} role="group" aria-label={label}>
      {showLabel && (
        <b className="zp-marq-label" aria-hidden="true">
          {label}
        </b>
      )}
      <div ref={rowRef} className="zp-marq-view">
        <div ref={trackRef} className="zp-marq-track">
          <ul className="zp-marq-group">{children}</ul>
          <ul className="zp-marq-group" aria-hidden="true" inert>
            {children}
          </ul>
        </div>
      </div>
      {moving && (
        <button
          type="button"
          className="zp-marq-pause"
          aria-pressed={paused}
          aria-label="Wstrzymaj animację"
          title={paused ? 'Wznów animację' : 'Wstrzymaj animację'}
          onClick={toggle}
        >
          <ProcIcon name={paused ? 'arrow' : 'pause'} />
        </button>
      )}
    </div>
  )
}
