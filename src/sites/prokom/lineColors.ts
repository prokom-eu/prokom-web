import type { CSSProperties } from 'react'

import type { HubLine } from '@/lib/prokom/lines'

type Line = HubLine | 'prokom'

/** Colour of a line (marks, bars) and its text variant — tokens of `tokens-prokom.css` (ADR-013). */
const COLOUR: Record<Line, { base: string; text: string; dark: string; ink: string }> = {
  prokom: { base: 'var(--k-g)', text: 'var(--k-gt)', dark: 'var(--k-card)', ink: 'var(--k-gi)' },
  biznes: { base: 'var(--k-b)', text: 'var(--k-bt)', dark: 'var(--k-bd)', ink: 'var(--k-bi)' },
  instalacje: { base: 'var(--k-i)', text: 'var(--k-it)', dark: 'var(--k-id)', ink: 'var(--k-ii)' },
  software: { base: 'var(--k-s)', text: 'var(--k-st)', dark: 'var(--k-sd)', ink: 'var(--k-si)' },
  tech: { base: 'var(--k-t)', text: 'var(--k-tt)', dark: 'var(--k-td)', ink: 'var(--k-ti)' },
  // `--k-yt`: the board's gold darkened for AA in the light theme (4.48:1 → 5.38:1 on white).
  gaming: { base: 'var(--k-y)', text: 'var(--k-yt)', dark: 'var(--k-yd)', ink: 'var(--k-yi)' },
}

/**
 * `--ln` (mark), `--ln-text` (text), `--ln-dark` (the line's card) and `--ln-ink` (text on the
 * mark colour) for a line's element; CSS of the hub reads only these.
 */
export function lineStyle(line: Line): CSSProperties {
  const { base, text, dark, ink } = COLOUR[line]
  return { '--ln': base, '--ln-text': text, '--ln-dark': dark, '--ln-ink': ink } as CSSProperties
}
