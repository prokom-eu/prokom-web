import { describe, expect, it } from 'vitest'

import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import { labeledSourceLinks, sameAddress } from './sourceLabels'

/** „Skąd są te informacje” on every ready card of the K4 package (audit 14.11 P1-3). */

type Card = {
  slug_seed: string
  status: string
  nazwa: string
  krotka?: string | null
  zrodla?: { url: string; etykieta: string }[] | null
}

const ready = (k4Catalog as unknown as { produkty: Card[] }).produkty.filter(
  (card) => card.status === 'gotowe',
)
const sourcesOf = (card: Card) =>
  labeledSourceLinks(
    (card.zrodla ?? []).map(({ url, etykieta }) => ({ url, label: etykieta })),
    [card.nazwa, card.krotka ?? ''],
  )

describe('sources of a ready card (audit 14.11 P1-3)', () => {
  it('no two sources with one label', () => {
    const repeated = ready.flatMap((card) => {
      const labels = sourcesOf(card).map((source) => source.label)
      return labels
        .filter((label, index) => labels.indexOf(label) !== index)
        .map((label) => `${card.slug_seed}: ${label}`)
    })
    expect(repeated).toEqual([])
  })

  it('no two sources with one address', () => {
    const repeated = ready.flatMap((card) => {
      const addresses = sourcesOf(card).map((source) => sameAddress(source.url))
      return addresses
        .filter((address, index) => addresses.indexOf(address) !== index)
        .map((address) => `${card.slug_seed}: ${address}`)
    })
    expect(repeated).toEqual([])
  })
})
