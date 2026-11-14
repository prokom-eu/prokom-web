import { describe, expect, it } from 'vitest'

import { AUTOPLAY_IDLE, isRunning, stepIndex } from './autoplay'

describe('autoplay of the home page (spec §8)', () => {
  it('runs only when nothing holds it', () => {
    expect(isRunning(AUTOPLAY_IDLE)).toBe(true)
    for (const key of [
      'hovered',
      'focused',
      'pageHidden',
      'offScreen',
      'reducedMotion',
      'stopped',
    ] as const) {
      expect(isRunning({ ...AUTOPLAY_IDLE, [key]: true }), key).toBe(false)
    }
  })

  it('wraps the index both ways', () => {
    expect(stepIndex(2, 3)).toBe(0)
    expect(stepIndex(0, 3, -1)).toBe(2)
    expect(stepIndex(5, 6, 1)).toBe(0)
    expect(stepIndex(0, 0)).toBe(0)
  })
})
