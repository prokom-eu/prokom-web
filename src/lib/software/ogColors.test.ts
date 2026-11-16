import { describe, expect, it } from 'vitest'

import { resolve, rule } from '@/styles/parse-tokens'

import { SOFTWARE_OG_CATEGORIES, SOFTWARE_OG_COVER, softwareOgCategory } from './ogColors'

const software = { ...rule(':root'), ...rule("[data-line='software']") }
const token = (name: string) => resolve(`var(--${name})`, software).toLowerCase()

describe('Software OG colours', () => {
  it('equal the cover tokens', () => {
    for (const [name, value] of Object.entries(SOFTWARE_OG_COVER)) {
      expect(value, name).toBe(token(name))
    }
  })

  it('equal the category tokens', () => {
    for (const [category, { glow, bg, ink }] of Object.entries(SOFTWARE_OG_CATEGORIES)) {
      expect(glow, category).toBe(token(`news-art-${category}`))
      expect(bg, category).toBe(token(`news-art-${category}-bg`))
      expect(ink, category).toBe(token(`news-art-${category}-ink`))
    }
  })

  it('falls back to the guide for an unknown category', () => {
    expect(softwareOgCategory('systemy')).toBe('systemy')
    expect(softwareOgCategory('ksef')).toBe('poradnik')
    expect(softwareOgCategory(null)).toBe('poradnik')
  })
})
