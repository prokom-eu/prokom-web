import { describe, expect, it } from 'vitest'

import { HOME_SEO } from '../home'
import { objectData, objectsToImport, pagesToImport, servicesToImport, slugOf } from '../map'

const refs = { service: () => 1, object: () => 1 }
const pages = pagesToImport()
const objects = objectsToImport().map((item) => objectData(item, refs).seo)
const all = [HOME_SEO, ...pages.map((p) => p.seo), ...objects]

/** Pages whose SEO INST-6 has rewritten: PR3 — the services and `/uslugi`. */
const REWRITTEN = new Set([...servicesToImport().map(({ menu }) => slugOf(menu.href)), 'uslugi'])

describe('SEO texts of the Instalacje pages (runda v6 §2.2 p. 7)', () => {
  it('rewritten pages: description 140–155 characters', () => {
    const off = pages
      .filter((p) => REWRITTEN.has(p.slug))
      .map((p) => `${p.slug}: ${p.seo.description.length}`)
      .filter((row) => {
        const n = Number(row.split(': ')[1])
        return n < 140 || n > 155
      })
    expect(off).toEqual([])
  })

  it('titles and descriptions are unique', () => {
    const titles = all.map((s) => s?.title)
    const descriptions = all.map((s) => s?.description)
    expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([])
    expect(descriptions.filter((d, i) => descriptions.indexOf(d) !== i)).toEqual([])
  })
})
