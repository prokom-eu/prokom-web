import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import type {
  BiznesSetting,
  CatalogCategory,
  CatalogGroup,
  Industry,
  Media,
  Partner,
  Product,
} from '@/payload-types'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import media from '../../../seed/prokombiznes/media.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import {
  categoryData,
  groupData,
  industryData,
  mediaData,
  productData,
  searchData,
  skipMediaFile,
  type SeedCatalog,
} from '../../seed/biznes/map'
import { buildCatalogIndex, type CatalogSource } from './catalogIndex'

const TENANT = 1
const OTHER_TENANT = 2

function image(id: number, file: string, overrides: Partial<Media> = {}): Media {
  const base = file.replace(/\.webp$/, '')
  return {
    id,
    tenant: TENANT,
    alt: `Obraz ${file}`,
    requiresConsent: false,
    url: `/api/media/file/${file}`,
    width: 1200,
    height: 900,
    sizes: {
      small: { url: `/api/media/file/${base}-480x360.webp`, width: 480, height: 360 },
      medium: { url: `/api/media/file/${base}-960x720.webp`, width: 960, height: 720 },
    },
    ...overrides,
  } as Media
}

/** The seed package as the database returns it after `pnpm seed` (populated relations). */
function sourceFromSeed(): CatalogSource {
  const catalog: SeedCatalog = katalog
  let nextId = 1
  const groups = catalog.grupy.map((group) => ({ id: nextId++, ...groupData(group) }))
  const groupBySeed = new Map(catalog.grupy.map((group, index) => [group.slug, groups[index]!]))
  const categories = catalog.kategorie.map((category) => {
    const group = groupBySeed.get(category.grupa)!
    return {
      id: nextId++,
      ...categoryData(category, group.id, icons.kategoria_ikona),
      group,
      tenant: TENANT,
    }
  })
  const categoryBySeed = new Map(
    catalog.kategorie.map((category, index) => [category.slug, categories[index]!]),
  )
  const industries = catalog.branze.map((industry, index) => ({
    id: nextId++,
    ...industryData(industry, index),
    tenant: TENANT,
  }))
  const industryBySeed = new Map(
    catalog.branze.map((industry, index) => [industry.slug, industries[index]!]),
  )
  const brands = new Map(
    catalog.marki.map((brand) => [
      brand.nazwa,
      {
        id: nextId++,
        name: brand.nazwa,
        slug: brand.slug,
        partnerStatus: 'none',
        tenants: [TENANT],
      } as Partner,
    ]),
  )
  const images = new Map(
    media.pliki
      .filter((file) => !skipMediaFile(file))
      .map((file) => [file.plik, image(nextId++, file.plik, mediaData(file, catalog.produkty))]),
  )
  const products = catalog.produkty.map((product) => {
    const data = productData(product, catalog, media.pliki, {
      brand: (name) => brands.get(name)?.id,
      category: (slug) => categoryBySeed.get(slug)?.id,
      industry: (slug) => industryBySeed.get(slug)?.id,
      image: (file) => images.get(file)?.id,
    })
    return {
      ...data,
      id: nextId++,
      brand: brands.get(product.marka),
      categories: [categoryBySeed.get(product.kategoria)],
      industries: (product.branze ?? []).map((slug) => industryBySeed.get(slug)),
      images: product.zdjecie ? [images.get(product.zdjecie)] : [],
    }
  })
  return {
    tenantId: TENANT,
    products: products as unknown as Product[],
    categories: categories as unknown as CatalogCategory[],
    groups: groups as unknown as CatalogGroup[],
    industries: industries as unknown as Industry[],
    pages: [
      { slug: 'home', title: 'Strona główna' },
      { slug: 'opieka-it', title: 'Opieka IT' },
    ],
    settings: { search: searchData(search) } as Pick<BiznesSetting, 'search'>,
  }
}

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
