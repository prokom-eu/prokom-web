'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { openingStatus, type OpeningHours } from '@/lib/shared/openingStatus'

type Props = {
  hours: OpeningHours
  /** Closed days, `YYYY-MM-DD` (`CompanyData.holidays`). */
  holidays: readonly string[]
  /** The moment the server rendered (ISO) — the first client render shows the same status. */
  now: string
  /** `inline`: dot + text (brand bar); `pill`: on a tinted pill (cards, hero). */
  variant?: 'inline' | 'pill'
  /** On a dark band (`line-dark`): light dot, white text. */
  onDark?: boolean
  className?: string
}

/**
 * Live opening status (spec §5 `OpeningStatus`): „Otwarte · do 17:00”, „Zamykamy za N min”,
 * „Zamknięte · otwieramy…”. Rendered on the server for `now`, then refreshed every minute; the
 * text keeps its place (the dot and label only change), so nothing below moves. The colour is
 * never the only carrier: the label says the state.
 */
export function OpeningStatus({
  hours,
  holidays,
  now,
  variant = 'inline',
  onDark,
  className,
}: Props) {
  const [moment, setMoment] = useState(() => new Date(now))

  useEffect(() => {
    // Right after hydration (the server's minute may be stale), then at each full minute.
    let timer = 0
    const tick = () => {
      setMoment(new Date())
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000))
    }
    timer = window.setTimeout(tick, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const status = openingStatus(hours, holidays, moment)
  if (!status) return null
  return (
    <span
      className={cx('oh-status', variant === 'pill' && 'oh-status--pill', className)}
      data-state={status.state}
      data-on-dark={onDark ? '' : undefined}
      data-opening-status
    >
      <span className="oh-status__dot" aria-hidden="true" />
      {status.label}
    </span>
  )
}
