import type { OpeningHours } from './openingStatus'

export type HourTile = { key: 'week' | 'sat' | 'sun'; label: string; value: string; today: boolean }

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri']

/** "09:00" → "9:00", as on the boards. */
const display = (time: string) => time.replace(/^0(?=\d:)/, '')

/** The hours of one day as „9:00–17:00”, or „Zamknięte” when no row covers it. */
function valueFor(hours: OpeningHours, day: string): string {
  const row = hours.find((item) => item.days.includes(day))
  return row ? `${display(row.opens)}–${display(row.closes)}` : 'Zamknięte'
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
