import { describe, expect, it } from 'vitest'

import type { CatalogCategory, Media } from '@/payload-types'

import {
  boughtWithTiles,
  buildCategoryView,
  categoryBrands,
  categoryPill,
  categoryProducts,
  filterCategoryProducts,
  findSubcategory,
  helpCardSpan,
  registerOptions,
  subcategoryHref,
  subcategoryLinks,
  subcategoryProducts,
  subcategoryTitle,
} from './category'
import type { CatalogIndex, IndexProduct } from './catalogIndex'

const product = (slug: string, fields: Partial<IndexProduct> = {}): IndexProduct => ({
  slug,
  name: slug.toUpperCase(),
  brand: null,
  kind: 'device',
  categories: ['kasy-fiskalne'],
  group: 'sprzedaz',
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 50,
  registerTypes: [],
  hay: slug,
  ...fields,
})

const index = (products: IndexProduct[], fields: Partial<CatalogIndex> = {}): CatalogIndex => ({
  products,
  brands: [],
  categories: [],
  groups: [],
  industries: [],
  pages: [],
  search: { synonyms: {}, stopWords: [], popular: [] },
  ...fields,
})

describe('categoryProducts', () => {
  it('takes every listed product in the category, as the menu counts them, in index order', () => {
    const catalog = index([
      product('ergo'),
      product('terminal', { categories: ['terminale-platnicze'] }),
      product('szuflada', { categories: ['akcesoria-pos', 'kasy-fiskalne'] }),
    ])
    expect(categoryProducts(catalog, 'kasy-fiskalne').map((item) => item.slug)).toEqual([
      'ergo',
      'szuflada',
    ])
  })

  it('is empty for an unknown or empty category (the page is 404 then)', () => {
    expect(categoryProducts(index([product('ergo')]), 'automaty-vendingowe')).toEqual([])
  })
})

describe('categoryBrands', () => {
  it('lists brands of the products with counts, most products first, then by name', () => {
    const products = [
      product('a', { brand: 'elzab' }),
      product('b', { brand: 'posnet' }),
      product('c', { brand: 'posnet' }),
      product('d', { brand: 'fawag' }),
      product('e'),
    ]
    const catalog = index(products, {
      brands: [
        { slug: 'elzab', name: 'Elzab', status: 'none' },
        { slug: 'fawag', name: 'Fawag', status: 'none' },
        { slug: 'posnet', name: 'Posnet', status: 'authorized-service' },
      ],
    })
    expect(categoryBrands(products, catalog)).toEqual([
      { slug: 'posnet', name: 'Posnet', count: 2 },
      { slug: 'elzab', name: 'Elzab', count: 1 },
      { slug: 'fawag', name: 'Fawag', count: 1 },
    ])
  })
})

describe('registerOptions', () => {
  it('gives the 4 picker options with counts and the picture of the most popular product', () => {
    const image = { url: '/k10.webp', alt: 'K10', width: 480, height: 480 }
    const products = [
      product('ergo', { registerTypes: ['mobile', 'small'] }),
      product('k10', { registerTypes: ['mobile', 'touch'], image }),
      product('neo', { registerTypes: ['system'] }),
    ]
    const options = registerOptions(products)
    expect(options?.map(({ value, count }) => [value, count])).toEqual([
      ['mobile', 2],
      ['small', 1],
      ['system', 1],
      ['touch', 1],
    ])
    expect(options?.[0]).toMatchObject({ title: 'W drodze i u klienta' })
    expect(options?.[3]?.image).toEqual(image)
  })

  it('is off while fewer than 2 products have a register type (data decides, not the slug)', () => {
    expect(registerOptions([product('ergo', { registerTypes: ['small'] }), product('x')])).toBe(
      null,
    )
  })
})

describe('filterCategoryProducts', () => {
  const products = [
    product('ergo', { brand: 'posnet', registerTypes: ['mobile', 'small'] }),
    product('k10', { brand: 'elzab', registerTypes: ['mobile', 'touch'] }),
    product('neo', { brand: 'posnet', registerTypes: ['system'] }),
  ]
  const slugs = (list: IndexProduct[]) => list.map((item) => item.slug)

  it('keeps everything without a choice', () => {
    expect(slugs(filterCategoryProducts(products, {}))).toEqual(['ergo', 'k10', 'neo'])
  })

  it('narrows by register type and brand together', () => {
    expect(slugs(filterCategoryProducts(products, { registerType: 'mobile' }))).toEqual([
      'ergo',
      'k10',
    ])
    expect(
      slugs(filterCategoryProducts(products, { registerType: 'mobile', brand: 'posnet' })),
    ).toEqual(['ergo'])
  })

  it('narrows by the main category (brand page) and a subcategory chip (K3b′)', () => {
    const mixed = [
      product('szuflada', { categories: ['akcesoria-pos'], subcategory: 'Szuflady kasowe' }),
      product('sprawdzarka', { categories: ['akcesoria-pos'], subcategory: 'Sprawdzarki cen' }),
      product('ergo-2', { categories: ['kasy-fiskalne', 'akcesoria-pos'] }),
    ]
    expect(slugs(filterCategoryProducts(mixed, { category: 'akcesoria-pos' }))).toEqual([
      'szuflada',
      'sprawdzarka',
    ])
    expect(slugs(filterCategoryProducts(mixed, { subcategory: 'Szuflady kasowe' }))).toEqual([
      'szuflada',
    ])
  })
})

