/**
 * Opening status of the shared elements (spec §5 `OpeningStatus`): open, closing soon (≤ 30 min)
 * or closed with the next opening — in Polish time, with holidays from the panel. Pure and
 * without project imports, so it can be copied to `prokom-system` with the components.
 * The lines' own status (`lib/site/hours.ts`) stays until they move to the shared bar (D3).
 */

export type OpeningHours = { days: string[]; opens: string; closes: string }[]

export type OpeningState = 'open' | 'soon' | 'closed'

export type OpeningStatusResult = { state: OpeningState; label: string }

const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

/** "w poniedziałek", "we wtorek"… — the form after "otwieramy". */
const ON_DAY = [
  'w niedzielę',
  'w poniedziałek',
  'we wtorek',
  'w środę',
  'w czwartek',
  'w piątek',
  'w sobotę',
]

/** Minutes before closing from which the status says „Zamykamy za N min”. */
export const CLOSING_SOON_MINUTES = 30

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

const minutesOf = (time: string): number | null => {
  const match = TIME.exec(time)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

/** "09:00" → "9:00", as in the design. */
const display = (time: string) => time.replace(/^0(?=\d:)/, '')

// `sv-SE` gives YYYY-MM-DD; the weekday comes from that date, so both agree with Warsaw.
const warsawParts = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function warsawNow(now: Date): { date: string; minutes: number } {
  const parts = Object.fromEntries(warsawParts.formatToParts(now).map((p) => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

/** The calendar date `offset` days after `date` (YYYY-MM-DD) and its weekday (0 = Sunday). */
function dayAfter(date: string, offset: number): { date: string; weekday: number } {
  const day = new Date(`${date}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() + offset)
  return { date: day.toISOString().slice(0, 10), weekday: day.getUTCDay() }
}

/**
 * Status at `now`. `holidays` are closed days (`YYYY-MM-DD`, Warsaw). `null` without valid hours —
 * no status rather than a wrong one.
 */
export function openingStatus(
  hours: OpeningHours,
  holidays: readonly string[],
  now: Date,
): OpeningStatusResult | null {
  const rows = hours.flatMap(({ days, opens, closes }) => {
    const from = minutesOf(opens)
    const to = minutesOf(closes)
    return from === null || to === null || from >= to ? [] : [{ days, opens, closes, from, to }]
  })
  if (rows.length === 0 || rows.length !== hours.length) return null

  const closed = new Set(holidays)
  const today = warsawNow(now)
  const rowsOn = ({ date, weekday }: { date: string; weekday: number }) =>
    closed.has(date) ? [] : rows.filter((row) => row.days.includes(WEEK[weekday]!))

  const current = rowsOn(dayAfter(today.date, 0)).find(
    (row) => row.from <= today.minutes && today.minutes < row.to,
  )
  if (current) {
    const left = current.to - today.minutes
    const until = `do ${display(current.closes)}`
    return left <= CLOSING_SOON_MINUTES
      ? { state: 'soon', label: `Zamykamy za ${left} min · ${until}` }
      : { state: 'open', label: `Otwarte · ${until}` }
  }

  // Two weeks: enough for a run of holidays (Christmas, Easter) after a weekend.
  for (let offset = 0; offset < 14; offset++) {
    const day = dayAfter(today.date, offset)
    const next = rowsOn(day)
      .filter((row) => offset > 0 || row.from > today.minutes)
      .sort((a, b) => a.from - b.from)[0]
    if (next) {
      const when = offset === 0 ? 'dziś' : offset === 1 ? 'jutro' : ON_DAY[day.weekday]
      return { state: 'closed', label: `Zamknięte · otwieramy ${when} o ${display(next.opens)}` }
    }
  }
  return null
}
