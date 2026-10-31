'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { IconName } from '@/lib/catalog/options'
import { productHref } from '@/lib/catalog/card'
import { plural } from '@/lib/plural'

export type WheelGroup = {
  slug: string
  name: string
  icon: IconName
  count: number
  description?: string
  thumbs: { slug: string; name: string; image: IndexImage }[]
}

type Props = { groups: WheelGroup[]; total: number; phone: string | null }

/** Board v149c: the wheel switches to the next department every 6.5 s until one is picked. */
const AUTO_MS = 6500
/** K36 §12: a department's products sit in an arc next to it, 21° apart. */
const ARC_STEP = (21 * Math.PI) / 180

// Radii as a share of the wheel's width (board: 282 and 170 px of 640 px).
const OUTER = 44
const INNER = 26.5

// Rounded: the server and the browser print long floats differently (hydration mismatch).
const point = (angle: number, radius: number) => ({
  left: `${(50 + radius * Math.cos(angle)).toFixed(2)}%`,
  top: `${(50 + radius * Math.sin(angle)).toFixed(2)}%`,
})

/**
 * The five departments around "your company" (spec. §4 pkt 1): department buttons on the inner
 * ring, product pictures on the slowly turning outer ring, the picked department in the middle.
 * Only small, ready data comes in (never the catalog index). Pointer or keyboard focus on the
 * wheel pauses the turning and the switching (WCAG 2.2.2); `prefers-reduced-motion`: neither.
 */
export function DepartmentWheel({ groups, total, phone }: Props) {
  const [active, setActive] = useState<string | null>(null)
  const [picked, setPicked] = useState(false)
  // Pointer over the wheel or focus inside it: nothing changes under the visitor's hand.
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (picked || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const order = [...groups.map((group) => group.slug), null]
    const timer = window.setInterval(() => {
      setActive((current) => order[(order.indexOf(current) + 1) % order.length] ?? null)
    }, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [groups, picked, paused])

  // K36 §12: each department's products in an arc around its own direction on the ring.
  const angleOf = (i: number) => (2 * Math.PI * i) / groups.length - Math.PI / 2
  const bubbles = groups.flatMap((group, i) =>
    group.thumbs.map((thumb, k) => ({
      ...thumb,
      group: group.slug,
      angle: angleOf(i) + (k - (group.thumbs.length - 1) / 2) * ARC_STEP,
    })),
  )
  const current = groups.find((group) => group.slug === active)

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
        className="absolute inset-[3%] rounded-full bg-[radial-gradient(circle,transparent_60%,var(--glow)_100%)] shadow-[inset_0_0_0_1px_var(--border)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-[15%] rounded-full border-[1.5px] border-dashed border-border"
      />
      <div
        aria-hidden="true"
        className="absolute inset-[31%] rounded-full shadow-[inset_0_0_0_1px_var(--border)]"
      />

      <ul
        aria-label="Przykładowe produkty działów"
        className="absolute inset-0 animate-[spin_120s_linear_infinite] group-focus-within/wheel:[animation-play-state:paused] group-hover/wheel:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {bubbles.map((bubble) => {
          const dim = current !== undefined && bubble.group !== current.slug
          const hi = current !== undefined && bubble.group === current.slug
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
                  'flex size-full animate-[spin_120s_linear_infinite_reverse] items-center justify-center rounded-full bg-card shadow-[0_14px_30px_-14px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[opacity,scale,box-shadow] duration-300 group-focus-within/wheel:[animation-play-state:paused] group-hover/wheel:[animation-play-state:paused] hover:scale-110 motion-reduce:animate-none',
                  // v149c: the others stay readable; the pointer on the wheel shows all again.
                  dim &&
                    'scale-[.94] opacity-[.82] group-hover/wheel:scale-100 group-hover/wheel:opacity-100',
                  hi &&
                    'scale-110 shadow-[0_14px_30px_-14px_var(--glow),inset_0_0_0_2px_var(--accent)]',
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
          const on = group.slug === active
          return (
            <li
              key={group.slug}
              className="absolute z-[2] -translate-1/2"
              style={point(angleOf(i), INNER)}
            >
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setPicked(true)
                  setActive(on ? null : group.slug)
                }}
                className="group/dz flex flex-col items-center gap-2"
              >
                <span
                  className={cx(
                    'flex size-10 items-center justify-center rounded-full transition-[scale,background-color] duration-200 sm:size-[54px]',
                    on
                      ? 'scale-110 bg-accent-text text-accent-ink'
                      : 'bg-card text-accent-text shadow-[0_12px_26px_-12px_var(--accent),inset_0_0_0_1.5px_var(--accent)] group-hover/dz:scale-105',
                  )}
                >
                  <Icon name={group.icon} className="size-5 sm:size-6" />
                </span>
                <span
                  className={cx(
                    'hidden rounded-full px-2.5 py-1 text-[12.5px] font-extrabold whitespace-nowrap sm:block',
                    on
                      ? 'bg-accent-text text-accent-ink'
                      : 'bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--border)]',
                  )}
                >
                  {group.name}
                </span>
                <span className="sr-only sm:hidden">{group.name}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div
        data-surface="dark"
        className="absolute top-1/2 left-1/2 z-[3] flex aspect-square w-[33%] -translate-1/2 flex-col items-center justify-center rounded-full bg-surface-dark p-3 text-center text-white shadow-[0_30px_60px_-20px_var(--glow),inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_10%,transparent)] sm:p-4"
      >
        {current ? (
          <>
            <span className="font-display text-[9px] font-extrabold tracking-[0.14em] text-accent-on-dark uppercase sm:text-[10.5px]">
              {current.name}
            </span>
            <span className="mt-1.5 font-display text-sm leading-none font-extrabold whitespace-nowrap font-stretch-112% sm:mt-2 sm:text-[clamp(20px,2.1vw,30px)]">
              {current.count} {plural(current.count, ['pozycja', 'pozycje', 'pozycji'])}
            </span>
            {current.description && (
              <span className="mt-1.5 line-clamp-3 max-w-[20ch] text-[10px] leading-snug text-white/80 sm:mt-2 sm:text-xs">
                {current.description}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="font-display text-[9px] font-extrabold tracking-[0.14em] text-accent-on-dark uppercase sm:text-[10.5px]">
              PRO-KOM Biznes
            </span>
            <span className="mt-1.5 font-display text-sm leading-none font-extrabold whitespace-nowrap font-stretch-112% sm:mt-2 sm:text-[clamp(20px,2.1vw,30px)]">
              Twoja firma
            </span>
            <span className="mt-1.5 max-w-[20ch] text-[10px] leading-snug text-white/80 sm:mt-2 sm:text-xs">
              {groups.length} {plural(groups.length, ['dział', 'działy', 'działów'])} · {total}{' '}
              {plural(total, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}
              {phone && (
                <>
                  <br />
                  jeden numer: {phone}
                </>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
