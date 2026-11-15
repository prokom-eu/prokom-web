import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule } from './parse-tokens'

// I3: the CTA band and the footer of the Instalacje shell are dark in both themes (pk.css v4.2),
// so their text colours are checked once, on their own surfaces (WCAG AA, 4.5:1).
const scope = { ...rule(':root'), ...rule("[data-line='instalacje']") }
const hex = (token: string) => resolve(`var(${token})`, scope)

const PAIRS: Array<[text: string, surface: string]> = [
  ['--inst-band-ink', '--inst-band'],
  ['--inst-band-lead', '--inst-band'],
  ['--inst-band-note', '--inst-band'],
  ['--inst-band-phone', '--inst-band'],
  ['--inst-band-button-ink', '--inst-band-button'],
  ['--inst-foot-ink', '--inst-foot-top'],
  ['--inst-foot-text', '--inst-foot-top'],
  ['--inst-foot-ink-2', '--inst-foot-top'],
  ['--inst-foot-accent', '--inst-foot-top'],
  ['--inst-foot-chip', '--inst-foot-top'],
  ['--inst-foot-chip-2', '--inst-foot-top'],
  // The plan card: dark ink on the turquoise card (white of the design gives 2.4:1).
  ['--inst-band-button-ink', '--inst-foot-cta-from'],
  ['--inst-band-button-ink', '--inst-foot-cta-to'],
]

describe('Instalacje shell colours', () => {
  it.each(PAIRS)('%s on %s ≥ 4.5:1', (text, surface) => {
    expect(contrastRatio(hex(text), hex(surface))).toBeGreaterThanOrEqual(4.5)
  })
})
