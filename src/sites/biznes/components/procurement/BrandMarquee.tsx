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
  /**
   * Pause set by the parent (one button for several strips, home page §9): the strip then has
   * no button of its own.
   */
  paused?: boolean
  /** Drag with a finger or the mouse (home page §9); after a drag a click does not open a link. */
  draggable?: boolean
}

const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Whether motion is allowed (`false` on the server and with reduced motion). */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => !window.matchMedia(REDUCED).matches,
    () => false,
  )
}

/** How fast the speed eases towards its target (prototype `marquee()`: 3.2 per second). */
const EASE = 3.2
/** Pointer travel (px) after which a press is a drag, not a click. */
const DRAG_PX = 6
/** After a drag the strip waits this long before it moves on (prototype: 900 ms). */
const DRAG_REST_MS = 900

/**
 * A strip of logos moving in a loop (ZAOPATRZENIE §2 pkt 2, §9): a `requestAnimationFrame` loop,
 * not a CSS animation, so it eases to a stop under the mouse and starts again from the same
 * place. Stops on keyboard focus inside and with the pause button (WCAG 2.2.2); with reduced
 * motion it stands still and the button goes. The second copy (for the loop) is `aria-hidden`
 * and `inert`, so screen readers and the Tab key get one list. The loop runs only while the
 * strip is on screen. With `draggable` the pointer moves `x` (also with reduced motion: the strip
 * stands, but can be dragged); with `paused` the parent owns the pause.
 */
export function BrandMarquee({
  label,
  showLabel = false,
  speed = 34,
  direction = -1,
  children,
  className,
  paused: pausedProp,
  draggable = false,
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const aimRef = useRef<() => void>(() => {})
  const [pausedOwn, setPaused] = useState(false)
  const controlled = pausedProp !== undefined
  const paused = controlled ? pausedProp : pausedOwn
  // Server and reduced motion: a still strip without the pause button.
  const moving = useMotionAllowed()

  useEffect(() => {
    const row = rowRef.current
    const track = trackRef.current
    if (!row || !track || !(moving || draggable)) return
    let x = 0
    let v = 0
    let target = moving ? speed : 0
    let last = 0
    let frame = 0
    let hover = false
    let focus = false
    let visible = false
    let drag: { x0: number; x: number } | null = null
    let moved = 0
    let rest = 0
    const half = () => (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0
    const wrap = () => {
      const h = half()
      if (!h) return
      while (x <= -h) x += h
      while (x > 0) x -= h
    }
    const aim = () => {
      target = !moving || hover || focus || drag || pausedRef.current ? 0 : speed
    }
    aimRef.current = aim
    const tick = (t: number) => {
      // Focus on a tile out of view makes the browser scroll the view: move that into `x`.
      if (row.scrollLeft) {
        x -= row.scrollLeft
        row.scrollLeft = 0
      }
      const dt = Math.min(0.05, (t - (last || t)) / 1000)
      last = t
      v += (target - v) * Math.min(1, dt * EASE)
      if (!drag) {
        x += direction * v * dt
        wrap()
      }
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
      if (row.scrollLeft) {
        x -= row.scrollLeft
        row.scrollLeft = 0
        wrap()
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
      }
      aim()
    }
    const onDown = (event: PointerEvent) => {
      if (!draggable || (event.pointerType === 'mouse' && event.button !== 0)) return
      drag = { x0: event.clientX, x }
      moved = 0
      v = 0
      clearTimeout(rest)
      aim()
    }
    const onMove = (event: PointerEvent) => {
      if (!drag) return
      const dx = event.clientX - drag.x0
      moved = Math.max(moved, Math.abs(dx))
      x = drag.x + dx
      wrap()
    }
    const onUp = () => {
      if (!drag) return
      drag = null
      rest = window.setTimeout(aim, DRAG_REST_MS)
      // The click (if any) comes right after this event; a later Enter key must still work.
      window.setTimeout(() => {
        moved = 0
      }, 0)
    }
    // A press that became a drag must not open the tile's link.
    const onClick = (event: MouseEvent) => {
      if (moved <= DRAG_PX) return
      event.preventDefault()
      event.stopPropagation()
      moved = 0
    }
    const onDragStart = (event: DragEvent) => event.preventDefault()
    if (draggable) {
      row.addEventListener('pointerdown', onDown)
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
      row.addEventListener('click', onClick, true)
      row.addEventListener('dragstart', onDragStart)
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
      clearTimeout(rest)
      row.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      row.removeEventListener('click', onClick, true)
      row.removeEventListener('dragstart', onDragStart)
      row.removeEventListener('pointerenter', onEnter)
      row.removeEventListener('pointerleave', onLeave)
      row.removeEventListener('focusin', onFocusIn)
      row.removeEventListener('focusout', onFocusOut)
    }
  }, [speed, direction, moving, draggable])

  // A pause owned by the parent: follow it and ease the strip to a stop (or back to speed).
  useEffect(() => {
    if (!controlled) return
    pausedRef.current = pausedProp
    aimRef.current()
  }, [controlled, pausedProp])

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
      <div ref={rowRef} className="zp-marq-view" data-draggable={draggable ? '' : undefined}>
        <div ref={trackRef} className="zp-marq-track">
          <ul className="zp-marq-group">{children}</ul>
          <ul className="zp-marq-group" aria-hidden="true" inert>
            {children}
          </ul>
        </div>
      </div>
      {moving && !controlled && (
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
