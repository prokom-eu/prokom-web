import { describe, expect, it } from 'vitest'

import { openingStatus } from './openingStatus'

// Spec §5 `OpeningStatus`, §10 pkt 3: Europe/Warsaw, frozen times. 2026-11-09 is a Monday;
// November is CET (UTC+1), so 10:00 in Rabka = 09:00Z.
const HOURS = [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }]
const at = (iso: string) => new Date(iso)

describe('openingStatus', () => {
  it('Monday 10:00 → open until 17:00', () => {
    expect(openingStatus(HOURS, [], at('2026-11-09T09:00:00Z'))).toEqual({
      state: 'open',
      label: 'Otwarte · do 17:00',
    })
  })

  it('Monday 16:40 → closing in 20 minutes', () => {
    expect(openingStatus(HOURS, [], at('2026-11-09T15:40:00Z'))).toEqual({
      state: 'soon',
      label: 'Zamykamy za 20 min · do 17:00',
    })
  })

  it('30 minutes before closing is already „soon”, 31 is still open', () => {
    expect(openingStatus(HOURS, [], at('2026-11-09T15:30:00Z'))?.state).toBe('soon')
    expect(openingStatus(HOURS, [], at('2026-11-09T15:29:00Z'))?.state).toBe('open')
  })

  it('Saturday 10:00 → closed, opens on Monday', () => {
    expect(openingStatus(HOURS, [], at('2026-11-14T09:00:00Z'))).toEqual({
      state: 'closed',
      label: 'Zamknięte · otwieramy w poniedziałek o 9:00',
    })
  })

  it('Monday 8:00 → opens today; Monday 18:00 → opens tomorrow', () => {
    expect(openingStatus(HOURS, [], at('2026-11-09T07:00:00Z'))?.label).toBe(
      'Zamknięte · otwieramy dziś o 9:00',
    )
    expect(openingStatus(HOURS, [], at('2026-11-09T17:00:00Z'))?.label).toBe(
      'Zamknięte · otwieramy jutro o 9:00',
    )
  })

  it('a holiday is closed and skipped when looking for the next opening', () => {
    // Wednesday 11.11 (Independence Day) at 10:00, and Tuesday evening before it.
    const holidays = ['2026-11-11']
    expect(openingStatus(HOURS, holidays, at('2026-11-11T09:00:00Z'))).toEqual({
      state: 'closed',
      label: 'Zamknięte · otwieramy jutro o 9:00',
    })
    expect(openingStatus(HOURS, holidays, at('2026-11-10T18:00:00Z'))?.label).toBe(
      'Zamknięte · otwieramy w czwartek o 9:00',
    )
  })

  it('counts days in Warsaw, not in UTC (summer time: 23:30Z on Sunday is Monday 1:30)', () => {
    expect(openingStatus(HOURS, [], at('2026-07-05T23:30:00Z'))?.label).toBe(
      'Zamknięte · otwieramy dziś o 9:00',
    )
  })

  it('no valid hours → null (no status rather than a wrong one)', () => {
    expect(openingStatus([], [], at('2026-11-09T09:00:00Z'))).toBeNull()
    expect(
      openingStatus([{ days: ['mon'], opens: '9', closes: '17:00' }], [], at('2026-11-09T09:00Z')),
    ).toBeNull()
  })
})
