import { existsSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import k4HomeFile from '../../../seed/prokombiznes/k4/strona-glowna-k4.json'
import katalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import { k4GroupProducts, k4WheelImageFile, k4WheelProducts } from './k4Home'
import { KOLO_1411, WHEEL_LINK_PHOTO_1411, WHEEL_PHOTO_1411, withWheel1411 } from './wheel1411'

const cards = new Map(
  (katalog as { produkty: { slug_seed: string; dzial: string }[] }).produkty.map((card) => [
    card.slug_seed,
    card,
  ]),
)

describe('wheel of runda 1411 (PRZEKAZANIE §1 „Hero — koło”)', () => {
  it('has exactly three bubbles a department, in the order of the handoff', () => {
    expect(KOLO_1411.map((row) => row.g)).toEqual(['sprz', 'biuro', 'prog', 'bezp', 'usl'])
    for (const row of KOLO_1411) expect(row.p.length + (row.link ? 1 : 0)).toBe(3)
    expect(KOLO_1411[0]!.p).toEqual(['ergo', 'pol', 'd3'])
    expect(KOLO_1411[4]!.link?.href).toBe('/opieka-it')
  })

  it('names only cards of the catalog, each in its own department', () => {
    for (const row of KOLO_1411) {
      for (const slug of row.p) {
        expect(cards.get(slug)?.dzial, slug).toBe(row.g)
        expect(row.nazwy?.[slug], `${slug}: name`).toBeTruthy()
      }
    }
  })

  it('has a photo for every bubble (own or borrowed), none an icon', () => {
    for (const row of KOLO_1411) {
      for (const slug of row.p) {
        const file = k4WheelImageFile(WHEEL_PHOTO_1411[slug] ?? slug).filePath
        expect(existsSync(file), `${slug}: ${file}`).toBe(true)
      }
      if (row.link) {
        const borrowed = WHEEL_LINK_PHOTO_1411[row.g]
        expect(borrowed, `${row.g}: page photo`).toBeDefined()
        expect(existsSync(k4WheelImageFile(borrowed!).filePath)).toBe(true)
      }
    }
  })

  it('replaces only the wheel of the package file (the rest stays 1:1)', () => {
    const home = withWheel1411(k4HomeFile)
    expect(home.kolo_hero).toBe(KOLO_1411)
    expect(home.top_dzialu).toBe(k4HomeFile.top_dzialu)
    const ids = new Map<string, number>()
    const idOf = (slug: string) => {
      if (!ids.has(slug)) ids.set(slug, ids.size + 1)
      return ids.get(slug)
    }
    const groups = k4GroupProducts(home, idOf)
    expect([...groups.values()].map((group) => group.wheelProducts.length)).toEqual([3, 3, 3, 3, 2])
    expect(k4WheelProducts(home).get('fiskalizacja')).toEqual({
      wheelName: 'Fiskalizacja kasy',
      wheelColor: null,
    })
  })
})
