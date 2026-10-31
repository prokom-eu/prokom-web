import { describe, expect, it } from 'vitest'

import { cardPrice } from './cardPrice'
import { DEFAULT_PRICE_DISPLAY, type IndexSolution } from './solutionsIndex'

const NBSP = String.fromCharCode(0xa0) // non-breaking space
const base = {
  priceMonthly: false,
  priceFrom: null,
  leadTime: null,
} satisfies Partial<IndexSolution>

const solution = (patch: Partial<IndexSolution>) => ({ ...base, ...patch })

describe('cardPrice', () => {
  it('one „od” price split around the amount, and the „od” term as stored', () => {
    const price = cardPrice(
      solution({ priceFrom: 2490, leadTime: 'od 2 tygodni' }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price).toEqual({
      head: { before: 'od', amount: `2${NBSP}490`, after: 'zł netto' },
      term: 'od 2 tygodni',
      ask: false,
    })
  })

  it('no price: ask for a quote and the term fallback', () => {
    expect(cardPrice(solution({}), DEFAULT_PRICE_DISPLAY)).toEqual({
      head: { before: '', amount: 'Zapytaj o wycenę', after: '' },
      term: 'po krótkiej rozmowie',
      ask: true,
    })
  })

  it('a monthly price (care) reads per month', () => {
    const price = cardPrice(solution({ priceFrom: 149, priceMonthly: true }), DEFAULT_PRICE_DISPLAY)
    expect(price.head).toEqual({ before: 'od', amount: '149', after: 'zł / mies.' })
    expect(price.term).toBe('po krótkiej rozmowie')
  })

  it('0 is a price — free, not „ask for a quote”', () => {
    const price = cardPrice(
      solution({ priceFrom: 0, leadTime: '2 dni robocze' }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price.head).toEqual({ before: '', amount: '0', after: 'zł' })
    expect(price.term).toBe('2 dni robocze')
    expect(price.ask).toBe(false)
  })

  it('follows the templates of the panel', () => {
    const price = cardPrice(solution({ priceFrom: 999 }), {
      ...DEFAULT_PRICE_DISPLAY,
      template: 'już od {cena} zł',
      termFallback: 'termin po rozmowie',
    })
    expect(price.head).toEqual({ before: 'już od', amount: '999', after: 'zł' })
    expect(price.term).toBe('termin po rozmowie')
  })
})
