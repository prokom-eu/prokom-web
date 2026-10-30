import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'

import { resolve, rule } from './parse-tokens'

// I5: home hero "Twój obiekt na żywo". The scene has its own time of day (ADR-I003 §6), so the
// text colours are checked per time of day, not per theme (WCAG AA). Translucent surfaces are
// laid over the lightest scene colour that can sit behind them (sky, ground, phone background).
const day = rule("[data-line='instalacje'] [data-hx-time]")
const TIMES = {
  day,
  night: { ...day, ...rule("[data-line='instalacje'] [data-hx-time='night']") },
  winter: { ...day, ...rule("[data-line='instalacje'] [data-hx-time='winter']") },
}

type Scope = Record<string, string>
const RGBA = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/

function channels(hex: string): number[] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
}

/** `top` (`#rrggbb` with `alpha`) laid over `bottom` (`#rrggbb`). */
function mix(top: number[], alpha: number, bottom: string): string {
  const base = channels(bottom)
  return `#${top
    .map((c, i) =>
      Math.round(c * alpha + base[i] * (1 - alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** A `#rrggbb` or an `rgba()` laid over `base`. */
function over(color: string, base: string): string {
  const m = RGBA.exec(color)
  return m
    ? mix(
        [1, 2, 3].map((i) => Number(m[i])),
        Number(m[4]),
        base,
      )
    : color
}

const value = (scope: Scope, token: string) => resolve(`var(${token})`, scope)

/** Lightest of the given scene colours (the hardest background for light text on glass). */
function lightest(scope: Scope, tokens: string[]): string {
  const luminance = (hex: string) => contrastRatio(hex, '#000000')
  return tokens.map((t) => value(scope, t)).sort((a, b) => luminance(b) - luminance(a))[0]
}

// Behind the text column: the fade band over the sky and the mountains.
const TEXT_BEHIND = ['--hx-sky1', '--hx-sky-m', '--hx-sky2', '--hx-l2t', '--hx-l3t', '--hx-gnd']
// Behind the glass panels and chips: anywhere in the scene, on the phone also its background.
const GLASS_BEHIND = ['--hx-sky1', '--hx-sky-m', '--hx-sky2', '--hx-gnd', '--hx-phone-bg']

describe.each(Object.entries(TIMES))('home hero colours — %s', (_time, scope) => {
  const fade = (behind: string) =>
    mix(channels(value(scope, '--hx-fade')), Number(value(scope, '--hx-fade-a')), behind)

  it.each(TEXT_BEHIND)('heading and lead on the fade over %s ≥ 4.5:1', (behind) => {
    expect(
      contrastRatio(value(scope, '--hx-ink'), fade(value(scope, behind))),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it.each(TEXT_BEHIND)('accent part of the heading (≥ 50 px) over %s ≥ 3:1', (behind) => {
    expect(
      contrastRatio(value(scope, '--hx-key'), fade(value(scope, behind))),
    ).toBeGreaterThanOrEqual(3)
  })

  it('heading and accent on the phone background ≥ 4.5:1', () => {
    const phone = value(scope, '--hx-phone-bg')
    // On the phone the text sits below the scene, on a background following the time of day.
    expect(contrastRatio(value(scope, '--hx-ink'), phone)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(value(scope, '--hx-key'), phone)).toBeGreaterThanOrEqual(4.5)
  })

  it.each([
    '--hx-glass-ink',
    '--hx-sub',
    '--hx-muted',
    '--hx-tab-ink',
    '--hx-chip-ink',
    '--hx-accent-2',
    '--hx-amber',
    '--hx-rec',
  ])('%s on glass ≥ 4.5:1', (text) => {
    const glass = over(value(scope, '--hx-glass'), lightest(scope, GLASS_BEHIND))
    expect(contrastRatio(value(scope, text), glass)).toBeGreaterThanOrEqual(4.5)
  })

  it('label on the accent button ≥ 4.5:1', () => {
    expect(
      contrastRatio(value(scope, '--hx-accent-ink'), value(scope, '--hx-accent')),
    ).toBeGreaterThanOrEqual(4.5)
  })
})
