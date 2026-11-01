import { describe, expect, it } from 'vitest'

import { activeSlide } from './carousel'

describe('activeSlide (audyt 01.11 P1 #23–#24)', () => {
  // Card starts relative to the scroller's left padding edge after scrolling.
  it('is the card whose start is nearest the left edge', () => {
    expect(activeSlide([0, 300, 600], false)).toBe(0)
    expect(activeSlide([-280, 20, 320], false)).toBe(1)
    expect(activeSlide([-560, -260, 40], false)).toBe(2)
  })

  it('is the last card once the row is scrolled to the end', () => {
    expect(activeSlide([-400, -100, 200], true)).toBe(2)
  })

  it('is 0 for an empty row', () => {
    expect(activeSlide([], false)).toBe(0)
  })
})
