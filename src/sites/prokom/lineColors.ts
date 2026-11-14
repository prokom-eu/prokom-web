import type { CSSProperties } from 'react'

import type { HubLine } from '@/lib/prokom/lines'

type Line = HubLine | 'prokom'

/** Colour of a line (marks, bars) and its text variant — tokens of `tokens-prokom.css` (ADR-013). */
const COLOUR: Record<Line, { base: string; text: string }> = {
  prokom: { base: 'var(--k-g)', text: 'var(--k-gt)' },
  biznes: { base: 'var(--k-b)', text: 'var(--k-bt)' },
  instalacje: { base: 'var(--k-i)', text: 'var(--k-it)' },
  software: { base: 'var(--k-s)', text: 'var(--k-st)' },
  tech: { base: 'var(--k-t)', text: 'var(--k-tt)' },
  // `--k-yt`: the board's gold darkened for AA in the light theme (4.48:1 → 5.38:1 on white).
  gaming: { base: 'var(--k-y)', text: 'var(--k-yt)' },
}

/** `--ln` / `--ln-text` for a line's element; CSS of the hub reads only these two. */
export function lineStyle(line: Line): CSSProperties {
  const { base, text } = COLOUR[line]
  return { '--ln': base, '--ln-text': text } as CSSProperties
}
