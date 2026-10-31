import { describe, expect, it } from 'vitest'

import { buildSiteMap, siteMapPaths } from './siteLinks'

const pages = [
  { slug: 'kontakt', title: 'Kontakt', updatedAt: '2026-10-20T00:00:00.000Z' },
  { slug: 'home', title: 'Start', updatedAt: '2026-10-21T00:00:00.000Z' },
  { slug: 'cookies', title: 'Cookies' },
]

describe('buildSiteMap', () => {
  it('on a line without catalog and news lists the pages only, home first', () => {
    const map = buildSiteMap({ pages, catalog: null, news: null })
    expect(map.map(({ id }) => id)).toEqual(['strony'])
    expect(map[0]?.links.map(({ href, label }) => `${href} ${label}`)).toEqual([
      '/ Strona główna',
      '/cookies Cookies',
      '/kontakt Kontakt',
      '/mapa-strony Mapa strony',
    ])
  })

  it('on Biznes adds the catalog, active industries, products by main category and news', () => {
    const map = buildSiteMap({
      pages,
      catalog: {
        categories: [
          { slug: 'kasy-fiskalne', name: 'Kasy fiskalne' },
          { slug: 'drukarki-fiskalne', name: 'Drukarki fiskalne' },
          { slug: 'wagi', name: 'Wagi' },
        ],
        industries: [
          { slug: 'gastronomia', name: 'Gastronomia', active: true },
          { slug: 'beauty', name: 'Beauty i usługi', active: false },
        ],
        products: [
          { slug: 'posnet-ergo', name: 'Posnet Ergo', categories: ['kasy-fiskalne'] },
          { slug: 'elzab-k10', name: 'Elzab K10', categories: ['kasy-fiskalne', 'wagi'] },
          { slug: 'posnet-thermal', name: 'Posnet Thermal', categories: ['drukarki-fiskalne'] },
        ],
      },
      news: { posts: [{ slug: 'ksef', title: 'KSeF od 2027' }] },
    })
    expect(map.map(({ id }) => id)).toEqual([
      'strony',
      'oferta',
      'branze',
      'produkty',
      'aktualnosci',
    ])
    expect(map[1]?.links[0]).toEqual({ href: '/oferta', label: 'Cały katalog' })
    expect(map[2]?.links).toEqual([{ href: '/branze/gastronomia', label: 'Gastronomia' }])
    // Each product once, under its main category; empty groups are left out.
    expect(map[3]?.groups?.map(({ title, links }) => [title, links.map((l) => l.label)])).toEqual([
      ['Kasy fiskalne', ['Elzab K10', 'Posnet Ergo']],
      ['Drukarki fiskalne', ['Posnet Thermal']],
    ])
    expect(map[4]?.links.map(({ href }) => href)).toEqual(['/aktualnosci', '/aktualnosci/ksef'])
  })

  it('lists subcategory pages under their category and the brand pages (K3b′)', () => {
    const map = buildSiteMap({
      pages: [],
      catalog: {
        categories: [
          {
            slug: 'komputery-monitory',
            name: 'Komputery i monitory',
            subcategories: [{ name: 'Laptopy', slug: 'laptopy' }, { name: 'Bez adresu' }],
          },
        ],
        brands: [{ slug: 'dibal', name: 'Dibal' }],
        industries: [],
        products: [],
      },
      news: null,
    })
    expect(map.find(({ id }) => id === 'oferta')?.links.map(({ href }) => href)).toEqual([
      '/oferta',
      '/oferta/komputery-monitory',
      '/oferta/komputery-monitory/laptopy',
    ])
    expect(map.find(({ id }) => id === 'marki')?.links).toEqual([
      { href: '/marki', label: 'Wszystkie marki' },
      { href: '/marki/dibal', label: 'Dibal' },
    ])
  })

  it('lists /zestawy and the bundles given (only „Gotowe” — K3c)', () => {
    const catalog = { categories: [], industries: [], products: [] }
    const map = buildSiteMap({
      pages: [],
      catalog: { ...catalog, bundles: [{ slug: 'zestaw-wifi-omada', name: 'Wi-Fi Omada' }] },
      news: null,
    })
    expect(map.find(({ id }) => id === 'zestawy')?.links).toEqual([
      { href: '/zestawy', label: 'Wszystkie zestawy' },
      { href: '/zestawy/zestaw-wifi-omada', label: 'Wi-Fi Omada' },
    ])
    const none = buildSiteMap({ pages: [], catalog: { ...catalog, bundles: null }, news: null })
    expect(none.find(({ id }) => id === 'zestawy')).toBeUndefined()
  })

  it('keeps a published product whose category is not listed, under „Pozostałe”', () => {
    const map = buildSiteMap({
      pages: [],
      catalog: {
        categories: [{ slug: 'kasy-fiskalne', name: 'Kasy fiskalne' }],
        industries: [],
        products: [
          { slug: 'bez-grupy', name: 'Bez grupy', categories: ['usunieta'] },
          { slug: 'bez-kategorii', name: 'Bez kategorii', categories: [] },
        ],
      },
      news: null,
    })
    expect(map.find(({ id }) => id === 'produkty')?.groups).toEqual([
      {
        title: 'Pozostałe',
        links: [
          { href: '/produkt/bez-grupy', label: 'Bez grupy', updatedAt: undefined },
          { href: '/produkt/bez-kategorii', label: 'Bez kategorii', updatedAt: undefined },
        ],
      },
    ])
  })
})

