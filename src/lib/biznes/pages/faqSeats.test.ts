import { describe, expect, it } from 'vitest'

import { faqSeatsPair } from './faqSeats'

const seats = { blockType: 'bzSection', variant: 'seats' }
const faq = { blockType: 'faq' }
const band = { blockType: 'bzSection', variant: 'band' }

describe('faqSeatsPair (Opieka IT: „Ile masz stanowisk?” next to the FAQ, PREMIUM-1011)', () => {
  it('pairs a FAQ with the seats section right after it', () => {
    const blocks = [faq, seats, band]
    expect(faqSeatsPair(blocks, 0)).toBe('faq')
    expect(faqSeatsPair(blocks, 1)).toBe('seats')
    expect(faqSeatsPair(blocks, 2)).toBeNull()
  })

  it('no pair when they are apart or in the other order', () => {
    expect(faqSeatsPair([faq, band, seats], 0)).toBeNull()
    expect(faqSeatsPair([faq, band, seats], 2)).toBeNull()
    expect(faqSeatsPair([seats, faq], 0)).toBeNull()
  })
})
