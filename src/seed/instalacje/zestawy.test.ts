import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokominstalacje/katalog/katalog-inst.json'
import bundlesFile from '../../../seed/prokominstalacje/katalog/zestawy-inst.json'
import { COPY_WORDS } from '../../lib/instalacje/copyWords'
import {
  groupSeries,
  instBundleData,
  INST_GROUP_AREAS,
  orderedBundles,
  type InstBundlesFile,
} from './zestawy'

const file = bundlesFile as unknown as InstBundlesFile
const cards = new Map(
  (catalog as unknown as { produkty: { slug_seed: string; status: string }[] }).produkty.map(
    (card, id) => [card.slug_seed, { id, status: card.status }],
  ),
)
const refs = {
  product: (slug: string) => cards.get(slug)?.id,
  cardStatus: (slug: string) => cards.get(slug)?.status,
}

describe('Instalacje bundles (INST-K3)', () => {
  const bundles = orderedBundles(file)

  it('maps every bundle: known group, cards in the catalog, fields within their limits', () => {
    for (const [order, [slug, bundle]] of bundles.entries()) {
      const data = instBundleData(slug, bundle, order, refs)
      expect(INST_GROUP_AREAS[bundle.grupa], slug).toBeDefined()
      expect(data.name.length, slug).toBeLessThanOrEqual(120)
      expect(data.audience.length, slug).toBeLessThanOrEqual(300)
      expect(data.benefit.length, slug).toBeLessThanOrEqual(300)
      for (const item of data.items) {
        expect(item.role.length, `${slug}: ${item.role}`).toBeLessThanOrEqual(80)
        expect((item.suggestedVersion ?? '').length, slug).toBeLessThanOrEqual(200)
      }
      expect(data.items.length, slug).toBeGreaterThan(1)
    }
  })

  it('a bundle is ready only with every item card ready', () => {
    const [slug, bundle] = bundles[0]!
    const notReady = { ...refs, cardStatus: () => 'do-sprawdzenia' }
    expect(instBundleData(slug, { ...bundle, status: 'gotowe' }, 0, notReady).contentStatus).toBe(
      'needs-review',
    )
    expect(
      instBundleData(slug, { ...bundle, status: 'do-potwierdzenia' }, 0, refs).contentStatus,
    ).toBe('needs-review')
  })

  it('texts follow the line rules: no prices, no phrases from COPY_WORDS', () => {
    const text = JSON.stringify(file.zestawy)
    expect(text).not.toMatch(/\d\s?zł|PLN/)
    const texts = Object.values(file.zestawy).flatMap((bundle) => [
      bundle.dla,
      bundle.korzysc,
      ...bundle.opis,
      ...(bundle.why ?? []),
      ...(bundle.faq ?? []).flatMap(({ q, a }) => [q, a]),
    ])
    const sentences = texts
      .flatMap((value) => value.split(/(?<=[.!?])\s+/))
      .filter((sentence) => COPY_WORDS.test(sentence))
    expect(sentences).toEqual([])
  })

  it('series keys are plain slugs', () => {
    expect(groupSeries('Kościół i parafia')).toBe('kosciol-i-parafia')
    expect(groupSeries('Firma, biuro i hala')).toBe('firma-biuro-i-hala')
  })
})
