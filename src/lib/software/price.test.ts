import { describe, expect, it } from 'vitest'

import { formatPrice } from './price'

const NBSP = String.fromCharCode(0xa0) // non-breaking space

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
