import { describe, expect, it } from 'vitest'

import type { BundleCardData } from '@/lib/catalog/bundle'
import type { PlanScene } from '@/lib/catalog/floorPlan'

import { isSceneLoaded, mergeScene, planForScenes, scenePayload } from './planScenes'
import type { FloorPlanData, PlanProduct } from './types'

const scene = (slug: string, products: string[]): PlanScene => ({
  slug,
  name: slug,
  title: slug,
  lead: null,
  iconPath: null,
  width: 100,
  height: 60,
  points: products.map((product, i) => ({
    n: i + 1,
    product,
    label: product,
    description: null,
    x: 10,
    y: 10,
  })),
  bundles: [],
})

const product = (slug: string): PlanProduct => ({
  slug,
  name: slug,
  brand: null,
  benefit: null,
  features: [],
  image: null,
  icon: 'box',
  href: `/produkt/${slug}`,
  params: [],
  video: null,
})

const bundle = (slug: string) => ({ slug }) as BundleCardData

// Two scenes share the printer; each has one product of its own.
const full: FloorPlanData = {
  scenes: [scene('sklep', ['kasa', 'drukarka']), scene('biuro', ['laptop', 'drukarka'])],
  products: { kasa: product('kasa'), drukarka: product('drukarka'), laptop: product('laptop') },
  bundles: { sklep: [bundle('start-sklep')], biuro: [bundle('start-biuro')] },
  firstSvg: '<svg/>',
}

describe('planForScenes — the home page sends only the first scene', () => {
  it('keeps every scene (tiles, counts, points) but only the products and bundles of the picked', () => {
    const home = planForScenes(full, [full.scenes[0]!.slug])
    expect(home.scenes).toBe(full.scenes)
    expect(Object.keys(home.products).sort()).toEqual(['drukarka', 'kasa'])
    expect(home.bundles).toEqual({ sklep: [bundle('start-sklep')] })
    expect(home.firstSvg).toBe('<svg/>')
  })

  it('marks the picked scenes as loaded, the others not', () => {
    const home = planForScenes(full, ['sklep'])
    expect(isSceneLoaded(home, 'sklep')).toBe(true)
    expect(isSceneLoaded(home, 'biuro')).toBe(false)
    expect(isSceneLoaded(full, 'biuro')).toBe(true)
  })

  it('ignores a slug that is not a scene', () => {
    expect(planForScenes(full, ['nie-ma']).products).toEqual({})
  })
})

describe('scenePayload — what /api/plan-scene/<scena> returns', () => {
  it('gives the products of the scene points and its bundles', () => {
    expect(scenePayload(full, 'biuro')).toEqual({
      products: { laptop: product('laptop'), drukarka: product('drukarka') },
      bundles: [bundle('start-biuro')],
    })
  })

  it('is null for a slug that is not a scene of this plan', () => {
    expect(scenePayload(full, 'apteka')).toBeNull()
  })

  it('skips a point whose product is not in the plan data (not listed)', () => {
    const data = { ...full, products: { kasa: product('kasa') } }
    expect(scenePayload(data, 'sklep')?.products).toEqual({ kasa: product('kasa') })
  })
})

describe('mergeScene — the client adds a loaded scene', () => {
  it('adds the products and bundles, and the scene counts as loaded', () => {
    const home = planForScenes(full, ['sklep'])
    const merged = mergeScene(home, 'biuro', scenePayload(full, 'biuro')!)
    expect(isSceneLoaded(merged, 'biuro')).toBe(true)
    expect(merged.products).toEqual(full.products)
    expect(merged.bundles).toEqual(full.bundles)
    expect(merged.scenes).toBe(home.scenes)
  })
})
