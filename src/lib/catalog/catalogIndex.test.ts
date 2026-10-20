import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import type { CatalogCategory, Industry, Media, Partner, Product } from '@/payload-types'

import { buildCatalogIndex } from './catalogIndex'
import { image, sourceFromSeed, TENANT } from './seedSource.fixture'

const OTHER_TENANT = 2

describe('buildCatalogIndex on the seed package', () => {
  const index = buildCatalogIndex(sourceFromSeed())

  it('lists all 67 products', () => {
    expect(index.products).toHaveLength(67)
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
        url: '/api/media/file/p-posnet-ergo-480x360.webp',
        alt: 'Posnet Ergo Online',
      },
    })
    expect(ergo.hay).toContain('posnet ergo online')
    expect(ergo.hay).toContain('kasy fiskalne')
    expect(ergo.hay).toContain('kasy i sprzedaz')
    expect(ergo.hay).toContain('food truck')
    expect(ergo.hay).not.toMatch(/[A-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/)
  })

  it('hides empty categories and counts the others', () => {
    const slugs = index.categories.map((category) => category.slug)
    expect(slugs).toHaveLength(20)
    expect(slugs).not.toContain('maszyny-vendingowe')
    const total = index.categories.reduce((sum, category) => sum + category.count, 0)
    expect(total).toBe(67)
    expect(index.groups).toHaveLength(5)
    expect(index.groups[0]).toMatchObject({ slug: 'sprzedaz', gradient: ['#244FB0', '#4FA3F0'] })
  })

  it('lists brands of the products, industries, pages but home, and search settings', () => {
    // 27 brands in the package, 26 with products (spec. §7).
    expect(index.brands).toHaveLength(26)
    expect(index.industries.filter((industry) => industry.active)).toHaveLength(3)
    expect(index.pages).toEqual([{ slug: 'opieka-it', title: 'Opieka IT' }])
    expect(index.search.synonyms.notebook).toEqual(['laptop'])
    expect(index.search.popular).toContain('KSeF')
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
