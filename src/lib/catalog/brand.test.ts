import { describe, expect, it } from 'vitest'

import type { Partner } from '@/payload-types'

import {
  brandCategories,
  brandHref,
  brandJsonLd,
  brandPageHref,
  brandProducts,
  brandTitle,
  buildBrandView,
} from './brand'
import type { CatalogIndex, IndexProduct } from './catalogIndex'

const BIZNES = 1
const OTHER = 2

const partner = (fields: Partial<Partner> = {}): Partner =>
  ({
    id: 7,
    name: 'Lenovo',
    slug: 'lenovo',
    website: 'https://www.lenovo.com/pl/pl/',
    partnerStatus: 'none',
    tenants: [BIZNES],
    order: 0,
    brandPage: {
      hasPage: true,
      country: 'Chiny',
      shortDescription: 'Producent laptopów, komputerów stacjonarnych i monitorów dla firm.',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [{ type: 'text', text: 'Lenovo założono w 1984 roku.', version: 1 }],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      facts: [
        { label: 'Rok założenia', value: '1984', sourceUrl: 'https://www.lenovo.com/about' },
        { label: 'Giełda', value: 'Hongkong', sourceUrl: 'http://www.lenovo.com/plain-http' },
        { label: 'Licencja', value: 'od 1 stanowiska', sourceUrl: 'https://sklep.eset.pl/cennik' },
        { label: ' ', value: 'pusty wiersz' },
      ],
      productLines: ['ThinkPad', ' ', 'ThinkBook 14 / 16'],
      sources: ['https://www.lenovo.com/about'],
    },
    updatedAt: '2026-10-28T00:00:00.000Z',
    createdAt: '2026-10-28T00:00:00.000Z',
    ...fields,
  }) as Partner

const product = (slug: string, fields: Partial<IndexProduct> = {}): IndexProduct => ({
  slug,
  name: slug,
  brand: 'lenovo',
  kind: 'device',
  categories: ['komputery-monitory'],
  group: 'biuro',
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 50,
  registerTypes: [],
  hay: slug,
  ...fields,
})

describe('buildBrandView', () => {
  it('reads the brand page of a brand of this site', () => {
    const view = buildBrandView(partner(), BIZNES)
    expect(view).toMatchObject({
      slug: 'lenovo',
      name: 'Lenovo',
      country: 'Chiny',
      productLines: ['ThinkPad', 'ThinkBook 14 / 16'],
      website: 'https://www.lenovo.com/pl/pl/',
    })
    expect(view?.description).not.toBeNull()
  })

  it('links only https sources of producers (never a shop) and drops empty rows', () => {
    expect(buildBrandView(partner(), BIZNES)?.facts).toEqual([
      { label: 'Rok założenia', value: '1984', sourceUrl: 'https://www.lenovo.com/about' },
      { label: 'Giełda', value: 'Hongkong', sourceUrl: null },
      { label: 'Licencja', value: 'od 1 stanowiska', sourceUrl: null },
    ])
  })

  it('has no page without `hasPage`, without an address or on another site', () => {
    expect(buildBrandView(partner({ brandPage: { hasPage: false } }), BIZNES)).toBeNull()
    expect(buildBrandView(partner({ slug: null }), BIZNES)).toBeNull()
    expect(buildBrandView(partner(), OTHER)).toBeNull()
  })

  it('treats an emptied editor as no description and a plain-http site as none', () => {
    const view = buildBrandView(
      partner({
        website: 'http://lenovo.com',
        brandPage: {
          hasPage: true,
          description: {
            root: {
              type: 'root',
              children: [{ type: 'paragraph', version: 1, children: [] }],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      }),
      BIZNES,
    )
    expect(view?.description).toBeNull()
    expect(view?.website).toBeNull()
  })
})

describe('brandPageHref', () => {
  const index: Pick<CatalogIndex, 'brands'> = {
    brands: [
      { slug: 'lenovo', name: 'Lenovo', status: 'none', page: true },
      { slug: 'ingenico', name: 'Ingenico', status: 'none' },
    ],
  }

  it('links a listed brand with a page, never one without', () => {
    expect(brandPageHref(index, 'lenovo')).toBe('/marki/lenovo')
    expect(brandPageHref(index, 'ingenico')).toBeNull()
    expect(brandPageHref(index, 'dell')).toBeNull()
  })

  it('encodes the slug', () => {
    expect(brandHref('a b')).toBe('/marki/a%20b')
  })
})

describe('brandTitle', () => {
  it('cuts the short description at a word under 60 characters', () => {
    const title = brandTitle(
      'Lenovo',
      'Producent laptopów, komputerów stacjonarnych i monitorów dla firm i domu.',
    )
    expect(title).toBe('Lenovo — Producent laptopów, komputerów stacjonarnych i monitorów…')
    expect(title.length - 'Lenovo — '.length).toBeLessThanOrEqual(60)
  })

  it('keeps a short description whole and names the brand without one', () => {
    expect(brandTitle('Dibal', 'Wagi sklepowe z Hiszpanii.')).toBe(
      'Dibal — Wagi sklepowe z Hiszpanii.',
    )
    expect(brandTitle('Dibal', null)).toBe('Dibal w PRO-KOM')
  })
})

describe('brandProducts and brandCategories', () => {
  const products = [
    product('thinkbook'),
    product('thinkcentre'),
    product('thinkvision', { categories: ['monitory-x', 'komputery-monitory'] }),
    product('posnet', { brand: 'posnet', categories: ['kasy-fiskalne'] }),
  ]
  const categories = [
    { slug: 'kasy-fiskalne', name: 'Kasy fiskalne', group: 'sprzedaz', count: 1 },
    { slug: 'monitory-x', name: 'Monitory', group: 'biuro', count: 1 },
    { slug: 'komputery-monitory', name: 'Komputery i monitory', group: 'biuro', count: 3 },
  ]

  it('lists the products of one brand in index order', () => {
    expect(brandProducts({ products }, 'lenovo').map((item) => item.slug)).toEqual([
      'thinkbook',
      'thinkcentre',
      'thinkvision',
    ])
  })

  it('counts the main categories, most products first', () => {
    expect(brandCategories(brandProducts({ products }, 'lenovo'), { categories })).toEqual([
      { slug: 'komputery-monitory', name: 'Komputery i monitory', count: 2 },
      { slug: 'monitory-x', name: 'Monitory', count: 1 },
    ])
  })
})

describe('brandJsonLd', () => {
  it('is a Brand with the producer site as sameAs, without empty fields', () => {
    expect(
      brandJsonLd({
        name: 'Dibal',
        url: 'https://prokombiznes.pl/marki/dibal',
        description: null,
        logo: null,
        website: 'https://www.dibal.com',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: 'Dibal',
      url: 'https://prokombiznes.pl/marki/dibal',
      sameAs: ['https://www.dibal.com'],
    })
  })
})
