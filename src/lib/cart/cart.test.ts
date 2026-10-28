import { describe, expect, it } from 'vitest'

import { buildCatalogIndex, type CatalogIndex, type IndexProduct } from '../catalog/catalogIndex'
import { sourceFromSeed } from '../catalog/seedSource.fixture'
import {
  addAll,
  addItems,
  addOnly,
  type CartItem,
  cartCount,
  changeQty,
  MAX_ITEMS,
  MAX_NOTE,
  MAX_QTY,
  parseCart,
  prune,
  remove,
  setNote,
  suggestFor,
  toggle,
} from './cart'

const item = (id: string, q = 1): CartItem => ({ id, q })

describe('parseCart', () => {
  it('reads the pk-cart format', () => {
    expect(parseCart('[{"id":"a","q":2,"uwaga":"czarna"},{"id":"b","q":1}]')).toEqual([
      { id: 'a', q: 2, uwaga: 'czarna' },
      { id: 'b', q: 1 },
    ])
  })

  it('starts empty on nothing, bad JSON or a wrong shape', () => {
    for (const raw of [null, '', 'nie json', '{"id":"a"}', '42', 'null']) {
      expect(parseCart(raw)).toEqual([])
    }
  })

  it('drops broken entries and duplicates, clamps quantities and notes', () => {
    const raw = JSON.stringify([
      { id: 'a', q: 0 },
      { id: 'a', q: 5 },
      { id: '', q: 1 },
      { q: 1 },
      'x',
      { id: 'b', q: 1.7 },
      { id: 'c', q: 10_000 },
      { id: 'd', q: 'dwa' },
      { id: 'e', q: 1, uwaga: 'x'.repeat(MAX_NOTE + 10) },
      { id: 'f', q: 1, uwaga: 7 },
    ])
    expect(parseCart(raw)).toEqual([
      { id: 'a', q: 1 },
      { id: 'b', q: 1 },
      { id: 'c', q: MAX_QTY },
      { id: 'd', q: 1 },
      { id: 'e', q: 1, uwaga: 'x'.repeat(MAX_NOTE) },
      { id: 'f', q: 1 },
    ])
  })

  it(`keeps at most ${MAX_ITEMS} positions`, () => {
    const many = Array.from({ length: MAX_ITEMS + 5 }, (_, i) => item(`p${i}`))
    expect(parseCart(JSON.stringify(many))).toHaveLength(MAX_ITEMS)
  })
})

describe('actions', () => {
  it('toggle adds a missing position and removes a present one', () => {
    const added = toggle([], 'a')
    expect(added).toEqual({ cart: [item('a')], added: true })
    expect(toggle(added.cart, 'a')).toEqual({ cart: [], added: false })
  })

  it('addOnly never removes and keeps the same list when present', () => {
    const cart = [item('a', 3)]
    expect(addOnly(cart, 'a')).toBe(cart)
    expect(addOnly(cart, 'b')).toEqual([item('a', 3), item('b')])
  })

  it(`does not grow past ${MAX_ITEMS} positions`, () => {
    const full = Array.from({ length: MAX_ITEMS }, (_, i) => item(`p${i}`))
    expect(addOnly(full, 'new')).toBe(full)
    expect(toggle(full, 'new')).toEqual({ cart: full, added: false })
  })

  it('changes the quantity by ±1, never below 1 nor above the cap', () => {
    expect(changeQty([item('a', 2)], 'a', 1)).toEqual([item('a', 3)])
    expect(changeQty([item('a', 1)], 'a', -1)).toEqual([item('a', 1)])
    expect(changeQty([item('a', MAX_QTY)], 'a', 1)).toEqual([item('a', MAX_QTY)])
    expect(changeQty([item('a')], 'b', 1)).toEqual([item('a')])
  })

  it('removes a position and sets or clears its note', () => {
    expect(remove([item('a'), item('b')], 'a')).toEqual([item('b')])
    const noted = setNote([item('a')], 'a', '  kolor czarny ')
    expect(noted).toEqual([{ id: 'a', q: 1, uwaga: 'kolor czarny' }])
    expect(setNote(noted, 'a', '   ')).toEqual([item('a')])
  })

  it('prune drops slugs the catalog does not know', () => {
    const cart = [item('a'), item('gone'), item('b')]
    expect(prune(cart, new Set(['a', 'b']))).toEqual([item('a'), item('b')])
    expect(prune([item('a')], new Set(['a']))).toEqual([item('a')])
  })

  it('counts positions, not pieces', () => {
    expect(cartCount([item('a', 5), item('b', 2)])).toBe(2)
  })
})

