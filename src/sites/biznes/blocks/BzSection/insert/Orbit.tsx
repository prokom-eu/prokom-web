'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, type CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

export type OrbitBox = {
  slug: string
  name: string
  image: IndexImage
  /** Short line under the box („KPiR i ryczałt”). */
  line?: string
  /** Place on the 500 × 440 board (`insert.orb`). */
  x?: number
  y?: number
}

const W = 500
const H = 440
/** How far a box drifts with the pointer: the satellites more than the centre (depth). */
const DRIFT_CENTRE = 6
const DRIFT_SATELLITE = 14
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark-text'

/**
 * The InsERT hero composition (Web-insert, PREMIUM-1011): Subiekt nexo in the middle, the other
 * programs around it on two faint rings, the partner badges in a row under them. Each box opens
 * its card. A slight parallax follows the pointer — only with a fine pointer and without reduced
 * motion; on a phone the boxes are a row to swipe.
 */
export function InsertOrbit({
  center,
  items,
  badges,
}: {
  center: OrbitBox
  items: readonly OrbitBox[]
  badges: readonly string[]
}) {
  const board = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = board.current
    if (
      !element ||
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    let frame = 0
    const set = (px: number, py: number) => {
      element.style.setProperty('--px', px.toFixed(3))
      element.style.setProperty('--py', py.toFixed(3))
    }
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      const px = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1))
      const py = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1))
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => set(px, py))
    }
    const reset = () => {
      cancelAnimationFrame(frame)
      set(0, 0)
    }
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', reset)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', reset)
    }
  }, [])

  const drift = (depth: number): CSSProperties => ({
    translate: `calc(var(--px, 0) * ${depth}px) calc(var(--py, 0) * ${depth}px)`,
  })

  return (
    <div className="min-w-0">
      {/* Phone: the boxes as a row to swipe, the centre first. */}
      <ul
        className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[768px]:hidden"
        data-insert-carousel
      >
        {[center, ...items].map((box) => (
          <li key={box.slug} className="w-[34%] shrink-0 snap-start">
            <Link
              href={productHref(box.slug)}
              className={cx(
                'flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10',
                FOCUS,
              )}
            >
              <Image
                unoptimized
                src={box.image.url}
                alt=""
                width={box.image.width}
                height={box.image.height}
                className="h-20 w-auto object-contain"
              />
              <span className="text-center text-xs leading-tight font-extrabold">{box.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={board}
        className="relative mx-auto aspect-[500/440] w-full max-w-[600px] max-md:hidden"
        data-insert-orbit
      >
        {[0.62, 0.92].map((size) => (
          <span
            key={size}
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            style={{ width: `${size * 100}%` }}
          />
        ))}
        <span
          className="absolute top-1/2 left-1/2 z-[2] w-[34%] -translate-x-1/2 -translate-y-1/2"
          data-orbit-center
        >
          <Link
            href={productHref(center.slug)}
            className={cx('block transition-[translate] duration-300 ease-out', FOCUS)}
            style={drift(DRIFT_CENTRE)}
          >
            <Image
              unoptimized
              fetchPriority="high"
              loading="eager"
              src={center.image.url}
              alt={center.name}
              width={center.image.width}
              height={center.image.height}
              className="w-full object-contain"
            />
          </Link>
        </span>
        {items.map((box) => (
          <span
            key={box.slug}
            className="absolute z-[1] w-[17%] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((box.x ?? W / 2) / W) * 100}%`,
              top: `${((box.y ?? H / 2) / H) * 100}%`,
            }}
          >
            <Link
              href={productHref(box.slug)}
              className={cx(
                'group flex flex-col items-center gap-1 transition-[translate] duration-300 ease-out',
                FOCUS,
              )}
              style={drift(DRIFT_SATELLITE)}
            >
              <Image
                unoptimized
                src={box.image.url}
                alt=""
                width={box.image.width}
                height={box.image.height}
                className="w-full object-contain transition-transform group-hover:-translate-y-1"
              />
              <span className="text-center text-[12px] leading-tight font-extrabold whitespace-nowrap">
                {box.name}
              </span>
              {box.line && (
                <span className="text-center text-[11px] leading-tight whitespace-nowrap text-white/70">
                  {box.line}
                </span>
              )}
            </Link>
          </span>
        ))}
      </div>
      {/* The partner badges in a row under the composition: on the board they would cover a box
          at some widths. */}
      <ul className="mt-2 flex flex-wrap justify-center gap-2 max-md:hidden">
        {badges.map((badge) => (
          <li
            key={badge}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-2 text-[13px] font-extrabold ring-1 ring-white/15"
          >
            <span aria-hidden="true" className="text-ok">
              ✓
            </span>
            {badge}
          </li>
        ))}
      </ul>
    </div>
  )
}
