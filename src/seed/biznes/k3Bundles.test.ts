import { describe, expect, it } from 'vitest'

import bundlesFile from '../../../seed/prokombiznes/k3/zestawy.json'
import plans from '../../../seed/prokombiznes/k31/plansze-k31.json'
import {
  bundleBlockers,
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

  it('gives every bundle the status of the package (open item or pair = „Do sprawdzenia”)', () => {
    for (const bundle of bundles) {
      const status = bundleStatus(bundle, { checks: bundlesFile.sprawdzone_zgodnosci })
      expect(status === 'ready' ? 'gotowe' : 'do-sprawdzenia', bundle.slug).toBe(bundle.status)
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
    const market = bySlug('zestaw-sklep-spozywczy-market-pos')
    expect(market.items.find((item) => item.toConfirm)?.toConfirm).toMatch(/PC-POS/)
    expect(kawiarnia.compatChecks.length).toBeGreaterThan(0)
    expect(kawiarnia.compatChecks.find((check) => check.url)?.url).toMatch(/^https:\/\//)
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

describe('bundleBlockers (BIZ-3 §9.1: „Gotowe” only with every question settled)', () => {
  const bundle = {
    slug: 'zestaw-x',
    elementy: [
      { slug: 'kasa', rola: 'kasa', ilosc: 1, obowiazkowy: true },
      { slug: 'term', rola: 'terminal', ilosc: 1, obowiazkowy: false },
    ],
  }
  const ready = (slug: string) => (slug === 'term' ? 'do-sprawdzenia' : 'gotowe')

  it('is ready with no open item, no open pair and only ready cards', () => {
    expect(bundleBlockers(bundle, { cardStatus: () => 'gotowe' })).toEqual([])
    expect(bundleStatus(bundle, { cardStatus: () => 'gotowe' })).toBe('ready')
  })

  it('blocks on an item waiting for a confirmation', () => {
    const open = {
      ...bundle,
      elementy: [{ ...bundle.elementy[0]!, do_potwierdzenia: 'Napięcie szuflady?' }],
    }
    expect(bundleBlockers(open)).toEqual(['kasa: Napięcie szuflady?'])
    expect(bundleStatus(open)).toBe('needs-review')
  })

  it('blocks on a card that is not ready (a bundle never outruns its cards)', () => {
    expect(bundleBlockers(bundle, { cardStatus: ready })).toEqual(['term: karta do-sprawdzenia'])
    expect(bundleBlockers(bundle, { cardStatus: () => undefined })).toHaveLength(2)
  })

  it('blocks on an open pair of the bundle only; „bez integracji” is settled', () => {
    const checks = [
      { zestaw: 'zestaw-x', para: 'kasa ↔ terminal', status: 'do_potwierdzenia' },
      { zestaw: 'zestaw-x', para: 'kasa ↔ waga', status: 'bez-integracji' },
      { zestaw: 'zestaw-y', para: 'inna', status: 'do_potwierdzenia' },
    ]
    expect(bundleBlockers(bundle, { checks })).toEqual(['kasa ↔ terminal: para do potwierdzenia'])
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
