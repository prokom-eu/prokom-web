'use client'

import Link from 'next/link'
import { useId } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { HomeArea } from '@/lib/software/homeAreas'
import { keepTogether } from '@/lib/software/price'

import { AreaScene } from './AreaScene'
import { useAutoTabs } from './useAutoTabs'

/** Board `Main`: the areas change every 5,5 s until the visitor picks one (spec. §8.3). */
export const AREAS_AUTO_MS = 5500

type Props = {
  areas: HomeArea[]
  priceCaption: string
  wizardButton: string
}

/**
 * „Oferta” explorer (spec. §4 pkt 3): the areas as ARIA tabs (automatic activation, arrows,
 * Home, End) and the panel of the chosen one. Switches itself every 5,5 s: stops for good once
 * the visitor picks, pauses while the pointer or focus is inside and while the tab is hidden,
 * never runs with `prefers-reduced-motion`. Phone: the tabs are a scrolling row of pills.
 */
export function AreasExplorer({ areas, priceCaption, wizardButton }: Props) {
  const id = useId()
  const { active, rotating, pick, onKeyDown, tabRef, region } = useAutoTabs(
    areas.length,
    AREAS_AUTO_MS,
  )

  const area = areas[active]
  if (!area) return null

  return (
    <div
      className="grid gap-5 min-[1081px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] min-[1081px]:gap-6"
      {...region}
    >
      <div
        role="tablist"
        aria-label="Obszary oferty"
        onKeyDown={onKeyDown}
        className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[1081px]:mx-0 min-[1081px]:grid min-[1081px]:grid-cols-2 min-[1081px]:content-start min-[1081px]:gap-3 min-[1081px]:overflow-visible min-[1081px]:px-0"
      >
        {areas.map((item, i) => {
          const selected = i === active
          return (
            <button
              key={item.key}
              ref={tabRef(i)}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => pick(i)}
              className={cx(
                'group relative flex shrink-0 snap-start items-center gap-3 overflow-hidden border text-left transition-colors',
                'min-h-12 rounded-full py-1.5 pl-1.5 pr-4 min-[1081px]:min-h-[150px] min-[1081px]:rounded-[18px] min-[1081px]:p-4',
                selected
                  ? 'border-accent-text bg-accent-soft'
                  : 'border-border bg-card hover:border-accent-line',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-9 shrink-0 place-items-center rounded-full transition-colors min-[1081px]:size-[52px] min-[1081px]:rounded-[15px]',
                  selected
                    ? 'bg-accent text-accent-ink'
                    : 'bg-accent-soft text-accent-text group-hover:bg-accent group-hover:text-accent-ink',
                )}
              >
                {item.icon && <Icon name={item.icon} className="size-5 min-[1081px]:size-6" />}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block whitespace-nowrap text-sm font-extrabold text-ink min-[1081px]:whitespace-normal min-[1081px]:font-display min-[1081px]:text-base">
                  {item.name}
                </b>
                {item.short && (
                  <span className="hidden text-[13px] leading-snug text-ink-2 min-[1081px]:block">
                    {item.short}
                  </span>
                )}
                {item.countLabel && (
                  <span className="mt-1 hidden text-xs font-extrabold text-accent-text min-[1081px]:block">
                    {item.countLabel}
                  </span>
                )}
              </span>
              <Icon
                name="arrow"
                strokeWidth={2.2}
                className="hidden size-4 text-ink-2 min-[1081px]:block"
              />
              {selected && rotating && (
                <i
                  aria-hidden="true"
                  key={active}
                  className="absolute bottom-0 left-0 hidden h-1 w-full origin-left bg-accent motion-safe:animate-area-progress min-[1081px]:block"
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="overflow-hidden rounded-[26px] border border-border bg-card shadow-raised"
      >
        <AreaScene areaKey={area.key} />
        <div className="flex flex-col gap-4 p-5 min-[640px]:p-7">
          <div className="flex flex-col gap-1 min-[640px]:flex-row min-[640px]:items-baseline min-[640px]:justify-between min-[640px]:gap-4">
            <h3 className="font-display text-[26px] font-extrabold leading-tight min-[640px]:text-[28px]">
              {area.name}
            </h3>
            {area.countLabel && (
              <span className="text-sm font-extrabold text-accent-text">{area.countLabel}</span>
            )}
          </div>
          {area.description && <p className="text-ink-2">{area.description}</p>}
          {area.gain && (
            <p className="flex items-start gap-3 rounded-2xl bg-surface-2 px-4 py-3 font-extrabold">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ok text-xs text-white"
              >
                ✓
              </span>
              {area.gain}
            </p>
          )}
          {area.chips.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {area.chips.map((chip) => (
                <li key={chip.label}>
                  {chip.href ? (
                    <Link
                      href={chip.href}
                      className="inline-flex min-h-11 items-center rounded-xl border border-accent-line bg-accent-soft px-3 text-sm font-extrabold text-ink hover:border-accent-text"
                    >
                      {chip.label}
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-extrabold text-ink">
                      {chip.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-4 border-t border-border pt-4 min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between">
            <p className="flex flex-col">
              <small className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2">
                {priceCaption}
              </small>
              <b className="font-display text-2xl font-extrabold whitespace-nowrap text-accent-text">
                {area.price}
              </b>
            </p>
            <div className="grid grid-cols-2 gap-2 min-[640px]:flex">
              <Link
                href="/#dobierz"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-border bg-card px-4 text-center text-sm font-extrabold text-ink hover:border-accent-line min-[640px]:whitespace-nowrap"
              >
                {keepTogether(wizardButton)}
              </Link>
              {area.cta && (
                <Link
                  href={area.cta.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-button px-4 text-center text-sm font-extrabold text-accent-ink min-[640px]:whitespace-nowrap"
                >
                  {area.cta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
