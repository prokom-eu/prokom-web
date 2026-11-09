import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { SERVICE_KEYS } from '@/lib/instalacje/options'

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

// LCP on phones (audit 09.11): a page links only its kind's sheets. Files share selectors
// (e.g. `.zkticket` in glowna-sekcje and zaplanuj, `.odi` in oferta and teletechnika), so every
// module keeps them in one cascade order — the order of the former all-blocks module.
const CASCADE = [
  'widzety/architekci/architekci.css',
  'widzety/glowna/glowna.css',
  'sekcje/sceny.css',
  'sekcje/glowna/glowna-sekcje.css',
  'sekcje/glowna/podhale-proces.css',
  'widzety/zaplanuj/zaplanuj.css',
  'widzety/serwis/serwis.css',
  'widzety/oferta/oferta.css',
  'widzety/realizacje/realizacje.css',
  'widzety/firma/firma.css',
  'widzety/alarmy/alarmy.css',
  'widzety/anteny/anteny.css',
  'widzety/dostep/dostep.css',
  'widzety/sieci/sieci.css',
  'widzety/teletechnika/teletechnika.css',
  'widzety/monitoring/monitoring.css',
  'widzety/smart/smart.css',
  'widzety/ekrany/ekrany.css',
  'widzety/ladowarki/ladowarki.css',
  'widzety/naglosnienie/naglosnienie.css',
].map((sheet) => join(LINE, sheet))

describe('page stylesheets (one module per page kind)', () => {
  it('keep the line’s cascade order in every module', () => {
    for (const styleModule of styleModules) {
      const sheets = importsOf(styleModule).filter((target) => CASCADE.includes(target))
      const order = sheets.map((sheet) => CASCADE.indexOf(sheet))
      expect(order, styleModule).toEqual([...order].sort((a, b) => a - b))
    }
  })

  it('every service has its page module', () => {
    const text = readFileSync(LINE_STYLES, 'utf8')
    for (const { value } of SERVICE_KEYS) expect(text, value).toContain(`  ${value}: dynamic(`)
  })
})
