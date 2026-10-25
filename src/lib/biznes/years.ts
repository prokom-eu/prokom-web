import { plural } from '../plural'

export const YEARS_TOKEN = '{lata}'

const WARSAW_YEAR = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric' })

/** Whole calendar years in Poland since `year` (spec. §6.9: „22 lata” counted from 2004). */
export function yearsSince(year: number | null | undefined, now: Date): number | null {
  if (!year) return null
  // The panel's number field takes fractions; a year is whole.
  const years = Number(WARSAW_YEAR.format(now)) - Math.trunc(year)
  return years >= 0 ? years : null
}

/**
 * A text from the panel with `{lata}` replaced by „22 lata” / „25 lat” — so the H1 of `/o-firmie`
 * grows by itself every January. Without the year the token is dropped (never shown raw).
 */
export function withYears(text: string, year: number | null | undefined, now: Date): string {
  if (!text.includes(YEARS_TOKEN)) return text
  const years = yearsSince(year, now)
  if (years === null) {
    const rest = text
      .replaceAll(YEARS_TOKEN, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    return rest.charAt(0).toUpperCase() + rest.slice(1)
  }
  return text.replaceAll(YEARS_TOKEN, `${years} ${plural(years, ['rok', 'lata', 'lat'])}`)
}
