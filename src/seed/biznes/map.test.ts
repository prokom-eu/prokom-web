import { describe, expect, it } from 'vitest'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import media from '../../../seed/prokombiznes/media.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import { isValidSlug } from '../../lib/tenant/uniqueSlug'
import {
  categoryData,
  groupData,
  industryData,
  isImportedFileName,
  mediaData,
  productData,
  productImageFiles,
  searchData,
  skipMediaFile,
  slugFromName,
  type ProductRefs,
  type SeedCatalog,
} from './map'

const catalog: SeedCatalog = katalog
const files = media.pliki

/** Every lookup succeeds with a fake id, so a failing map points at the data, not the refs. */
const anyRefs: ProductRefs = {
  brand: () => 1,
  category: () => 2,
  industry: () => 3,
  image: () => 4,
}

describe('package counts (spec. §7)', () => {
  it('has 5 groups, 21 categories, 7 industries, 27 brands and 67 products', () => {
    expect(catalog.grupy).toHaveLength(5)
    expect(catalog.kategorie).toHaveLength(21)
    expect(catalog.branze).toHaveLength(7)
    expect(catalog.marki).toHaveLength(27)
    expect(catalog.produkty).toHaveLength(67)
  })
})

describe('groups, categories and industries', () => {
  it('maps every group to its ADR-012 address with icon and gradient', () => {
    const groups = catalog.grupy.map(groupData)
    expect(groups.map((g) => g.slug)).toEqual([
      'sprzedaz',
      'komputery-biuro',
      'oprogramowanie',
      'bezpieczenstwo-siec',
      'serwis-uslugi',
    ])
    expect(groups[0]).toMatchObject({ icon: 'store', gradientFrom: '#244FB0' })
  })

  it('maps all categories to unique valid addresses', () => {
    const slugs = catalog.kategorie.map(
      (category) => categoryData(category, 1, icons.kategoria_ikona).slug,
    )
    expect(new Set(slugs).size).toBe(21)
    for (const slug of slugs) expect(isValidSlug(slug)).toBe(true)
  })

  it('keeps the category icon and leaves an empty description out', () => {
    const kasy = catalog.kategorie.find((c) => c.slug === 'kasy')!
    expect(categoryData(kasy, 7, icons.kategoria_ikona)).toMatchObject({
      slug: 'kasy-fiskalne',
      group: 7,
      icon: 'store',
    })
    const vend = categoryData(
      catalog.kategorie.find((c) => c.slug === 'vend')!,
      7,
      icons.kategoria_ikona,
    )
    expect(vend.slug).toBe('maszyny-vendingowe')
    expect(vend).not.toHaveProperty('description')
    expect(vend).not.toHaveProperty('icon')
  })

  it('maps industries to full addresses with the wizard business type', () => {
    const industries = catalog.branze.map((industry, index) => industryData(industry, index))
    expect(industries.map((i) => i.slug)).toEqual([
      'gastronomia',
      'handel',
      'noclegi',
      'biura-uslugi',
      'szkoly-instytucje',
      'zdrowie-uzdrowiska',
      'beauty',
    ])
    expect(industries.filter((i) => i.active).map((i) => i.slug)).toEqual([
      'gastronomia',
      'handel',
      'noclegi',
    ])
    expect(industries.at(-1)).toMatchObject({ wizardBusinessType: 'gabinet', active: false })
  })
})

