import { describe, expect, it } from 'vitest'

import { railState } from './rail'

// Sections at these page offsets; the window is 1000 px high (35% line = 350 px below the top).
const SECTIONS = [
  { id: 'start', top: 0 },
  { id: 'dla-kogo', top: 1000 },
  { id: 'uslugi', top: 2000 },
]

describe('railState (common.js → _onS)', () => {
  it('starts on the first section, hidden near the top', () => {
    expect(railState(SECTIONS, 0, 1000)).toEqual({ active: 'start', visible: false })
  })

  it('shows after 400 px', () => {
    expect(railState(SECTIONS, 401, 1000).visible).toBe(true)
    expect(railState(SECTIONS, 400, 1000).visible).toBe(false)
  })

  it('marks the last section whose top is above 35% of the window', () => {
    expect(railState(SECTIONS, 649, 1000).active).toBe('start')
    expect(railState(SECTIONS, 650, 1000).active).toBe('dla-kogo')
    expect(railState(SECTIONS, 1700, 1000).active).toBe('uslugi')
  })

  it('has no active section without sections', () => {
    expect(railState([], 900, 1000)).toEqual({ active: null, visible: true })
  })
})
