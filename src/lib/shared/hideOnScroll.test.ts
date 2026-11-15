import { describe, expect, it } from 'vitest'

import { nextHidden } from './hideOnScroll'

const base = { lastY: 200, hidden: false, narrow: true, paused: false }

describe('nextHidden (NAGLOWEK-KAPSULA §5)', () => {
  it('hides on a scroll down past the threshold, shows again on a scroll up', () => {
    expect(nextHidden({ ...base, y: 220 })).toEqual({ hidden: true, lastY: 220 })
    expect(nextHidden({ ...base, hidden: true, y: 180 })).toEqual({ hidden: false, lastY: 180 })
  })

  it('ignores small moves and keeps the reference point', () => {
    expect(nextHidden({ ...base, y: 205 })).toEqual({ hidden: false, lastY: 200 })
    expect(nextHidden({ ...base, hidden: true, y: 195 })).toEqual({ hidden: true, lastY: 200 })
  })

  it('never hides near the top, on wide screens or while a sheet is open', () => {
    expect(nextHidden({ ...base, lastY: 40, y: 80 }).hidden).toBe(false)
    expect(nextHidden({ ...base, narrow: false, y: 400 }).hidden).toBe(false)
    expect(nextHidden({ ...base, paused: true, hidden: true, y: 400 }).hidden).toBe(false)
  })
})
