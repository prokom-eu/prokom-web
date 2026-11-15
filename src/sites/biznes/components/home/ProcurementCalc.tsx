'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { handoffHref } from '@/lib/biznes/procurement/handoff'
import { resultLabel, type CalculatorType } from '@/lib/biznes/procurement/home'
import { easeOut } from '@/lib/motion/countUp'
import { ProcIcon } from '@/sites/biznes/components/procurement/icons'

type Props = {
  page: string
  types: CalculatorType[]
  count: number
  unit: [string, string, string]
  cta: string
  note?: string
}

const TWEEN_MS = 450
const REDUCED = '(prefers-reduced-motion: reduce)'

/** The number shown counts smoothly to `value` (instantly with reduced motion). */
function useTween(value: number): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = from.current
    if (start === value) return
    // Reduced motion: the whole tween in one frame.
    const ms = window.matchMedia(REDUCED).matches ? 0 : TWEEN_MS
    let frame = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const p = ms ? Math.min(1, (t - t0) / ms) : 1
      const next = Math.round(start + (value - start) * easeOut(p))
      from.current = next
      setShown(next)
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return shown
}

/**
 * Mini calculator of a home card (ZAOPATRZENIE §8): type × count → „84 urządzenia · 12 lokali”,
 * and the button carries the choice to the page's configurator (`?typ=&n=`). The server HTML
 * already has the default result and link.
 */
export function ProcurementCalc({ page, types, count: start, unit, cta, note }: Props) {
  const [type, setType] = useState(0)
  const [count, setCount] = useState(start)
  const current = types[type] ?? types[0]!
  const total = count * current.perUnit
  const shown = useTween(total)
  const label = resultLabel(total, count, unit)
  const change = (delta: number) => setCount((n) => Math.max(1, Math.min(500, n + delta)))

  return (
    <>
      <div className="zh-calc">
        <div className="zh-seg" role="group" aria-label="Rodzaj">
          {types.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              aria-pressed={i === type}
              onClick={() => setType(i)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="zh-step" role="group" aria-label={`Liczba ${unit[2]}`}>
          <button type="button" aria-label="Mniej" disabled={count <= 1} onClick={() => change(-1)}>
            −
          </button>
          <output>{count}</output>
          <button
            type="button"
            aria-label="Więcej"
            disabled={count >= 500}
            onClick={() => change(1)}
          >
            +
          </button>
        </div>
        {/* The counting number is for the eye; readers get the final result once. */}
        <p className="zh-res">
          <b aria-hidden="true">{shown}</b>
          <span aria-hidden="true">{label}</span>
          <span className="sr-only" aria-live="polite">
            {total} {label}
          </span>
        </p>
      </div>
      <div className="zh-go">
        <Link className="zh-btn" href={handoffHref(page, current.slug, count)}>
          {cta}
          <ProcIcon name="arrow" />
        </Link>
        {note && <small>{note}</small>}
      </div>
    </>
  )
}
