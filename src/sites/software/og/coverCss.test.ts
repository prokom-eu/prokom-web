import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { COVER_CSS } from './coverCss'

/** Rules as `selector{declarations}`, comments and whitespace dropped. */
function normalise(css: string): string[] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, selector, body]) =>
      `${selector.replace(/\s+/g, ' ').trim()}{${body
        .split(';')
        .map((declaration) => declaration.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join(';')}}`,
  )
}

describe('COVER_CSS', () => {
  it('is the cover block of subpages.css', () => {
    const sheet = readFileSync(
      fileURLToPath(new URL('../style/subpages.css', import.meta.url)),
      'utf8',
    )
    const start = sheet.indexOf('.sw-cover * {')
    const end = sheet.indexOf('}', sheet.indexOf('.cv-glow {')) + 1
    expect(start).toBeGreaterThan(-1)
    expect(normalise(COVER_CSS)).toEqual(normalise(sheet.slice(start, end)))
  })
})
