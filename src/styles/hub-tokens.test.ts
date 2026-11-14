import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule } from './parse-tokens'

// pro-kom.eu (H1-2): the text colour of each line (mega menu, sheet, cards) on the hub's cards
// and surfaces, in both themes — small bold text, so 4.5:1 (WCAG 1.4.3).
const root = rule(':root')
const light = { ...root, ...rule("[data-line='prokom']") }
const dark = { ...light, ...rule("[data-line='prokom'][data-theme='dark']") }

const LINE_TEXTS = ['--k-gt', '--k-bt', '--k-it', '--k-st', '--k-tt', '--k-yt']
const SURFACES = ['--k-card', '--k-bg', '--k-bg2']

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('hub line texts, %s theme', (_mode, scope) => {
  it.each(LINE_TEXTS)('%s reaches 4.5:1 on the cards and surfaces', (text) => {
    for (const surface of SURFACES) {
      const ratio = contrastRatio(resolve(`var(${text})`, scope), resolve(`var(${surface})`, scope))
      expect(ratio, `${text} on ${surface}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})
