import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokombiznes/kreator.json'
import type {
  BiznesSetting,
  CatalogCategory,
  Industry,
  Media,
  Partner,
  Product,
} from '@/payload-types'

import {
  buildCatalogIndex,
  type CatalogIndex,
  type CatalogSource,
  searchIndex,
  WIZARD_PAGE,
} from './catalogIndex'
import { image, sourceFromSeed, TENANT } from './seedSource.fixture'
import { wizardFromSeed } from './wizard'

const OTHER_TENANT = 2

describe('buildCatalogIndex on the seed package', () => {
  const index = buildCatalogIndex(sourceFromSeed())

  it('lists all 225 products', () => {
    expect(index.products).toHaveLength(225)
  })

  it('stays under 50 KB gzip (B2 acceptance)', () => {
    const size = gzipSync(JSON.stringify(index)).length
    expect(size).toBeLessThan(50 * 1024)
  })

  it('builds a product card with brand, categories and a normalized hay', () => {
    const ergo = index.products.find((product) => product.slug === 'posnet-ergo-online')!
    expect(ergo).toMatchObject({
      name: 'Posnet Ergo Online',
      brand: 'posnet',
      kind: 'device',
      categories: ['kasy-fiskalne'],
      group: 'sprzedaz',
      industries: ['biura-uslugi', 'gastronomia', 'handel'],
      badge: 'Ulga do 700 zł',
      featuredOrder: 0,
      registerTypes: ['mobile', 'small'],
      image: {
        url: '/api/media/file/ergo-01-480x360.webp',
        alt: 'Posnet Ergo Online',
      },
    })
    expect(ergo.hay).toContain('posnet ergo online')
    expect(ergo.hay).toContain('kasy fiskalne')
    // The group name is matched apart, with a lower weight (`lib/search.ts`).
    expect(ergo.hay).not.toContain('kasy i sprzedaz')
    expect(ergo.hay).toContain('food truck')
    expect(ergo.hay).not.toMatch(/[A-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/)
  })

  it('hides empty categories and counts the others', () => {
    const slugs = index.categories.map((category) => category.slug)
    // Katalog v2: every one of the 23 categories has products (vending: 1).
    expect(slugs).toHaveLength(23)
    expect(slugs).toContain('automaty-vendingowe')
    const total = index.categories.reduce((sum, category) => sum + category.count, 0)
    expect(total).toBe(225)
    expect(index.groups).toHaveLength(5)
    expect(index.groups[0]).toMatchObject({ slug: 'sprzedaz', gradient: ['#244FB0', '#4FA3F0'] })
  })

  it('lists brands of the products, industries, pages but home, and search settings', () => {
    // 32 brands in the package, 31 with products (StorageCraft has none in katalog v2).
    expect(index.brands).toHaveLength(31)
    expect(index.industries.filter((industry) => industry.active)).toHaveLength(3)
    expect(index.pages).toEqual([{ slug: 'opieka-it', title: 'Opieka IT' }])
    expect(index.search.synonyms.notebook).toEqual(['laptop'])
    expect(index.search.popular).toContain('KSeF')
  })

  it('lists the wizard among the pages while it has valid rules (B10c)', () => {
    const source = sourceFromSeed()
    const rules = wizardFromSeed(kreator, (id) =>
      id === 'ergo' ? 'posnet-ergo-online' : undefined,
    )
    const withWizard = buildCatalogIndex({
      ...source,
      settings: { search: source.settings!.search, wizard: rules as BiznesSetting['wizard'] },
    })
    expect(withWizard.pages).toContainEqual(WIZARD_PAGE)
    expect(index.pages).not.toContainEqual(WIZARD_PAGE)
  })

  it('carries no price field', () => {
    expect(JSON.stringify(index)).not.toMatch(/"(price|cena|offers)"/i)
  })
})

describe('buildCatalogIndex tenant isolation of relations', () => {
  const build = (relations: Partial<Product>) =>
    buildCatalogIndex({
      tenantId: TENANT,
      products: [
        { id: 1, slug: 'p', name: 'P', kind: 'device', categories: [], ...relations },
      ] as unknown as Product[],
      categories: [],
      groups: [],
      industries: [],
      pages: [],
      settings: null,
    })
  const category = (tenant: number) =>
    ({ id: 10 + tenant, slug: `kat-${tenant}`, name: `Kat ${tenant}`, tenant }) as CatalogCategory
  const industry = (tenant: number) =>
    ({ id: 20 + tenant, slug: `branza-${tenant}`, name: `Branża ${tenant}`, tenant }) as Industry
  const brand = (tenants: number[]) =>
    ({ id: 30, slug: 'marka', name: 'Marka', partnerStatus: 'none', tenants }) as Partner

  it('drops categories and industries of another tenant', () => {
    const [product] = build({
      categories: [category(OTHER_TENANT), category(TENANT)],
      industries: [industry(OTHER_TENANT), industry(TENANT)],
    }).products
    expect(product).toMatchObject({ categories: ['kat-1'], industries: ['branza-1'] })
    expect(product!.hay).not.toContain('kat 2')
    expect(product!.hay).not.toContain('branza 2')
  })

  it('drops a brand not shown on this site', () => {
    const index = build({ brand: brand([OTHER_TENANT]) })
    expect(index.products[0]!.brand).toBeNull()
    expect(index.brands).toEqual([])
    expect(index.products[0]!.hay).not.toContain('marka')
  })

  it('lists "Skompletuj stanowisko" of this tenant only, and only when set', () => {
    const fit = (slug: string, tenant: number) => ({ id: 40 + tenant, slug, tenant }) as Product
    const [product] = build({
      fitsWith: [fit('obca', OTHER_TENANT), fit('swoja', TENANT)],
    }).products
    expect(product!.fits).toEqual(['swoja'])
    expect(build({}).products[0]).not.toHaveProperty('fits')
  })

  it('keeps a brand shown on this site', () => {
    expect(build({ brand: brand([OTHER_TENANT, TENANT]) }).products[0]!.brand).toBe('marka')
  })

  it('gives a brand its small logo file, and none without a file', () => {
    const withLogo = {
      ...brand([TENANT]),
      url: '/api/partners/file/marka.png',
      width: 800,
      height: 200,
      sizes: { logo: { url: '/api/partners/file/marka-320x80.webp', width: 320, height: 80 } },
    } as Partner
    expect(build({ brand: withLogo }).brands[0]!.logo).toEqual({
      url: '/api/partners/file/marka-320x80.webp',
      width: 800,
      height: 200,
    })
    expect(build({ brand: brand([TENANT]) }).brands[0]).not.toHaveProperty('logo')
  })
})

describe('buildCatalogIndex brand pages and subcategories (K3b′)', () => {
  const group = { id: 50, slug: 'biuro', name: 'Komputery i biuro', tenant: TENANT }
  const komp = {
    id: 51,
    slug: 'komputery-monitory',
    name: 'Komputery i monitory',
    tenant: TENANT,
    group: 50,
    subcategories: [
      { name: 'Laptopy', slug: 'laptopy' },
      { name: 'Komputery i All-in-One', slug: 'komputery' },
      { name: 'Monitory', slug: 'monitory' },
    ],
  } as CatalogCategory
  const lenovo = {
    id: 30,
    slug: 'lenovo',
    name: 'Lenovo',
    partnerStatus: 'none',
    tenants: [TENANT],
    brandPage: { hasPage: true },
  } as Partner
  const ingenico = { ...lenovo, id: 31, slug: 'ingenico', name: 'Ingenico', brandPage: {} }
  const card = (id: number, fields: Partial<Product>) =>
    ({
      id,
      slug: `p${id}`,
      name: `P${id}`,
      kind: 'device',
      categories: [komp],
      ...fields,
    }) as Product
  const index = buildCatalogIndex({
    tenantId: TENANT,
    products: [
      card(1, { brand: lenovo, subcategory: 'Laptopy', series: 'ThinkBook' }),
      card(2, { brand: lenovo, subcategory: 'Laptopy' }),
      card(3, { brand: ingenico, subcategory: 'Monitory' }),
      card(4, { subcategory: 'Nieznana' }),
    ],
    categories: [komp],
    groups: [group] as unknown as CatalogSource['groups'],
    industries: [],
    pages: [],
    settings: null,
  })

  it('marks only brands with a page', () => {
    expect(index.brands.find((brand) => brand.slug === 'lenovo')).toMatchObject({ page: true })
    expect(index.brands.find((brand) => brand.slug === 'ingenico')).not.toHaveProperty('page')
  })

  it('counts subcategories with products, in the panel order, with their addresses', () => {
    expect(index.categories[0]!.subcategories).toEqual([
      { name: 'Laptopy', slug: 'laptopy', count: 2 },
      { name: 'Monitory', slug: 'monitory', count: 1 },
    ])
  })

  it('lets „laptop” find a card through its subcategory and series', () => {
    expect(index.products[0]!.hay).toContain('laptopy')
    expect(index.products[0]!.hay).toContain('thinkbook')
  })
})

describe('buildCatalogIndex images', () => {
  const product = (images: Media[]) =>
    ({
      id: 1,
      slug: 'p',
      name: 'P',
      kind: 'device',
      categories: [],
      images,
    }) as unknown as Product
  const build = (images: Media[]) =>
    buildCatalogIndex({
      tenantId: TENANT,
      products: [product(images)],
      categories: [],
      groups: [],
      industries: [],
      pages: [],
      settings: null,
    }).products[0]!

  it('never lists an image that needs consent', () => {
    expect(build([image(1, 'a.webp', { requiresConsent: true })]).image).toBeUndefined()
  })

  it('never lists an image of another tenant', () => {
    expect(build([image(1, 'a.webp', { tenant: OTHER_TENANT })]).image).toBeUndefined()
  })

  it('takes the first public image', () => {
    expect(
      build([image(1, 'a.webp', { requiresConsent: true }), image(2, 'b.webp')]).image?.url,
    ).toBe('/api/media/file/b-480x360.webp')
  })
})

describe('buildCatalogIndex group showcase (home page offer cards)', () => {
  const category = { id: 11, slug: 'kasy', name: 'Kasy', group: 5, tenant: TENANT }
  const product = {
    id: 1,
    slug: 'p',
    name: 'P',
    kind: 'device',
    categories: [category],
  } as unknown as Product
  const build = (showcase: unknown) =>
    buildCatalogIndex({
      tenantId: TENANT,
      products: [product],
      categories: [category] as unknown as CatalogCategory[],
      groups: [
        {
          id: 5,
          slug: 'sprzedaz',
          name: 'Kasy i sprzedaż',
          icon: 'store',
          gradientFrom: '#244FB0',
          gradientTo: '#4FA3F0',
          showcase,
        },
      ] as unknown as Parameters<typeof buildCatalogIndex>[0]['groups'],
      industries: [],
      pages: [],
      settings: null,
    }).groups[0]

  it('gives up to two public pictures of this tenant', () => {
    const own = image(1, 'ergo.webp')
    const foreign = image(2, 'obce.webp', { tenant: OTHER_TENANT })
    const consent = image(3, 'zgoda.webp', { requiresConsent: true })
    const group = build({ mode: 'images', images: [foreign, own, consent] })
    expect(group?.showcase?.images.map((picture) => picture.alt)).toEqual(['Obraz ergo.webp'])
    expect(group?.showcase?.statuses).toEqual([])
  })

  it('gives the status rows in the status mode', () => {
    const group = build({
      mode: 'statuses',
      images: [image(1, 'ergo.webp')],
      statuses: [{ label: 'Opieka IT', value: 'aktywna', tone: 'ok' }],
    })
    expect(group?.showcase).toEqual({
      images: [],
      statuses: [{ label: 'Opieka IT', value: 'aktywna', tone: 'ok' }],
    })
  })

  it('has no showcase when nothing is set', () => {
    expect(build(undefined)).not.toHaveProperty('showcase')
    expect(build({ mode: 'images', images: [] })).not.toHaveProperty('showcase')
  })
})

describe('searchIndex (`GET /api/catalog-index`, K31c)', () => {
  it('leaves out what only server-rendered cards use: the „film” badge', () => {
    const index = {
      products: [
        { slug: 'a', video: true, name: 'A' },
        { slug: 'b', name: 'B' },
      ],
      brands: [],
    } as unknown as CatalogIndex
    expect(searchIndex(index).products).toEqual([
      { slug: 'a', name: 'A' },
      { slug: 'b', name: 'B' },
    ])
  })
})

describe('buildCatalogIndex showroom brands and films (K31c)', () => {
  const brand = (id: number, slug: string, series: (number | { id: number })[]) =>
    ({
      id,
      slug,
      name: slug,
      partnerStatus: 'none',
      tenants: [TENANT],
      brandPage: { hasPage: true },
      showroom: {
        segments: [{ name: 'Laptopy', key: 'laptopy', series: [{ name: 'S', products: series }] }],
      },
    }) as unknown as Partner
  const build = (products: Partial<Product>[]) =>
    buildCatalogIndex({
      tenantId: TENANT,
      products: products.map((fields, position) => ({
        id: position + 1,
        slug: `p${position + 1}`,
        name: `P${position + 1}`,
        kind: 'device',
        categories: [],
        ...fields,
      })) as Product[],
      categories: [],
      groups: [],
      industries: [],
      pages: [],
      settings: null,
    })

  it('a brand is a showroom only while a card of its showroom is listed', () => {
    const lenovo = brand(30, 'lenovo', [1])
    const dell = brand(31, 'dell', [{ id: 99 }])
    const index = build([{ brand: lenovo }, { brand: dell }])
    expect(index.brands.find((item) => item.slug === 'lenovo')).toMatchObject({ showroom: true })
    expect(index.brands.find((item) => item.slug === 'dell')).not.toHaveProperty('showroom')
  })

  it('marks cards with an active film', () => {
    const index = build([
      { videos: [{ youtubeId: 'UFXLZ4kSjD0', title: 'A', match: 'model', active: true }] },
      { videos: [{ youtubeId: 'UFXLZ4kSjD0', title: 'A', match: 'model', active: false }] },
      {},
    ])
    expect(index.products.map((product) => product.video ?? false)).toEqual([true, false, false])
  })
})
