import { describe, expect, it } from 'vitest'

import { HUB_INQUIRY_CATEGORIES, isHubInquiryCategory } from './inquiry'

describe('hub inquiry categories (ADR-H002 §3)', () => {
  it('has the six forms of the hub, each fitting the 100-character category field', () => {
    expect(HUB_INQUIRY_CATEGORIES).toHaveLength(6)
    for (const category of HUB_INQUIRY_CATEGORIES) expect(category).toMatch(/^hub-[a-z-]{1,90}$/)
  })

  it('recognises only hub categories', () => {
    expect(isHubInquiryCategory('hub-dostawy')).toBe(true)
    expect(isHubInquiryCategory('Kasy fiskalne')).toBe(false)
    expect(isHubInquiryCategory(null)).toBe(false)
  })
})