describe('products', () => {
  it('builds addresses from names (ADR-012 §2.1)', () => {
    expect(slugFromName('Posnet Ergo Online')).toBe('posnet-ergo-online')
    expect(slugFromName('Sharp/NEC — monitor 4K')).toBe('sharp-nec-monitor-4k')
    expect(slugFromName('Zestaw: kasa + szuflada')).toBe('zestaw-kasa-szuflada')
  })

  it('gives every product a unique valid address and keeps the short id', () => {
    const data = catalog.produkty.map((p) => productData(p, catalog, files, anyRefs))
    const slugs = data.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(67)
    for (const slug of slugs) expect(isValidSlug(slug)).toBe(true)
    expect(new Set(data.map((p) => p.legacyId)).size).toBe(67)
  })

  it('maps the card, flags and register comparison of a product', () => {
    const ergo = catalog.produkty.find((p) => p.slug === 'ergo')!
    const refs: ProductRefs = {
      brand: (name) => (name === 'Posnet' ? 10 : undefined),
      category: (slug) => (slug === 'kasy' ? 20 : undefined),
      industry: (slug) => ({ uslugi: 31, gastro: 32, handel: 33 })[slug],
      image: (file) => (file === 'p-posnet-ergo.webp' ? 40 : undefined),
    }
    expect(productData(ergo, catalog, files, refs)).toMatchObject({
      name: 'Posnet Ergo Online',
      slug: 'posnet-ergo-online',
      legacyId: 'ergo',
      kind: 'device',
      brand: 10,
      categories: [20],
      industries: [31, 32, 33],
      features: ['Online', 'WiFi / LTE', '0,6 kg'],
      badge: 'Ulga do 700 zł',
      images: [40],
      authorized: true,
      isNew: false,
      popularity: 98,
      registerTypes: ['mobile', 'small'],
      comparison: { type: 'mała / mobilna', weight: '0,6 kg', audience: expect.any(String) },
      featured: true,
      featuredOrder: 0,
    })
  })

  it('features the 12 products in the package order', () => {
    const featured = catalog.produkty
      .map((p) => productData(p, catalog, files, anyRefs))
      .filter((p) => p.featured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    expect(featured.map((p) => p.legacyId)).toEqual(catalog.kolejnosc_wyroznionych)
  })

  it('fails loudly on a reference that was not imported', () => {
    const ergo = catalog.produkty.find((p) => p.slug === 'ergo')!
    expect(() => productData(ergo, catalog, files, { ...anyRefs, brand: () => undefined })).toThrow(
      'brand "Posnet"',
    )
  })

  it('adds product files keyed by the short id to the product photo', () => {
    const product = (slug: string) => catalog.produkty.find((p) => p.slug === slug)!
    expect(productImageFiles(product('waga'), files)).toEqual(['p-waga.webp'])
    expect(productImageFiles(product('fw'), files)).toEqual([
      'p-stormshield-urzadzenie.webp',
      'p-stormshield-firewall.webp',
    ])
    expect(productImageFiles(product('opieka'), files)).toEqual([])
  })
})

describe('isImportedFileName', () => {
  it.each([
    ['p-posnet-trio.webp', true],
    ['p-posnet-trio-1.webp', true],
    ['p-posnet-trio-12.webp', true],
    ['p-posnet-trio-triotab.webp', false],
    ['p-posnet-trio-1.png', false],
    ['x-p-posnet-trio.webp', false],
    [null, false],
  ])('%j is p-posnet-trio.webp: %j', (stored, expected) => {
    expect(isImportedFileName(stored, 'p-posnet-trio.webp')).toBe(expected)
  })

  it('tells every imported file of the package apart from the others', () => {
    const imported = files.filter((file) => !skipMediaFile(file)).map((file) => file.plik)
    for (const file of imported) {
      expect(imported.filter((other) => isImportedFileName(other, file))).toEqual([file])
    }
  })
})

describe('media', () => {
  it('imports 66 files: no PRO-KOM sign, brand logos go to partners', () => {
    const imported = files.filter((file) => !skipMediaFile(file))
    expect(imported).toHaveLength(66)
    expect(imported.some((file) => file.plik.endsWith('.svg'))).toBe(false)
    expect(imported.some((file) => file.rola === 'logo marki')).toBe(false)
  })

  it('has an alt text for every imported file', () => {
    for (const file of files.filter((f) => !skipMediaFile(f))) {
      expect(mediaData(file, catalog.produkty).alt.length).toBeGreaterThan(2)
    }
  })

  it('hides client logos (no written consent)', () => {
    const clients = files.filter((file) => file.rola.startsWith('logo klienta'))
    expect(clients).toHaveLength(8)
    for (const file of clients) {
      expect(mediaData(file, catalog.produkty)).toMatchObject({
        requiresConsent: true,
        alt: `Logo: ${file.klucz}`,
      })
    }
  })

  it('names a product photo after the product', () => {
    const file = files.find((f) => f.plik === 'p-posnet-ergo.webp')!
    expect(mediaData(file, catalog.produkty)).toMatchObject({
      alt: 'Posnet Ergo Online',
      requiresConsent: false,
    })
  })
})

describe('search settings', () => {
  it('maps synonyms, stop words and popular searches', () => {
    const data = searchData(search)
    expect(data.synonyms).toContainEqual({ phrase: 'notebook', expansions: ['laptop'] })
    expect(data.stopWords).toContain('szukam')
    expect(data.popular).toHaveLength(8)
  })
})
