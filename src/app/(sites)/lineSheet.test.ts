import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { LINE_VALUES } from '@/lib/tenant/lines'

// ADR-023 „CSS per linia”: every page gets one Tailwind sheet, the one of its line. A static CSS
// import in a server module of `[domain]` (or in `global-error`) would be linked on every line.
const read = (file: string) => readFileSync(file, 'utf8')
const sources = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((file) => join(dir, file))

const ENTRIES = {
  biznes: 'src/sites/biznes/style/biznes.css',
  software: 'src/sites/software/style/software.css',
  instalacje: 'src/sites/instalacje/style/tailwind.css',
  base: 'src/app/(sites)/globals.css',
}

describe('one Tailwind sheet per line', () => {
  it('the root layout and the global error page import no stylesheet', () => {
    for (const file of ['src/app/(sites)/layout.tsx', 'src/app/global-error.tsx']) {
      expect(read(file)).not.toMatch(/^import '[^']+\.css'/m)
    }
  })

  it('each entry imports Tailwind without automatic sources, then the shared styles', () => {
    for (const entry of Object.values(ENTRIES)) {
      const css = read(entry)
      expect(css).toContain("@import 'tailwindcss' source(none);")
      expect(css).toMatch(/@import '(\.\.\/)+styles\/site\.css';/)
    }
  })

  it('only the entries import Tailwind', () => {
    const importers = sources('src')
      .filter((file) => file.endsWith('.css'))
      .filter((file) => /@import 'tailwindcss/.test(read(file)))
      .map((file) => file.split('\\').join('/'))
    expect(importers.sort()).toEqual(Object.values(ENTRIES).sort())
  })

  it('a line scans its own folder; the Instalacje tokens stay in its sheet', () => {
    for (const line of ['biznes', 'software', 'instalacje'] as const) {
      expect(read(ENTRIES[line])).toContain("@source '..';")
    }
    const withLineTokens = sources('src')
      .filter((file) => file.endsWith('.css'))
      .filter((file) => read(file).includes('tokens-instalacje.css'))
      .map((file) => file.split('\\').join('/'))
    expect(withLineTokens).toEqual([ENTRIES.instalacje])
  })

  it('LineSheet renders a sheet for every line', () => {
    const lineSheet = read('src/app/(sites)/LineSheet.tsx')
    expect(lineSheet.startsWith("'use client'")).toBe(true)
    for (const line of LINE_VALUES.filter((value) => value !== 'prokom')) {
      expect(lineSheet).toContain(`case '${line}':`)
    }
    expect(lineSheet).toContain('default:')
  })
})
