'use client'

import { useEffect, useState, type RefObject } from 'react'

import { cx } from '@/components/ui/cx'

type Props = {
  /** The tab list or button group (positioned: `relative`). */
  container: RefObject<HTMLElement | null>
  /** Anything that changes with the choice (the active index), to measure again. */
  active: unknown
  /** Background of the pill (`bg-button`, `bg-card shadow-raised`…) and its corner radius. */
  className: string
  /** Corner radius of the chosen item. */
  radius?: number
}

type Box = { width: number; height: number; left: number; top: number }

/**
 * One background that flows under the chosen tab or button instead of jumping (SWV7; Instalacje
 * I-M): as big as the chosen item and moved with `translate` (its size follows). It used to cover the whole list
 * clipped with `clip-path`, but contrast checkers (axe) ignore the clip and saw its colour under
 * every other tab — so it lies only under the chosen one. One absolute element: resizing it moves
 * nothing else. Measured in the list's own coordinates (offsets), so a list that scrolls sideways
 * keeps it under the item. The chosen item needs `relative z-[1]` and no background of its own;
 * without JavaScript it keeps its own look (the pill is not drawn).
 */
export function SlidingPill({ container, active, className, radius = 12 }: Props) {
  const [box, setBox] = useState<Box | null>(null)

  // `useEffect`, not a layout effect: the list's ref (the parent) is attached only after the
  // children's layout effects. Until measured the chosen item keeps its own background.
  useEffect(() => {
    const list = container.current
    if (!list) return
    const measure = () => {
      const item = list.querySelector<HTMLElement>('[aria-selected="true"], [aria-pressed="true"]')
      if (!item) return setBox(null)
      setBox({
        width: item.offsetWidth,
        height: item.offsetHeight,
        left: item.offsetLeft,
        top: item.offsetTop,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [container, active])

  if (!box) return null
  return (
    <span
      aria-hidden="true"
      data-sliding-pill
      className={cx(
        'pointer-events-none absolute top-0 left-0 transition-[translate,width,height] duration-(--dur-state) ease-(--ease-out) motion-reduce:transition-none',
        className,
      )}
      style={{
        width: box.width,
        height: box.height,
        translate: `${box.left}px ${box.top}px`,
        borderRadius: radius,
      }}
    />
  )
}
