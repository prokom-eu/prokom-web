import { describe, expect, it } from 'vitest'

import { daysLabel, daysUntil } from './days'

describe('daysUntil', () => {
  it('counts calendar days in Poland, not 24-hour periods', () => {
    // 23:30 in Warsaw on 31.12 is still the day before 1.01.
    expect(daysUntil('2027-01-01', new Date('2026-12-31T22:30:00Z'))).toBe(1)
    // 00:30 in Warsaw on 1.01 (still 31.12 in UTC) is the day itself.
    expect(daysUntil('2027-01-01', new Date('2026-12-31T23:30:00Z'))).toBe(0)
  })

  it('accepts a full ISO date from the panel', () => {
    expect(daysUntil('2027-01-01T00:00:00.000Z', new Date('2026-10-23T10:00:00Z'))).toBe(70)
  })

  it('is null after the date and for an invalid date', () => {
    expect(daysUntil('2027-01-01', new Date('2027-01-02T10:00:00Z'))).toBeNull()
    expect(daysUntil('nie-data', new Date())).toBeNull()
  })
})

describe('daysLabel', () => {
  it('uses the Polish plural', () => {
    expect(daysLabel(1)).toBe('1 dzień')
    expect(daysLabel(2)).toBe('2 dni')
    expect(daysLabel(70)).toBe('70 dni')
    expect(daysLabel(0)).toBe('dziś')
  })
})
