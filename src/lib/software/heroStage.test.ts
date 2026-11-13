import { describe, expect, it } from 'vitest'

import { RESUME_MS, SLIDE_MS, farJump, jumps, rankOf, stepDistance, stepSlide } from './heroStage'

describe('rankOf — place of a window in the 3D carousel (ZMIANY-v24 §4.1a)', () => {
  it('puts the current slide in the middle, the next on the right, the previous on the left', () => {
    expect(rankOf(0, 0, 7)).toBe('r0')
    expect(rankOf(1, 0, 7)).toBe('r1')
    expect(rankOf(6, 0, 7)).toBe('rl')
  })

  it('keeps the far neighbours behind the edges and hides the rest (SWA14 §1)', () => {
    expect(rankOf(2, 0, 8)).toBe('r2')
    expect(rankOf(6, 0, 8)).toBe('rl2')
    for (const k of [3, 4, 5]) expect(rankOf(k, 0, 8)).toBe('rx')
  })

  it('wraps around both ends', () => {
    expect(rankOf(0, 6, 7)).toBe('r1')
    expect(rankOf(5, 6, 7)).toBe('rl')
    expect(rankOf(6, 6, 7)).toBe('r0')
    expect(rankOf(1, 6, 7)).toBe('r2')
    expect(rankOf(4, 6, 7)).toBe('rl2')
  })

  it('works with a different number of slides from the data', () => {
    expect(rankOf(2, 0, 3)).toBe('rl')
    expect(rankOf(1, 0, 3)).toBe('r1')
    expect(rankOf(0, 0, 1)).toBe('r0')
  })

  it('moves every window one place per step: none goes from a seen place to a hidden one', () => {
    const order = ['rl2', 'rl', 'r0', 'r1', 'r2']
    for (const count of [6, 7, 8, 9]) {
      for (let current = 0; current < count; current += 1) {
        const next = stepSlide(current, 1, count)
        for (let k = 0; k < count; k += 1) {
          const from = rankOf(k, current, count)
          const to = rankOf(k, next, count)
          if (from === 'r0' || from === 'r1' || from === 'rl') {
            // A seen window slides one place to the left, never to `rx`.
            expect(order.indexOf(to)).toBe(order.indexOf(from) - 1)
          }
          if (to === 'r0' || to === 'r1' || to === 'rl') {
            expect(order.indexOf(from)).toBe(order.indexOf(to) + 1)
          }
        }
      }
    }
  })
})

describe('jumps — unseen to unseen without a flight across the stage', () => {
  it('jumps between the far places and the hidden ones, flies between seen ones', () => {
    // 8 slides, 0 → 1: window 6 (rl2) hides, window 3 (rx) comes behind the right edge.
    expect(jumps(6, 0, 1, 8)).toBe(true)
    expect(jumps(3, 0, 1, 8)).toBe(true)
    // Window 2: r2 → r1 comes into sight — a flight.
    expect(jumps(2, 0, 1, 8)).toBe(false)
    // Window 0: r0 → rl.
    expect(jumps(0, 0, 1, 8)).toBe(false)
  })
})

describe('farJump — a tile further than one place away swaps at once (przegląd #4)', () => {
  it('measures the shortest way around the drum', () => {
    expect(stepDistance(0, 1, 8)).toBe(1)
    expect(stepDistance(0, 7, 8)).toBe(-1)
    expect(stepDistance(0, 4, 8)).toBe(4)
    expect(stepDistance(6, 1, 8)).toBe(3)
  })

  it('flies one place, swaps further', () => {
    expect(farJump(0, 1, 8)).toBe(false)
    expect(farJump(0, 7, 8)).toBe(false)
    expect(farJump(0, 2, 8)).toBe(true)
    expect(farJump(3, 3, 8)).toBe(false)
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
