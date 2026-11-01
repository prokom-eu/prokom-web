import { describe, expect, it } from 'vitest'

import { openingStatus, type OpeningHours, warsawWeekday } from './hours'

const WEEKDAYS: OpeningHours = [
  { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' },
]

// Times in UTC; Warsaw is UTC+2 until 25.10.2026 and UTC+1 after it.
describe('openingStatus', () => {
  it('is open during working hours', () => {
    // Monday 19.10.2026, 10:30 in Warsaw.
    expect(openingStatus(WEEKDAYS, new Date('2026-10-19T08:30:00Z'))).toEqual({
      open: true,
      label: 'Otwarte teraz · do 17:00',
      time: '17:00',
      when: null,
    })
  })

  it('opens today before the opening time', () => {
    // Monday, 7:15 in Warsaw.
    expect(openingStatus(WEEKDAYS, new Date('2026-10-19T05:15:00Z'))).toEqual({
      open: false,
      label: 'Zamknięte · otwieramy dziś o 9:00',
      time: '9:00',
      when: 'dziś',
    })
  })

  it('opens tomorrow after closing on a weekday', () => {
    // Monday, 17:00 in Warsaw — closing time is exclusive.
    expect(openingStatus(WEEKDAYS, new Date('2026-10-19T15:00:00Z'))?.label).toBe(
      'Zamknięte · otwieramy jutro o 9:00',
    )
  })

  it('opens on Monday after closing on Friday and over the weekend', () => {
    // Friday 23.10, 18:00 and Saturday 24.10, 12:00.
    for (const now of ['2026-10-23T16:00:00Z', '2026-10-24T10:00:00Z']) {
      expect(openingStatus(WEEKDAYS, new Date(now))?.label).toBe(
        'Zamknięte · otwieramy w poniedziałek o 9:00',
      )
    }
  })

  it('says "jutro" on Sunday (after the change to winter time)', () => {
    // Sunday 25.10, 12:00 in Warsaw (UTC+1).
    expect(openingStatus(WEEKDAYS, new Date('2026-10-25T11:00:00Z'))?.label).toBe(
      'Zamknięte · otwieramy jutro o 9:00',
    )
  })

  it('uses Warsaw time, not the server time zone (winter time)', () => {
    // Monday 26.10.2026, 8:30 UTC = 9:30 in Warsaw (UTC+1).
    expect(openingStatus(WEEKDAYS, new Date('2026-10-26T08:30:00Z'))?.open).toBe(true)
    // 16:30 UTC = 17:30 in Warsaw.
    expect(openingStatus(WEEKDAYS, new Date('2026-10-26T16:30:00Z'))?.open).toBe(false)
  })

  it('names the weekday with the right preposition', () => {
    const tuesdayOnly: OpeningHours = [{ days: ['tue'], opens: '08:30', closes: '12:00' }]
    // Wednesday 21.10 → next Tuesday.
    expect(openingStatus(tuesdayOnly, new Date('2026-10-21T10:00:00Z'))?.label).toBe(
      'Zamknięte · otwieramy we wtorek o 8:30',
    )
  })

  it('reads several rows (Saturday hours)', () => {
    const hours: OpeningHours = [...WEEKDAYS, { days: ['sat'], opens: '09:00', closes: '13:00' }]
    // Saturday 24.10, 12:00 in Warsaw.
    expect(openingStatus(hours, new Date('2026-10-24T10:00:00Z'))?.label).toBe(
      'Otwarte teraz · do 13:00',
    )
  })

  it('returns null without opening hours or with invalid times', () => {
    expect(openingStatus([], new Date())).toBeNull()
    expect(openingStatus([{ days: ['mon'], opens: 'x', closes: '17:00' }], new Date())).toBeNull()
  })
})

describe('warsawWeekday', () => {
  it('reads the day in Poland, not in UTC', () => {
    // 23:30 UTC on Sunday is already Monday in Warsaw (summer and winter time).
    expect(warsawWeekday(new Date('2026-11-01T23:30:00Z'))).toBe('mon')
    expect(warsawWeekday(new Date('2026-11-02T10:00:00Z'))).toBe('mon')
    expect(warsawWeekday(new Date('2026-11-01T10:00:00Z'))).toBe('sun')
  })
})
