import { describe, expect, it } from 'vitest'

import { DAYLIGHT_TABLE } from './daylight.generated'
import { buildDaylightTable, RABKA, sunTimes } from './daylight'
import { isNight } from './night'

const minutes = (iso: string) => Date.parse(iso) / 60_000

/**
 * Reference sunrise and sunset for Rabka-Zdrój (49.61° N, 19.96° E), UTC.
 * Source: sunrise-sunset.org API (`/json?lat=49.61&lng=19.96&date=…&formatted=0`), read 18.11.2026.
 * Polish time: 21.06 04:33 / 20:51 CEST, 21.12 07:34 / 15:42 CET, 30.03 06:21 / 19:08 CEST,
 * 26.10 06:19 / 16:29 CET.
 */
const REFERENCE = [
  { date: '2026-06-21', sunrise: '2026-06-21T02:32:46Z', sunset: '2026-06-21T18:51:10Z' },
  { date: '2026-12-21', sunrise: '2026-12-21T06:34:05Z', sunset: '2026-12-21T14:42:17Z' },
  { date: '2026-03-30', sunrise: '2026-03-30T04:21:08Z', sunset: '2026-03-30T17:08:06Z' },
  { date: '2026-10-26', sunrise: '2026-10-26T05:19:05Z', sunset: '2026-10-26T15:29:09Z' },
]

describe('sunTimes (NOAA) for Rabka-Zdrój', () => {
  it.each(REFERENCE)('$date matches the reference within 3 minutes', (ref) => {
    const { sunrise, sunset } = sunTimes(new Date(`${ref.date}T12:00:00Z`), RABKA)
    expect(Math.abs(sunrise.getTime() / 60_000 - minutes(ref.sunrise))).toBeLessThanOrEqual(3)
    expect(Math.abs(sunset.getTime() / 60_000 - minutes(ref.sunset))).toBeLessThanOrEqual(3)
  })
})

describe('DAYLIGHT_TABLE', () => {
  it('is the committed output of buildDaylightTable (run `node scripts/daylight-table.ts`)', () => {
    expect(DAYLIGHT_TABLE).toEqual(buildDaylightTable())
  })

  it('has sunrise before sunset for each of the 12 months', () => {
    expect(DAYLIGHT_TABLE).toHaveLength(24)
    for (let m = 0; m < 12; m++)
      expect(DAYLIGHT_TABLE[2 * m]).toBeLessThan(DAYLIGHT_TABLE[2 * m + 1])
  })

  // The table with interpolation stays within ±10 minutes of the full formula (spec §2.2) on every
  // day of the year — checked a minute after sunrise and a minute before sunset is day, and
  // 11 minutes either side the opposite.
  it('gives night and day within 10 minutes of sunTimes every day of the year', () => {
    for (let day = 0; day < 365; day++) {
      const noon = new Date(Date.UTC(2026, 0, 1 + day, 12))
      const { sunrise, sunset } = sunTimes(noon, RABKA)
      const at = (d: Date, shift: number) => new Date(d.getTime() + shift * 60_000)
      expect(isNight(at(sunrise, 11)), `${noon.toISOString()} after sunrise`).toBe(false)
      expect(isNight(at(sunset, -11)), `${noon.toISOString()} before sunset`).toBe(false)
      expect(isNight(at(sunrise, -11)), `${noon.toISOString()} before sunrise`).toBe(true)
      expect(isNight(at(sunset, 11)), `${noon.toISOString()} after sunset`).toBe(true)
    }
  })
})

describe('isNight — Polish time, whatever the computer’s time zone', () => {
  it.each([
    ['2026-11-18T21:00:00Z', true], // 22:00 in Warsaw
    ['2026-11-18T11:00:00Z', false], // 12:00
    ['2026-06-21T19:30:00Z', true], // 21:30 CEST, after the 20:51 sunset
    ['2026-06-21T18:30:00Z', false], // 20:30 CEST
    ['2026-12-21T06:00:00Z', true], // 07:00 CET, before the 07:34 sunrise
  ] as const)('%s → night: %s', (iso, night) => {
    expect(isNight(new Date(iso))).toBe(night)
  })
})
