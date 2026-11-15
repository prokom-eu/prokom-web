import { describe, expect, it } from 'vitest'

import { priceAt, splitPrice } from './priceTween'

// AUDYT-0811 P2 A10: the wizard's price counts to the new value instead of jumping.
describe('splitPrice', () => {
  it('finds the amount with its thousands separator and keeps the words around it', () => {
    expect(splitPrice('od 2\u00a0490 zł')).toEqual({
      before: 'od ',
      value: 2490,
      after: ' zł',
      separator: '\u00a0',
    })
    expect(splitPrice('od 149 zł / mies.')?.value).toBe(149)
  })

  it('is null for a text without an amount', () => {
    expect(splitPrice('wycena po rozmowie')).toBeNull()
  })
})

describe('priceAt', () => {
  const to = splitPrice('od 12\u00a0900 zł')!

  it('runs from the old amount to the new one and ends on the exact text', () => {
    expect(priceAt(2490, to, 0)).toBe('od 2\u00a0490 zł')
    expect(priceAt(2490, to, 1)).toBe('od 12\u00a0900 zł')
    const half = Number(priceAt(2490, to, 0.5).replace(/\D/g, ''))
    expect(half).toBeGreaterThan(2490)
    expect(half).toBeLessThan(12900)
  })
})
