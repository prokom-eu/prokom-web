import { describe, expect, it } from 'vitest'

import {
  DOWNTIME_DEFAULTS,
  HOURS_OPTIONS,
  OUTAGES,
  REVENUE_RANGE,
  downtimeCost,
  formatZl,
  outageHours,
  revenueShare,
} from './downtime'

describe('downtime calculator (spec. §6.4 pkt 3)', () => {
  it('starts as on the board: 5 000 zł a day, 10 h, a whole day down', () => {
    expect(DOWNTIME_DEFAULTS).toEqual({ revenue: 5_000, hoursPerDay: 10, outage: 'day' })
    expect(downtimeCost(DOWNTIME_DEFAULTS)).toEqual({ perHour: 500, total: 5_000 })
  })

  it('offers the board inputs', () => {
    expect(REVENUE_RANGE).toEqual({ min: 500, max: 30_000, step: 500 })
    expect(HOURS_OPTIONS).toEqual([6, 8, 10, 12, 14])
    expect(OUTAGES.map((outage) => outage.label)).toEqual([
      '2 godziny',
      'Pół dnia',
      'Cały dzień',
      'Weekend',
    ])
  })

  it('counts the outage in working hours: 2 h, half a day, a day, a weekend = two days', () => {
    expect(outageHours('2h', 10)).toBe(2)
    expect(outageHours('half', 10)).toBe(5)
    expect(outageHours('day', 10)).toBe(10)
    expect(outageHours('weekend', 10)).toBe(20)
    expect(outageHours('half', 14)).toBe(7)
  })

  it('hour cost = revenue ÷ hours; failure cost = hour cost × outage hours', () => {
    expect(downtimeCost({ revenue: 12_000, hoursPerDay: 8, outage: '2h' })).toEqual({
      perHour: 1_500,
      total: 3_000,
    })
    expect(downtimeCost({ revenue: 30_000, hoursPerDay: 6, outage: 'weekend' })).toEqual({
      perHour: 5_000,
      total: 60_000,
    })
  })

  it('rounds to whole złoty only at the end', () => {
    // 5000 / 12 = 416.67 per hour; 2 h = 833.33, not 2 × 417.
    expect(downtimeCost({ revenue: 5_000, hoursPerDay: 12, outage: '2h' })).toEqual({
      perHour: 417,
      total: 833,
    })
  })

  it('formats złoty with a non-breaking space between thousands', () => {
    expect(formatZl(500)).toBe('500')
    expect(formatZl(5_000)).toBe('5 000')
    expect(formatZl(60_000)).toBe('60 000')
    expect(formatZl(1_234_567)).toBe('1 234 567')
  })

  it('places the slider fill between the ends of the range', () => {
    expect(revenueShare(500)).toBe(0)
    expect(revenueShare(30_000)).toBe(100)
    expect(revenueShare(15_250)).toBe(50)
  })
})
