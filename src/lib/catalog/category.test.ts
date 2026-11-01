import { describe, expect, it } from 'vitest'

import type { CatalogCategory, Media } from '@/payload-types'

import {
  boughtWithTiles,
  buildCategoryView,
  categoryBrands,
  categoryGuide,
  categoryPill,
  choiceInquiryHref,
  categoryIndustries,
  categoryProducts,
  categorySeries,
  filterCategoryProducts,
  findSubcategory,
  helpCardSpan,
  registerOptions,
  seriesFilter,
  seriesFromParam,
  seriesSlug,
  showroomHelpHref,
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

  it('puts the cards numbered in the panel (`pop9`) first, then the more popular (K36 §10)', () => {
    const catalog = index([
      product('popular', { popularity: 90 }),
      product('second', { order: 1, popularity: 10 }),
      product('first', { order: 0, popularity: 10 }),
    ])
    expect(categoryProducts(catalog, 'kasy-fiskalne').map((item) => item.slug)).toEqual([
      'first',
      'second',
      'popular',
    ])
  })
})

describe('categoryGuide (K36 §13)', () => {
  const none = { title: null, text: null, button: null, action: null }
  const vending = {
    title: 'Nie wiesz, jaki automat?',
    text: 'Zacznij od produktu.',
    button: 'Dobierz automat',
    action: 'vending' as const,
  }

  it('laptops and computers: „Dobierz laptop” in the salon', () => {
    const guide = categoryGuide({
      slug: 'laptopy',
      name: 'Laptopy',
      data: [none],
      showroomHref: '/marki/lenovo#dobor',
      vendingPage: false,
    })
    expect(guide).toMatchObject({ button: 'Dobierz laptop', href: '/marki/lenovo#dobor' })
  })

  it('elsewhere without a panel card: „Zapytaj o dobór” with the name in the inquiry', () => {
    const guide = categoryGuide({
      slug: 'niszczarki',
      name: 'Niszczarki',
      data: [none],
      showroomHref: '/marki/niszczarki#dobor',
      vendingPage: false,
    })
    expect(guide).toEqual({
      title: 'Nie wiesz, co wybrać?',
      text: 'Napisz, do czego potrzebujesz — dobierzemy model i przygotujemy ofertę na piśmie.',
      button: 'Zapytaj o dobór',
      href: choiceInquiryHref('Niszczarki'),
    })
    expect(choiceInquiryHref('Niszczarki')).toBe('/zapytanie?fraza=Dob%C3%B3r%3A%20Niszczarki')
  })

  it('a panel card wins, the subcategory before the category', () => {
    const ups = {
      title: 'Nie wiesz, jaki UPS?',
      text: 'Napisz.',
      button: 'Zapytaj o dobór',
      action: 'inquiry' as const,
    }
    const guide = categoryGuide({
      slug: 'serwery-nas-ups',
      name: 'UPS',
      data: [ups, vending],
      showroomHref: null,
      vendingPage: true,
    })
    expect(guide).toMatchObject({ title: 'Nie wiesz, jaki UPS?', href: choiceInquiryHref('UPS') })
  })

  it('the vending button needs the vending page, else it asks', () => {
    const args = { slug: 'automaty', name: 'Automaty', data: [vending], showroomHref: null }
    expect(categoryGuide({ ...args, vendingPage: true }).href).toBe('/automaty-vendingowe')
    expect(categoryGuide({ ...args, vendingPage: false }).button).toBe('Zapytaj o dobór')
    // Without the page, a card of the category behind the subcategory's vending card still wins.
    const own = {
      title: 'Nie wiesz, jaki?',
      text: 'Napisz.',
      button: 'Zapytaj',
      action: 'inquiry' as const,
    }
    expect(categoryGuide({ ...args, data: [vending, own], vendingPage: false }).title).toBe(
      'Nie wiesz, jaki?',
    )
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

  it('shows a status only when its brands make at least half of the category', () => {
    const all: CatalogIndex['brands'] = [
      ...brands,
      { slug: 'optivendi', name: 'Optivendi', status: 'partner' },
      { slug: 'comex', name: 'COMEX', status: 'cooperation' },
      { slug: 'zebra', name: 'Zebra', status: 'none' },
    ]
    // Automaty vendingowe: Optivendi machines and one Elzab module.
    const vending = [
      product('v1', { brand: 'optivendi' }),
      product('v2', { brand: 'optivendi' }),
      product('v3', { brand: 'optivendi' }),
      product('v4', { brand: 'elzab' }),
    ]
    expect(categoryPill('Automaty', vending, index(vending, { brands: all }))).toBe(
      'Automaty · 4 modele · partner Optivendi',
    )
    // Skanery, etykiety i kolektory: mostly other brands, one Elzab scanner.
    const scanners = [
      product('s1', { brand: 'zebra' }),
      product('s2', { brand: 'zebra' }),
      product('s3', { brand: 'elzab' }),
    ]
    expect(categoryPill('Skanery', scanners, index(scanners, { brands: all }))).toBe(
      'Skanery · 3 modele',
    )
    // K4-FINAL §1 wording „Posnet i Elzab”, also when Elzab has more models.
    const registers = [
      product('r1', { brand: 'elzab' }),
      product('r2', { brand: 'elzab' }),
      product('r3', { brand: 'posnet' }),
    ]
    expect(categoryPill('Kasy', registers, index(registers, { brands: all }))).toBe(
      'Kasy · 3 modele · autoryzowany serwis Posnet i Elzab',
    )
    const cooperation = [product('c1', { brand: 'comex' }), product('c2', { brand: 'zebra' })]
    expect(categoryPill(null, cooperation, index(cooperation, { brands: all }))).toBe(
      '2 modele · we współpracy z COMEX',
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

describe('series filter (K31c, `?seria=`)', () => {
  const laptops = [
    product('tb14', { brand: 'lenovo', series: 'ThinkBook', industries: ['biuro'] }),
    product('dp14', { brand: 'dell', series: 'Dell Pro', industries: ['biuro', 'teren'] }),
    product('tb16', { brand: 'lenovo', series: 'ThinkBook' }),
    product('x1', { brand: 'lenovo', series: 'ThinkPad X1 i X9', industries: ['szef'] }),
    product('bez-serii', { brand: 'dell' }),
  ]

  it('lists series with counts, most cards first, ties in index order', () => {
    expect(categorySeries(laptops)).toEqual([
      { name: 'ThinkBook', slug: 'thinkbook', count: 2 },
      { name: 'Dell Pro', slug: 'dell-pro', count: 1 },
      { name: 'ThinkPad X1 i X9', slug: 'thinkpad-x1-i-x9', count: 1 },
    ])
  })

  it('the filter shows only where the page asks for it and the cards have 2+ series', () => {
    // A brand page without its showroom (template) keeps its category filter: no series filter.
    expect(seriesFilter(false, laptops)).toEqual([])
    expect(seriesFilter(true, laptops)).toHaveLength(3)
    expect(seriesFilter(true, laptops.slice(0, 1))).toEqual([])
  })

  it('reads `?seria=` by slug; unknown or empty → no filter', () => {
    const series = categorySeries(laptops)
    expect(seriesFromParam('thinkpad-x1-i-x9', series)).toBe('ThinkPad X1 i X9')
    expect(seriesFromParam('nie-ma', series)).toBeUndefined()
    expect(seriesFromParam(null, series)).toBeUndefined()
  })

  it('filters by series, any of the brands and any of the uses', () => {
    const slugs = (items: IndexProduct[]) => items.map((item) => item.slug)
    expect(slugs(filterCategoryProducts(laptops, { series: 'ThinkBook' }))).toEqual([
      'tb14',
      'tb16',
    ])
    expect(slugs(filterCategoryProducts(laptops, { brands: ['dell'] }))).toEqual([
      'dp14',
      'bez-serii',
    ])
    expect(slugs(filterCategoryProducts(laptops, { industries: ['teren', 'szef'] }))).toEqual([
      'dp14',
      'x1',
    ])
    expect(slugs(filterCategoryProducts(laptops, { brands: [], industries: [] }))).toHaveLength(5)
  })

  it('„Do czego”: active uses of the cards, in the order of the index', () => {
    const catalog = index(laptops, {
      industries: [
        { slug: 'szef', name: 'Dla szefa', active: true },
        { slug: 'biuro', name: 'Biuro i recepcja', active: true },
        { slug: 'teren', name: 'Praca w terenie', active: false },
        { slug: 'szkola', name: 'Szkoła', active: true },
      ],
    })
    expect(categoryIndustries(laptops, catalog)).toEqual([
      { slug: 'szef', name: 'Dla szefa', count: 1 },
      { slug: 'biuro', name: 'Biuro i recepcja', count: 2 },
    ])
  })

  it('„Nie wiesz, który?” goes to the chooser of a salon: the chosen brand, else the biggest', () => {
    const brands: CatalogIndex['brands'] = [
      {
        slug: 'lenovo',
        name: 'Lenovo',
        status: 'none',
        page: true,
        salon: 'lenovo',
        showroom: true,
      },
      {
        slug: 'dell',
        name: 'Dell',
        status: 'none',
        page: true,
        salon: 'komputery',
        showroom: true,
      },
      // A salon without „Pomóż mi wybrać” does not count.
      { slug: 'asus', name: 'Asus', status: 'none', page: true, salon: 'asus' },
    ]
    const catalog = index(laptops, { brands })
    expect(showroomHelpHref(laptops, catalog, [])).toBe('/marki/lenovo#dobor')
    expect(showroomHelpHref(laptops, catalog, ['dell'])).toBe('/marki/komputery#dobor')
    expect(showroomHelpHref(laptops, catalog, ['asus'])).toBe('/marki/lenovo#dobor')
    expect(showroomHelpHref(laptops, index(laptops, { brands: brands.slice(2) }), [])).toBeNull()
  })
})

describe('seriesSlug', () => {
  it('makes the address part of a series', () => {
    expect(seriesSlug('ThinkPad T i X13')).toBe('thinkpad-t-i-x13')
    expect(seriesSlug('ThinkPad 2-in-1')).toBe('thinkpad-2-in-1')
  })
})
