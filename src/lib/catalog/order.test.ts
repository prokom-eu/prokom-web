import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import dictionaries from '../../../seed/prokombiznes/k4/slowniki-k4.json'
import home from '../../../seed/prokombiznes/k4/strona-glowna-k4.json'
import {
  compareInCategory,
  departmentRows,
  menuOrder,
  ROW_NARROW,
  ROW_WIDE,
  type OrderedProduct,
  type OrderSource,
} from './order'

// The K4 package as the index carries it (codes stand in for slugs — the order reads neither).
const order = home.kolejnosc_w_kategorii as Record<string, number>
const products: OrderedProduct[] = catalog.produkty.map((card) => ({
  slug: card.slug_seed,
  group: card.dzial,
  categories: [card.kategoria],
  popularity: 50,
  ...(order[card.slug_seed] !== undefined && { order: order[card.slug_seed] }),
}))
const source: OrderSource = {
  groups: dictionaries.dzialy.map(({ slug }) => ({
    slug,
    top: (home.top_dzialu as Record<string, string[]>)[slug] ?? [],
  })),
  categories: dictionaries.kategorie.map(({ kod, dzial }) => ({ slug: kod, group: dzial })),
}

const slugs = (list: OrderedProduct[]) => list.map(({ slug }) => slug)

describe('departmentRows (K36 §10)', () => {
  it('opens with the department tops, a row each (the first screen of the design)', () => {
    expect(slugs(departmentRows(products, source, ROW_WIDE).slice(0, 15))).toEqual([
      'ergo',
      'k10',
      'd3',
      'lenovo-thinkbook-14-g8-g9',
      'apple-iphone-17',
      'brother-mfc-l2922dw-mfc-l2862dw',
      'nexo',
      'gopos',
      'microsoft-365-business',
      'udr7',
      'u7',
      'eset',
      'przkas',
      'srvkas',
      'przeglad-it',
    ])
  })

  it('keeps every card once, whatever the row length', () => {
    for (const row of [ROW_WIDE, ROW_NARROW]) {
      const result = slugs(departmentRows(products, source, row))
      expect(result).toHaveLength(products.length)
      expect(new Set(result).size).toBe(products.length)
    }
  })

  it('with 2 per row, the rows still change department', () => {
    expect(slugs(departmentRows(products, source, ROW_NARROW).slice(0, 4))).toEqual([
      'ergo',
      'k10',
      'lenovo-thinkbook-14-g8-g9',
      'apple-iphone-17',
    ])
  })

  it('after the top, the categories of a department take turns', () => {
    const tiny: OrderedProduct[] = [
      { slug: 'a1', group: 'g', categories: ['a'], popularity: 1, order: 1 },
      { slug: 'a0', group: 'g', categories: ['a'], popularity: 1, order: 0 },
      { slug: 'b0', group: 'g', categories: ['b'], popularity: 9 },
      { slug: 'top', group: 'g', categories: ['b'], popularity: 0 },
    ]
    const tinySource: OrderSource = {
      groups: [{ slug: 'g', top: ['top'] }],
      categories: [
        { slug: 'a', group: 'g' },
        { slug: 'b', group: 'g' },
      ],
    }
    expect(slugs(departmentRows(tiny, tinySource, 3))).toEqual(['top', 'a0', 'b0', 'a1'])
  })

  it('a card without a listed department comes last', () => {
    const orphan = { slug: 'x', group: null, categories: [], popularity: 99 }
    expect(departmentRows([orphan, ...products], source, ROW_WIDE).at(-1)).toBe(orphan)
  })
})

describe('menuOrder', () => {
  it('lists departments and categories as the menu, then `pop9` inside the category', () => {
    const result = menuOrder(products, source)
    expect(result[0]?.slug).toBe(
      products.find((p) => p.categories[0] === 'kasy' && p.order === 0)?.slug,
    )
    const groups = result.map((product) => product.group)
    // Each department is one block, in menu order.
    expect([...new Set(groups)]).toEqual(source.groups.map(({ slug }) => slug))
    const sales = result.filter((product) => product.group === 'sprz')
    expect(sales.map((p) => p.categories[0]).filter((c, i, all) => all.indexOf(c) === i)).toEqual(
      source.categories.filter((c) => c.group === 'sprz').map((c) => c.slug),
    )
  })
})

describe('compareInCategory', () => {
  it('numbered cards first, then the more popular', () => {
    const card = (slug: string, popularity: number, order?: number): OrderedProduct => ({
      slug,
      group: 'g',
      categories: ['c'],
      popularity,
      ...(order !== undefined && { order }),
    })
    expect(
      slugs(
        [card('a', 90), card('b', 10, 1), card('c', 50), card('d', 5, 0)].sort(compareInCategory),
      ),
    ).toEqual(['d', 'b', 'a', 'c'])
  })
})
