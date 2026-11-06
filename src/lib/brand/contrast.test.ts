import { describe, expect, it } from 'vitest'

import {
  colorStops,
  composite,
  contrastRatio,
  hueAndSaturation,
  relativeLuminance,
} from './contrast'

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

describe('composite', () => {
  it('lays a translucent colour over an opaque background', () => {
    expect(composite('rgba(255, 255, 255, 0.5)', '#000000')).toBe('#808080')
    expect(composite('rgba(255,255,255,.06)', '#0b0d0c')).toBe('#1a1c1b')
  })

  it('returns an opaque colour as it is', () => {
    expect(composite('#9670ee', '#000000')).toBe('#9670ee')
    expect(composite('rgba(150, 112, 238, 1)', '#000000')).toBe('#9670ee')
  })

  it('rejects what it cannot read', () => {
    expect(() => composite('var(--glass)', '#000000')).toThrow()
  })
})

describe('colorStops', () => {
  it('finds every colour in a gradient', () => {
    expect(
      colorStops('linear-gradient(180deg, rgba(255, 255, 255, 0.95), #7b52e0 45%, #a07ef2)'),
    ).toEqual(['rgba(255, 255, 255, 0.95)', '#7b52e0', '#a07ef2'])
  })
})

describe('hueAndSaturation', () => {
  it('gives the HSL hue and saturation in degrees and percent', () => {
    const violet = hueAndSaturation('#9670ee')
    expect(Math.round(violet.hue)).toBe(258)
    expect(Math.round(violet.saturation)).toBe(79)
    expect(hueAndSaturation('rgba(255, 255, 255, 0.35)').saturation).toBe(0)
  })
})
