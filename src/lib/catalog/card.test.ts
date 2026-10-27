import { describe, expect, it } from 'vitest'

import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { cardIcon, productBadges } from './card'

const product = (overrides: Partial<IndexProduct>): IndexProduct => ({
  slug: 'p',
  name: 'P',
  brand: 'marka',
  kind: 'device',
  categories: [],
  group: null,
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 0,
  registerTypes: [],
  hay: 'p',
  ...overrides,
})

const brands = [
  { slug: 'marka', name: 'Marka', status: 'none' as const },
  { slug: 'gopos', name: 'GoPOS', status: 'authorized-partner' as const },
  { slug: 'posnet', name: 'Posnet', status: 'authorized-service' as const },
]

const labels = (overrides: Partial<IndexProduct>) =>
  productBadges(product(overrides), brands).map((badge) => badge.label)

describe('productBadges (spec. §5.3, at most 2)', () => {
  it('marks services, news and the marketing badge, in this order', () => {
    expect(labels({ kind: 'service' })).toEqual(['Usługa'])
    expect(labels({ isNew: true, badge: 'Ulga do 700 zł' })).toEqual(['Nowość', 'Ulga do 700 zł'])
    expect(labels({ kind: 'service', isNew: true, badge: 'Bezpłatnie' })).toEqual([
      'Usługa',
      'Nowość',
    ])
  })

  it('names the authorization after the brand status', () => {
    expect(labels({ authorized: true, brand: 'gopos' })).toEqual(['Autoryzowany partner'])
    expect(labels({ authorized: true, brand: 'posnet' })).toEqual(['Autoryzowany serwis'])
  })

  it('falls back to the kind without a brand status: software → partner, else service', () => {
    expect(labels({ authorized: true, kind: 'software' })).toEqual(['Autoryzowany partner'])
    expect(labels({ authorized: true, kind: 'service' })).toEqual(['Usługa', 'Autoryzowany serwis'])
  })

  it('keeps the authorization only while there is room', () => {
    expect(labels({ authorized: true, badge: 'Ulga do 700 zł', brand: 'posnet' })).toEqual([
      'Ulga do 700 zł',
      'Autoryzowany serwis',
    ])
    expect(labels({ authorized: true, isNew: true, kind: 'service' })).toEqual(['Usługa', 'Nowość'])
  })
})

describe('cardIcon', () => {
  const index = {
    categories: [
      { slug: 'kasy', name: 'Kasy', group: 'sprzedaz', icon: 'store', count: 1 },
      { slug: 'uslugi', name: 'Usługi', group: 'serwis', count: 1 },
    ],
    groups: [
      { slug: 'sprzedaz', name: 'Sprzedaż', icon: 'wallet', gradient: ['#111111', '#222222'] },
      { slug: 'serwis', name: 'Serwis', icon: 'wrench', gradient: ['#333333', '#444444'] },
    ],
  } as unknown as CatalogIndex

  it('takes the main category icon', () => {
    expect(cardIcon(product({ categories: ['kasy'], group: 'sprzedaz' }), index)).toBe('store')
  })

  it('falls back to the group icon, then to the store icon', () => {
    expect(cardIcon(product({ categories: ['uslugi'], group: 'serwis' }), index)).toBe('wrench')
    expect(cardIcon(product({}), index)).toBe('store')
  })
})
