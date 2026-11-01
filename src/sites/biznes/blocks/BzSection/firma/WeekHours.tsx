'use client'

import { useSyncExternalStore } from 'react'

import { cx } from '@/components/ui/cx'
import { warsawWeekday } from '@/lib/site/hours'
import type { WeekDay } from '@/lib/site/hoursSummary'

const noop = () => () => {}

/**
 * The week of opening hours with today marked (K4 Kontakt). „Today” is read in the browser, in
 * Polish time (`warsawWeekday`) — the page is cached, a day from the server would go stale; on the
 * server render no day is marked, so hydration matches.
 */
export function WeekHours({ week }: { week: { day: WeekDay; name: string; time: string }[] }) {
  const today = useSyncExternalStore(
    noop,
    () => warsawWeekday(new Date()),
    () => null,
  )
  return (
    <ul className="flex flex-col">
      {week.map((row) => {
        const isToday = row.day === today
        const closed = row.time === 'nieczynne'
        return (
          <li
            key={row.day}
            aria-current={isToday ? 'date' : undefined}
            className={cx(
              'flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-[15px]',
              isToday && 'bg-accent-text/10 font-extrabold text-ink',
              !isToday && closed && 'text-ink-2',
              !isToday && !closed && 'text-ink-2',
            )}
          >
            <span>
              {row.name}
              {isToday && <span className="ml-2 text-[12px] text-h1-accent uppercase">dziś</span>}
            </span>
            <b className={isToday ? 'font-extrabold' : 'font-bold'}>{row.time}</b>
          </li>
        )
      })}
    </ul>
  )
}
