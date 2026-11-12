import { describe, expect, it } from 'vitest'

import { FOLD_HIT, foldHitBox } from './foldHit'

const BUTTON = 52

describe('foldHitBox', () => {
  it('is 120 px above the button when no control crosses its edges', () => {
    expect(foldHitBox([], BUTTON)).toEqual({ above: FOLD_HIT, below: 0 })
    expect(foldHitBox([{ top: -300, bottom: -200 }], BUTTON)).toEqual({
      above: FOLD_HIT,
      below: 0,
    })
    // 30 px of the question above the zone: enough to tap.
    expect(foldHitBox([{ top: -150, bottom: -90 }], BUTTON).above).toBe(FOLD_HIT)
  })

  it('takes the whole control when only a sliver would stay above it', () => {
    expect(foldHitBox([{ top: -137.7, bottom: -60 }], BUTTON).above).toBe(139)
  })

  it('grows again when taking one control cuts the next one up', () => {
    const controls = [
      { top: -155, bottom: -138 },
      { top: -137.7, bottom: -60 },
    ]
    expect(foldHitBox(controls, BUTTON).above).toBe(156)
  })

  it('reaches under the button as far as a control cut by the fold (audit 10.11)', () => {
    // The question starts 18 px above the button and its box ends 64 px below its top.
    expect(foldHitBox([{ top: -18, bottom: 64 }], BUTTON).below).toBe(65)
    // Cut by the edge but ending beside the button: the zone spans the whole button.
    expect(foldHitBox([{ top: -8, bottom: 49 }], BUTTON).below).toBe(BUTTON)
    // Controls of the unfolded part further down do not count.
    expect(foldHitBox([{ top: 74, bottom: 155 }], BUTTON).below).toBe(0)
  })
})
