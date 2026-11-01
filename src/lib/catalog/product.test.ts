import { describe, expect, it } from 'vitest'

import type { CatalogCategory, Industry, Partner, Product } from '@/payload-types'

import { buildProductView, hasRichText, isIndexableProduct, productGallery } from './product'
import { image, TENANT } from './seedSource.fixture'

const OTHER_TENANT = 2

const category = (tenant: number, included: string[] = []) =>
  ({
    id: 10 + tenant,
    slug: `kat-${tenant}`,
    name: `Kat ${tenant}`,
    tenant,
    included,
  }) as CatalogCategory
const industry = (tenant: number) =>
  ({ id: 20 + tenant, slug: `branza-${tenant}`, name: `Branża ${tenant}`, tenant }) as Industry
const brand = (tenants: number[]) =>
  ({
    id: 30,
    slug: 'marka',
    name: 'Marka',
    partnerStatus: 'authorized-service',
    tenants,
  }) as Partner

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: text ? [{ type: 'text', text }] : [] }],
  },
})

const product = (fields: Partial<Product> = {}) =>
  ({
    id: 1,
    slug: 'p',
    name: 'P',
    kind: 'device',
    categories: [category(TENANT)],
    ...fields,
  }) as unknown as Product

const build = (fields: Partial<Product> = {}) => buildProductView(product(fields), TENANT)

describe('buildProductView tenant isolation', () => {
  it('drops categories, industries and a brand of another tenant', () => {
    const view = build({
      categories: [category(OTHER_TENANT), category(TENANT)],
      industries: [industry(OTHER_TENANT), industry(TENANT)],
      brand: brand([OTHER_TENANT]),
    })
    expect(view.category).toEqual({ slug: 'kat-1', name: 'Kat 1' })
    expect(view.industries).toEqual([{ slug: 'branza-1', name: 'Branża 1' }])
    expect(view.brand).toBeNull()
  })

  it('keeps a brand shown on this site', () => {
    expect(build({ brand: brand([OTHER_TENANT, TENANT]) }).brand).toMatchObject({
      slug: 'marka',
      name: 'Marka',
      status: 'authorized-service',
    })
  })

  it('keeps only public images of this tenant, in order', () => {
    const view = build({
      images: [
        image(1, 'a.webp', { tenant: OTHER_TENANT }),
        image(2, 'b.webp', { requiresConsent: true }),
        image(3, 'c.webp'),
        image(4, 'd.webp'),
      ],
    })
    expect(view.images.map((item) => item.alt)).toEqual(['Obraz c.webp', 'Obraz d.webp'])
  })
})

