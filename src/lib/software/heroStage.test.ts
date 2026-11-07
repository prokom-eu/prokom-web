import { describe, expect, it } from 'vitest'

import { RESUME_MS, SLIDE_MS, rankOf, stepSlide } from './heroStage'

describe('rankOf — place of a window in the 3D carousel (ZMIANY-v24 §4.1a)', () => {
  it('puts the current slide in the middle, the next on the right, the previous on the left', () => {
    expect(rankOf(0, 0, 7)).toBe('r0')
    expect(rankOf(1, 0, 7)).toBe('r1')
    expect(rankOf(6, 0, 7)).toBe('rl')
  })

  it('hides the rest', () => {
    for (const k of [2, 3, 4, 5]) expect(rankOf(k, 0, 7)).toBe('rx')
  })

  it('wraps around both ends', () => {
    expect(rankOf(0, 6, 7)).toBe('r1')
    expect(rankOf(5, 6, 7)).toBe('rl')
    expect(rankOf(6, 6, 7)).toBe('r0')
  })

  it('works with a different number of slides from the data', () => {
    expect(rankOf(2, 0, 3)).toBe('rl')
    expect(rankOf(1, 0, 3)).toBe('r1')
    expect(rankOf(0, 0, 1)).toBe('r0')
  })
})

describe('stepSlide', () => {
  it('moves forward and back with wrap-around', () => {
    expect(stepSlide(0, 1, 7)).toBe(1)
    expect(stepSlide(6, 1, 7)).toBe(0)
    expect(stepSlide(0, -1, 7)).toBe(6)
  })
})

describe('clock', () => {
  it('changes every 4.2 s and comes back 12 s after the last touch', () => {
    expect(SLIDE_MS).toBe(4200)
    expect(RESUME_MS).toBe(12000)
  })
})
