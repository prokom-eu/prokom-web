'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { openingStatus, type OpeningHours, type OpeningStatus } from '@/lib/site/hours'

const MINUTE = 60_000

type Props = {
  hours: OpeningHours
  /** Status at render time on the server, so the first paint shows it without a flash. */
  initial: OpeningStatus
  /** Text colour and size; default: ink (light surfaces). */
  className?: string
}

/**
 * "Otwarte teraz · do 17:00" with a green dot, or "Zamknięte · otwieramy…" with an orange one
 * (spec. §3.1). Recomputed every minute in the browser: the page may stay open for hours, and
 * a cached render would otherwise show a stale status.
 */
export function HoursStatus({ hours, initial, className = 'text-ink' }: Props) {
  const [status, setStatus] = useState(initial)
  useEffect(() => {
    const update = () => setStatus((current) => openingStatus(hours, new Date()) ?? current)
    update()
    const timer = window.setInterval(update, MINUTE)
    return () => window.clearInterval(timer)
  }, [hours])

  return (
    <p className={cx('inline-flex items-center gap-2 font-bold', className)}>
      <span
        aria-hidden="true"
        className={cx('size-2 shrink-0 rounded-full', status.open ? 'bg-ok' : 'bg-warn')}
      />
      {status.label}
    </p>
  )
}
