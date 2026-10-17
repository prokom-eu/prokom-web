import { describe, expect, it } from 'vitest'

import { contrastRatio, relativeLuminance } from './contrast'

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBe(1)
  })

  it('accepts lower case', () => {
    expect(relativeLuminance('#ffffff')).toBe(1)
  })

  it('rejects anything but #rrggbb', () => {
    expect(() => relativeLuminance('#fff')).toThrow()
    expect(() => relativeLuminance('rgb(0, 0, 0)')).toThrow()
    expect(() => relativeLuminance('var(--c-grafit)')).toThrow()
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white, in either order', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1 for the same colour', () => {
    expect(contrastRatio('#244FB0', '#244FB0')).toBe(1)
  })

  // Values from the table in docs/marka.md (14.10.2026).
  it('matches the brand book measurements', () => {
    expect(contrastRatio('#244FB0', '#FFFFFF')).toBeCloseTo(7.45, 2)
    expect(contrastRatio('#0093B3', '#FFFFFF')).toBeCloseTo(3.61, 2)
    expect(contrastRatio('#DD8600', '#F4F5F1')).toBeCloseTo(2.56, 2)
  })
})
