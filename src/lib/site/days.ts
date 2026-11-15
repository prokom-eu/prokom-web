import { plural } from '../plural'

const WARSAW_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DAY_MS = 86_400_000

/** Calendar day in Poland as a UTC midnight timestamp, so days subtract exactly. */
function warsawDay(date: Date): number {
  return Date.parse(`${WARSAW_DAY.format(date)}T00:00:00Z`)
}

/** Calendar day in Poland of a moment, as a UTC midnight timestamp (compare with `Date.parse(day)`). */
export const warsawDayOf = (date: Date): number => warsawDay(date)

/**
 * Whole calendar days in Poland from `now` to `target` (a date or an ISO instant from the
 * panel, read in Polish time). `null` once the day has passed or when the date is invalid.
 */
export function daysUntil(target: string, now: Date): number | null {
  const date = new Date(target)
  if (Number.isNaN(date.getTime())) return null
  const days = Math.round((warsawDay(date) - warsawDay(now)) / DAY_MS)
  return days >= 0 ? days : null
}

export function daysLabel(days: number): string {
  return days === 0 ? 'dziś' : `${days} ${plural(days, ['dzień', 'dni', 'dni'])}`
}