describe('subcategories (K3b′)', () => {
  const komp = {
    slug: 'komputery-monitory',
    name: 'Komputery i monitory',
    group: 'biuro',
    count: 3,
    subcategories: [
      { name: 'Laptopy', slug: 'laptopy', count: 2 },
      { name: 'Monitory', slug: 'monitory', count: 1 },
    ],
  }
  const akc = {
    slug: 'akcesoria-pos',
    name: 'Akcesoria POS',
    group: 'sprzedaz',
    count: 2,
    subcategories: [{ name: 'Szuflady kasowe', count: 2 }],
  }
  const categories = [komp, akc]

  it('finds a subcategory page only by its address in a listed category', () => {
    expect(findSubcategory({ categories }, 'komputery-monitory', 'laptopy')).toEqual({
      category: komp,
      subcategory: { name: 'Laptopy', slug: 'laptopy', count: 2 },
    })
    expect(findSubcategory({ categories }, 'komputery-monitory', 'tablety')).toBeNull()
    expect(findSubcategory({ categories }, 'akcesoria-pos', 'szuflady-kasowe')).toBeNull()
    expect(findSubcategory({ categories }, 'nieznana', 'laptopy')).toBeNull()
  })

  it('takes the cards whose main category holds the subcategory', () => {
    const products = [
      product('tb', { categories: ['komputery-monitory'], subcategory: 'Laptopy' }),
      product('obcy', { categories: ['inna', 'komputery-monitory'], subcategory: 'Laptopy' }),
      product('mon', { categories: ['komputery-monitory'], subcategory: 'Monitory' }),
    ]
    expect(
      subcategoryProducts({ products }, 'komputery-monitory', 'Laptopy').map((p) => p.slug),
    ).toEqual(['tb'])
  })

  it('links subcategories with an address and keeps the others as chips', () => {
    expect(subcategoryLinks(komp).pages.map((item) => item.href)).toEqual([
      '/oferta/komputery-monitory/laptopy',
      '/oferta/komputery-monitory/monitory',
    ])
    expect(subcategoryLinks(akc)).toEqual({
      pages: [],
      chips: [{ name: 'Szuflady kasowe', count: 2 }],
    })
    expect(subcategoryHref('a b', 'c')).toBe('/oferta/a%20b/c')
  })

  it('names the subcategory page with its brands', () => {
    expect(subcategoryTitle('Laptopy', [{ name: 'Lenovo' }, { name: 'Dell' }])).toBe(
      'Laptopy dla firm — Lenovo i Dell',
    )
    expect(subcategoryTitle('Zasilacze UPS', [{ name: 'APC' }])).toBe(
      'Zasilacze UPS dla firm — APC',
    )
    expect(subcategoryTitle('Projektory', [])).toBe('Projektory dla firm')
  })
})

describe('helpCardSpan', () => {
  it('fills the rest of the last row, or a whole row when it is full', () => {
    expect(helpCardSpan(7, 3)).toBe(2)
    expect(helpCardSpan(8, 3)).toBe(1)
    expect(helpCardSpan(9, 3)).toBe(3)
    expect(helpCardSpan(7, 2)).toBe(1)
    expect(helpCardSpan(0, 3)).toBe(3)
  })
})

describe('boughtWithTiles', () => {
  const image = { url: '/d.webp', alt: 'Drukarka', width: 480, height: 480 }
  const catalog = index(
    [
      product('druk', { categories: ['drukarki-fiskalne'], image }),
      product('druk2', { categories: ['drukarki-fiskalne'] }),
      product('pol', { categories: ['terminale-platnicze'] }),
      product('ergo'),
    ],
    {
      categories: [
        { slug: 'kasy-fiskalne', name: 'Kasy fiskalne', group: 'sprzedaz', count: 1 },
        { slug: 'drukarki-fiskalne', name: 'Drukarki fiskalne', group: 'sprzedaz', count: 5 },
        {
          slug: 'terminale-platnicze',
          name: 'Terminale płatnicze',
          group: 'sprzedaz',
          count: 2,
          icon: 'wallet',
        },
      ],
    },
  )

  it('turns the products into tiles of their main categories: once each, never this one', () => {
    expect(
      boughtWithTiles(catalog, 'kasy-fiskalne', ['druk', 'nie-ma', 'druk2', 'ergo', 'pol']),
    ).toEqual([
      {
        slug: 'drukarki-fiskalne',
        name: 'Drukarki fiskalne',
        count: 5,
        group: 'sprzedaz',
        image,
      },
      {
        slug: 'terminale-platnicze',
        name: 'Terminale płatnicze',
        count: 2,
        group: 'sprzedaz',
        icon: 'wallet',
      },
    ])
  })

  it('keeps at most 4 tiles', () => {
    const many = index(
      ['a', 'b', 'c', 'd', 'e'].map((slug) => product(slug, { categories: [`kat-${slug}`] })),
      {
        categories: ['a', 'b', 'c', 'd', 'e'].map((slug) => ({
          slug: `kat-${slug}`,
          name: slug,
          group: 'g',
          count: 1,
        })),
      },
    )
    expect(boughtWithTiles(many, 'kasy-fiskalne', ['a', 'b', 'c', 'd', 'e'])).toHaveLength(4)
  })
})

