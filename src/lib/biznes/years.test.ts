import { describe, expect, it } from 'vitest'

import { withYears, yearsSince } from './years'

const NOW = new Date('2026-10-25T09:00:00.000Z')

describe('yearsSince', () => {
  it('counts whole calendar years in Poland', () => {
    expect(yearsSince(2004, NOW)).toBe(22)
    // 31.12.2026 23:30 UTC is already 2027 in Poland.
    expect(yearsSince(2004, new Date('2026-12-31T23:30:00.000Z'))).toBe(23)
  })

  it('takes the whole year of a fraction typed in the panel', () => {
    expect(yearsSince(2004.5, NOW)).toBe(22)
  })

  it('is null for a missing or future year', () => {
    expect(yearsSince(null, NOW)).toBeNull()
    expect(yearsSince(2030, NOW)).toBeNull()
  })
})

describe('withYears', () => {
  it('puts the years with the Polish plural in place of {lata}', () => {
    expect(withYears('{lata} na Podhalu.', 2004, NOW)).toBe('22 lata na Podhalu.')
    expect(withYears('{lata} na Podhalu.', 2001, NOW)).toBe('25 lat na Podhalu.')
    expect(withYears('{lata} z nami', 2025, NOW)).toBe('1 rok z nami')
  })

  it('leaves a text without the token as it is', () => {
    expect(withYears('O firmie', 2004, NOW)).toBe('O firmie')
  })

  it('drops the token rather than showing it when the year is missing', () => {
    expect(withYears('{lata} na Podhalu.', null, NOW)).toBe('Na Podhalu.')
    expect(withYears('Od {lata} z nami', null, NOW)).toBe('Od z nami')
  })
})
