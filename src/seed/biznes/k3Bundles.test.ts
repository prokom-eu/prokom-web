import { describe, expect, it } from 'vitest'

import bundlesFile from '../../../seed/prokombiznes/k3/zestawy.json'
import plans from '../../../seed/prokombiznes/k31/plansze-k31.json'
import {
  bundleData,
  bundleStatus,
  nextBundleStatus,
  sceneBundles,
  type BundleRefs,
  type K3Bundle,
} from './k3Bundles'

const bundles: K3Bundle[] = bundlesFile.zestawy
const ids = new Map<string, number>()
const idOf = (key: string) => {
  if (!ids.has(key)) ids.set(key, ids.size + 1)
  return ids.get(key)
}

const refs: BundleRefs = {
  cards: (slug) => [slug],
  product: idOf,
  industry: (slug) => (slug === 'magazyn-produkcja' ? undefined : idOf(`industry:${slug}`)),
  category: (code) => idOf(`category:${code}`),
  hidden: new Set(['opieka', 'kopie', 'przeglad']),
}

const all = bundles.map((bundle) => bundleData(bundle, bundlesFile.sprawdzone_zgodnosci, refs))
const bySlug = (slug: string) => all.find((bundle) => bundle.slug === slug)!

describe('bundleData (K3c, K3-KATALOG §7)', () => {
  it('maps the 23 bundles onto the 8 areas of the board', () => {
    const areas: Record<string, number> = {}
    for (const bundle of all) areas[bundle.area] = (areas[bundle.area] ?? 0) + 1
    expect(all).toHaveLength(23)
    expect(areas).toEqual({
      sklep: 5,
      gastronomia: 5,
      noclegi: 3,
      biuro: 4,
      gabinet: 1,
      szkola: 2,
      siec: 2,
      ekrany: 1,
    })
  })

  it('marks „Gotowe” only the bundles without open questions (3), like the package', () => {
    expect(all.filter((bundle) => bundle.contentStatus === 'ready').map((b) => b.slug)).toEqual([
      'zestaw-noclegi-kwatera',
      'zestaw-szkola-sala-interaktywna',
      'zestaw-wifi-omada',
    ])
    for (const bundle of bundles) {
      expect(bundleStatus(bundle) === 'ready' ? 'gotowe' : 'do-sprawdzenia').toBe(bundle.status)
    }
  })

  it('keeps items in order with quantity, version and the required flag', () => {
    const kawiarnia = bySlug('zestaw-kawiarnia-lada')
    expect(kawiarnia.items).toHaveLength(10)
    expect(kawiarnia.items.filter((item) => item.mandatory)).toHaveLength(5)
    expect(kawiarnia.items[0]).toMatchObject({
      product: idOf('d3'),
      role: 'terminal POS z ekranem dotykowym',
      quantity: '1',
      mandatory: true,
    })
  })

  it('keeps internal fields in the panel fields only', () => {
    const kawiarnia = bySlug('zestaw-kawiarnia-lada')
    expect(kawiarnia.items.find((item) => item.toConfirm)?.toConfirm).toMatch(/GoPOS/)
    expect(kawiarnia.compatChecks.length).toBeGreaterThan(0)
    const notes = bySlug('zestaw-sklep-spozywczy-program-waga-etykiet').internalNotes
    expect(notes).toMatch(/Usługi po akceptacji szefa: kopie, opieka\./)
    const publicText = JSON.stringify({
      ...kawiarnia,
      items: [],
      internalNotes: null,
      compatChecks: [],
    })
    expect(publicText).not.toMatch(/do_potwierdzenia|uwagi_wewnetrzne/)
  })

  it('leaves out services waiting for the boss and industries without a record', () => {
    const hiddenRefs = { ...refs, hidden: new Set(['szkol']) }
    const [first] = bundles
    const data = bundleData(first!, [], hiddenRefs)
    expect(data.services).not.toContain(idOf('szkol'))
    const etykiety = bySlug('zestaw-sklep-etykiety-inwentaryzacja')
    expect(etykiety.industries).toEqual([idOf('industry:handel')])
  })

  it('links „Zobacz też” to catalog categories', () => {
    expect(bySlug('zestaw-szkola-siec').related).toEqual([idOf('category:dof')])
  })

  it('fails on a card without a record', () => {
    const [first] = bundles
    expect(() => bundleData(first!, [], { ...refs, product: () => undefined })).toThrow(
      /has no record/,
    )
  })
})

describe('nextBundleStatus', () => {
  it('moves forward only', () => {
    expect(nextBundleStatus('needs-review', 'ready')).toBe('ready')
    expect(nextBundleStatus('needs-review', 'needs-review')).toBe('needs-review')
    expect(nextBundleStatus('ready', undefined)).toBe('ready')
  })
})

describe('sceneBundles', () => {
  it('finds every bundle named under the floor plans', () => {
    const known = new Set(bundles.map((bundle) => bundle.slug))
    for (const scene of plans.sceny) {
      expect(
        sceneBundles(scene.zestawy, (slug) => (known.has(slug) ? 1 : undefined), scene.id),
      ).toHaveLength(scene.zestawy?.length ?? 0)
    }
  })
})
