import { describe, expect, it } from 'vitest'

import { classify } from '../../../scripts/zdjecia-tlo.mjs'

const SIZE = 64

/** A 64×64 RGBA picture: background, and a square product in the middle with an outline. */
function picture(background: number[], product: number[], outline = product) {
  const data = new Uint8Array(SIZE * SIZE * 4)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const inside = x >= 16 && x < 48 && y >= 16 && y < 48
      const edge = inside && (x === 16 || x === 47 || y === 16 || y === 47)
      data.set(edge ? outline : inside ? product : background, (y * SIZE + x) * 4)
    }
  }
  return { data, width: SIZE, height: SIZE }
}

const WHITE = [255, 255, 255, 255]
const CLEAR = [0, 0, 0, 0]
const DARK = [30, 30, 40, 255]

describe('zdjecia-tlo: photos to re-cut (NAPRAWA-0911 §3b)', () => {
  it('an opaque, almost white frame = white background', () => {
    expect(classify(picture(WHITE, DARK))?.problem).toBe('białe tło')
  })

  it('a clean cut-out (transparent background, dark outline) is fine', () => {
    expect(classify(picture(CLEAR, DARK))).toBeNull()
  })

  it('a transparent background with a light outline = halo', () => {
    expect(classify(picture(CLEAR, DARK, WHITE))?.problem).toBe('otoczka')
  })

  it('an opaque coloured background is not reported', () => {
    expect(classify(picture([40, 80, 160, 255], DARK))).toBeNull()
  })
})
