import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { PAGE_SHEET_ORDER } from './cascade'

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

// LCP on phones (audit 09.11): a page links only its kind's sheets (`LineStyles.tsx`), each module
// in the order of `cascade.ts`.
const ORDER = PAGE_SHEET_ORDER.map((sheet) => join(LINE, sheet))
/** Modules of the frame and the pages outside blocks (their own sheets, not in the order list). */
const OTHER_MODULES = ['frame', 'obiekty', 'poradnik', 'wyslane', 'tailwind'].map((name) =>
  join(STYLE, `${name}.tsx`),
)
const pageModules = styleModules.filter((file) => !OTHER_MODULES.includes(file))
const cssImports = (file: string) => importsOf(file).filter((target) => target.endsWith('.css'))

describe('page stylesheets (one module per page kind)', () => {
  it('import only sheets from the order list, in its order', () => {
    expect(pageModules.length).toBeGreaterThan(10)
    for (const pageModule of pageModules) {
      const sheets = cssImports(pageModule)
      expect(
        sheets.filter((sheet) => !ORDER.includes(sheet)),
        pageModule,
      ).toEqual([])
      const order = sheets.map((sheet) => ORDER.indexOf(sheet))
      expect(order, pageModule).toEqual([...order].sort((a, b) => a - b))
    }
  })

  it('every sheet in the order list exists and some page links it', () => {
    const linked = new Set(pageModules.flatMap(cssImports))
    for (const sheet of ORDER) expect(linked.has(sheet), sheet).toBe(true)
  })
})

// Review 09.11: the scenes moved without their keyframes. Every animation a module's sheets use
// has its keyframes in the same module, in the frame or in the shared styles.
const keyframesOf = (file: string) =>
  [...readFileSync(file, 'utf8').matchAll(/@keyframes\s+([\w-]+)/g)].map(([, name]) => name!)
const NOT_NAMES =
  /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|alternate|alternate-reverse|normal|reverse|infinite|forwards|backwards|both|none|running|paused|var|cubic-bezier|steps)$/
const animationsOf = (file: string) => {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const names = new Set<string>()
  for (const [, value] of css.matchAll(/animation(?:-name)?\s*:\s*([^;]+);/g))
    for (const token of value!.replace(/\([^)]*\)/g, ' ').split(/[\s,]+/))
      if (/^[a-z][\w-]*-[\w-]+$/i.test(token) && !NOT_NAMES.test(token)) names.add(token)
  return names
}

describe('stylesheet keyframes', () => {
  const shared = files(join(SRC, 'styles')).filter((file) => file.endsWith('.css'))
  const frame = cssImports(join(STYLE, 'frame.tsx'))
  const always = new Set([...shared, ...frame].flatMap(keyframesOf))

  // The „Dla kogo” pages link the scenes without their motion (`sceny-ruch.css`): there the
  // scenes have always stood still.
  const STILL = new Map([[join(STYLE, 'obiekty.tsx'), join(LINE, 'sekcje', 'sceny.css')]])

  it('every animation of a module has its keyframes where the module is linked', () => {
    const missing = styleModules.flatMap((styleModule) => {
      const sheets = cssImports(styleModule).filter((sheet) => STILL.get(styleModule) !== sheet)
      const available = new Set([...always, ...sheets.flatMap(keyframesOf)])
      return sheets.flatMap((sheet) =>
        [...animationsOf(sheet)]
          .filter((name) => !available.has(name))
          .map((name) => `${basename(styleModule)} → ${basename(sheet)}: ${name}`),
      )
    })
    expect(missing).toEqual([])
  })
})
