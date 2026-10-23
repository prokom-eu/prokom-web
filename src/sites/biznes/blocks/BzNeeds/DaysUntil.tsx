'use client'

import { type ReactNode, useSyncExternalStore } from 'react'

import { daysLabel, daysUntil } from '@/lib/site/days'

const noop = () => () => {}

type Props = {
  date: string
  className?: string
  /** Shown once the date has passed (the tile's tag or arrow). */
  fallback: ReactNode
}

/**
 * "73 dni" to a date, counted in the browser: the page is cached, so a number from the server
 * would go stale. Nothing on the server render (no hydration mismatch); after the date the
 * tile gets its usual corner back.
 */
export function DaysUntil({ date, className, fallback }: Props) {
  const days = useSyncExternalStore(
    noop,
    () => daysUntil(date, new Date()),
    () => undefined,
  )
  if (days === undefined) return null
  if (days === null) return fallback
  return <span className={className}>{daysLabel(days)}</span>
}
