import { describe, expect, it } from 'vitest'

import { hourTiles, weekHours } from './hourTiles'

const HOURS = [
  { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' },
  { days: ['sat'], opens: '09:00', closes: '14:00' },
]

describe('hourTiles (spec §6.1 hour tiles)', () => {
  it('shows Pon–Pt, Sobota and Niedziela, a day without a row as „Zamknięte”', () => {
    expect(hourTiles(HOURS, 'tue').map(({ label, value }) => `${label} ${value}`)).toEqual([
      'Pon–Pt 9:00–17:00',
      'Sobota 9:00–14:00',
      'Niedziela Zamknięte',
    ])
  })

  it('marks the tile of today', () => {
    expect(hourTiles(HOURS, 'wed').map((tile) => tile.today)).toEqual([true, false, false])
    expect(hourTiles(HOURS, 'sat').map((tile) => tile.today)).toEqual([false, true, false])
    expect(hourTiles(HOURS, 'sun').map((tile) => tile.today)).toEqual([false, false, true])
  })

  it('with no hours every tile says „Zamknięte”', () => {
    expect(hourTiles([], 'mon').every((tile) => tile.value === 'Zamknięte')).toBe(true)
  })
})

describe('weekHours (Kontakt „week” layout, Web-kontakt)', () => {
  it('lists the seven days from Monday, a day without a row as „nieczynne”', () => {
    expect(weekHours(HOURS, 'tue').map(({ label, value }) => `${label} ${value}`)).toEqual([
      'Poniedziałek 9:00–17:00',
      'Wtorek 9:00–17:00',
      'Środa 9:00–17:00',
      'Czwartek 9:00–17:00',
      'Piątek 9:00–17:00',
      'Sobota 9:00–14:00',
      'Niedziela nieczynne',
    ])
  })

  it('marks only today', () => {
    expect(
      weekHours(HOURS, 'fri')
        .filter((day) => day.today)
        .map((day) => day.key),
    ).toEqual(['fri'])
    expect(weekHours(HOURS, 'sun').findIndex((day) => day.today)).toBe(6)
  })
})
