import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'
import { LINE_VALUES } from '@/lib/tenant/lines'

import { rule } from './parse-tokens'

const root = rule(':root')

function color(token: string): string {
  const value = root[token]
  if (!value) throw new Error(`Missing ${token} in :root`)
  // Prettier writes hex colours in lower case; the brand book uses upper case.
  return value.toUpperCase()
}

const WHITE = color('--c-white')
const PAPIER = color('--c-papier')
const GRAFIT = color('--c-grafit')

// All six lines of the brand book, also the ones without a site in this repo yet.
const BRAND_LINES = ['prokom', 'biznes', 'instalacje', 'software', 'tech', 'zakopane']

describe('brand colours (docs/marka.md)', () => {
  it('keeps the brand book values', () => {
    expect(color('--c-biznes')).toBe('#244FB0')
    expect(color('--c-instalacje')).toBe('#0093B3')
    expect(color('--c-software')).toBe('#8B61E3')
    expect(color('--c-prokom')).toBe('#45A02C')
    expect(GRAFIT).toBe('#121613')
    expect(PAPIER).toBe('#F4F5F1')
  })

  it.each(BRAND_LINES)('%s: text colour reaches 4.5:1 on white and papier', (line) => {
    const text = color(`--c-${line}-text`)
    expect(contrastRatio(text, WHITE)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(text, PAPIER)).toBeGreaterThanOrEqual(4.5)
  })

  // Lines with a site here only: Zakopane's amber stays below 3:1 even for large elements
  // (docs/marka.md), so its headings would need the text colour too.
  it.each([...LINE_VALUES])('%s: brand colour reaches 3:1 on white (large elements)', (line) => {
    expect(contrastRatio(color(`--c-${line}`), WHITE)).toBeGreaterThanOrEqual(3)
  })

  it.each(BRAND_LINES)('%s: on-dark colour reaches 4.5:1 on grafit', (line) => {
    expect(contrastRatio(color(`--c-${line}-on-dark`), GRAFIT)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('data-line → --accent* (ADR-007)', () => {
  const accents = (line: string) => ({
    '--accent': `var(--c-${line})`,
    '--accent-on-dark': `var(--c-${line}-on-dark)`,
    '--accent-text': `var(--c-${line}-text)`,
  })

  it.each([...LINE_VALUES])('maps the %s line', (line) => {
    expect(rule(`[data-line='${line}']`)).toMatchObject(accents(line))
  })

  it('defaults to the main PRO-KOM line without the attribute (unknown domain)', () => {
    expect(root).toMatchObject(accents('prokom'))
  })
})
