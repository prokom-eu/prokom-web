/**
 * Sunrise and sunset in Rabka-Zdrój for the „Auto” theme (ADR-028, MOTYW-PASEK-LINII §2.2): night
 * there → dark theme. No geolocation and nothing sent anywhere: our visitors are from Podhale.
 *
 * No imports, so `scripts/daylight-table.ts` can run it with Node; `isNight` reads the table.
 */
export const RABKA = { lat: 49.61, lng: 19.96 } as const

/** Minutes added to sunrise and taken from sunset before „night” ends/starts (spec §2.2). */
export const NIGHT_OFFSET_MIN = 0

/**
 * The table and the inline script work in Central European *standard* time (UTC+1) all year: night
 * is astronomical, so a fixed offset avoids the summer-time jump without `Intl`.
 */
export const CET_OFFSET_MIN = 60

const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/**
 * Sunrise and sunset (instants) on the UTC calendar day of `date` — NOAA solar calculator
 * equations (https://gml.noaa.gov/grad/solcalc/calcdetails.html), accurate to about a minute at our
 * latitude. Sun's upper limb with refraction: zenith 90.833°.
 */
export function sunTimes(
  date: Date,
  place: { lat: number; lng: number } = RABKA,
): { sunrise: Date; sunset: Date } {
  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const julianDay = (dayStart + 43_200_000) / 86_400_000 + 2_440_587.5
  const t = (julianDay - 2_451_545) / 36_525

  const meanLong = (280.46646 + t * (36_000.76983 + t * 0.0003032)) % 360
  const meanAnomaly = 357.52911 + t * (35_999.05029 - 0.0001537 * t)
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
  const m = rad(meanAnomaly)
  const centre =
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289
  const omega = rad(125.04 - 1934.136 * t)
  const apparentLong = rad(meanLong + centre - 0.00569 - 0.00478 * Math.sin(omega))
  const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60
  const obliquity = rad(meanObliquity + 0.00256 * Math.cos(omega))
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(apparentLong))

  const y = Math.tan(obliquity / 2) ** 2
  const l0 = rad(meanLong)
  const equationOfTime =
    4 *
    deg(
      y * Math.sin(2 * l0) -
        2 * eccentricity * Math.sin(m) +
        4 * eccentricity * y * Math.sin(m) * Math.cos(2 * l0) -
        0.5 * y * y * Math.sin(4 * l0) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * m),
    )

  const lat = rad(place.lat)
  const hourAngle = deg(
    Math.acos(
      Math.cos(rad(90.833)) / (Math.cos(lat) * Math.cos(declination)) -
        Math.tan(lat) * Math.tan(declination),
    ),
  )
  const noonMin = 720 - 4 * place.lng - equationOfTime
  const at = (min: number) => new Date(dayStart + min * 60_000)
  return { sunrise: at(noonMin - 4 * hourAngle), sunset: at(noonMin + 4 * hourAngle) }
}

/**
 * 24 numbers for the inline script: for each month, sunrise and sunset on the 15th as minutes of
 * the day in UTC+1, with `NIGHT_OFFSET_MIN` applied. Output committed as `daylight.generated.ts`.
 */
export function buildDaylightTable(year = 2026): number[] {
  const table: number[] = []
  for (let month = 0; month < 12; month++) {
    const { sunrise, sunset } = sunTimes(new Date(Date.UTC(year, month, 15, 12)))
    const cet = (d: Date) => Math.round(d.getUTCHours() * 60 + d.getUTCMinutes() + CET_OFFSET_MIN)
    table.push(cet(sunrise) + NIGHT_OFFSET_MIN, cet(sunset) - NIGHT_OFFSET_MIN)
  }
  return table
}
