'use client'

import { useSyncExternalStore } from 'react'

import { daysUntil } from '@/lib/site/days'

const noop = () => () => {}
const NBSP = String.fromCharCode(0xa0)

/**
 * Whole days to the date, counted in the browser (the page is cached, a number from the server
 * would go stale). Nothing on the server render — the box keeps its height, so the layout does
 * not jump; nothing either once the day has passed (the server stops rendering the counter too).
 */
export function DayCount({ date, className }: { date: string; className?: string }) {
  const days = useSyncExternalStore(
    noop,
    () => daysUntil(date, new Date()),
    () => undefined,
  )
  if (days === null) return null
  return (
    <span className={className} data-testid="ksef-days">
      {/* Before hydration a non-breaking space keeps the line's height. */}
      {days ?? NBSP}
    </span>
  )
}
