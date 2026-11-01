import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const SRC = 'src'
const LINE = join(SRC, 'sites', 'instalacje')

/**
 * Files allowed to import an Instalacje stylesheet. `frame.tsx` and `blocks.tsx` are loaded
 * through `next/dynamic` (`LineStyles.tsx`); the others belong only to `(instalacje)` routes,
 * whose CSS never reaches the routes shared with Software and Biznes. A static import comes
 * before the dynamic ones in the cascade, so it must not override `frame.tsx` (checked by hand:
 * obiekty, firma and zaplanuj share no conflicting selectors with instalacje/sekcje).
 */
const ALLOWED = new Set(
  [
    'sites/instalacje/style/frame.tsx',
    'sites/instalacje/style/blocks.tsx',
    'sites/instalacje/obiekty/ObjectPage.tsx',
    'sites/instalacje/poradnik/GuidePost.tsx',
    'app/(sites)/[domain]/(instalacje)/wyslane/page.tsx',
  ].map((file) => join(SRC, file)),
)

const files = (dir: string) =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((file) => join(dir, file))

/** Importer → Instalacje stylesheets it imports (relative or `@/` paths). */
function cssImports(): Map<string, string[]> {
  const result = new Map<string, string[]>()
  for (const file of files(SRC).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts'))) {
    const specs = [...readFileSync(file, 'utf8').matchAll(/^import '([^']+\.css)'$/gm)].map(
      ([, spec]) => spec!,
    )
    const sheets = specs
      .map((spec) =>
        spec.startsWith('@/')
          ? join(SRC, spec.slice(2))
          : relative('.', resolve(dirname(file), spec)),
      )
      .filter((sheet) => sheet.startsWith(LINE))
    if (sheets.length) result.set(file, sheets)
  }
  return result
}

describe('Instalacje stylesheets stay off the other lines', () => {
  const imports = cssImports()

  it('are imported only by the dynamic style modules or (instalacje) routes', () => {
    expect([...imports.keys()].filter((file) => !ALLOWED.has(file))).toEqual([])
  })

  it('every stylesheet of the line is imported somewhere', () => {
    const imported = new Set([...imports.values()].flat())
    const sheets = files(LINE).filter((file) => file.endsWith('.css'))
    expect(sheets.filter((sheet) => !imported.has(sheet))).toEqual([])
  })
})
