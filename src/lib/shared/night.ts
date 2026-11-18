import { CET_OFFSET_MIN } from './daylight'
import { DAYLIGHT_TABLE } from './daylight.generated'

/**
 * Night in Rabka at `now`, from the table with linear interpolation between the 15ths. The inline
 * script repeats this arithmetic (`themeScript` in `lib/brand/theme.ts`); `theme.test.ts` runs both.
 */
export function isNight(now: Date, table: readonly number[] = DAYLIGHT_TABLE): boolean {
  const cet = new Date(now.getTime() + CET_OFFSET_MIN * 60_000)
  const position = cet.getUTCMonth() + (cet.getUTCDate() - 15) / 30.5
  const index = Math.floor(position)
  const weight = position - index
  const a = ((index + 12) % 12) * 2
  const b = ((index + 13) % 12) * 2
  const minute = cet.getUTCHours() * 60 + cet.getUTCMinutes()
  const sunrise = table[a] + (table[b] - table[a]) * weight
  const sunset = table[a + 1] + (table[b + 1] - table[a + 1]) * weight
  return minute < sunrise || minute >= sunset
}
