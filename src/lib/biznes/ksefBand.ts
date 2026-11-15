// The KSeF band of the Biznes home page (plan 0611 §7.1 pkt 7): the countdown to the deadline
// from the panel (`SiteSettings → Biznes → KSeF`), in Polish time. Pure functions, so the server
// (which version of the text) and the browser (the ticking numbers) count the same way.

const ZONE = 'Europe/Warsaw'

const WALL = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const WORDS = new Intl.DateTimeFormat('pl-PL', {
  timeZone: ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function parse(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Polish wall clock of a moment as a UTC timestamp (its distance to the moment = the offset). */
function wallClock(date: Date): number {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    WALL.formatToParts(date).find((item) => item.type === type)?.value ?? '00'
  return Date.parse(
    `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}Z`,
  )
}

/**
 * The instant the deadline day starts in Poland: the panel's date (a day or an instant) read as
 * its Polish calendar day. `null` for an invalid date. (Poland changes the clock at 2:00/3:00,
 * never at midnight, so the offset of the day's start is the offset at that midnight.)
 */
export function warsawMidnight(deadline: string): number | null {
  const date = parse(deadline)
  if (!date) return null
  const day = new Date(wallClock(date)).toISOString().slice(0, 10)
  const utcMidnight = Date.parse(`${day}T00:00:00Z`)
  return utcMidnight - (wallClock(new Date(utcMidnight)) - utcMidnight)
}

/** Whole minutes left to the deadline (rounded up), or `null` from the deadline day on. */
export function minutesLeft(deadline: string, now: Date): number | null {
  const start = warsawMidnight(deadline)
  if (start === null) return null
  const left = Math.ceil((start - now.getTime()) / 60_000)
  return left > 0 ? left : null
}

export function splitMinutes(total: number): { days: number; hours: number; minutes: number } {
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60,
  }
}

/** „before” = countdown and the text before; „after” = from the deadline day on (K36 §3). */
export function ksefPhase(deadline: string, now: Date): 'before' | 'after' {
  return minutesLeft(deadline, now) === null ? 'after' : 'before'
}

/** The deadline in words, „1 stycznia 2027”, or `null` for an invalid date. */
export function deadlineText(deadline: string): string | null {
  const date = parse(deadline)
  return date ? WORDS.format(date) : null
}
