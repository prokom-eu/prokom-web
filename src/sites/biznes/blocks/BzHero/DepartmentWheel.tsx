'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'
import { groupHref } from '@/lib/catalog/menu'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'

export type WheelGroup = {
  slug: string
  name: string
  icon: IconName
  count: number
  /** Department colours from the catalog (`CatalogGroups`), as on the offer cards. */
  gradient: [string, string]
  thumbs: { slug: string; name: string; image: IndexImage }[]
}

type Props = { groups: WheelGroup[] }

/** Board v149c: the wheel switches to the next department every 6.5 s until one is picked. */
const AUTO_MS = 6500
/** K36 §12: a department's products sit in an arc next to it, 21° apart. */
const ARC_STEP = (21 * Math.PI) / 180

// Radii as a share of the wheel's width (board: 282 and 192 px of 640 px).
const OUTER = 44
const INNER = 30

// Rounded: the server and the browser print long floats differently (hydration mismatch).
const point = (angle: number, radius: number) => ({
  left: `${(50 + radius * Math.cos(angle)).toFixed(2)}%`,
  top: `${(50 + radius * Math.sin(angle)).toFixed(2)}%`,
})

const positions = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

/**
 * The five departments of the hero (board `Web-start`, prompt 2 W2): department nodes in their
 * colours on the inner ring, product pictures on the slowly turning outer ring and the active
 * department in the middle — „Dział 1 z 5”, its pictures, name, count and „Zobacz dział”. One
 * department is always active (the first at the start); a click or the timer changes it. Pointer
 * or keyboard focus on the wheel pauses the turning and switching (WCAG 2.2.2);
 * `prefers-reduced-motion`: neither.
 */
