import { describe, expect, it } from 'vitest'

import { deadlineText, ksefPhase, minutesLeft, splitMinutes, warsawMidnight } from './ksefBand'

describe('warsawMidnight', () => {
  it('is the start of the deadline day in Polish time (winter: UTC+1)', () => {
    expect(new Date(warsawMidnight('2027-01-01')!).toISOString()).toBe('2026-12-31T23:00:00.000Z')
  })

  it('reads an instant from the panel as its Polish calendar day', () => {
    // The panel's date picker may store noon UTC or the evening before in UTC.
    expect(warsawMidnight('2027-01-01T12:00:00.000Z')).toBe(warsawMidnight('2027-01-01'))
    expect(warsawMidnight('2026-12-31T23:00:00.000Z')).toBe(warsawMidnight('2027-01-01'))
  })

  it('summer time: UTC+2', () => {
    expect(new Date(warsawMidnight('2026-07-01')!).toISOString()).toBe('2026-06-30T22:00:00.000Z')
  })

  it('null for an invalid date', () => {
    expect(warsawMidnight('nie-data')).toBeNull()
  })
})

describe('minutesLeft', () => {
  it('whole minutes to the Polish midnight of the deadline', () => {
    expect(minutesLeft('2027-01-01', new Date('2026-12-31T22:00:00.000Z'))).toBe(60)
    expect(minutesLeft('2027-01-01', new Date('2026-12-31T22:59:30.000Z'))).toBe(1)
  })

  it('null from the deadline day on (the „after” version)', () => {
    expect(minutesLeft('2027-01-01', new Date('2026-12-31T23:00:00.000Z'))).toBeNull()
    expect(minutesLeft('2027-01-01', new Date('2027-03-01T10:00:00.000Z'))).toBeNull()
  })

  it('null for an invalid date', () => {
    expect(minutesLeft('', new Date())).toBeNull()
  })
})

describe('splitMinutes', () => {
  it('days, hours and minutes', () => {
    expect(splitMinutes(2 * 1440 + 3 * 60 + 4)).toEqual({ days: 2, hours: 3, minutes: 4 })
    expect(splitMinutes(59)).toEqual({ days: 0, hours: 0, minutes: 59 })
  })
})

describe('ksefPhase', () => {
  it('before the deadline day, after from that day on', () => {
    expect(ksefPhase('2027-01-01', new Date('2026-11-08T10:00:00.000Z'))).toBe('before')
    expect(ksefPhase('2027-01-01', new Date('2026-12-31T23:00:00.000Z'))).toBe('after')
  })
})

describe('deadlineText', () => {
  it('the Polish date in words', () => {
    expect(deadlineText('2027-01-01')).toBe('1 stycznia 2027')
    expect(deadlineText('2026-12-31T23:00:00.000Z')).toBe('1 stycznia 2027')
  })

  it('null for an invalid date', () => {
    expect(deadlineText('x')).toBeNull()
  })
})
