import { describe, expect, it } from 'vitest'

import { dayTiles, hourTiles, weekHours } from './hourTiles'

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

describe('dayTiles (runda 1411, KontaktHero)', () => {
  it('shows seven short days with compact hours, closed days as null', () => {
    const tiles = dayTiles(
      [...HOURS, { days: ['sun'], opens: '10:30', closes: '13:00' }].slice(0, 2),
      'wed',
    )
    expect(tiles.map((tile) => tile.short)).toEqual(['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'])
    expect(tiles.map((tile) => tile.compact)).toEqual([
      '9–17',
      '9–17',
      '9–17',
      '9–17',
      '9–17',
      '9–14',
      null,
    ])
    expect(tiles[6]).toMatchObject({ label: 'Niedziela', value: 'nieczynne', today: false })
    expect(tiles.filter((tile) => tile.today).map((tile) => tile.key)).toEqual(['wed'])
  })

  it('keeps the minutes of a half hour', () => {
    const [monday] = dayTiles([{ days: ['mon'], opens: '08:30', closes: '16:30' }], 'sun')
    expect(monday).toMatchObject({ compact: '8:30–16:30', value: '8:30–16:30' })
  })
})
