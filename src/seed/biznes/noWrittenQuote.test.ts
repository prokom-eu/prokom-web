import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import katalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import { lineCopy } from '../../lib/mail/lineCopy'
import { mailWording } from './textFixes'

// Runda 1411 (ADR-017 „Rozstrzygnięcia 15.11”): Biznes says „wycena na mailu”, never „na piśmie”.
// Allowed only where the old wording is the thing looked for: the detectors of older seeds
// (`homeV150.ts`) and the fixes that turn it into the new one (`textFixes.ts`).
const ROOTS = [
  'src/seed/biznes',
  'src/sites/biznes',
  'src/lib/biznes',
  'src/app/(sites)/[domain]/(biznes)',
  'src/app/(sites)/[domain]/(katalog)',
]
const FILES = [
  'src/seed/shared/biznes.ts',
  'src/lib/catalog/category.ts',
  'src/lib/catalog/industry.ts',
]
const ALLOWED = new Set(['homeV150.ts', 'textFixes.ts'])
const OLD = /na[  ]piśmie/i

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return sources(full)
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : []
  })
}

describe('„na mailu”, not „na piśmie” (runda 1411)', () => {
  it('no Biznes source says „na piśmie”', () => {
    const found = [...ROOTS.flatMap(sources), ...FILES]
      .filter((file) => !ALLOWED.has(path.basename(file)))
      .filter((file) => OLD.test(readFileSync(file, 'utf8')))
    expect(found).toEqual([])
  })

  it('the Biznes confirmation e-mail says „na mailu” (Instalacje and Software keep theirs)', () => {
    expect(JSON.stringify(lineCopy('biznes'))).not.toMatch(OLD)
  })

  it('the catalog cards of the package lose it on import (`mailWording`)', () => {
    expect(JSON.stringify(katalog)).toMatch(OLD)
    expect(JSON.stringify(mailWording(katalog))).not.toMatch(OLD)
  })
})