describe('buildSiteMap — Software', () => {
  it('lists the catalog of solutions, never its filtered views (SW9)', () => {
    const map = buildSiteMap({ pages, catalog: null, news: null, solutions: { items: [] } })
    const section = map.find(({ id }) => id === 'rozwiazania')
    expect(section?.links).toEqual([
      { href: '/rozwiazania', label: 'Pełna oferta' },
      { href: '/dobierz', label: 'Dobierz rozwiązanie' },
    ])
    expect(siteMapPaths(map)).toContainEqual({ path: '/rozwiazania' })
    expect(siteMapPaths(map)).toContainEqual({ path: '/dobierz' })
  })

  it('lists the page of every published solution, by name (SW10)', () => {
    const map = buildSiteMap({
      pages,
      catalog: null,
      news: null,
      solutions: {
        items: [
          { slug: 'strona-wizytowka', name: 'Strona wizytówka' },
          { slug: 'aplikacja-dla-ekip-w-terenie', name: 'Aplikacja dla ekip w terenie' },
        ],
      },
    })
    const section = map.find(({ id }) => id === 'rozwiazania')
    expect(section?.links.slice(2)).toEqual([
      { href: '/rozwiazania/aplikacja-dla-ekip-w-terenie', label: 'Aplikacja dla ekip w terenie' },
      { href: '/rozwiazania/strona-wizytowka', label: 'Strona wizytówka' },
    ])
    expect(siteMapPaths(map)).toContainEqual({ path: '/rozwiazania/strona-wizytowka' })
  })

  it('has no such section elsewhere', () => {
    expect(buildSiteMap({ pages, catalog: null, news: null }).map(({ id }) => id)).not.toContain(
      'rozwiazania',
    )
  })

  it('lists the active industry pages of Software (SW10b)', () => {
    const map = buildSiteMap({
      pages,
      catalog: null,
      news: null,
      solutions: { items: [] },
      industryPages: [{ slug: 'budownictwo-i-wykonczenia', name: 'Budownictwo i wykończenia' }],
    })
    const section = map.find(({ id }) => id === 'dla-branz')
    expect(section?.links).toEqual([
      { href: '/dla-branz/budownictwo-i-wykonczenia', label: 'Budownictwo i wykończenia' },
    ])
    expect(siteMapPaths(map)).toContainEqual({ path: '/dla-branz/budownictwo-i-wykonczenia' })
  })

  it('has no industry section without active pages', () => {
    const map = buildSiteMap({ pages, catalog: null, news: null, industryPages: [] })
    expect(map.map(({ id }) => id)).not.toContain('dla-branz')
  })
})

describe('buildSiteMap — Instalacje', () => {
  it('lists the object pages „Dla kogo” after the pages, in the given order', () => {
    const map = buildSiteMap({
      pages,
      catalog: null,
      news: null,
      objectPages: [
        { slug: 'dom', name: 'Dom jednorodzinny', updatedAt: '2026-10-30T00:00:00.000Z' },
        { slug: 'pensjonaty', name: 'Pensjonaty' },
      ],
    })
    expect(map.map(({ id }) => id)).toEqual(['strony', 'dla-kogo'])
    expect(map[1]).toEqual({
      id: 'dla-kogo',
      title: 'Dla kogo',
      links: [
        {
          href: '/dla-kogo/dom',
          label: 'Dom jednorodzinny',
          updatedAt: '2026-10-30T00:00:00.000Z',
        },
        { href: '/dla-kogo/pensjonaty', label: 'Pensjonaty', updatedAt: undefined },
      ],
    })
    expect(siteMapPaths(map)).toContainEqual({
      path: '/dla-kogo/dom',
      updatedAt: '2026-10-30T00:00:00.000Z',
    })
  })

  it('has no object section without published objects', () => {
    const map = buildSiteMap({ pages, catalog: null, news: null, objectPages: [] })
    expect(map.map(({ id }) => id)).not.toContain('dla-kogo')
  })
})

describe('siteMapPaths', () => {
  it('flattens the map for sitemap.xml, each address once, with its date', () => {
    const map = buildSiteMap({ pages, catalog: null, news: { posts: [] } })
    expect(siteMapPaths(map)).toEqual([
      { path: '/', updatedAt: '2026-10-21T00:00:00.000Z' },
      { path: '/cookies', updatedAt: undefined },
      { path: '/kontakt', updatedAt: '2026-10-20T00:00:00.000Z' },
      { path: '/mapa-strony', updatedAt: undefined },
      { path: '/aktualnosci', updatedAt: undefined },
    ])
  })
})
