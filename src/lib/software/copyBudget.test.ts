import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// SWV9 (docs/design/prokomsoftware/TEKSTY-SWV9.md §5): slogans repeated to boredom read as
// written by a machine. The budget counts the Software seeds — every text that reaches the site.
const root = process.cwd()
const files = [
  ...readdirSync(join(root, 'seed/prokomsoftware'))
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(root, 'seed/prokomsoftware', name)),
  ...readdirSync(join(root, 'src/seed/software'))
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
    .map((name) => join(root, 'src/seed/software', name)),
]
const text = files.map((file) => readFileSync(file, 'utf8')).join('\n')
const count = (pattern: RegExp) => text.match(pattern)?.length ?? 0

describe('Software copy budget (SWV9 §1, §5)', () => {
  it('„zanim / potem zapłacisz” at most 3 times', () => {
    expect(count(/(zanim|potem) zapłacisz/gi)).toBeLessThanOrEqual(3)
  })

  it('„robi się samo / robią się same / składa się samo” at most 2 times', () => {
    expect(count(/robi się sam|robią się same|składa się sam/gi)).toBeLessThanOrEqual(2)
  })

  it('never „co boli”', () => {
    expect(count(/co boli/gi)).toBe(0)
  })

  it('„na piśmie” at most 25 times', () => {
    expect(count(/na piśmie/gi)).toBeLessThanOrEqual(25)
  })

  it('„Klient nie czeka i nie ucieka” once at most', () => {
    expect(count(/Klient nie czeka i nie ucieka/g)).toBeLessThanOrEqual(1)
  })

  it('no „od ilu kosztuje”, „Dzień dobry, Anna” or booking in the wizard', () => {
    expect(count(/od ilu kosztuje/gi)).toBe(0)
    expect(count(/Dzień dobry, Anna\b/g)).toBe(0)
    expect(readFileSync(join(root, 'seed/prokomsoftware/kreator.json'), 'utf8')).not.toMatch(
      /rezerwacje\./,
    )
  })
})
