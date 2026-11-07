'use client'

import { Fragment, useDeferredValue, useId, useMemo, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { layoutTowns } from '@/lib/shared/areaLayout'
import { findZone, ZONE_MIN_LETTERS, zoneLabel, type ServiceZone } from '@/lib/shared/zones'

/** The label touches its point with this side (`layoutTowns` → `align`). */
const ALIGN = { start: '', center: '-translate-x-1/2', end: '-translate-x-full' } as const

type Props = {
  zones: readonly ServiceZone[]
  /** The salon in the middle, e.g. „Rabka-Zdrój”. */
  center: string
  /** Behind the drawing — the page passes `<Contours />`, drawn on the server, not in this bundle. */
  background?: ReactNode
  className?: string
}

/**
 * Service area of every line (spec §5 `ServiceAreaMap`, board Kontakt; pattern: the Biznes
 * `AreaMap` and the Instalacje town search): the field „Sprawdź swoją miejscowość” with the zone
 * of the town (from 3 letters), and a drawing on the line's dark colour — the salon in the middle,
 * dashed lines to the towns of `CompanyData.serviceZones`, labels as HTML. No travel times (no
 * source). On a phone the field comes first and the drawing is smaller.
 */
export function ServiceAreaMap({ zones, center, background, className }: Props) {
  const id = useId()
  const [town, setTown] = useState('')
  const deferred = useDeferredValue(town)
  const placed = useMemo(() => layoutTowns(zones, center), [zones, center])
  const typed = deferred.trim()
  const match = typed.length >= ZONE_MIN_LETTERS ? findZone(zones, typed) : null
  // No zones in the panel: nothing to check against, so no field that would say „not listed” to all.
  if (zones.length === 0) return null

  return (
    <div className={cx('flex flex-col gap-5', className)} data-service-area>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-town`} className="font-semibold">
          Sprawdź swoją miejscowość
        </label>
        <input
          id={`${id}-town`}
          type="text"
          value={town}
          onChange={(event) => setTown(event.target.value)}
          autoComplete="address-level2"
          placeholder="np. Szaflary"
          aria-describedby={`${id}-result`}
          className="block min-h-[52px] w-full max-w-[420px] rounded-xl border-[1.5px] border-border-input bg-card px-4 text-base text-ink"
        />
        <p id={`${id}-result`} aria-live="polite" className="min-h-6 font-semibold">
          {match ? (
            <span className="text-accent-text">{zoneLabel(match)}</span>
          ) : typed.length >= ZONE_MIN_LETTERS ? (
            <span className="text-ink-2">Nie ma jej na liście — zadzwoń, ustalimy dojazd.</span>
          ) : (
            ''
          )}
        </p>
      </div>

      <div
        className="relative isolate h-[300px] overflow-hidden rounded-[28px] bg-line-dark min-[768px]:h-[440px]"
        aria-hidden="true"
      >
        {background}
        <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
          {placed.map((t, i) => (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${t.x}%`}
              y2={`${t.y}%`}
              stroke="var(--on-dark)"
              strokeWidth={match?.town === t.town ? 2 : 1}
              strokeDasharray="4 6"
              opacity={match?.town === t.town ? 0.9 : 0.35}
            />
          ))}
        </svg>
        {placed.map((t, i) => {
          const found = match?.town === t.town
          const at = { left: `${t.x}%`, top: `${t.y}%` }
          return (
            <Fragment key={i}>
              {/* Phone: 20 labels do not fit 300 px — a dot each, the label only for the match. */}
              {!found && (
                <span
                  style={at}
                  className="absolute size-2 -translate-1/2 rounded-full bg-on-dark opacity-70 min-[768px]:hidden"
                />
              )}
              <span
                style={at}
                className={cx(
                  'absolute -translate-y-1/2 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap min-[768px]:text-[13px]',
                  ALIGN[t.align],
                  found
                    ? 'z-[1] bg-on-dark text-on-dark-ink'
                    : 'bg-line-dark-current text-line-dark-ink ring-1 ring-line-dark-rule max-[767px]:hidden',
                )}
              >
                {t.town}
              </span>
            </Fragment>
          )
        })}
        <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <span className="size-5 rounded-full border-[5px] border-on-dark/30 bg-on-dark" />
          <span className="rounded-lg bg-card px-3 py-1 text-sm font-extrabold text-ink">
            {center}
          </span>
        </span>
      </div>
    </div>
  )
}
