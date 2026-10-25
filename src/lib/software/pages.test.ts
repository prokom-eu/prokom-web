import { describe, expect, it } from 'vitest'

import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from '../../seed/software/pages'

import {
  inquiryNumberParam,
  notFoundSchema,
  thanksSchema,
  validateNotFound,
  validateThanks,
} from './pages'

// Start texts from the boards `Dziekujemy` and `NieZnaleziono` — what the seed stores (SW3).
const thanks = SOFTWARE_THANKS
const notFound = SOFTWARE_NOT_FOUND

describe('thanks page texts', () => {
  it('accept the texts of the board', () => {
    expect(thanksSchema.safeParse(thanks).error?.issues).toBeUndefined()
  })

  it('reject a mistyped key', () => {
    expect(validateThanks({ ...thanks, titel: 'x' })).toMatch(/^Strona „Dziękujemy”/)
  })

  it('allow at most 3 cards', () => {
    const cards = Array.from({ length: 4 }, () => thanks.more.cards[0])
    expect(validateThanks({ ...thanks, more: { ...thanks.more, cards } })).toMatch(/more\.cards/)
  })
})

describe('404 page texts', () => {
  it('accept the texts of the board', () => {
    expect(notFoundSchema.safeParse(notFound).error?.issues).toBeUndefined()
  })

  it('allow at most 6 tiles', () => {
    const tiles = Array.from({ length: 7 }, () => notFound.places.tiles[0])
    expect(validateNotFound({ ...notFound, places: { ...notFound.places, tiles } })).toMatch(
      /places\.tiles/,
    )
  })

  it('reject an unsafe link', () => {
    const wizard = { ...notFound.wizard, href: 'javascript:alert(1)' }
    expect(validateNotFound({ ...notFound, wizard })).toMatch(/wizard\.href/)
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
