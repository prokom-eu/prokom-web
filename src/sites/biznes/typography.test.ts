import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

import { BZ_H1, BZ_H2, BZ_LEAD } from './typography'

const ROOTS = ['src/sites/biznes', 'src/app/(sites)/[domain]/(biznes)']

/** H2s that are not section headings: the plan dialog and the wizard step titles. */
const OWN_SIZE = ['components/plan/PlanPointDialog.tsx', 'components/configurator/Configurator.tsx']

/** H1s rebuilt with the new hero cards of PR 4 (board Web-kategoria-*, salons). */
const OWN_H1 = ['components/catalog/CatalogHero.tsx', 'components/brand/salon/SalonSections.tsx']

/** Files and their sources, as posix paths. */
const SOURCES = ROOTS.flatMap(files).map((file) => ({
  path: file.split(path.sep).join('/'),
  source: readFileSync(file, 'utf8'),
}))

/** Headings of a level with their own `clamp` size: in the tag or in an `H2` / `HEADING` constant. */
function ownSizes(level: 1 | 2, allowed: readonly string[]): string[] {
  return SOURCES.flatMap(({ path: file, source }) => {
    if (allowed.some((entry) => file.endsWith(entry))) return []
    const tags = (source.match(new RegExp(`<h${level}\\b[^>]*>`, 'g')) ?? []).filter((tag) =>
      /text-\[clamp\(/.test(tag),
    )
    const constants =
      level === 2
        ? (source.match(/const\s+\w*(?:H2|HEADING)\w*\s*=\s*['`][^'`]*text-\[clamp\(/g) ?? [])
        : []
    return [...tags, ...constants].map((found) => `${file}: ${found}`)
  })
}

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return files(full)
    return entry.name.endsWith('.tsx') ? [full] : []
  })
}

describe('Biznes type scale (board Strona.dc.html, audit 01.11.2026)', () => {
  it('takes the H2, lead and H1 sizes from the board CSS', () => {
    expect(BZ_H2).toContain('text-[clamp(26px,2.6vw,36px)]')
    expect(BZ_H2).toContain('leading-[1.05]')
    expect(BZ_H2).toContain('tracking-[-0.02em]')
    expect(BZ_H2).toContain('font-stretch-112%')
    expect(BZ_LEAD).toContain('text-[clamp(16px,1.25vw,19px)]')
    expect(BZ_H1).toContain('text-[clamp(34px,4vw,56px)]')
  })

  it('gives no section H2 its own size: they use BZ_H2', () => {
    expect(ownSizes(2, OWN_SIZE)).toEqual([])
  })

  it('gives no subpage H1 its own size: they use BZ_H1 or BZ_H1_COMPACT', () => {
    expect(ownSizes(1, OWN_H1)).toEqual([])
  })
})
