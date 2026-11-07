import { describe, expect, it } from 'vitest'

import { contourPath } from './contours'

describe('contourPath (spec §5 Contours)', () => {
  it('is the same on every call — no randomness (server and browser agree)', () => {
    expect(contourPath()).toBe(contourPath())
  })

  it('draws 13 closed rings around (1090, 330)', () => {
    const path = contourPath()
    expect(path.match(/Z/g)).toHaveLength(13)
    // The first point of ring 1: θ = 0, r = 104 · (1 + 0.075·sin 0.7 + 0.045·sin −1.1), x scaled 1.3.
    const r = 104 * (1 + 0.075 * Math.sin(0.7) + 0.045 * Math.sin(-1.1))
    expect(path.startsWith(`M${Math.round(1090 + r * 1.3)} 330`)).toBe(true)
  })

  it('stays small enough for a hero (spec §9: under 60 KB)', () => {
    expect(contourPath().length).toBeLessThan(20_000)
  })
})
