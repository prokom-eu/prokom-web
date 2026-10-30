import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule } from './parse-tokens'

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
]

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
