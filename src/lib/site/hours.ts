/** Opening hours of one branch, as in `CompanyData.locations[].hours`. */
export type OpeningHours = { days: string[]; opens: string; closes: string }[]

export type OpeningStatus = { open: boolean; label: string }

const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

/** "w poniedziałek", "we wtorek"… — the form after "otwieramy". */
const ON_DAY: Record<(typeof WEEK)[number], string> = {
  sun: 'w niedzielę',
  mon: 'w poniedziałek',
  tue: 'we wtorek',
  wed: 'w środę',
  thu: 'w czwartek',
  fri: 'w piątek',
  sat: 'w sobotę',
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

const minutesOf = (time: string): number | null => {
  const match = TIME.exec(time)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

/** "09:00" → "9:00", as in the design. */
const display = (time: string) => time.replace(/^0(?=\d:)/, '')

const warsawClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Warsaw',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Weekday index (0 = Sunday) and minutes since midnight in Warsaw — never the server's zone. */
function warsawNow(now: Date): { day: number; minutes: number } {
  const parts = Object.fromEntries(warsawClock.formatToParts(now).map((p) => [p.type, p.value]))
  const day = WEEK.indexOf(String(parts.weekday).toLowerCase().slice(0, 3) as (typeof WEEK)[number])
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

/**
 * Live status for the top bar (spec. §3.1): "Otwarte teraz · do 17:00" or "Zamknięte ·
 * otwieramy dziś|jutro|w poniedziałek o 9:00". `null` without valid hours — the bar then
 * shows no status rather than a wrong one.
 */
export function openingStatus(hours: OpeningHours, now: Date): OpeningStatus | null {
  const rows = hours.flatMap(({ days, opens, closes }) => {
    const from = minutesOf(opens)
    const to = minutesOf(closes)
    return from === null || to === null || from >= to ? [] : [{ days, opens, closes, from, to }]
  })
  if (rows.length === 0 || rows.length !== hours.length) return null

  const { day, minutes } = warsawNow(now)
  const rowsOn = (weekday: number) => rows.filter((row) => row.days.includes(WEEK[weekday]!))

  const current = rowsOn(day).find((row) => row.from <= minutes && minutes < row.to)
  if (current) return { open: true, label: `Otwarte teraz · do ${display(current.closes)}` }

  for (let offset = 0; offset < 7; offset++) {
    const weekday = (day + offset) % 7
    const next = rowsOn(weekday)
      .filter((row) => offset > 0 || row.from > minutes)
      .sort((a, b) => a.from - b.from)[0]
    if (next) {
      const when = offset === 0 ? 'dziś' : offset === 1 ? 'jutro' : ON_DAY[WEEK[weekday]!]
      return { open: false, label: `Zamknięte · otwieramy ${when} o ${display(next.opens)}` }
    }
  }
  return null
}
