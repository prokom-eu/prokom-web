import { describe, expect, it } from 'vitest'

import type { CatalogCategory, Industry, Partner, Product } from '@/payload-types'

import { buildProductView, hasRichText, isIndexableProduct } from './product'
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

  it('lists alternatives of this tenant only, as slugs', () => {
    const alternative = (slug: string, tenant: number) =>
      ({ id: 50 + tenant, slug, tenant }) as unknown as Product
    expect(
      build({ alternatives: [alternative('obca', OTHER_TENANT), alternative('neo', TENANT), 7] })
        .alternatives,
    ).toEqual(['neo'])
    expect(build().alternatives).toEqual([])
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
  it('removes repeated datasheets and product pages (the seed repeats one PDF per variant)', () => {
    const view = build({
      sources: {
        datasheets: ['https://x.pl/a.pdf', 'https://x.pl/a.pdf', 'https://x.pl/b.pdf'],
        productPages: ['https://x.pl/p', 'https://x.pl/p'],
      },
    })
    expect(view.documents).toEqual({
      datasheets: ['https://x.pl/a.pdf', 'https://x.pl/b.pdf'],
      productPages: ['https://x.pl/p'],
    })
  })

  it('takes „W cenie” from the product, else from the main category', () => {
    expect(build({ included: ['Fiskalizacja'] }).included).toEqual(['Fiskalizacja'])
    expect(build({ categories: [category(TENANT, ['Szkolenie'])] }).included).toEqual(['Szkolenie'])
    expect(build({ included: [], categories: [category(TENANT, ['Szkolenie'])] }).included).toEqual(
      ['Szkolenie'],
    )
  })

  it('groups the specification rows, keeping their order', () => {
    const view = build({
      specs: [
        { group: 'Druk', label: 'Szybkość', value: '20 l/s' },
        { group: 'Druk', label: 'Papier', value: '57 mm' },
        { group: null, label: 'Waga', value: '0,6 kg' },
      ],
    })
    expect(view.specs).toEqual([
      {
        group: 'Druk',
        rows: [
          { label: 'Szybkość', value: '20 l/s' },
          { label: 'Papier', value: '57 mm' },
        ],
      },
      { group: null, rows: [{ label: 'Waga', value: '0,6 kg' }] },
    ])
  })

  it('shows hotspots only over a picture', () => {
    const hotspots = [{ x: 10, y: 20, title: 'Moduł WiFi', description: null }]
    expect(build({ hotspots }).hotspots).toEqual([])
    expect(build({ hotspots, images: [image(1, 'a.webp')] }).hotspots).toEqual([
      { x: 10, y: 20, title: 'Moduł WiFi', description: null },
    ])
  })

  it('drops hotspots when the first photo of the panel is not public (they were set on it)', () => {
    const hotspots = [{ x: 10, y: 20, title: 'Moduł WiFi', description: null }]
    const view = build({
      hotspots,
      images: [image(1, 'a.webp', { requiresConsent: true }), image(2, 'b.webp')],
    })
    expect(view.images).toHaveLength(1)
    expect(view.hotspots).toEqual([])
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

describe('buildProductView tabs', () => {
  it('lists only the tabs with content, in the order of the board', () => {
    expect(build().tabs).toEqual([])
    expect(
      build({
        description: paragraph('Kasa na co dzień.') as unknown as Product['description'],
        specs: [{ group: null, label: 'Waga', value: '0,6 kg' }],
        sources: { datasheets: ['https://x.pl/a.pdf'] },
        faq: [{ question: 'Czy?', answer: 'Tak.' }],
      }).tabs,
    ).toEqual(['opis', 'specyfikacja', 'dokumenty', 'pytania'])
  })

  it('counts product pages alone as documents', () => {
    expect(build({ sources: { productPages: ['https://x.pl/p'] } }).tabs).toEqual(['dokumenty'])
  })

  it('treats an empty editor as no description', () => {
    const view = build({ description: paragraph('') as unknown as Product['description'] })
    expect(view.description).toBeNull()
    expect(view.tabs).toEqual([])
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