describe('buildProductView content', () => {
  it('lists producer sources once each, datasheets first, with labels (K31-ZMIANY §4 pkt 9)', () => {
    const view = build({
      brand: brand([TENANT]),
      sources: {
        datasheets: [
          'https://www.posnet.com.pl/a.pdf',
          'https://www.posnet.com.pl/a.pdf',
          'https://sklep.example.pl/b.pdf',
        ],
        productPages: ['https://www.posnet.com.pl/p', 'https://www.posnet.com.pl/p'],
        checkedAt: '2026-10-25T00:00:00.000Z',
      },
    })
    expect(view.sources).toEqual([
      {
        url: 'https://www.posnet.com.pl/a.pdf',
        label: 'Dokument PDF — posnet.com.pl',
        meta: 'posnet.com.pl · PDF',
      },
      {
        url: 'https://www.posnet.com.pl/p',
        label: 'Strona producenta — posnet.com.pl',
        meta: 'posnet.com.pl/p',
      },
    ])
    expect(view.checkedAt).toBe('2026-10-25T00:00:00.000Z')
  })

  it('uses the labelled sources of K4 when set — producers only, labels from the panel', () => {
    const view = build({
      sources: {
        datasheets: ['https://www.posnet.com.pl/a.pdf'],
        links: [
          { label: 'Strona producenta — Apple', url: 'https://www.apple.com/pl/iphone-17/' },
          { label: 'Sklep', url: 'https://sklep.example.pl/iphone' },
          { label: 'Duplikat', url: 'https://www.apple.com/pl/iphone-17/' },
        ],
      },
    })
    expect(view.sources).toEqual([
      {
        url: 'https://www.apple.com/pl/iphone-17/',
        label: 'Strona producenta — Apple',
        meta: 'apple.com/pl/iphone-17',
      },
    ])
  })

  it('keeps colours with a valid swatch, and recommendations of this site only (K4)', () => {
    const own = { id: 5, slug: 'szuflada', tenant: TENANT } as Product
    const foreign = { id: 6, slug: 'obca', tenant: OTHER_TENANT } as Product
    const view = build({
      colors: [
        { name: 'Lawendowy', hex: '#C9B8E8', image: image(7, 'lawenda.webp') },
        { name: 'Zły', hex: 'red', image: null },
      ],
      recommended: [
        { product: own, label: 'Szuflada' },
        { product: foreign, label: 'Obca' },
        { product: 9, label: 'Niewczytana' },
      ],
    })
    expect(view.colors).toEqual([
      {
        name: 'Lawendowy',
        hex: '#C9B8E8',
        image: expect.objectContaining({ alt: 'Obraz lawenda.webp' }),
      },
    ])
    expect(view.recommended).toEqual([{ slug: 'szuflada', label: 'Szuflada' }])
  })

  it('takes „W cenie” from the product, else from the main category', () => {
    expect(build({ included: ['Fiskalizacja'] }).included).toEqual(['Fiskalizacja'])
    expect(build({ categories: [category(TENANT, ['Szkolenie'])] }).included).toEqual(['Szkolenie'])
    expect(build({ included: [], categories: [category(TENANT, ['Szkolenie'])] }).included).toEqual(
      ['Szkolenie'],
    )
  })

  it('keeps the parameters in the panel order, without empty rows', () => {
    const view = build({
      specs: [
        { group: 'Druk', label: 'Szybkość', value: '20 l/s' },
        { group: null, label: 'Waga', value: ' 0,6 kg ' },
        { group: null, label: 'Pusty', value: ' ' },
      ],
    })
    expect(view.specs).toEqual([
      { label: 'Szybkość', value: '20 l/s' },
      { label: 'Waga', value: '0,6 kg' },
    ])
  })

  it('heads a long name with the short one (K31-ZMIANY §13.5)', () => {
    const name = 'Lenovo ThinkBook 14 G8 IRL / G8 IAL / G9 IRL / G9 IPL / G9 AHP (Intel albo AMD)'
    expect(build({ name, shortName: 'Lenovo ThinkBook 14 G8 / G9' }).heading).toBe(
      'Lenovo ThinkBook 14 G8 / G9',
    )
    expect(build({ name: 'Posnet Ergo', shortName: 'Ergo' }).heading).toBe('Posnet Ergo')
  })

  it('shows at most 2 active videos (ADR-016)', () => {
    const video = (youtubeId: string, active: boolean) => ({
      youtubeId,
      title: `Film ${youtubeId}`,
      match: 'model' as const,
      active,
      channel: 'Lenovo',
      lang: 'en',
    })
    const view = build({
      videos: [
        video('aaaaaaaaaaa', false),
        video('bbbbbbbbbbb', true),
        video('ccccccccccc', true),
        video('ddddddddddd', true),
      ],
    })
    expect(view.videos.map((item) => item.id)).toEqual(['bbbbbbbbbbb', 'ccccccccccc'])
    expect(view.videos[0]).toEqual({
      id: 'bbbbbbbbbbb',
      title: 'Film bbbbbbbbbbb',
      channel: 'Lenovo',
      lang: 'en',
    })
  })

  it('has no configurator without options to choose from', () => {
    expect(build().configurator).toBeNull()
    expect(
      build({ configurator: { options: [{ name: 'RAM', values: ['8 GB', '16 GB'] }] } })
        .configurator?.options,
    ).toHaveLength(1)
  })

  it('marks a product „Do sprawdzenia” as not indexable, otherwise looks the same (K3a)', () => {
    const review = build({ contentStatus: 'needs-review' })
    const ready = build({ contentStatus: 'ready' })
    expect(review.indexable).toBe(false)
    expect(ready.indexable).toBe(true)
    expect({ ...review, indexable: true }).toEqual(ready)
    expect(review).not.toHaveProperty('contentStatus')
  })

  it('lists versions with their difference, once per name, without empty ones (K3)', () => {
    expect(
      build({
        variants: [
          { name: ' Jota ONLINE ', difference: 'kabel LAN' },
          { name: 'Jota ONLINE', difference: 'powtórka' },
          { name: 'Jota BT/WiFi', difference: ' ' },
          { name: ' ', difference: 'bez nazwy' },
        ],
      }).variants,
    ).toEqual([
      { name: 'Jota ONLINE', difference: 'kabel LAN' },
      { name: 'Jota BT/WiFi', difference: null },
    ])
    expect(build().variants).toEqual([])
  })

  it('carries no price field', () => {
    expect(JSON.stringify(build())).not.toMatch(/"(price|cena|offers)"/i)
  })

  it('never carries internal fields of the import (K3: notes, distributor pages)', () => {
    const view = build({
      internalNotes: 'Notatka dla zespołu',
      sources: { distributorPages: ['https://sklep.example/jota'] },
    })
    const json = JSON.stringify(view)
    expect(json).not.toContain('Notatka dla zespołu')
    expect(json).not.toContain('sklep.example')
    expect(view).not.toHaveProperty('internalNotes')
  })
})

describe('buildProductView description', () => {
  it('treats an empty editor as no description', () => {
    expect(
      build({ description: paragraph('') as unknown as Product['description'] }).description,
    ).toBeNull()
    expect(
      build({ description: paragraph('Kasa na co dzień.') as unknown as Product['description'] })
        .description,
    ).not.toBeNull()
  })
})

describe('hasRichText', () => {
  it('needs visible text or an embedded element', () => {
    expect(hasRichText(null)).toBe(false)
    expect(hasRichText(paragraph('   '))).toBe(false)
    expect(hasRichText(paragraph('Tekst'))).toBe(true)
    expect(hasRichText({ root: { type: 'root', children: [{ type: 'horizontalrule' }] } })).toBe(
      true,
    )
  })
})

describe('isIndexableProduct', () => {
  it('keeps a product „Do sprawdzenia” out of search engines and site maps (K3a)', () => {
    expect(isIndexableProduct({ contentStatus: 'ready' })).toBe(true)
    expect(isIndexableProduct({ contentStatus: 'needs-review' })).toBe(false)
  })
})

describe('productGallery (K32 §9)', () => {
  const view = build({
    colors: [
      { name: 'A', hex: '#111111', image: image(7, 'a.webp') },
      { name: 'B', hex: '#222222', image: image(7, 'a.webp') },
      { name: 'C', hex: '#333333', image: null },
    ],
    images: [image(8, 'own.webp'), image(9, 'a.webp')],
  })

  it('colours first, each picture once, then the own photos', () => {
    const { images, colorSlides } = productGallery(view.colors, view.images)
    expect(images.map((item) => item.alt)).toEqual(['Obraz a.webp', 'Obraz own.webp'])
    expect(colorSlides).toEqual([0, 0, null])
  })
})
