import { describe, expect, it } from 'vitest'

import { SOLUTION_CATEGORIES } from '../../lib/software/options'
import { solutionsToImport } from './map'
import { PRICING_FEATURED_SLUG, SW_PRICING_FAQ, softwarePricingLayout, swPricing } from './pricing'

describe('Software /cennik of the seed (SW11a)', () => {
  it('is the price list block and the 5 price questions', () => {
    const layout = softwarePricingLayout(7)
    expect(layout.map((block) => block.blockType)).toEqual(['swPricing', 'faq'])
    expect(SW_PRICING_FAQ.items).toHaveLength(5)
    expect(SW_PRICING_FAQ.items?.[1]?.question).toBe('Co oznacza cena „od”?')
  })

  it('names all 5 tabs of the board and holds no price of its own (spec. §1 pkt 1)', () => {
    const block = swPricing(null)
    expect(block.tabs?.map((tab) => tab.category)).toEqual(
      SOLUTION_CATEGORIES.map(({ value }) => value),
    )
    expect(JSON.stringify(block)).not.toMatch(/\d[\d\s\u00a0]*zł/)
  })

  it('features a solution of the package', () => {
    expect(solutionsToImport().some((item) => item.slug === PRICING_FEATURED_SLUG)).toBe(true)
    expect(swPricing(7).featured).toBe(7)
  })
})
