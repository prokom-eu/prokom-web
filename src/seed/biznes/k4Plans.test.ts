import { describe, expect, it } from 'vitest'

import k3BundlesFile from '../../../seed/prokombiznes/k3/zestawy.json'
import k31Plans from '../../../seed/prokombiznes/k31/plansze-k31.json'
import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import slugMap from '../../../seed/prokombiznes/k4/mapa-slugow-k4.json'
import plansFile from '../../../seed/prokombiznes/k4/plany-k4.json'
import bundlesFile from '../../../seed/prokombiznes/k4/zestawy-k4.json'
import { bundleData, type K3Bundle } from './k3Bundles'
import type { K31Scene } from './k31Plans'
import { k4Bundle, k4Scene, k4ServiceSlugs, type K4Bundle, type K4Scene } from './k4Plans'

const baseScenes = k31Plans.sceny as K31Scene[]
const scenes = plansFile.sceny as K4Scene[]
const baseBundles: K3Bundle[] = k3BundlesFile.zestawy
const bundles = bundlesFile.zestawy as Record<string, K4Bundle>

const pairedScenes = scenes.map((scene) =>
  k4Scene(
    scene,
    baseScenes.find((base) => base.id === scene.id)!,
  ),
)
const serviceSlug = k4ServiceSlugs(catalog.produkty)
const pairedBundles = Object.entries(bundles).map(([slug, bundle]) =>
  k4Bundle(
    slug,
    bundle,
    baseBundles.find((base) => base.slug === slug)!,
    serviceSlug,
  ),
)

describe('k4Scene (plany-k4.json)', () => {
  it('pairs the 12 scenes and keeps the K3.1 drawing', () => {
    expect(pairedScenes).toHaveLength(12)
    for (const [index, scene] of pairedScenes.entries()) {
      expect(scene.svg).toBe(baseScenes.find((base) => base.id === scene.id)!.svg)
      expect(scene.punkty).toHaveLength(scenes[index]!.pts.length)
    }
  })

  it('turns percent into drawing units (35% of 1600 = 560)', () => {
    const sklep = pairedScenes.find((scene) => scene.id === 'sklep')!
    expect(sklep.punkty[0]).toMatchObject({ slug: 'u7', x: 560, y: 330 })
  })

  it('stops on a scene paired with another', () => {
    expect(() => k4Scene(scenes[0]!, baseScenes[1]!)).toThrow(/sklep/)
  })
})

describe('k4Bundle (zestawy-k4.json)', () => {
  it('pairs the 23 bundles and keeps series and order of K3c', () => {
    expect(pairedBundles).toHaveLength(23)
    for (const bundle of pairedBundles) {
      const base = baseBundles.find((item) => item.slug === bundle.slug)!
      expect(bundle.seria).toBe(base.seria)
      expect(bundle.kolejnosc).toBe(base.kolejnosc)
    }
  })

  it('turns service names into service cards', () => {
    const start = pairedBundles.find((bundle) => bundle.slug === 'zestaw-sklep-kasa-start')!
    expect(start.uslugi).toEqual(['srvkas', 'szkol', 'przkas'])
    expect(() =>
      k4Bundle(
        'zestaw-sklep-kasa-start',
        bundles['zestaw-sklep-kasa-start']!,
        baseBundles[0]!,
        () => undefined,
      ),
    ).toThrow(/Serwis kas/)
  })

  it('takes items, swaps and texts from K4', () => {
    const start = pairedBundles.find((bundle) => bundle.slug === 'zestaw-sklep-kasa-start')!
    const source = bundles['zestaw-sklep-kasa-start']!
    expect(start.nazwa).toBe(source.nazwa)
    expect(start.elementy.map((item) => item.slug)).toEqual(source.el.map((item) => item.s))
    expect(start.zamienniki[0]).toEqual({
      zamiast: source.zam[0]!.z,
      mozna: source.zam[0]!.na,
      kiedy: source.zam[0]!.kiedy,
    })
  })

  it('keeps an open question of K3 with the same card', () => {
    const base = baseBundles.find((bundle) =>
      bundle.elementy.some(
        (item) =>
          item.do_potwierdzenia && bundles[bundle.slug]!.el.some((el) => el.s === item.slug),
      ),
    )
    if (!base) return
    const item = base.elementy.find((row) => row.do_potwierdzenia)!
    const paired = pairedBundles.find((bundle) => bundle.slug === base.slug)!
    expect(paired.elementy.find((row) => row.slug === item.slug)?.do_potwierdzenia).toBe(
      item.do_potwierdzenia,
    )
  })

  it('names only cards the import knows (K4, repo split, slug map)', () => {
    const known = new Set([
      ...catalog.produkty.map((card) => card.slug_seed),
      ...Object.values(slugMap.niepodzielone).flatMap((split) => split.nowe),
      ...Object.keys(slugMap.ukryj),
    ])
    const ids = new Map<string, number>()
    const idOf = (key: string) => {
      if (!ids.has(key)) ids.set(key, ids.size + 1)
      return ids.get(key)
    }
    for (const bundle of pairedBundles) {
      expect(() =>
        bundleData(bundle, k3BundlesFile.sprawdzone_zgodnosci, {
          cards: (slug) => [slug],
          product: (slug) => (known.has(slug) ? idOf(slug) : undefined),
          industry: (slug) => idOf(`industry:${slug}`),
          category: (code) => idOf(`category:${code}`),
          hidden: new Set(),
        }),
      ).not.toThrow()
    }
    for (const scene of pairedScenes) {
      for (const point of scene.punkty) expect(known.has(point.slug), point.slug).toBe(true)
    }
  })
})
