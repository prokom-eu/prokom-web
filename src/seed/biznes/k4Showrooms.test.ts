import { describe, expect, it } from 'vitest'

import brandsFile from '../../../seed/prokombiznes/k4/marki-k4.json'
import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import slugMap from '../../../seed/prokombiznes/k4/mapa-slugow-k4.json'
import salonsFile from '../../../seed/prokombiznes/k4/salony-k4.json'
import type { K4BrandsFile } from './k4Brands'
import { k4ShowroomData, showroomSlug, type K4Showroom } from './k4Showrooms'

const brands: K4BrandsFile = brandsFile
const salons = salonsFile.salony as unknown as Record<string, K4Showroom>
const keys = Object.keys(salons)

const ids = new Map<string, number>()
const idOf = (key: string) => {
  if (!ids.has(key)) ids.set(key, ids.size + 1)
  return ids.get(key)
}
const refs = {
  brands,
  partner: (name: string) => idOf(`brand:${name}`),
  product: (slug: string) => idOf(slug),
}
const all = keys.map((key, index) => ({ key, ...k4ShowroomData(key, salons[key]!, index, refs) }))
const byKey = (key: string) => all.find((item) => item.key === key)!.data

describe('showroomSlug (D-K4-1)', () => {
  it('gives the themed showrooms their own address and the others the brand address', () => {
    expect(all.map((item) => item.data.slug)).toEqual([
      'posnet',
      'elzab',
      'sunmi',
      'druk',
      'siec',
      'nas',
      'comex',
      'eset',
      'microsoft',
      'eurocert',
      'polcard',
      'samsung',
      'sharp-nec',
      'avtek',
      'apple',
      'lenovo',
      'dell',
      'brother',
      'logitech',
      'niszczarki',
    ])
  })

  it('stops on a key that is neither themed nor a brand', () => {
    expect(() => showroomSlug('Ogród', brands)).toThrow(/Ogród/)
  })
})

describe('k4ShowroomData (K4-FINAL §6)', () => {
  it('maps the 20 showrooms, every brand of salon_marki in its showroom', () => {
    expect(all).toHaveLength(20)
    for (const [brand, key] of Object.entries(salonsFile.salon_marki)) {
      expect(byKey(key).brands).toContain(idOf(`brand:${brand}`))
    }
  })

  it('joins the brands of a themed showroom', () => {
    const druk = byKey('Druk')
    expect(druk.name).toBe('Druk w biurze')
    expect(druk.brands).toEqual([idOf('brand:Konica Minolta'), idOf('brand:Kyocera')])
  })

  it('keeps hero products with their labels and the comparison as text cells', () => {
    const lenovo = byKey('Lenovo')
    expect(lenovo.hero).toEqual([
      { product: idOf('lenovo-thinkpad-x1-carbon-gen14'), label: 'ThinkPad X1 Carbon' },
      { product: idOf('lenovo-thinkcentre-neo-50a-55a'), label: 'ThinkCentre neo AIO' },
    ])
    const columns = lenovo.compare?.columns?.length
    for (const row of lenovo.compare?.rows ?? []) expect(row.values).toHaveLength(columns!)
  })

  it('fills the service block only for Posnet and Elzab', () => {
    const withService = all.filter((item) => item.data.service?.title).map((item) => item.key)
    expect(withService).toEqual(['Posnet', 'Elzab'])
  })

  it('opens the inquiry from the rollout button, except „Zobacz GoPOS”', () => {
    expect(byKey('Sunmi').rollout?.buttonHref).toBe('/gopos')
    expect(byKey('Posnet').rollout).toMatchObject({ button: 'Zapytaj o kasę', buttonHref: null })
  })

  it('names only K4 cards, split cards of the repo and aliases of the slug map', () => {
    const known = new Set([
      ...catalog.produkty.map((card) => card.slug_seed),
      ...Object.values(slugMap.niepodzielone).flatMap((split) => split.nowe),
      ...Object.keys(slugMap.ukryj),
    ])
    const unknown = keys.flatMap(
      (key, index) =>
        k4ShowroomData(key, salons[key]!, index, {
          ...refs,
          product: (slug) => (known.has(slug) ? idOf(slug) : undefined),
        }).unknown,
    )
    expect(unknown).toEqual([])
  })

  it('reports a card without a record instead of storing a gap', () => {
    const { data, unknown } = k4ShowroomData('Lenovo', salons.Lenovo!, 0, {
      ...refs,
      product: (slug) => (slug === 'lenovo-thinkpad-x1-carbon-gen14' ? undefined : idOf(slug)),
    })
    expect(unknown).toEqual(['lenovo-thinkpad-x1-carbon-gen14'])
    expect(data.hero).toHaveLength(1)
  })
})