describe('buildCategoryView', () => {
  const image: Partial<Media> = {
    alt: 'Kasy',
    url: '/media/kasy.webp',
    width: 1200,
    height: 800,
    tenant: 1,
    requiresConsent: false,
  }
  const category = (fields: Partial<CatalogCategory> = {}): CatalogCategory => ({
    id: 1,
    tenant: 1,
    name: 'Kasy fiskalne',
    slug: 'kasy-fiskalne',
    group: 1,
    description: 'Kasy online z fiskalizacją.',
    updatedAt: '',
    createdAt: '',
    ...fields,
  })

  it('falls back to the name, the short description and general texts', () => {
    const view = buildCategoryView(category(), 1)
    expect(view.title).toBe('Kasy fiskalne')
    expect(view.lead).toBe('Kasy online z fiskalizacją.')
    expect(view.included.cards).toEqual([])
    expect(view.faq.title).toBe('Zanim zdecydujesz')
    expect(view.help.title).toBeTruthy()
    expect(view.contact.heading).toBeTruthy()
  })

  it('makes „W cenie” cards from the plain list when there are no cards', () => {
    const view = buildCategoryView(category({ included: ['Fiskalizacja', ' ', 'Szkolenie'] }), 1)
    expect(view.included.cards).toEqual([
      { icon: null, title: 'Fiskalizacja', text: null },
      { icon: null, title: 'Szkolenie', text: null },
    ])
  })

  it('shows a legal fact only with its source and an https link to it (plan B §4)', () => {
    const view = buildCategoryView(
      category({
        facts: {
          items: [
            {
              value: '700 zł',
              title: 'Ulga',
              text: 'Opis',
              source: 'Art. 111 ust. 4 ustawy o VAT',
              sourceUrl: 'https://isap.sejm.gov.pl/',
            },
            { value: '2 lata', title: 'Przegląd', text: 'Opis', source: 'Rozporządzenie MF' },
            { value: '2027', title: 'KSeF', text: 'Opis' },
            {
              value: 'X',
              title: 'Zły link',
              text: 'Opis',
              source: 'Ustawa',
              sourceUrl: 'http://example.com/',
            },
          ],
        },
      }),
      1,
    )
    expect(view.facts.items.map((fact) => fact.value)).toEqual(['700 zł'])
  })

  it('keeps only a public picture of this tenant and slugs of related products', () => {
    const view = buildCategoryView(
      category({
        hero: { image: image as Media },
        frequentlyBoughtWith: [
          5,
          { id: 6, slug: 'druk', tenant: 1 } as never,
          { id: 7, slug: 'obcy', tenant: 2 } as never,
        ],
      }),
      1,
    )
    expect(view.image?.alt).toBe('Kasy')
    expect(view.boughtWith).toEqual(['druk'])
    expect(buildCategoryView(category({ hero: { image: image as Media } }), 2).image).toBeNull()
  })
})

describe('categoryPill', () => {
  const brands: CatalogIndex['brands'] = [
    { slug: 'elzab', name: 'Elzab', status: 'authorized-service' },
    { slug: 'fawag', name: 'Fawag', status: 'none' },
    { slug: 'posnet', name: 'Posnet', status: 'authorized-service' },
    { slug: 'gopos', name: 'GoPOS', status: 'authorized-partner' },
  ]

  it('names the group, counts models and lists confirmed partner statuses', () => {
    const products = [
      product('a', { brand: 'posnet' }),
      product('b', { brand: 'elzab' }),
      product('c', { brand: 'fawag' }),
      product('d', { brand: 'posnet' }),
    ]
    expect(categoryPill('Kasy i sprzedaż', products, index(products, { brands }))).toBe(
      'Kasy i sprzedaż · 4 modele · autoryzowany serwis Posnet i Elzab',
    )
  })

  it('counts positions when not everything is a device, and skips missing statuses', () => {
    const products = [product('a', { kind: 'service' }), product('b', { brand: 'gopos' })]
    expect(categoryPill(null, products, index(products, { brands }))).toBe(
      '2 pozycje · autoryzowany partner GoPOS',
    )
    expect(categoryPill('Serwis', [product('x', { kind: 'service' })], index([]))).toBe(
      'Serwis · 1 pozycja',
    )
  })
})
