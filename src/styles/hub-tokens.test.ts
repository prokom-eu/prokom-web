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

// H2-1: buttons in a line's colour with small bold text (domain pills, CTA, tool chips) — the
// ink of the line on its solid fill (`--ln-fill`: the base colour, Gaming `--k-yfill`).
const FILLS = [
  ['--k-bi', '--k-b'],
  ['--k-ii', '--k-i'],
  ['--k-si', '--k-s'],
  ['--k-ti', '--k-t'],
  ['--k-yi', '--k-yfill'],
  ['--k-gi', '--k-g'],
] as const

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('hub line buttons, %s theme', (_mode, scope) => {
  it.each(FILLS)('%s on %s reaches 4.5:1', (ink, fill) => {
    const ratio = contrastRatio(resolve(`var(${ink})`, scope), resolve(`var(${fill})`, scope))
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})

// H2-2/H2-3: cards in a line's own dark colour (`--ln-dark`: plans, help, brands, news) carry the
// line's text colour (labels, numbers) and the page ink (`--k-white`, dark in the light theme).
const LINE_CARDS = [
  ['--k-bt', '--k-bd'],
  ['--k-it', '--k-id'],
  ['--k-st', '--k-sd'],
  ['--k-tt', '--k-td'],
  ['--k-yt', '--k-yd'],
] as const

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('hub line cards, %s theme', (_mode, scope) => {
  it.each(LINE_CARDS)('%s and the page ink reach 4.5:1 on %s', (text, card) => {
    const surface = resolve(`var(${card})`, scope)
    expect(contrastRatio(resolve(`var(${text})`, scope), surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(resolve('var(--k-white)', scope), surface)).toBeGreaterThanOrEqual(4.5)
  })
})
