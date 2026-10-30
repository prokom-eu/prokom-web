import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import slugMap from '../../../seed/prokombiznes/k4/mapa-slugow-k4.json'
import homeFile from '../../../seed/prokombiznes/k4/strona-glowna-k4.json'
import {
  K4_FEATURED,
  k4CategoryOrder,
  k4GroupProducts,
  k4HomeProductFields,
  type K4HomeFile,
} from './k4Home'

const home: K4HomeFile = homeFile
const cards = new Set(catalog.produkty.map((card) => card.slug_seed))
const splitCards = Object.values(slugMap.niepodzielone).flatMap((split) => split.nowe)

describe('K4_FEATURED (K35 §7a)', () => {
  it('has 16 cards of the K4 catalog with the pill counts of the board', () => {
    expect(K4_FEATURED).toHaveLength(16)
    for (const item of K4_FEATURED) expect(cards.has(item.slug), item.slug).toBe(true)
    const pills: Record<string, number> = {}
    for (const item of K4_FEATURED) pills[item.group] = (pills[item.group] ?? 0) + 1
    expect(pills).toEqual({
      'kasy-platnosci': 5,
      'komputery-telefony': 5,
      'programy-ochrona': 4,
      zasilanie: 2,
    })
  })
})

describe('k4CategoryOrder (pop9)', () => {
  const order = k4CategoryOrder(home, slugMap.niepodzielone)

  it('names only cards of the K4 catalog or of the repo split', () => {
    for (const slug of order.keys()) {
      expect(cards.has(slug) || splitCards.includes(slug), slug).toBe(true)
    }
  })

  it('gives the place of a card the repo split to each of its new cards', () => {
    const place = home.kolejnosc_w_kategorii['lenovo-yoga-pro']
    expect(order.get('lenovo-yoga-pro-7-15')).toBe(place)
    expect(order.get('lenovo-yoga-pro-9-16')).toBe(place)
    expect(order.has('lenovo-yoga-pro')).toBe(false)
  })

  it('sets the pill only for the 16 and the place for every listed card', () => {
    expect(k4HomeProductFields('ergo', order)).toEqual({
      featuredGroup: 'kasy-platnosci',
      categoryOrder: 0,
    })
    expect(k4HomeProductFields('nieznana', order)).toEqual({
      featuredGroup: null,
      categoryOrder: null,
    })
  })
})

describe('k4GroupProducts (dzTop9, wheel)', () => {
  const ids = new Map<string, number>()
  const idOf = (slug: string) => {
    if (!ids.has(slug)) ids.set(slug, ids.size + 1)
    return ids.get(slug)
  }

  it('gives each of the 5 departments up to 5 first cards and 3 wheel products', () => {
    const groups = k4GroupProducts(home, idOf)
    expect([...groups.keys()]).toEqual(['sprz', 'biuro', 'prog', 'bezp', 'usl'])
    for (const group of groups.values()) {
      expect(group.topProducts).toHaveLength(5)
      expect(group.wheelProducts).toHaveLength(3)
    }
    expect(groups.get('sprz')?.wheelProducts).toEqual([idOf('ergo'), idOf('d3'), idOf('pol')])
  })

  it('stops on a card without a record', () => {
    expect(() => k4GroupProducts(home, (slug) => (slug === 'ergo' ? undefined : 1))).toThrow(/ergo/)
  })
})
