import { describe, expect, it } from 'vitest'

import { activeSection, railLineEnd, railProgress } from './railActive'

// SWV6 A2: the section rail marks the section the visitor is reading.

const SECTIONS = [
  { id: 'start', top: -1200 },
  { id: 'popularne', top: -400 },
  { id: 'proces', top: 300 },
  { id: 'kontakt', top: 1400 },
]

describe('activeSection', () => {
  it('is the last section whose top has passed 40% of the screen', () => {
    // 40% of 900 px = 360: „Proces” (top 300) has passed it, „Kontakt” not yet.
    expect(activeSection(SECTIONS, 900, false)).toBe('proces')
    expect(activeSection(SECTIONS, 600, false)).toBe('popularne')
  })

  it('is the first section above all of them and the last one at the bottom of the page', () => {
    expect(
      activeSection(
        [
          { id: 'a', top: 500 },
          { id: 'b', top: 900 },
        ],
        900,
        false,
      ),
    ).toBe('a')
    expect(activeSection(SECTIONS, 900, true)).toBe('kontakt')
  })

  it('has nothing to mark without sections', () => {
    expect(activeSection([], 900, false)).toBeNull()
  })
})

// AUDYT-0811 #8: the progress line runs along the section list and its end points at the section
// being read, moving on towards the next entry as the visitor reads through it.
describe('railProgress', () => {
  it('is the index of the section being read plus the share of it already read', () => {
    // Line at 360 px. „Proces” (top 300) passed it by 60 px of its 1100 px to „Kontakt”.
    expect(railProgress([-1200, -400, 300, 1400], 900, false)).toBeCloseTo(2 + 60 / 1100)
  })

  it('stays at 0 before the first section reaches the line and ends on the last one', () => {
    expect(railProgress([500, 900], 900, false)).toBe(0)
    expect(railProgress([-2000, -900], 900, false)).toBe(1)
    expect(railProgress([-900, 200], 900, true)).toBe(1)
    expect(railProgress([], 900, false)).toBe(0)
  })
})

describe('railLineEnd', () => {
  const centers = [22, 68, 114, 160]

  it('turns the progress into a share of the line from the first to the last entry centre', () => {
    expect(railLineEnd(0, centers)).toBe(0)
    expect(railLineEnd(3, centers)).toBe(1)
    // Half way from entry 2 (114) to entry 3 (160) = 137, of 22…160.
    expect(railLineEnd(2.5, centers)).toBeCloseTo((137 - 22) / 138)
  })

  it('is 0 for a list of one entry or none', () => {
    expect(railLineEnd(0, [22])).toBe(0)
    expect(railLineEnd(1, [])).toBe(0)
  })
})
