import { describe, expect, it } from 'vitest'

import { formatPrice, leadTimeOf, priceFromOf } from './price'

const NBSP = String.fromCharCode(0xa0) // non-breaking space

describe('priceFromOf', () => {
  it('is the lowest price given', () => {
    expect(priceFromOf({ start: 2490, std: 3390, full: 5490 })).toBe(2490)
    expect(priceFromOf({ start: null, std: 3390, full: 1990 })).toBe(1990)
  })

  it('treats 0 as a price, not as missing', () => {
    expect(priceFromOf({ start: 0, std: 990, full: 1990 })).toBe(0)
  })

  it('is null when no price is given', () => {
    expect(priceFromOf({ start: null, std: null, full: null })).toBeNull()
    expect(priceFromOf({})).toBeNull()
    expect(priceFromOf(null)).toBeNull()
    expect(priceFromOf(undefined)).toBeNull()
  })

  it('ignores values that are not prices', () => {
    expect(priceFromOf({ start: Number.NaN, std: -5, full: 1200 })).toBe(1200)
  })
})

describe('leadTimeOf', () => {
  it('is the term of the start size', () => {
    expect(leadTimeOf({ start: '2 tygodnie', std: '3 tygodnie', full: '4–5 tygodni' })).toBe(
      '2 tygodnie',
    )
  })

  it('falls back to the first term given', () => {
    expect(leadTimeOf({ start: null, std: '3 tygodnie', full: '5 tygodni' })).toBe('3 tygodnie')
    expect(leadTimeOf({ start: '  ', std: null, full: '5 tygodni' })).toBe('5 tygodni')
  })

  it('is null when no term is given', () => {
    expect(leadTimeOf({ start: null, std: '', full: null })).toBeNull()
    expect(leadTimeOf(null)).toBeNull()
  })

  it('trims the term', () => {
    expect(leadTimeOf({ start: ' 1 tydzień ' })).toBe('1 tydzień')
  })
})

describe('formatPrice', () => {
  it('groups thousands with a non-breaking space, like the boards', () => {
    expect(formatPrice(999)).toBe('999')
    expect(formatPrice(2990)).toBe(`2${NBSP}990`)
    expect(formatPrice(12990)).toBe(`12${NBSP}990`)
    expect(formatPrice(1250000)).toBe(`1${NBSP}250${NBSP}000`)
  })

  it('keeps grosze when given', () => {
    expect(formatPrice(149.5)).toBe('149,50')
  })

  it('shows 0 as 0', () => {
    expect(formatPrice(0)).toBe('0')
  })
})
