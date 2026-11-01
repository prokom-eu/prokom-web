import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

import { BZ_H1, BZ_H2, BZ_LEAD } from './typography'

const ROOTS = ['src/sites/biznes', 'src/app/(sites)/[domain]/(biznes)']

/** H2s that are not section headings: the KSeF countdown, the plan dialog and wizard step titles. */
const OWN_SIZE = [
  'blocks/BzKsef/Component.tsx',
  'components/news/KsefPanel.tsx',
  'components/plan/PlanPointDialog.tsx',
  'components/configurator/Configurator.tsx',
]

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
    const offenders = ROOTS.flatMap(files).flatMap((file) => {
      const posix = file.split(path.sep).join('/')
      if (OWN_SIZE.some((allowed) => posix.endsWith(allowed))) return []
      const source = readFileSync(file, 'utf8')
      const h2s = source.match(/<h2\b[^>]*>/g) ?? []
      return h2s.filter((tag) => /text-\[clamp\(/.test(tag)).map((tag) => `${posix}: ${tag}`)
    })
    expect(offenders).toEqual([])
  })
})
