import { describe, expect, it } from 'vitest'

import { activeSection } from './railActive'

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
