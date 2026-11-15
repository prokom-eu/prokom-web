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

const LONG: Record<(typeof ORDER)[number], string> = {
  mon: 'poniedziałek',
  tue: 'wtorek',
  wed: 'środa',
  thu: 'czwartek',
  fri: 'piątek',
  sat: 'sobota',
  sun: 'niedziela',
}

/** "09:00" → "9:00", as in the design. */
const display = (time: string) => time.replace(/^0(?=\d:)/, '')

/** Days of one row as ranges of consecutive days: ['mon'…'fri'] → "pn–pt". */
function dayRanges(
  days: string[],
  names: Record<(typeof ORDER)[number], string> = SHORT,
  dash = '–',
): string {
  const indexes = ORDER.flatMap((day, i) => (days.includes(day) ? [i] : []))
  const ranges: [number, number][] = []
  for (const i of indexes) {
    const last = ranges.at(-1)
    if (last && last[1] === i - 1) last[1] = i
    else ranges.push([i, i])
  }
  return ranges
    .map(([from, to]) =>
      from === to ? names[ORDER[from]!] : `${names[ORDER[from]!]}${dash}${names[ORDER[to]!]}`,
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

/**
 * Days without opening hours, under the hours of the Software contact card (v23): "sobota
 * i niedziela nieczynne". Empty when every day is open or there are no hours.
 */
export function closedDays(hours: OpeningHours): string {
  if (hours.length === 0) return ''
  const open = new Set(hours.flatMap((row) => row.days))
  const days = ORDER.filter((day) => !open.has(day))
  const closed = days.map((day) => LONG[day])
  if (closed.length === 0) return ''
  if (closed.length === 1) {
    const feminine = days[0] === 'wed' || days[0] === 'sat' || days[0] === 'sun'
    return `${closed[0]} ${feminine ? 'nieczynna' : 'nieczynny'}`
  }
  return `${closed.slice(0, -1).join(', ')} i ${closed.at(-1)} nieczynne`
}

/**
 * Opening hours as the table of the board `Kontakt`: open rows with full day names, then one
 * „nieczynne” row with the remaining days and holidays. „święta” comes from the board, not
 * from the panel — TODO(krystian): [SZEF] potwierdzić (czy zawsze nieczynne w święta).
 */
export function hoursTable(hours: OpeningHours): { days: string; time: string }[] {
  if (hours.length === 0) return []
  const rows = hours.map((row) => ({
    days: dayRanges(row.days, LONG, ' – '),
    time: `${display(row.opens)} – ${display(row.closes)}`,
  }))
  const open = new Set(hours.flatMap((row) => row.days))
  const closed = ORDER.filter((day) => !open.has(day)).map((day) => LONG[day])
  return [...rows, { days: [...closed, 'święta'].join(', '), time: 'nieczynne' }]
}

export type WeekDay = (typeof ORDER)[number]

/**
 * Seven days from Monday with their hours (K4 Kontakt: the week with today marked): the open
 * time of the first row naming the day, „nieczynne” otherwise. The day names start upper-case.
 */
export function weekHours(hours: OpeningHours): { day: WeekDay; name: string; time: string }[] {
  return ORDER.map((day) => {
    const row = hours.find((item) => item.days.includes(day))
    const name = LONG[day].charAt(0).toUpperCase() + LONG[day].slice(1)
    return {
      day,
      name,
      time: row ? `${display(row.opens)}–${display(row.closes)}` : 'nieczynne',
    }
  })
}
