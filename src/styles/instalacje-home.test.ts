import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { darkMediaBlock, resolve, rule } from './parse-tokens'

// I6: text colours of the home sections on their own surfaces (WCAG AA, 4.5:1). Translucent
// layers (`rgba`) are laid over the next layer down; the last layer is opaque.
const light = { ...rule(':root'), ...rule("[data-line='instalacje']") }
const dark = { ...light, ...rule("[data-line='instalacje'][data-theme='dark']") }
const media = {
  ...light,
  ...rule("[data-line='instalacje']:not([data-theme='light'])", darkMediaBlock()),
}

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

/** Contrast of `text` on `layers` (top first, tokens without `var()`). */
function ratio(scope: Scope, text: string, ...layers: string[]): number {
  const colors = layers.map((token) => resolve(`var(${token})`, scope))
  const surface = colors.reduceRight((below, top) => over(top, below))
  return contrastRatio(resolve(`var(${text})`, scope), surface)
}

type Case = [text: string, ...layers: string[]]

const BANDS = ['--inst-band-soft', '--inst-band-tint', '--inst-band-plan-1', '--inst-band-plan-2']
const OBJECTS = [1, 2, 3, 4, 5]

// Following the theme: section bands, "Dla kogo" cards, the mountain cards.
const THEMED: Case[] = [
  ...BANDS.flatMap((band): Case[] => [
    ['--ink', band],
    ['--ink-2', band],
    ['--accent-text', band],
  ]),
  ...OBJECTS.flatMap((i): Case[] => [
    // Title and description on the card, the accent link, the chips, the filled pill.
    ['--ink', `--inst-ob-${i}`],
    ['--ink-soft', `--inst-ob-${i}`],
    [`--inst-obi-${i}`, `--inst-ob-${i}`],
    [`--inst-obi-${i}`, '--inst-ob-chip', `--inst-ob-${i}`],
    [`--inst-ob-${i}`, `--inst-obi-${i}`],
  ]),
  ['--ink-2', '--inst-gor-card', '--inst-gor-top'],
  ['--ink-2', '--inst-gor-card', '--inst-gor-bottom'],
]

// The same in both themes: service teaser, services card, quick plan form and its ticket.
// Gradients are checked on their lightest stop.
const FIXED: Case[] = [
  ['--inst-deep-ink', '--inst-deep-1'],
  ['--inst-deep-white', '--inst-deep-1'],
  ['--inst-deep-lead', '--inst-deep-1'],
  ['--inst-deep-lead-2', '--inst-deep-1'],
  ['--inst-deep-note', '--inst-deep-tile', '--inst-deep-1'],
  ['--inst-us-tag-ink', '--inst-us-tag', '--inst-us-stage'],
  ['--inst-plan-white', '--inst-plan-1'],
  ['--inst-plan-lead', '--inst-plan-1'],
  ['--inst-plan-text', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-muted', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-soft', '--inst-plan-num', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-card-ink', '--inst-plan-tile', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-chip-ink', '--inst-plan-tile-2', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-note', '--inst-plan-tile-2', '--inst-plan-glass-top', '--inst-plan-bg'],
  // Field label and the zone tag inside a field of the glass card.
  ['--inst-plan-field-ink', '--inst-plan-tile-2', '--inst-plan-glass-top', '--inst-plan-bg'],
  [
    '--inst-plan-field-ink',
    '--inst-plan-line',
    '--inst-plan-tile-2',
    '--inst-plan-glass-top',
    '--inst-plan-bg',
  ],
  ['--inst-plan-white', '--inst-plan-chip-on', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-accent', '--inst-plan-step-bg', '--inst-plan-step', '--inst-plan-bg'],
  ['--inst-plan-soft', '--inst-plan-step', '--inst-plan-bg'],
  ['--inst-plan-on-ink', '--inst-plan-accent'],
  ['--inst-plan-on-ink', '--inst-plan-send-from'],
  ['--inst-plan-on-ink', '--inst-plan-send-to'],
  ['--inst-plan-send-ink', '--inst-plan-send', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-white', '--inst-plan-ok-label'],
  ['--inst-plan-err', '--inst-plan-err-bg', '--inst-plan-glass-top', '--inst-plan-bg'],
  ['--inst-plan-text', '--inst-plan-tile', '--inst-plan-bg'],
  ['--inst-plan-accent', '--inst-plan-tile', '--inst-plan-bg'],
  ['--inst-ticket-ink', '--inst-ticket-1'],
  ['--inst-ticket-mut', '--inst-ticket-1'],
  ['--inst-ticket-eye', '--inst-ticket-1'],
]

const name = (c: Case) => `${c[0]} on ${c.slice(1).join(' over ')}`

describe('Instalacje home section colours', () => {
  it.each(THEMED.map((c) => [name(c), c] as const))('%s ≥ 4.5:1 in the light theme', (_, c) => {
    expect(ratio(light, ...c)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(THEMED.map((c) => [name(c), c] as const))('%s ≥ 4.5:1 in the dark theme', (_, c) => {
    expect(ratio(dark, ...c)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(FIXED.map((c) => [name(c), c] as const))('%s ≥ 4.5:1 in both themes', (_, c) => {
    expect(ratio(light, ...c)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(dark, ...c)).toBeGreaterThanOrEqual(4.5)
  })

  it('the system dark preference gives the same home tokens as the explicit choice', () => {
    const home = Object.keys(dark).filter((k) => /^--inst-(band|ob|gor|plan-glass)/.test(k))
    expect(home.length).toBeGreaterThan(20)
    for (const key of home) expect(media[key], key).toBe(dark[key])
  })
})

describe('Instalacje service card scenes', () => {
  it('keep their palette in one rule of tokens.css', () => {
    const scene = rule("[data-line='instalacje'] [data-inst-sx]")
    expect(Object.keys(scene).every((k) => k.startsWith('--sx-'))).toBe(true)
    expect(Object.keys(scene).length).toBeGreaterThan(60)
  })
})
