'use client'

import { useEffect, useState } from 'react'

import { openingStatus, type OpeningHours, type OpeningStatus } from '@/lib/site/hours'

const MINUTE = 60_000

type Props = {
  hours: OpeningHours
  /** Status at render time on the server; recomputed in the browser (the page may be cached). */
  initial: OpeningStatus
  /** Wraps the text, e.g. in `<b>` in the sheet. */
  strong?: boolean
}

/**
 * Live opening status with a dot (prototype `hours`: `.live` green with a ping, `.live.off`
 * orange): „Otwarte teraz · do 17:00” / „Zamknięte · otwieramy jutro o 9:00”, Europe/Warsaw.
 */
export function HoursLive({ hours, initial, strong = false }: Props) {
  const [status, setStatus] = useState(initial)
  useEffect(() => {
    const update = () => setStatus((current) => openingStatus(hours, new Date()) ?? current)
    update()
    const timer = window.setInterval(update, MINUTE)
    return () => window.clearInterval(timer)
  }, [hours])

  return (
    <>
      <span aria-hidden="true" className={status.open ? 'live' : 'live off'} />
      {strong ? <b>{status.label}</b> : status.label}
    </>
  )
}
