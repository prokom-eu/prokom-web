import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const SRC = 'src'
const LINE = join(SRC, 'sites', 'instalacje')
const STYLE = join(LINE, 'style')
const LINE_STYLES = join(STYLE, 'LineStyles.tsx')

const files = (dir: string) =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((file) => join(dir, file))

const sources = files(SRC).filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.test.ts'))

/** Style modules: each imports stylesheets and is loaded only through `next/dynamic`. */
const styleModules = files(STYLE).filter((file) => file.endsWith('.tsx') && file !== LINE_STYLES)

/** Every module specifier of a file (static, side-effect and dynamic imports), resolved. */
function importsOf(file: string): string[] {
  const text = readFileSync(file, 'utf8')
  return [...text.matchAll(/(?:^import |from |import\()'([^']+)'/gm)].map(([, spec]) =>
    spec!.startsWith('@/')
      ? join(SRC, spec!.slice(2))
      : relative('.', resolve(dirname(file), spec!)),
  )
}

const imports = new Map(sources.map((file) => [file, importsOf(file)]))
const importersOf = (match: (target: string) => boolean) =>
  [...imports].filter(([, targets]) => targets.some(match)).map(([file]) => file)

/**
 * In Next 16 a stylesheet imported anywhere in a route's server modules is linked on every page
 * of that route, and `[domain]` is shared by all lines (`LineStyles.tsx`). These checks keep the
 * Instalacje stylesheets behind `next/dynamic` in a Client Component.
 */
describe('Instalacje stylesheets stay off the other lines', () => {
  it('are imported only by the style modules', () => {
    const importers = importersOf((target) => target.startsWith(LINE) && target.endsWith('.css'))
    expect(importers.filter((file) => !styleModules.includes(file))).toEqual([])
  })

  it('every stylesheet of the line is imported somewhere', () => {
    const imported = new Set([...imports.values()].flat())
    const sheets = files(LINE).filter((file) => file.endsWith('.css'))
    expect(sheets.filter((sheet) => !imported.has(sheet))).toEqual([])
  })

  it('style modules are loaded only by LineStyles, through next/dynamic', () => {
    const text = readFileSync(LINE_STYLES, 'utf8')
    for (const styleModule of styleModules) {
      const target = styleModule.replace(/\.tsx$/, '')
      expect(importersOf((t) => t === target || t === styleModule)).toEqual([LINE_STYLES])
      expect(text).toContain(`dynamic(() => import('./${basename(target)}'))`)
    }
  })

  it('LineStyles is a Client Component', () => {
    expect(readFileSync(LINE_STYLES, 'utf8').startsWith("'use client'")).toBe(true)
  })
})
