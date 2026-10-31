'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { openingStatus, type OpeningHours, type OpeningStatus } from '@/lib/site/hours'

const MINUTE = 60_000

type Props = {
  hours: OpeningHours
  /** Status at render time; recomputed in the browser every minute (Europe/Warsaw). */
  initial: OpeningStatus
  /** „pn–pt 9:00–17:00 · formularz działa całą dobę”. */
  caption: string
}

/**
 * Hours card of the `/kontakt` hero (board `Kontakt`, stan `kontakt-90`): „Teraz otwarte ·
 * Odbieramy do 17:00” or „Teraz zamknięte · Otwieramy jutro o 9:00”, live.
 */
export function ContactHours({ hours, initial, caption }: Props) {
  const [status, setStatus] = useState(initial)
  useEffect(() => {
    const update = () => setStatus((current) => openingStatus(hours, new Date()) ?? current)
    update()
    const timer = window.setInterval(update, MINUTE)
    return () => window.clearInterval(timer)
  }, [hours])

  const title = status.open
    ? `Odbieramy do ${status.time}`
    : `Otwieramy ${status.when ?? ''} o ${status.time}`.replace('  ', ' ')
  return (
    <div className="flex flex-col gap-1.5 rounded-[22px] bg-card p-5 shadow-raised ring-1 ring-border">
      <p
        className={cx(
          'flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em]',
          status.open ? 'text-ok-text' : 'text-ink-2',
        )}
      >
        <span
          aria-hidden="true"
          className={cx('size-2.5 rounded-full', status.open ? 'bg-ok' : 'bg-warn')}
        />
        {status.open ? 'Teraz otwarte' : 'Teraz zamknięte'}
      </p>
      <p className="font-display text-xl font-extrabold leading-tight">{title}</p>
      <p className="text-sm text-ink-2">{caption}</p>
    </div>
  )
}
