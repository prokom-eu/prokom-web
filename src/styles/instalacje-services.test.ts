import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule, tokensCss } from './parse-tokens'

// I4: text colours of the service pages (meter, spectrum, switches, multiplex tags) on their own
// surfaces, in both themes (WCAG AA, 4.5:1). Tinted surfaces (`rgba`) are laid over the card.
const light = { ...rule(':root'), ...rule("[data-line='instalacje']") }
const dark = { ...light, ...rule("[data-line='instalacje'][data-theme='dark']") }

const RGBA = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/

/** A `#rrggbb` or an `rgba()` laid over `base` (`#rrggbb`). */
function over(color: string, base: string): string {
  const m = RGBA.exec(color)
  if (!m) return color
  const alpha = Number(m[4])
  const channels = [1, 2, 3].map((i) => {
    const top = Number(m[i])
    const bottom = parseInt(base.slice(1 + (i - 1) * 2, 3 + (i - 1) * 2), 16)
    return Math.round(top * alpha + bottom * (1 - alpha))
  })
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

type Scope = Record<string, string>
const ratio = (scope: Scope, text: string, surface: string) => {
  const card = resolve('var(--card)', scope)
  return contrastRatio(
    resolve(`var(${text})`, scope),
    over(resolve(`var(${surface})`, scope), card),
  )
}

// The same in both themes (dark surfaces of their own).
const FIXED: Array<[text: string, surface: string]> = [
  ['--inst-dark-ink', '--inst-dark-card'],
  ['--inst-dark-lead', '--inst-dark-card'],
  ['--inst-dark-note', '--inst-dark-card'],
  ['--inst-dark-accent', '--inst-dark-card'],
  ['--inst-meter-idle-ink', '--inst-meter-idle'],
  ['--inst-meter-lock-ink', '--inst-meter-lock'],
  ['--inst-spec-ink', '--inst-spec-bg'],
  ['--inst-spec-sub', '--inst-spec-bg'],
  ['--inst-spec-axis', '--inst-spec-bg'],
  ['--inst-switch-off-ink', '--inst-switch-off'],
]

// Following the theme: tags and the switch on tinted cards.
const THEMED: Array<[text: string, surface: string]> = [
  ['--inst-go-text', '--inst-mux-ok-bg'],
  ['--inst-go-text', '--inst-switch-on-bg'],
  ['--inst-warn-text', '--inst-mux-old-bg'],
  // Errors and „no” on cards (prototype `--bad`, I8).
  ['--inst-bad', '--card'],
]

// I7–I8: illustrations of the service pages (same in both themes). Labels drawn inside the
// scenes: the camera name on its chip, scene captions on the dark mask, the false-alarm marker.
const il = { ...light, ...rule("[data-line='instalacje'] [data-inst-il]") }
const ilRatio = (text: string, surface: string, base = '--il-cam') =>
  contrastRatio(
    resolve(`var(${text})`, il),
    over(resolve(`var(${surface})`, il), resolve(`var(${base})`, il)),
  )

describe('Instalacje service page illustrations', () => {
  // `light-dark()` (light theme of the scenes, I6/I7) needs a declared scheme in both themes.
  it('declares the light colour scheme on the line, the dark one in the dark rules', () => {
    expect(tokensCss).toMatch(/\[data-line='instalacje'\] \{[^}]*color-scheme: light;/)
    expect(tokensCss).toMatch(
      /\[data-line='instalacje'\]\[data-theme='dark'\] \{\s*color-scheme: dark;/,
    )
  })

  it('keep their palette in one rule of tokens.css', () => {
    const palette = rule("[data-line='instalacje'] [data-inst-il]")
    expect(Object.keys(palette).every((k) => k.startsWith('--il-'))).toBe(true)
    expect(Object.keys(palette).length).toBeGreaterThan(45)
  })

  it.each([
    ['--inst-plan-white', '--il-cam-label'],
    ['--il-cam-time', '--il-mask'],
    ['--inst-promo-warm', '--il-mask'],
    ['--inst-band-button-ink', '--il-false'],
    ['--il-caption', '--inst-il-phs-bg'],
  ])('%s on %s ≥ 4.5:1', (text, surface) => {
    expect(ilRatio(text, surface)).toBeGreaterThanOrEqual(4.5)
  })

  // Status chips of the alarm app panel (on the dark glass) and the alarm feed on the phone.
  it.each([
    ['--il-arm-ink', '--il-arm-chip', '--il-mask'],
    ['--il-al-ink', '--il-al-chip', '--il-mask'],
    ['--il-bad-ink', '--il-bad-feed', '--inst-il-phs-bg'],
  ])('%s on %s (over %s) ≥ 4.5:1', (text, surface, base) => {
    expect(ilRatio(text, surface, base)).toBeGreaterThanOrEqual(4.5)
  })

  // Ekrany (I9): the sky behind the screen gets brighter with each level of the brightness demo.
  it('brighten the sky of the screen demo level by level', () => {
    const levels = ['--inst-il-jsvis-bg', '--il-jsvis-p2-2', '--il-jsvis-p3-2', '--il-jsvis-p4-2']
    const vsBlack = levels.map((t) => contrastRatio(resolve(`var(${t})`, il), '#000000'))
    expect(vsBlack).toEqual([...vsBlack].sort((a, b) => a - b))
  })

  // Ładowarki (I9): six housing colours of CC Wall, each its own swatch.
  it('give CC Wall six distinct housing colours', () => {
    const names = ['black', 'white', 'grey', 'blue', 'green', 'brown'].map((c) => `--il-evsw-${c}`)
    const values = names.map((t) => resolve(`var(${t})`, il).toLowerCase())
    expect(values.every((v) => /^#[0-9a-f]{6}$/.test(v))).toBe(true)
    expect(new Set(values).size).toBe(6)
  })
})

describe('Instalacje service page colours', () => {
  it.each(FIXED)('%s on %s ≥ 4.5:1', (text, surface) => {
    expect(ratio(light, text, surface)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(THEMED)('%s on %s ≥ 4.5:1 in the light theme', (text, surface) => {
    expect(ratio(light, text, surface)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(THEMED)('%s on %s ≥ 4.5:1 in the dark theme', (text, surface) => {
    expect(ratio(dark, text, surface)).toBeGreaterThanOrEqual(4.5)
  })
})