export function DepartmentWheel({ groups }: Props) {
  const [active, setActive] = useState(0)
  const [picked, setPicked] = useState(false)
  // Pointer over the wheel or focus inside it: nothing changes under the visitor's hand.
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (picked || paused || groups.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % groups.length)
    }, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [groups.length, picked, paused])

  // K36 §12: each department's products in an arc around its own direction on the ring.
  const angleOf = (i: number) => (2 * Math.PI * i) / groups.length - Math.PI / 2
  const bubbles = groups.flatMap((group, i) =>
    group.thumbs.map((thumb, k) => ({
      ...thumb,
      group: i,
      angle: angleOf(i) + (k - (group.thumbs.length - 1) / 2) * ARC_STEP,
    })),
  )
  const current = groups[active] ?? groups[0]
  if (!current) return null

  return (
    <div
      className="group/wheel relative aspect-square w-full max-w-[640px]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[3%] rounded-full border-[1.5px] border-dashed border-border"
      />
      <div
        aria-hidden="true"
        className="absolute inset-[15%] rounded-full bg-[radial-gradient(circle,var(--glow)_0%,transparent_70%)] opacity-60"
      />

      <ul
        aria-label="Przykładowe produkty działów"
        className="absolute inset-0 animate-[spin_120s_linear_infinite] group-focus-within/wheel:[animation-play-state:paused] group-hover/wheel:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {bubbles.map((bubble) => {
          const hi = bubble.group === active
          return (
            <li
              key={bubble.slug}
              className="absolute size-[11.5%] -translate-1/2"
              style={point(bubble.angle, OUTER)}
            >
              <Link
                href={productHref(bubble.slug)}
                title={bubble.name}
                className={cx(
                  'flex size-full animate-[spin_120s_linear_infinite_reverse] items-center justify-center rounded-full bg-card shadow-[0_14px_30px_-14px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[scale,box-shadow] duration-300 group-focus-within/wheel:[animation-play-state:paused] group-hover/wheel:[animation-play-state:paused] hover:scale-110 motion-reduce:animate-none motion-reduce:transition-none',
                  hi &&
                    'scale-[1.32] shadow-[0_18px_34px_-14px_var(--glow),inset_0_0_0_3px_var(--accent-text)]',
                )}
              >
                <Image
                  src={bubble.image.url}
                  alt={bubble.name}
                  width={bubble.image.width}
                  height={bubble.image.height}
                  unoptimized
                  className="max-h-[62%] w-auto max-w-[64%] object-contain"
                />
              </Link>
            </li>
          )
        })}
      </ul>

      <ul aria-label="Działy oferty">
        {groups.map((group, i) => {
          const on = i === active
          return (
            <li
              key={group.slug}
              className={cx('absolute -translate-1/2', on ? 'z-[4]' : 'z-[2]')}
              style={point(angleOf(i), INNER)}
            >
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setPicked(true)
                  setActive(i)
                }}
                className="group/dz flex flex-col items-center gap-1.5"
              >
                <span
                  style={
                    {
                      backgroundImage: `linear-gradient(145deg, ${group.gradient[0]}, ${group.gradient[1]})`,
                    } as CSSProperties
                  }
                  className={cx(
                    'flex size-10 items-center justify-center rounded-full text-white shadow-[0_12px_24px_-12px_var(--glow)] transition-[scale,box-shadow] duration-200 motion-reduce:transition-none sm:size-[58px]',
                    on
                      ? 'scale-110 shadow-[0_0_0_4px_var(--surface),0_0_0_6px_var(--accent-text),0_16px_30px_-12px_var(--glow)]'
                      : 'group-hover/dz:scale-105',
                  )}
                >
                  <Icon name={group.icon} className="size-5 sm:size-6" />
                </span>
                <span
                  className={cx(
                    'hidden flex-col items-center rounded-lg px-2.5 py-1 leading-tight whitespace-nowrap sm:flex',
                    on
                      ? 'bg-surface-dark text-white'
                      : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
                  )}
                >
                  <span className="text-[13px] font-extrabold">{group.name}</span>
                  <span
                    className={cx('text-[11.5px] font-bold', on ? 'text-white/75' : 'text-ink-2')}
                  >
                    {positions(group.count)}
                  </span>
                </span>
                <span className="sr-only sm:hidden">{group.name}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div
        data-surface="dark"
        className="absolute top-1/2 left-1/2 z-[3] flex aspect-square w-[36%] -translate-1/2 flex-col items-center justify-center gap-1 rounded-full bg-surface-dark p-3 text-center text-white shadow-[0_30px_60px_-20px_var(--glow),inset_0_0_0_6px_color-mix(in_srgb,var(--c-white)_8%,transparent)] sm:p-5"
      >
        <span className="font-display text-[9px] font-extrabold tracking-[0.16em] text-accent-on-dark uppercase sm:text-[11px]">
          Dział {active + 1} z {groups.length}
        </span>
        {current.thumbs.length > 0 && (
          <span aria-hidden="true" className="mt-1 hidden -space-x-2.5 sm:flex">
            {current.thumbs.map((thumb) => (
              <span
                key={thumb.slug}
                className="flex size-11 items-center justify-center rounded-full bg-white shadow-[0_0_0_2px_var(--surface-dark)]"
              >
                <Image
                  src={thumb.image.url}
                  alt=""
                  width={thumb.image.width}
                  height={thumb.image.height}
                  unoptimized
                  className="max-h-[66%] w-auto max-w-[70%] object-contain"
                />
              </span>
            ))}
          </span>
        )}
        <span className="mt-1 font-display text-sm leading-tight font-extrabold font-stretch-112% max-w-[92%] sm:text-[clamp(15px,1.3vw,19px)]">
          {current.name}
        </span>
        <span className="text-[10px] font-bold text-white/75 sm:text-[13px]">
          {positions(current.count)}
        </span>
        <Link
          href={groupHref(current.slug)}
          className="mt-1.5 hidden min-h-9 items-center gap-1.5 rounded-full bg-white/12 px-3.5 text-[13px] font-extrabold text-white transition-colors hover:bg-white/20 sm:inline-flex"
        >
          Zobacz dział
          <Icon name="arrow" strokeWidth={2.4} className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
