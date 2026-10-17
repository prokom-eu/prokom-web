import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'
import { DARK_THEME_LINES } from '@/lib/brand/theme'
import { LINE_VALUES, type Line } from '@/lib/tenant/lines'

import { darkMediaBlock, findRule, resolve, rule, type Declarations } from './parse-tokens'

// ADR-013: neutral colours per line, a dark theme only for lines designed for it.
type Mode = 'light' | 'dark'

const root = rule(':root')
const darkSelector = (line: Line) => `[data-line='${line}'][data-theme='dark']`
const mediaSelector = (line: Line) => `[data-line='${line}']:not([data-theme='light'])`

/** Every custom property as the browser sees it on `<html>` for a line and theme. */
function scope(line: Line, mode: Mode): Declarations {
  return {
    ...root,
    ...rule(`[data-line='${line}']`),
    ...(mode === 'dark' ? rule(darkSelector(line)) : {}),
  }
}

function hex(token: string, s: Declarations): string {
  const value = resolve(`var(${token})`, s)
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${token} is not #rrggbb: ${value}`)
  return value
}

const TEXT_ON_SURFACES: Array<[string, string[]]> = [
  ['--ink', ['--surface', '--surface-2', '--surface-3', '--card']],
  ['--ink-2', ['--surface', '--surface-2', '--surface-3', '--card']],
  // ADR-013: the third ink only on the main surface and cards (light Biznes: 4.21 on surface-2).
  ['--ink-3', ['--surface', '--card']],
  // ADR-013: small accent text not on surface-3 (dark Biznes: 4.28).
  ['--accent-text', ['--surface', '--surface-2', '--card']],
]

const cases = LINE_VALUES.flatMap((line) =>
  (DARK_THEME_LINES.includes(line) ? (['light', 'dark'] as const) : (['light'] as const)).map(
    (mode) => ({ line, mode }),
  ),
)

describe.each(cases)('$line, $mode theme', ({ line, mode }) => {
  const s = scope(line, mode)

  it.each(TEXT_ON_SURFACES)('%s reaches 4.5:1 on its surfaces', (text, surfaces) => {
    for (const surface of surfaces) {
      expect(
        contrastRatio(hex(text, s), hex(surface, s)),
        `${text} on ${surface}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('button label reaches 4.5:1 on the button', () => {
    expect(contrastRatio(hex('--accent-ink', s), hex('--accent-text', s))).toBeGreaterThanOrEqual(
      4.5,
    )
  })

  it('text and links reach 4.5:1 on dark blocks', () => {
    expect(contrastRatio(hex('--c-white', s), hex('--surface-dark', s))).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(hex('--accent-on-dark', s), hex('--surface-dark', s)),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('accent reaches 3:1 on the surface (large elements)', () => {
    expect(contrastRatio(hex('--accent', s), hex('--surface', s))).toBeGreaterThanOrEqual(3)
  })
})

describe('dark theme definitions', () => {
  it.each([...LINE_VALUES])('%s: dark rules exist only for lines with a dark design', (line) => {
    const media = darkMediaBlock()
    const expected = DARK_THEME_LINES.includes(line)
    expect(findRule(darkSelector(line)) !== null).toBe(expected)
    expect(findRule(mediaSelector(line), media) !== null).toBe(expected)
  })

  it.each([...DARK_THEME_LINES])(
    '%s: the system preference gives the same values as an explicit choice',
    (line) => {
      expect(rule(mediaSelector(line), darkMediaBlock())).toEqual(rule(darkSelector(line)))
    },
  )
})
