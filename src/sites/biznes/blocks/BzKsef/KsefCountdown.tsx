'use client'

import { useSyncExternalStore } from 'react'

import { minutesLeft, splitMinutes } from '@/lib/biznes/ksefBand'
import { plural } from '@/lib/plural'

const NBSP = String.fromCharCode(0xa0)

/** Re-read every 15 s: the minute changes on time without a timer per box. */
function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(onChange, 15_000)
  return () => window.clearInterval(timer)
}

const UNITS = [
  ['days', ['dzień', 'dni', 'dni']],
  ['hours', ['godzina', 'godziny', 'godzin']],
  ['minutes', ['minuta', 'minuty', 'minut']],
] as const

/**
 * Days, hours and minutes to the KSeF deadline (plan 0611 §7.1 pkt 7), counted in the browser:
 * the page is cached, a number from the server would go stale. The server renders the three
 * boxes with a non-breaking space (same height — no layout shift); the static date next to them
 * says the deadline without JavaScript. A primitive snapshot (minutes) keeps React's store stable.
 */
export function KsefCountdown({ deadline }: { deadline: string }) {
  const left = useSyncExternalStore(
    subscribe,
    () => minutesLeft(deadline, new Date()),
    () => undefined,
  )
  // The day came while the page was open: the numbers go, the date text stays.
  if (left === null) return null
  const parts = left === undefined ? null : splitMinutes(left)
  return (
    <div className="flex gap-2.5" data-testid="ksef-countdown" aria-hidden="true">
      {UNITS.map(([key, forms]) => (
        <div
          key={key}
          className="flex flex-1 flex-col items-center rounded-[18px] bg-white/[0.06] px-2.5 pt-4 pb-3 text-center ring-1 ring-white/12 ring-inset"
        >
          <b
            className="block font-display text-[36px] leading-none font-extrabold tabular-nums font-stretch-112% min-[768px]:text-[48px]"
            data-unit={key}
          >
            {parts ? parts[key] : NBSP}
          </b>
          <span className="mt-1.5 block text-xs font-bold tracking-[0.08em] text-white/75 uppercase">
            {parts ? plural(parts[key], [...forms]) : forms[2]}
          </span>
        </div>
      ))}
    </div>
  )
}
