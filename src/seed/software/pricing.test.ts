import { describe, expect, it } from 'vitest'

import { SW_PRICING_FAQ, softwarePricingLayout, swPricing } from './pricing'

describe('Software /cennik of the seed (SWA4b)', () => {
  it('is the price list block and the 5 price questions', () => {
    const layout = softwarePricingLayout()
    expect(layout.map((block) => block.blockType)).toEqual(['swPricing', 'faq'])
    expect(SW_PRICING_FAQ.items).toHaveLength(5)
    expect(SW_PRICING_FAQ.items?.[1]?.question).toBe('Co oznacza cena „od”?')
  })

  it('holds no price of its own (spec. §1 pkt 1)', () => {
    expect(JSON.stringify(swPricing())).not.toMatch(/\d[\d\s\u00a0]*zł/)
  })
})
