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
