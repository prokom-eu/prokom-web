import { describe, expect, it } from 'vitest'

import { formatPrice, keepTogether } from './price'

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

describe('keepTogether', () => {
  it('binds „od”, „w”, „do” to the number and the number to its unit', () => {
    expect(keepTogether(`od 2${NBSP}490 zł netto`)).toBe(`od${NBSP}2${NBSP}490${NBSP}zł netto`)
    expect(keepTogether('od 2 tygodni')).toBe(`od${NBSP}2${NBSP}tygodni`)
    expect(keepTogether('wycena w 5–7 dni')).toBe(`wycena w${NBSP}5–7${NBSP}dni`)
    expect(keepTogether('od 149 zł / mies.')).toBe(`od${NBSP}149${NBSP}zł / mies.`)
  })

  it('keeps „60 s” of the wizard button on one line (audyt P1 #13)', () => {
    expect(keepTogether('Dobierz w 60 s')).toBe(`Dobierz w${NBSP}60${NBSP}s`)
    expect(keepTogether('2 sklepy')).toBe('2 sklepy')
  })

  it('leaves other spaces alone', () => {
    expect(keepTogether('Zapytaj o wycenę')).toBe('Zapytaj o wycenę')
    expect(keepTogether('po krótkiej rozmowie')).toBe('po krótkiej rozmowie')
  })
})
