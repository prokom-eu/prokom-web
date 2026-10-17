import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// ADR-007: colour values live only in `tokens.css`; site code uses tokens (Tailwind classes or
// `var(--…)`). This guard catches hex/rgb/hsl/oklch literals, also as Tailwind arbitrary values.
const ROOTS = ['src/components', 'src/blocks', 'src/app/(sites)', 'src/styles']
const ALLOWED = new Set([path.normalize('src/styles/tokens.css')])
const EXTENSIONS = new Set(['.ts', '.tsx', '.css'])
const RAW_COLOR =
  /(?<![\w&-])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab)\(/i

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return files(full)
    const isSource = EXTENSIONS.has(path.extname(entry.name)) && !entry.name.endsWith('.test.ts')
    return isSource && !ALLOWED.has(path.normalize(full)) ? [full] : []
  })
}

describe('no raw colours outside tokens.css', () => {
  it.each(ROOTS.flatMap(files))('%s', (file) => {
    const offending = readFileSync(file, 'utf8')
      .split('\n')
      .map((line, i) => ({ line: i + 1, text: line.trim() }))
      .filter(({ text }) => RAW_COLOR.test(text))
    expect(offending).toEqual([])
  })
})
