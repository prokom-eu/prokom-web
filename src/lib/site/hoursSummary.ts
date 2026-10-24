import type { OpeningHours } from './hours'

const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const SHORT: Record<(typeof ORDER)[number], string> = {
  mon: 'pn',
  tue: 'wt',
  wed: 'śr',
  thu: 'czw',
  fri: 'pt',
  sat: 'sob',
  sun: 'nd',
}

/** "09:00" → "9:00", as in the design. */
const display = (time: string) => time.replace(/^0(?=\d:)/, '')

/** Days of one row as ranges of consecutive days: ['mon'…'fri'] → "pn–pt". */
function dayRanges(days: string[]): string {
  const indexes = ORDER.flatMap((day, i) => (days.includes(day) ? [i] : []))
  const ranges: [number, number][] = []
  for (const i of indexes) {
    const last = ranges.at(-1)
    if (last && last[1] === i - 1) last[1] = i
    else ranges.push([i, i])
  }
  return ranges
    .map(([from, to]) =>
      from === to ? SHORT[ORDER[from]!] : `${SHORT[ORDER[from]!]}–${SHORT[ORDER[to]!]}`,
    )
    .join(', ')
}

/**
 * Short opening hours of the Biznes home page (facts card, contact panel): "pn–pt 9:00–17:00".
 * Apart from `LocationAddress`, whose long form other lines use (STAN, B3b).
 */
export function hoursSummary(hours: OpeningHours): string {
  return hours
    .map((row) => `${dayRanges(row.days)} ${display(row.opens)}–${display(row.closes)}`)
    .join(' · ')
}
