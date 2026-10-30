import { describe, expect, it } from 'vitest'

import { displayPrice } from './price'

const off = { showPrices: false, noPriceText: 'Wycena po wizji lokalnej' }
const on = { ...off, showPrices: true }

describe('displayPrice', () => {
  it('shows the "no price" text while prices are off, even with a price filled in', () => {
    expect(displayPrice('od 1200 zł z montażem', off)).toBe('Wycena po wizji lokalnej')
  })

  it('shows the price when the switch is on and the field holds one', () => {
    expect(displayPrice(' od 1200 zł z montażem ', on)).toBe('od 1200 zł z montażem')
  })

  it('never shows a package marker like [CENA], even with prices on', () => {
    expect(displayPrice('od [CENA] zł', on)).toBe('Wycena po wizji lokalnej')
  })

  it('falls back to the "no price" text for an empty field', () => {
    expect(displayPrice(undefined, on)).toBe('Wycena po wizji lokalnej')
    expect(displayPrice('   ', on)).toBe('Wycena po wizji lokalnej')
  })
})
