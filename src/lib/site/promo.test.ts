import { describe, expect, it } from 'vitest'

import { isPromoActive, isValidPromoRange } from './promo'

const now = new Date('2026-11-10T12:00:00Z')

describe('isPromoActive', () => {
  it('is active with text and no dates', () => {
    expect(isPromoActive({ text: 'Rabat 10%' }, now)).toBe(true)
  })

  it('is inactive without text', () => {
    expect(isPromoActive({ text: '   ', startsAt: null, endsAt: null }, now)).toBe(false)
    expect(isPromoActive(null, now)).toBe(false)
  })

  it('respects the start date', () => {
    expect(isPromoActive({ text: 'x', startsAt: '2026-11-11T00:00:00Z' }, now)).toBe(false)
    expect(isPromoActive({ text: 'x', startsAt: '2026-11-10T12:00:00Z' }, now)).toBe(true)
  })

  it('respects the end date (inclusive)', () => {
    expect(isPromoActive({ text: 'x', endsAt: '2026-11-09T23:59:59Z' }, now)).toBe(false)
    expect(isPromoActive({ text: 'x', endsAt: '2026-11-10T12:00:00Z' }, now)).toBe(true)
  })

  it('treats an unparsable date as inactive', () => {
    expect(isPromoActive({ text: 'x', startsAt: 'jutro' }, now)).toBe(false)
  })
})

describe('isValidPromoRange', () => {
  it('accepts open ranges and an end after the start', () => {
    expect(isValidPromoRange(null, null)).toBe(true)
    expect(isValidPromoRange('2026-11-01T00:00:00Z', null)).toBe(true)
    expect(isValidPromoRange(null, '2026-11-01T00:00:00Z')).toBe(true)
    expect(isValidPromoRange('2026-11-01T00:00:00Z', '2026-11-30T00:00:00Z')).toBe(true)
  })

  it('rejects an end before or equal to the start', () => {
    expect(isValidPromoRange('2026-11-30T00:00:00Z', '2026-11-01T00:00:00Z')).toBe(false)
    expect(isValidPromoRange('2026-11-01T00:00:00Z', '2026-11-01T00:00:00Z')).toBe(false)
  })
})
