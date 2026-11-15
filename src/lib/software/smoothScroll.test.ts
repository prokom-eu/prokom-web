import { describe, expect, it } from 'vitest'

import { easeInOutCubic, HEADER_OFFSET, scrollDuration, sectionOffset } from './smoothScroll'

// SWV5 (MOBILE-APLIKACJA §4 pkt 10): the section rail glides with braking (`v23/pkScroll.js`).

describe('scrollDuration', () => {
  it('grows with the distance between 520 and 1100 ms', () => {
    expect(scrollDuration(100)).toBe(520)
    expect(scrollDuration(2000)).toBe(700)
    expect(scrollDuration(-2000)).toBe(700)
    expect(scrollDuration(10000)).toBe(1100)
  })
})

describe('easeInOutCubic', () => {
  it('starts and ends still, half way at the middle', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(0.5)).toBe(0.5)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1)
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9)
  })
})

describe('sectionOffset', () => {
  it('ends where a plain anchor jump would (the section scroll margin)', () => {
    expect(sectionOffset('96px')).toBe(96)
    expect(sectionOffset('0px')).toBe(HEADER_OFFSET)
    expect(sectionOffset('')).toBe(HEADER_OFFSET)
  })
})