describe('suggestFor (Często dobierane)', () => {
  const index = buildCatalogIndex(sourceFromSeed())
  const bySlug = new Map(index.products.map((p) => [p.slug, p]))
  const product = (slug: string) => bySlug.get(slug)!

  it('suggests nothing for an empty list', () => {
    expect(suggestFor([], index)).toEqual([])
  })

  it('without "Skompletuj stanowisko": same group, another category, most popular first', () => {
    const ergo = product('posnet-ergo-online')
    const suggested = suggestFor([item(ergo.slug)], index, 3)
    expect(suggested).toHaveLength(3)
    for (const p of suggested) {
      expect(p.group).toBe(ergo.group)
      expect(p.categories[0]).not.toBe(ergo.categories[0])
    }
    const popularity = suggested.map((p) => p.popularity)
    expect(popularity).toEqual([...popularity].sort((a, b) => b - a))
  })

  it('a product without a group does not pull in every other product without one', () => {
    const noGroup: CatalogIndex = {
      ...index,
      products: index.products.map((p): IndexProduct => ({ ...p, group: null })),
    }
    expect(suggestFor([item('posnet-ergo-online')], noGroup)).toEqual([])
  })

  it('puts the products of "Skompletuj stanowisko" first and skips what is on the list', () => {
    const terminal = product('terminal-platniczy-polcard')
    const ksef = product('wdrozenie-ksef-w-firmie')
    const withFits: CatalogIndex = {
      ...index,
      products: index.products.map((p): IndexProduct =>
        p.slug === 'posnet-ergo-online' ? { ...p, fits: [ksef.slug, terminal.slug] } : p,
      ),
    }
    const suggested = suggestFor(
      [item('posnet-ergo-online'), item(terminal.slug)],
      withFits,
      2,
    ).map((p) => p.slug)
    expect(suggested[0]).toBe(ksef.slug)
    expect(suggested).not.toContain(terminal.slug)
    expect(suggested).not.toContain('posnet-ergo-online')
  })
})

describe('addAll', () => {
  it('adds the missing ones in order, keeps quantities and notes of the listed ones', () => {
    const cart: CartItem[] = [{ id: 'szuflada', q: 2, uwaga: 'czarna' }]
    expect(addAll(cart, ['szuflada', 'terminal', 'przeglad', 'terminal'])).toEqual({
      cart: [
        { id: 'szuflada', q: 2, uwaga: 'czarna' },
        { id: 'terminal', q: 1 },
        { id: 'przeglad', q: 1 },
      ],
      added: ['terminal', 'przeglad'],
    })
  })

  it('stops at the item limit and returns the same list when nothing is added', () => {
    const full = Array.from({ length: MAX_ITEMS }, (_, i) => ({ id: `p${i}`, q: 1 }))
    const result = addAll(full, ['nowy'])
    expect(result.cart).toBe(full)
    expect(result.added).toEqual([])

    const almost = full.slice(1)
    expect(addAll(almost, ['a', 'b']).added).toEqual(['a'])
  })
})

describe('addItems (Zapytaj o ten zestaw)', () => {
  it('adds missing items with quantity and note, in order', () => {
    const { cart, added } = addItems(
      [],
      [
        { id: 'd3', q: 1, uwaga: 'Zestaw: Kawiarnia; wersja: D3 PRO' },
        { id: 'pol', q: 2000, uwaga: '' },
      ],
    )
    expect(cart).toEqual([
      { id: 'd3', q: 1, uwaga: 'Zestaw: Kawiarnia; wersja: D3 PRO' },
      { id: 'pol', q: MAX_QTY },
    ])
    expect(added).toEqual(['d3', 'pol'])
  })

  it('keeps the quantity of a listed item and gives it the note only when it has none', () => {
    const start = [
      { id: 'd3', q: 3 },
      { id: 'zeta', q: 1, uwaga: 'czarna' },
    ]
    const { cart, added, noted } = addItems(start, [
      { id: 'd3', q: 1, uwaga: 'Zestaw: K' },
      { id: 'zeta', q: 1, uwaga: 'Zestaw: K' },
    ])
    expect(cart).toEqual([
      { id: 'd3', q: 3, uwaga: 'Zestaw: K' },
      { id: 'zeta', q: 1, uwaga: 'czarna' },
    ])
    expect(added).toEqual([])
    expect(noted).toEqual(['d3'])
  })

  it('stops at the item limit and cuts long notes', () => {
    const full = Array.from({ length: MAX_ITEMS }, (_, i) => item(`p${i}`))
    expect(addItems(full, [{ id: 'new', q: 1 }])).toMatchObject({ added: [], skipped: ['new'] })
    const [only] = addItems([], [{ id: 'x', q: 1, uwaga: 'a'.repeat(MAX_NOTE + 9) }]).cart
    expect(only?.uwaga).toHaveLength(MAX_NOTE)
  })
})
