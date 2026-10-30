import { describe, expect, it } from 'vitest'

import type { CatalogIndex } from './catalogIndex'
import { megaMenu, offerMenu } from './menu'

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

  it('lists the subcategory pages under their category, outside the limit (K3b′)', () => {
    const menu = megaMenu(
      {
        ...index,
        groups: [group('biuro', 'Komputery i biuro')],
        categories: [
          {
            ...category('komputery-monitory', 'biuro', 5),
            subcategories: [
              { name: 'Laptopy', slug: 'laptopy', count: 3 },
              { name: 'Bez adresu', count: 2 },
            ],
          },
          category('drukarki', 'biuro', 1),
        ],
      },
      { columnLimit: 2, highlights: [] },
    )
    expect(menu.columns[0]!.items).toEqual([
      {
        label: 'komputery-monitory',
        href: '/oferta/komputery-monitory',
        count: 5,
        sub: [{ label: 'Laptopy', href: '/oferta/komputery-monitory/laptopy', count: 3 }],
      },
      { label: 'drukarki', href: '/oferta/drukarki', count: 1 },
    ])
    expect(menu.columns[0]!.more).toBeNull()
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

describe('offerMenu (K4 mega menu v147c)', () => {
  const img = (url: string) => ({ url, alt: url, width: 100, height: 100 })
  const logo = { url: '/l.webp', width: 80, height: 30 }
  const product = (
    slug: string,
    groupSlug: string,
    categories: string[],
    extra: Partial<CatalogIndex['products'][number]> = {},
  ) =>
    ({
      slug,
      name: slug,
      brand: null,
      group: groupSlug,
      categories,
      popularity: 50,
      ...extra,
    }) as CatalogIndex['products'][number]

  const k4 = {
    ...index,
    products: [
      product('a', 'sprzedaz', ['kasy-fiskalne'], { brand: 'posnet', image: img('/a.webp') }),
      product('b', 'sprzedaz', ['kasy-fiskalne'], {
        brand: 'elzab',
        image: img('/b.webp'),
        featuredOrder: 2,
      }),
      product('c', 'sprzedaz', ['drukarki-fiskalne'], { brand: 'posnet', popularity: 90 }),
      product('d', 'oprogramowanie', ['programy'], { brand: 'insert' }),
    ],
    brands: [
      { slug: 'elzab', name: 'Elzab', status: 'authorized-service', logo },
      { slug: 'posnet', name: 'Posnet', status: 'authorized-service', logo },
      { slug: 'insert', name: 'InsERT', status: 'authorized-partner' },
    ],
    pages: [
      { slug: 'gopos', title: 'GoPOS' },
      { slug: 'zestawy/a', title: 'A' },
      { slug: 'zestawy/b', title: 'B' },
    ],
  } satisfies Parameters<typeof offerMenu>[0]
  const menu = offerMenu(k4)

  it('gives each department its products, categories and the address of its catalog', () => {
    const sales = menu.departments[0]!
    expect(sales).toMatchObject({ slug: 'sprzedaz', count: 3, href: '/oferta?grupa=sprzedaz' })
    expect(sales.categories.map((item) => item.label)).toEqual([
      'kasy-fiskalne',
      'drukarki-fiskalne',
      'terminale-platnicze',
    ])
  })

  it('pictures a category with its featured product first, nothing without a photo', () => {
    const [kasy, drukarki] = menu.departments[0]!.categories
    expect(kasy!.image?.url).toBe('/b.webp')
    expect(drukarki!.image).toBeUndefined()
  })

  it('lists brands with a logo, most products first', () => {
    expect(menu.departments[0]!.brands.map((brand) => brand.slug)).toEqual(['posnet', 'elzab'])
    expect(menu.departments[1]!.brands).toEqual([])
  })

  it('counts products, brands and ready bundles', () => {
    expect(menu.totals).toEqual({ products: 4, brands: 3, bundles: 2 })
  })
})
