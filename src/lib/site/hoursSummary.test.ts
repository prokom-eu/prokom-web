import { describe, expect, it } from 'vitest'

import { hoursSummary } from './hoursSummary'

describe('hoursSummary', () => {
  it('joins consecutive days into a range, as in the design', () => {
    expect(
      hoursSummary([
        { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' },
      ]),
    ).toBe('pn–pt 9:00–17:00')
  })

  it('lists several rows and single days', () => {
    expect(
      hoursSummary([
        { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '08:00', closes: '16:00' },
        { days: ['sat'], opens: '09:00', closes: '13:00' },
      ]),
    ).toBe('pn–pt 8:00–16:00 · sob 9:00–13:00')
  })

  it('keeps days that are not consecutive apart', () => {
    expect(hoursSummary([{ days: ['mon', 'wed', 'thu'], opens: '10:00', closes: '12:30' }])).toBe(
      'pn, śr–czw 10:00–12:30',
    )
  })

  it('is empty without hours', () => {
    expect(hoursSummary([])).toBe('')
  })
})
