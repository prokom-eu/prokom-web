import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule, type Declarations } from './parse-tokens'

// Tokens of the shared elements (spec WSPOLNE-ELEMENTY §3, NAGLOWEK-KAPSULA §4): the line's dark
// band, the header capsule and the page scrollbar — for the three lines with a design.
type Mode = 'light' | 'dark'
const LINES = ['biznes', 'instalacje', 'software'] as const
const cases = LINES.flatMap((line) => (['light', 'dark'] as const).map((mode) => ({ line, mode })))

function scope(line: string, mode: Mode): Declarations {
  return {
    ...rule(':root'),
    ...rule(`[data-line='${line}']`),
    ...(mode === 'dark' ? rule(`[data-line='${line}'][data-theme='dark']`) : {}),
  }
}

type Rgba = [number, number, number, number]

/** `#rrggbb` or `rgba(r, g, b, a)` of a token, resolved through `var()` chains. */
function rgba(token: string, s: Declarations): Rgba {
  const value = resolve(`var(${token})`, s)
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value)
  if (hex) return [...hex.slice(1).map((c) => parseInt(c, 16)), 1] as Rgba
  const fn = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(value)
  if (fn) return fn.slice(1).map(Number) as Rgba
  throw new Error(`${token} is neither #rrggbb nor rgba(): ${value}`)
}

const toHex = ([r, g, b]: Rgba) =>
  `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

/** `top` painted over an opaque `bottom` (alpha compositing). */
function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top[3]
  return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1) as Rgba
}

/** `color-mix(in srgb, a share, b)` of two opaque colours. */
function mix(a: Rgba, b: Rgba, share: number): Rgba {
  return [0, 1, 2].map((i) => a[i] * share + b[i] * (1 - share)).concat(1) as Rgba
}

const ratio = (a: Rgba, b: Rgba) => contrastRatio(toHex(a), toHex(b))

describe.each(LINES)('%s: dark band (role tokens)', (line) => {
  const s = scope(line, 'light')
  const band = rgba('--line-dark', s)

  it('secondary and accent text reach 4.5:1 on the band', () => {
    expect(ratio(rgba('--line-dark-text', s), band)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(rgba('--on-dark-text', s), band)).toBeGreaterThanOrEqual(4.5)
  })

  it('a button on the band reaches 3:1 and its label 4.5:1', () => {
    const button = rgba('--on-dark', s)
    expect(ratio(button, band)).toBeGreaterThanOrEqual(3)
    expect(ratio(rgba('--on-dark-ink', s), button)).toBeGreaterThanOrEqual(4.5)
  })
})

describe.each(cases)('$line, $mode theme: header capsule', ({ line, mode }) => {
  const s = scope(line, mode)
  // The capsule is translucent: what text sits on is the capsule over the page surface.
  const capsule = over(rgba('--cap-bg', s), rgba('--surface', s))

  it('menu links reach 4.5:1 on the capsule', () => {
    expect(ratio(rgba('--nav-ink', s), capsule)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(rgba('--nav-ink-2', s), capsule)).toBeGreaterThanOrEqual(4.5)
  })

  it('the current page pill text reaches 4.5:1 on its pill', () => {
    const pill = over(rgba('--nav-active-bg', s), capsule)
    expect(ratio(rgba('--nav-active-ink', s), pill)).toBeGreaterThanOrEqual(4.5)
  })

  // NAGLOWEK-KAPSULA §4: measured in the middle of the gradient, where the label is (the light
  // top edge of a few pairs is below 4.5:1, but no text sits there).
  it('the action label reaches 4.5:1 in the middle of its gradient', () => {
    const middle = mix(rgba('--cap-cta-from', s), rgba('--cap-cta-to', s), 0.5)
    expect(ratio(rgba('--cap-cta-ink', s), middle)).toBeGreaterThanOrEqual(4.5)
  })
})

describe.each(cases)('$line, $mode theme: opening status', ({ line, mode }) => {
  const s = scope(line, mode)
  const surfaces = ['--surface', '--surface-2', '--card'].map((token) => rgba(token, s))
  const dots = (
    mode === 'light'
      ? ['--status-open', '--status-soon', '--status-closed']
      : ['--status-open', '--status-soon']
  ).map((token) => [token, rgba(token, s)] as const)

  it('state dots reach 3:1 on the surfaces of the bar and cards (WCAG 1.4.11)', () => {
    for (const [token, dot] of dots) {
      for (const surface of surfaces) {
        expect(ratio(dot, surface), token).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('the open pill: dot 3:1 and text 4.5:1 on its tint', () => {
    const pill = over(rgba('--status-open-bg', s), rgba('--surface', s))
    expect(ratio(rgba('--status-open', s), pill)).toBeGreaterThanOrEqual(3)
    expect(ratio(rgba('--ink', s), pill)).toBeGreaterThanOrEqual(4.5)
  })

  it('on the dark band: light dot 3:1 and white text 4.5:1', () => {
    const band = over(rgba('--status-bg-on-dark', s), rgba('--line-dark', s))
    expect(ratio(rgba('--status-open-on-dark', s), band)).toBeGreaterThanOrEqual(3)
    expect(ratio(rgba('--status-ink-on-dark', s), band)).toBeGreaterThanOrEqual(4.5)
  })
})

describe.each(cases)('$line, $mode theme: page scrollbar', ({ line, mode }) => {
  const s = scope(line, mode)

  it('the thumb reaches 3:1 on the track (WCAG 1.4.11)', () => {
    const share = /color-mix\(in srgb, var\(--accent\) (\d+)%, var\(--scrollbar-track\)\)/.exec(
      s['--scrollbar-thumb'],
    )
    expect(share).not.toBeNull()
    const track = rgba('--scrollbar-track', s)
    const thumb = mix(rgba('--accent', s), track, Number(share![1]) / 100)
    expect(ratio(thumb, track)).toBeGreaterThanOrEqual(3)
  })
})
