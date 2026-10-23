'use client'

import Link from 'next/link'
import { useId, useRef, useState, type KeyboardEvent } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'

export type PlanScene = {
  tab: string
  icon: IconName
  title: string
  lead: string | null
  moreHref: string | null
  inquiryHref: string
  points: { name: string; note: string | null }[]
}

type Props = {
  scenes: PlanScene[]
  sceneNote: string | null
  moreLabel: string | null
  inquiryLabel: string | null
}

/**
 * Stage 1 of „Plan Twojej firmy” (spec. §4 pkt 6): tabs for the kinds of company and the
 * numbered points of the picked one. ARIA tabs with arrow keys, Home and End; only the picked
 * scene is rendered.
 */
export function PlanScenes({ scenes, sceneNote, moreLabel, inquiryLabel }: Props) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const scene = scenes[active] ?? scenes[0]
  if (!scene) return null

  const pick = (index: number) => {
    const next = (index + scenes.length) % scenes.length
    setActive(next)
    tabs.current[next]?.focus()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: scenes.length - 1,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    pick(next)
  }

  const count = scene.points.length
  return (
    <div className="rounded-[30px] bg-card p-2.5 shadow-[0_30px_60px_-40px_var(--glow),inset_0_0_0_1px_var(--border)] sm:p-4">
      <div
        role="tablist"
        aria-label="Rodzaj firmy"
        onKeyDown={onKeyDown}
        className="grid grid-cols-4 gap-1 rounded-[22px] bg-surface-2 p-1.5 min-[900px]:grid-cols-8"
      >
        {scenes.map((item, i) => {
          const selected = i === active
          return (
            <button
              key={i}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cx(
                'flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2 text-[12.5px] font-extrabold transition-colors min-[900px]:flex-row min-[900px]:gap-2.5 min-[900px]:text-sm',
                selected
                  ? 'bg-card text-ink shadow-[0_10px_24px_-16px_var(--glow)]'
                  : 'text-ink-2 hover:text-ink',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'flex size-[34px] shrink-0 items-center justify-center rounded-[10px]',
                  selected
                    ? 'bg-accent-text text-accent-ink'
                    : 'bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)]',
                )}
              >
                <Icon name={item.icon} className="size-[18px]" />
              </span>
              {item.tab}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="px-1.5 pt-5 pb-2 sm:px-2"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-[clamp(1.25rem,2vw,1.5rem)] leading-tight font-extrabold">
            {scene.title}
          </h3>
          <p className="text-sm font-bold text-ink-3">
            {count} {plural(count, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}
            {sceneNote ? ` ${sceneNote}` : ''}
          </p>
        </div>
        {count > 0 && (
          <ol className="mt-4 grid gap-2 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-5">
            {scene.points.map((point, i) => (
              <li
                key={`${point.name}-${i}`}
                className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-3"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-accent-text font-display text-[11px] font-extrabold text-accent-ink"
                >
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[14.5px] leading-snug font-extrabold text-ink">
                    {point.name}
                  </span>
                  {point.note && (
                    <span className="text-[12.5px] leading-snug text-ink-2">{point.note}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          {scene.lead && <p className="max-w-[62ch] text-[15px] text-ink-2">{scene.lead}</p>}
          <div className="flex flex-wrap items-center gap-4">
            {scene.moreHref && moreLabel && (
              <Link
                href={scene.moreHref}
                className="inline-flex min-h-11 items-center gap-1.5 font-extrabold text-ink hover:text-accent-text"
              >
                {moreLabel}
                <Icon name="arrow" strokeWidth={2.4} className="size-4" />
              </Link>
            )}
            <Link
              href={scene.inquiryHref}
              className="inline-flex min-h-12 items-center rounded-2xl bg-accent-text px-6 font-extrabold text-accent-ink transition-colors hover:bg-ink hover:text-surface"
            >
              {inquiryLabel ? `${inquiryLabel} ${scene.title}` : scene.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
