import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { recolorThumb, THUMB_COLORS } from '../../../scripts/software-thumbs.mjs'

// SWV1 (ADR-015 v23 pkt 6): thumbnails of solutions on papier, not on category pastels.

const SAMPLE = `<svg><linearGradient id='g'><stop offset='0' stop-color='#E6EEFC'/><stop offset='1' stop-color='#CCDCF8'/></linearGradient><rect fill='url(#g)'/><circle cx='250' cy='14' r='70' fill='#7EA6E6' opacity='.16'/><rect fill='#2F68BE'/><circle r='8' fill='#7EA6E6'/></svg>`

describe('recolorThumb', () => {
  it('puts the background stops and the big circle on papier', () => {
    const out = recolorThumb(SAMPLE)
    expect(out).toContain("stop-color='#F2F3EF'")
    expect(out).toContain("stop-color='#E3E6DE'")
    expect(out).toContain("r='70' fill='#B9B0D6'")
  })

  it('leaves the mock-up inside the thumbnail alone', () => {
    const out = recolorThumb(SAMPLE)
    expect(out).toContain("fill='#2F68BE'")
    expect(out).toContain("r='8' fill='#7EA6E6'")
  })

  it('is idempotent', () => {
    const once = recolorThumb(SAMPLE)
    expect(recolorThumb(once)).toBe(once)
  })
})

describe('public/software/rozwiazania', () => {
  it('has no old category colour in any background', () => {
    const dir = join('public', 'software', 'rozwiazania')
    const files = readdirSync(dir).filter((file) => file.endsWith('.svg'))
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      const svg = readFileSync(join(dir, file), 'utf8')
      expect(recolorThumb(svg), file).toBe(svg)
    }
    expect(Object.keys(THUMB_COLORS)).toHaveLength(15)
  })
})
