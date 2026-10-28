import { describe, expect, it } from 'vitest'

import bundlesFile from '../../../seed/prokombiznes/k3/zestawy.json'
import { wizardBundles } from './wizardBundles'

const bundles = bundlesFile.zestawy.map(({ slug, seria }) => ({ slug, series: seria }))
const slugs = (type: Parameters<typeof wizardBundles>[0], limit?: number) =>
  wizardBundles(type, bundles, limit).map((bundle) => bundle.slug)

describe('wizardBundles (K3-KATALOG §9)', () => {
  it('gives each business type its bundles, in order', () => {
    expect(slugs('sklep', 10)).toHaveLength(5)
    expect(slugs('gastro')).toEqual([
      'zestaw-gastro-foodtruck',
      'zestaw-kawiarnia-lada',
      'zestaw-restauracja-bistro',
    ])
    expect(slugs('hotel', 10)).toHaveLength(3)
    expect(slugs('biuro', 10)).toEqual([
      'zestaw-biuro-3-5',
      'zestaw-biuro-6-12',
      'zestaw-biuro-rachunkowe',
    ])
    expect(slugs('gabinet')).toEqual(['zestaw-gabinet'])
    expect(slugs('truck')).toEqual(['zestaw-gastro-foodtruck'])
    expect(slugs('warsztat')).toEqual(['zestaw-biuro-3-5', 'zestaw-kopie-zapasowe'])
    expect(slugs('inna')).toEqual([])
  })

  it('names only bundles of the package', () => {
    const known = new Set(bundles.map((bundle) => bundle.slug))
    for (const type of ['gabinet', 'truck', 'warsztat', 'produkcja'] as const) {
      expect(slugs(type).every((slug) => known.has(slug))).toBe(true)
      expect(slugs(type).length).toBeGreaterThan(0)
    }
  })
})
