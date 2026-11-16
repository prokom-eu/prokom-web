import { describe, expect, it } from 'vitest'

import { SOFTWARE_OG_CATEGORIES, type SoftwareOgCategory } from '@/lib/software/ogColors'
import { COVER_MOTIFS } from '@/lib/software/postCovers'

import { coverDataUri, coverStyle } from './coverSvg'

const categories = Object.keys(SOFTWARE_OG_CATEGORIES) as SoftwareOgCategory[]

describe('coverStyle', () => {
  it('leaves no CSS variable and draws the accent in the category hue', () => {
    for (const category of categories) {
      const css = coverStyle(category)
      expect(css).not.toContain('var(')
      expect(css).toContain(`.cv-h { fill: ${SOFTWARE_OG_CATEGORIES[category].ink} }`)
    }
  })
})

describe('coverDataUri', () => {
  it('is a standalone SVG with its rules, for every scene', () => {
    for (const motif of COVER_MOTIFS) {
      const uri = coverDataUri(motif, 'systemy', 520, 340)
      expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true)
      const svg = Buffer.from(uri.split(',')[1], 'base64').toString('utf8')
      expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]* width="520"/)
      expect(svg).toMatch(/<style>\s*\.sw-cover \*/)
      expect(svg).toContain('class="cv-')
    }
  })
})
