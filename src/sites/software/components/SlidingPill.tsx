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
  /** Corner radius of the chosen item, for the clip. */
  radius?: number
}

type Box = { width: number; height: number; clip: string }

/**
 * One background that flows under the chosen tab or button instead of jumping (SWV7): it covers
 * the whole list and is clipped to the chosen item with `clip-path: inset(…)`, so only the clip
 * moves — no width or position is animated. Measured in the list's own coordinates (offsets), so
 * a list that scrolls sideways keeps it under the item. The chosen item needs `relative z-[1]`
 * and no background of its own; without JavaScript it keeps its own look (the pill is not drawn).
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
      const width = list.scrollWidth
      const height = list.scrollHeight
      const top = item.offsetTop
      const left = item.offsetLeft
      const right = width - left - item.offsetWidth
      const bottom = height - top - item.offsetHeight
      setBox({
        width,
        height,
        clip: `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [container, active, radius])

  if (!box) return null
  return (
    <span
      aria-hidden="true"
      data-sliding-pill
      className={cx(
        'pointer-events-none absolute top-0 left-0 transition-[clip-path] duration-(--dur-state) ease-(--ease-out) motion-reduce:transition-none',
        className,
      )}
      style={{ width: box.width, height: box.height, clipPath: box.clip }}
    />
  )
}
