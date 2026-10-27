import { describe, expect, it } from 'vitest'

import { cardPrice } from './cardPrice'
import { DEFAULT_PRICE_DISPLAY, type IndexSolution } from './solutionsIndex'

const NBSP = ' '
const base = {
  prices: {},
  leadTimes: {},
  priceMonthly: false,
  sizeNames: {},
  priceFrom: null,
  leadTime: null,
} satisfies Partial<IndexSolution>

const solution = (patch: Partial<IndexSolution>) => ({ ...base, ...patch })

describe('cardPrice', () => {
  it('„od” the lowest price, split around the amount, and the start term', () => {
    const price = cardPrice(
      solution({
        prices: { start: 2490, std: 3390, full: 5490 },
        leadTimes: { start: '2 tygodnie', std: '3 tygodnie', full: '4–5 tygodni' },
        priceFrom: 2490,
        leadTime: '2 tygodnie',
      }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price.head).toEqual({ before: 'od', amount: `2${NBSP}490`, after: 'zł netto' })
    expect(price.term).toBe('Na start: 2 tygodnie')
    expect(price.versions).toEqual([
      { size: 'start', name: 'Na start', price: `2${NBSP}490 zł`, term: '2 tygodnie' },
      { size: 'std', name: 'Standard', price: `3${NBSP}390 zł`, term: '3 tygodnie' },
      { size: 'full', name: 'Pełna', price: `5${NBSP}490 zł`, term: '4–5 tygodni' },
    ])
    expect(price.ask).toBe(false)
  })

  it('no price: ask for a quote, the term fallback, no versions', () => {
    const price = cardPrice(solution({}), DEFAULT_PRICE_DISPLAY)
    expect(price).toEqual({
      head: { before: '', amount: 'Zapytaj o wycenę', after: '' },
      term: 'po krótkiej rozmowie',
      versions: [],
      ask: true,
    })
  })

  it('monthly prices with the version names of the panel', () => {
    const price = cardPrice(
      solution({
        prices: { start: 149, std: 299, full: 790 },
        priceMonthly: true,
        sizeNames: { start: 'Podstawowa', std: 'Standard', full: 'Systemy' },
        priceFrom: 149,
      }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price.head).toEqual({ before: 'od', amount: '149', after: 'zł / mies.' })
    expect(price.versions.map((version) => [version.name, version.price])).toEqual([
      ['Podstawowa', '149 zł / mies.'],
      ['Standard', '299 zł / mies.'],
      ['Systemy', '790 zł / mies.'],
    ])
    // No term given: the fallback, not an empty line.
    expect(price.term).toBe('po krótkiej rozmowie')
  })

  it('0 is a price — free, not „ask for a quote”', () => {
    const price = cardPrice(
      solution({
        prices: { start: 0, std: 990 },
        leadTimes: { start: '2 dni robocze' },
        priceFrom: 0,
        leadTime: '2 dni robocze',
      }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price.head).toEqual({ before: '', amount: '0', after: 'zł' })
    expect(price.ask).toBe(false)
    expect(price.versions[0]).toEqual({
      size: 'start',
      name: 'Na start',
      price: '0 zł',
      term: '2 dni robocze',
    })
    expect(price.versions[1]).toEqual({
      size: 'std',
      name: 'Standard',
      price: `990 zł`,
      term: null,
    })
  })

  it('a version without a price but with a term still shows, priced by the fallback', () => {
    const price = cardPrice(
      solution({ prices: { start: 999 }, leadTimes: { full: '6 tygodni' }, priceFrom: 999 }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price.versions).toEqual([
      { size: 'start', name: 'Na start', price: '999 zł', term: null },
      { size: 'full', name: 'Pełna', price: 'Zapytaj o wycenę', term: '6 tygodni' },
    ])
  })

  it('the term names the size it belongs to', () => {
    const price = cardPrice(
      solution({ leadTimes: { std: '3 tygodnie' }, leadTime: '3 tygodnie' }),
      DEFAULT_PRICE_DISPLAY,
    )
    expect(price.term).toBe('Standard: 3 tygodnie')
  })

  it('follows the templates of the panel', () => {
    const price = cardPrice(solution({ prices: { start: 999 }, priceFrom: 999 }), {
      ...DEFAULT_PRICE_DISPLAY,
      templateFrom: 'już od {cena} zł',
      fallback: 'Cena po rozmowie',
    })
    expect(price.head).toEqual({ before: 'już od', amount: '999', after: 'zł' })
    expect(
      cardPrice(solution({}), { ...DEFAULT_PRICE_DISPLAY, fallback: 'Cena po rozmowie' }).head
        .amount,
    ).toBe('Cena po rozmowie')
  })
})
