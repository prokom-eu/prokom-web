import { describe, expect, it } from 'vitest'

import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from '../../seed/software/pages'

import {
  inquiryNumberParam,
  notFoundSchema,
  thanksSchema,
  validateNotFound,
  validateThanks,
} from './pages'

// Start texts from the boards `AU-dziekujemy` and `AU-404` (v24) — what the seed stores.
const thanks = SOFTWARE_THANKS
const notFound = SOFTWARE_NOT_FOUND

describe('thanks page texts (v24)', () => {
  it('accept the texts of the board', () => {
    expect(thanksSchema.safeParse(thanks).error?.issues).toBeUndefined()
  })

  it('reject a mistyped key', () => {
    expect(validateThanks({ ...thanks, titel: 'x' })).toMatch(/^Strona „Dziękujemy”/)
  })

  it('have one to three steps, each with a title', () => {
    expect(validateThanks({ ...thanks, steps: [] })).toMatch(/steps/)
    const steps = Array.from({ length: 4 }, () => thanks.steps[0])
    expect(validateThanks({ ...thanks, steps })).toMatch(/steps/)
    expect(validateThanks({ ...thanks, steps: [{ text: 'bez tytułu' }] })).toMatch(/steps/)
  })

  it('reject the v23 shape (stored before SWA6), so the page asks for new texts', () => {
    expect(validateThanks({ ...thanks, more: { eyebrow: 'x', title: 'y', cards: [] } })).toMatch(
      /^Strona „Dziękujemy”/,
    )
  })

  it('reject an unsafe link in the buttons', () => {
    const actions = [{ label: 'x', href: 'javascript:alert(1)' }]
    expect(validateThanks({ ...thanks, actions })).toMatch(/actions/)
  })
})

describe('404 page texts (v24)', () => {
  it('accept the texts of the board', () => {
    expect(notFoundSchema.safeParse(notFound).error?.issues).toBeUndefined()
  })

  it('allow at most 6 tiles', () => {
    const tiles = Array.from({ length: 7 }, () => notFound.tiles[0])
    expect(validateNotFound({ ...notFound, tiles })).toMatch(/tiles/)
  })

  it('reject an unsafe link', () => {
    const tiles = [{ ...notFound.tiles[0], href: 'javascript:alert(1)' }]
    expect(validateNotFound({ ...notFound, tiles })).toMatch(/tiles/)
  })
})

describe('inquiryNumberParam', () => {
  it('takes a Software inquiry number', () => {
    expect(inquiryNumberParam('PKS-2026-0142')).toBe('PKS-2026-0142')
    expect(inquiryNumberParam('PKS-2026-1234567')).toBe('PKS-2026-1234567')
    expect(inquiryNumberParam(['PKS-2026-0001', 'PKS-2026-0002'])).toBe('PKS-2026-0001')
  })

  it('ignores anything else, so the page never echoes the address', () => {
    for (const value of [undefined, '', 'PKB-2026-0142', 'PKS-2026-01', '<b>PKS-2026-0142</b>']) {
      expect(inquiryNumberParam(value)).toBeNull()
    }
  })
})
