import { describe, expect, it } from 'vitest'

import { smoothPath } from './LineMocks'

describe('smoothPath', () => {
  it('runs from the first to the last point, with y measured from the bottom', () => {
    const d = smoothPath([0, 0.5, 1], 200, 100)
    expect(d.startsWith('M0.0 100.0')).toBe(true)
    expect(d.endsWith('200.0 0.0')).toBe(true)
    expect(d.match(/C/g)).toHaveLength(2)
  })

  it('gives no path for fewer than two points', () => {
    expect(smoothPath([0.4], 100, 100)).toBe('')
  })
})
