import { describe, expect, it } from 'vitest'

import type { CatalogIndex } from './catalogIndex'
import { megaMenu } from './menu'

const group = (slug: string, name: string) =>
  ({
    slug,
    name,
    icon: 'store',
    gradient: ['#000000', '#FFFFFF'],
  }) as CatalogIndex['groups'][number]

const category = (slug: string, groupSlug: string, count: number) => ({
  slug,
  name: slug,
  group: groupSlug,
  count,
})

const index = {
  products: Array.from({ length: 12 }, () => ({})) as CatalogIndex['products'],
  brands: [{}, {}, {}] as CatalogIndex['brands'],
  groups: [group('sprzedaz', 'Kasy i sprzedaż'), group('oprogramowanie', 'Oprogramowanie')],
  categories: [
    category('kasy-fiskalne', 'sprzedaz', 4),
    category('drukarki-fiskalne', 'sprzedaz', 2),
    category('terminale-platnicze', 'sprzedaz', 3),
    category('programy', 'oprogramowanie', 3),
  ],
} satisfies Pick<CatalogIndex, 'products' | 'brands' | 'groups' | 'categories'>

describe('megaMenu', () => {
  it('builds one column per group with its categories and counts', () => {
    const menu = megaMenu(index, { columnLimit: 6, highlights: [] })
    expect(menu.total).toEqual({ products: 12, brands: 3 })
    expect(menu.columns.map((column) => column.name)).toEqual(['Kasy i sprzedaż', 'Oprogramowanie'])
    expect(menu.columns[0]).toMatchObject({
      href: '/oferta?grupa=sprzedaz',
      items: [
        { label: 'kasy-fiskalne', href: '/oferta/kasy-fiskalne', count: 4 },
        { label: 'drukarki-fiskalne', href: '/oferta/drukarki-fiskalne', count: 2 },
        { label: 'terminale-platnicze', href: '/oferta/terminale-platnicze', count: 3 },
      ],
      more: null,
    })
  })

  it('puts highlights first and fills the column up to the limit', () => {
    const menu = megaMenu(index, {
      columnLimit: 3,
      highlights: [{ group: 'sprzedaz', label: 'Przegląd', href: '/opieka-it', badge: '0 zł' }],
    })
    expect(menu.columns[0]?.items).toEqual([
      { label: 'Przegląd', href: '/opieka-it', badge: '0 zł' },
      { label: 'kasy-fiskalne', href: '/oferta/kasy-fiskalne', count: 4 },
      { label: 'drukarki-fiskalne', href: '/oferta/drukarki-fiskalne', count: 2 },
    ])
    // The rest is behind "Wszystkie w grupie →".
    expect(menu.columns[0]?.more).toEqual({ href: '/oferta?grupa=sprzedaz', hidden: 1 })
  })

  it('ignores highlights of groups without listed categories', () => {
    const menu = megaMenu(index, {
      columnLimit: 6,
      highlights: [{ group: 'pusta', label: 'X', href: '/x', badge: null }],
    })
    expect(menu.columns.flatMap((column) => column.items).some((item) => item.label === 'X')).toBe(
      false,
    )
  })
})
