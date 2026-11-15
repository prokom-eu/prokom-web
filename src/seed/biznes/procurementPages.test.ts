import { existsSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import file from '../../../seed/prokombiznes/k4/strony-k4.json'
import { procurementPageSchema } from '../../lib/biznes/procurement/schema'
import {
  PROCUREMENT_PAGES,
  procurementImageNames,
  procurementMediaFile,
  resolveProcurementImages,
} from './procurementPages'

const pages = (file as unknown as { zaopatrzenie: Record<'agd' | 'it', unknown> }).zaopatrzenie

describe('Zaopatrzenie pages from the package (BIZ-2, ZAOPATRZENIE §1–§2)', () => {
  it('seeds both pages with the spec addresses and titles ≤ 60 characters with the brand', () => {
    expect(PROCUREMENT_PAGES.map((page) => [page.slug, page.variant])).toEqual([
      ['agd-rtv-dla-firm', 'agd'],
      ['dostawy-it-dla-firm', 'it'],
    ])
    for (const page of PROCUREMENT_PAGES) {
      expect(`${page.seoTitle} | PRO-KOM Biznes`.length).toBeLessThanOrEqual(60)
      expect(page.description.length).toBeLessThanOrEqual(160)
    }
  })

  it('every package image has a file in the media folder', () => {
    for (const variant of ['agd', 'it'] as const) {
      for (const name of procurementImageNames(pages[variant])) {
        const { file: mediaFile, upload } = procurementMediaFile(name)
        expect(upload).toMatch(/^zaop-/)
        expect(existsSync(mediaFile), mediaFile).toBe(true)
      }
    }
  })

  it('after resolving images to Media ids the data passes the panel schema', () => {
    let id = 0
    for (const variant of ['agd', 'it'] as const) {
      const { data, missing } = resolveProcurementImages(pages[variant], () => ++id)
      expect(missing).toEqual([])
      const result = procurementPageSchema.safeParse(data)
      expect(result.error?.issues ?? []).toEqual([])
      expect(result.data?.variant).toBe(variant)
    }
  })

  it('reports image names the database does not know and leaves them empty', () => {
    const { data, missing } = resolveProcurementImages(
      { hero: { scene: [{ image: 'p-a' }, { image: 'zaop-b' }] }, cross: { images: ['p-a'] } },
      (name) => (name === 'p-a' ? 7 : undefined),
    )
    expect(data).toEqual({
      hero: { scene: [{ image: 7 }, { image: null }] },
      cross: { images: [7] },
    })
    expect(missing).toEqual(['zaop-b'])
  })

  it('never puts a price in the page data (K4-FINAL §1: zero cen)', () => {
    // „powyżej 15 000 zł” is the split-payment threshold, not a price.
    expect(JSON.stringify(pages)).not.toMatch(/(od|za|cena|już)\s[\d\s]+zł/i)
  })
})
