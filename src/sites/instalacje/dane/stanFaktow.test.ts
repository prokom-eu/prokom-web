import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { STAN_FAKTOW, stanNa } from './stanFaktow'

const DIR = join(process.cwd(), 'src/sites/instalacje')

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sources(path)
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : []
  })
}

/** The source without comments — a date in a comment (an example of a format) is not a fact. */
const code = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('STAN_FAKTOW (P1-7, audit 06.11)', () => {
  it('is the only place with the date of the facts', () => {
    const offenders = sources(DIR)
      .filter((path) => !path.endsWith('stanFaktow.ts'))
      .filter((path) =>
        /(październik|października|październiku)\s+20\d\d/i.test(code(readFileSync(path, 'utf8'))),
      )
    expect(offenders).toEqual([])
  })

  it('writes „stan na …” from the one constant', () => {
    expect(stanNa()).toBe(`stan na ${STAN_FAKTOW.month}`)
    expect(STAN_FAKTOW.date).toMatch(/^\d{2}\.\d{2}\.20\d\d$/)
  })
})
