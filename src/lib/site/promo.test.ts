import { describe, expect, it } from 'vitest'

import {
  isPromoActive,
  isPromoForLine,
  isValidPromoRange,
  PROMO_CLOSED_KEY,
  promoClosedScript,
} from './promo'

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

describe('isPromoForLine', () => {
  it('shows on every line when no line is chosen', () => {
    expect(isPromoForLine([], 'software')).toBe(true)
    expect(isPromoForLine(null, 'instalacje')).toBe(true)
  })

  // ADR-012, rozstrzygnięcie 3: a Biznes campaign must not show on Instalacje or Software.
  it('shows only on the chosen lines', () => {
    expect(isPromoForLine(['biznes'], 'biznes')).toBe(true)
    expect(isPromoForLine(['biznes'], 'instalacje')).toBe(false)
    expect(isPromoForLine(['biznes', 'software'], 'software')).toBe(true)
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

describe('promoClosedScript', () => {
  it('hides the bar before paint when this campaign was closed', () => {
    const script = promoClosedScript('kasy-2026')
    expect(script).toContain(`localStorage.getItem("${PROMO_CLOSED_KEY}")==="kasy-2026"`)
    expect(script).toContain('data-sz-closed')
  })

  // The id comes from the panel, read with `overrideAccess`: never trusted inside a script.
  it.each([null, '', 'Kasy 2026', '"</script><script>alert(1)//'])(
    'gives no script for id %j (the bar cannot be closed)',
    (id) => {
      expect(promoClosedScript(id)).toBeNull()
    },
  )
})
