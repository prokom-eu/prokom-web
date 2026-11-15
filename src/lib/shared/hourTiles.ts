import type { OpeningHours } from './openingStatus'

export type HourTile = { key: 'week' | 'sat' | 'sun'; label: string; value: string; today: boolean }

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri']

/** "09:00" → "9:00", as on the boards. */
const display = (time: string) => time.replace(/^0(?=\d:)/, '')

/** The hours of one day as „9:00–17:00”, or `closed` when no row covers it. */
function valueFor(hours: OpeningHours, day: string, closed = 'Zamknięte'): string {
  const row = hours.find((item) => item.days.includes(day))
  return row ? `${display(row.opens)}–${display(row.closes)}` : closed
}

/**
 * The three hour tiles of the contact hero (spec §6.1 pkt 1): Pon–Pt, Sobota, Niedziela, the one
 * holding `today` (a weekday key in Poland, `warsawWeekday`) marked „dziś”. Pon–Pt shows Monday's
 * hours — the salons keep one row for the working week (seed, panel description).
 */
export function hourTiles(hours: OpeningHours, today: string): HourTile[] {
  return [
    {
      key: 'week',
      label: 'Pon–Pt',
      value: valueFor(hours, 'mon'),
      today: WEEKDAYS.includes(today),
    },
    { key: 'sat', label: 'Sobota', value: valueFor(hours, 'sat'), today: today === 'sat' },
    { key: 'sun', label: 'Niedziela', value: valueFor(hours, 'sun'), today: today === 'sun' },
  ]
}

export type WeekDay = { key: string; label: string; value: string; today: boolean }

const WEEK: readonly (readonly [string, string])[] = [
  ['mon', 'Poniedziałek'],
  ['tue', 'Wtorek'],
  ['wed', 'Środa'],
  ['thu', 'Czwartek'],
  ['fri', 'Piątek'],
  ['sat', 'Sobota'],
  ['sun', 'Niedziela'],
]

/**
 * The seven days of the contact card's „week” layout (Web-kontakt): Monday first, each with its
 * hours or „nieczynne”, `today` (a weekday key in Poland, `warsawWeekday`) marked.
 */
export function weekHours(hours: OpeningHours, today: string): WeekDay[] {
  return WEEK.map(([key, label]) => ({
    key,
    label,
    value: valueFor(hours, key, 'nieczynne'),
    today: key === today,
  }))
}

export type DayTile = {
  key: string
  /** „Pn” … „Nd” — the tile's label. */
  short: string
  /** „Poniedziałek” — for screen readers. */
  label: string
  /** „9–17” on the tile; `null` = closed. */
  compact: string | null
  /** „9:00–17:00” or „nieczynne” — for screen readers. */
  value: string
  today: boolean
}

const SHORT: Record<string, string> = {
  mon: 'Pn',
  tue: 'Wt',
  wed: 'Śr',
  thu: 'Cz',
  fri: 'Pt',
  sat: 'Sb',
  sun: 'Nd',
}

/** "09:00" → "9", "09:30" → "9:30": the short form on a day tile. */
const compactTime = (time: string) => display(time).replace(/:00$/, '')

/**
 * The seven day tiles of the Kontakt card (runda 1411, KontaktHero): „Pn … Nd” with „9–17” or
 * closed, `today` (a weekday key in Poland, `warsawWeekday`) marked. Short enough for seven
 * columns on a 360 px phone; the full value stays for screen readers.
 */
export function dayTiles(hours: OpeningHours, today: string): DayTile[] {
  return WEEK.map(([key, label]) => {
    const row = hours.find((item) => item.days.includes(key))
    return {
      key,
      short: SHORT[key] ?? key,
      label,
      compact: row ? `${compactTime(row.opens)}–${compactTime(row.closes)}` : null,
      value: valueFor(hours, key, 'nieczynne'),
      today: key === today,
    }
  })
}
