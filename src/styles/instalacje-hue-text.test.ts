import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule } from './parse-tokens'

// P1-4 (audit 06.11): eyebrows, chips and legends of Instalacje take the service colour (`--h`,
// set from the panel) mixed with --ink by `--inst-hue-text-mix`. Every hue of the package
// (services `wspolne.json` → HU, objects `obiekty/*.json` → h) must reach WCAG AA (4.5:1) on the
// line's surfaces — plain and tinted with the hue like a chip (14%) — in both themes.
const SEED = new URL('../../seed/prokominstalacje/', import.meta.url)
const read = (path: string) => JSON.parse(readFileSync(fileURLToPath(new URL(path, SEED)), 'utf8'))

const HUES: string[] = [
  ...Object.values(read('wspolne.json').HU as Record<string, string>),
  ...readdirSync(fileURLToPath(new URL('obiekty/', SEED)))
    .map((file) => read(`obiekty/${file}`).h as string | undefined)
    .filter((hue): hue is string => Boolean(hue)),
].map((hue) => hue.toLowerCase())

const light = { ...rule(':root'), ...rule("[data-line='instalacje']") }
const dark = { ...light, ...rule("[data-line='instalacje'][data-theme='dark']") }
const system = {
  ...light,
  ...rule("[data-line='instalacje']:not([data-theme='light'])"),
}

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

/** `color-mix(in srgb, a share, b)` of two `#rrggbb` colours. */
function mix(a: string, b: string, share: number): string {
  const [x, y] = [channels(a), channels(b)]
  return `#${x
    .map((c, i) =>
      Math.round(c * share + y[i]! * (1 - share))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

type Scope = Record<string, string>
const share = (scope: Scope) => parseFloat(resolve('var(--inst-hue-text-mix)', scope)) / 100

function worst(scope: Scope): { ratio: number; hue: string; surface: string } {
  const ink = resolve('var(--ink)', scope)
  const surfaces = ['--surface', '--surface-2', '--card'].map((name) =>
    resolve(`var(${name})`, scope),
  )
  let found = { ratio: Infinity, hue: '', surface: '' }
  for (const hue of HUES) {
    const text = mix(hue, ink, share(scope))
    for (const surface of surfaces) {
      for (const tinted of [surface, mix(hue, surface, 0.14)]) {
        const ratio = contrastRatio(text, tinted)
        if (ratio < found.ratio) found = { ratio, hue, surface: tinted }
      }
    }
  }
  return found
}

describe('service colour in text (--inst-hue-text-mix)', () => {
  it('reads every hue of the package', () => {
    expect(HUES.length).toBeGreaterThanOrEqual(10)
    expect(HUES.every((hue) => /^#[0-9a-f]{6}$/.test(hue))).toBe(true)
  })

  for (const [theme, scope] of [
    ['light', light],
    ['dark (chosen)', dark],
    ['dark (system)', system],
  ] as const) {
    it(`keeps AA for every hue in the ${theme} theme`, () => {
      const result = worst(scope)
      expect(result.ratio, `${result.hue} on ${result.surface}`).toBeGreaterThanOrEqual(4.5)
    })
  }
})
