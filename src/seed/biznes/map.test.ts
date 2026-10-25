import { describe, expect, it } from 'vitest'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import media from '../../../seed/prokombiznes/media.json'
import gallery from '../../../seed/prokombiznes/media-produkty-v2.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import { isValidSlug } from '../../lib/tenant/uniqueSlug'
import {
  brandLogoFile,
  CATEGORY_SLUGS,
  categoryData,
  galleryFileName,
  galleryFilesToImport,
  galleryMediaData,
  groupData,
  industryData,
  isImportedFileName,
  mediaData,
  productData,
  productImageFiles,
  productLegacyIds,
  productUpdateData,
  PREVIOUS_CATEGORY_SLUGS,
  searchData,
  skipMediaFile,
  slugFromName,
  type ProductRefs,
  type SeedCatalog,
} from './map'
import { hasSameValues } from '../compare'

const catalog: SeedCatalog = katalog
const files = media.pliki

/** Every lookup succeeds with a fake id, so a failing map points at the data, not the refs. */
const anyRefs: ProductRefs = {
  brand: () => 1,
  category: () => 2,
  industry: () => 3,
  image: () => 4,
}

describe('package counts (katalog v2, ZMIANY-katalog-v2 §1)', () => {
  it('has 5 groups, 23 categories, 7 industries, 32 brands and 225 products', () => {
    expect(catalog.grupy).toHaveLength(5)
    expect(catalog.kategorie).toHaveLength(23)
    expect(catalog.branze).toHaveLength(7)
    expect(catalog.marki).toHaveLength(32)
    expect(catalog.produkty).toHaveLength(225)
    expect(catalog.produkty.filter((p) => p.rodzaj === 'usluga')).toHaveLength(13)
  })

  it('has a gallery file on disk-list for every gallery entry, and no stray files', () => {
    const listed = new Set(gallery.pliki.map((file) => file.plik))
    const used = catalog.produkty.flatMap((p) => p.galeria ?? [])
    expect(listed.size).toBe(567)
    expect(new Set(used)).toEqual(listed)
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
    expect(new Set(slugs).size).toBe(23)
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
    expect(vend).toMatchObject({ slug: 'automaty-vendingowe', name: 'Automaty vendingowe' })
    expect(vend).not.toHaveProperty('icon')
  })

  it('puts the 3 new categories in the sales group and renames akc', () => {
    const sales = catalog.kategorie.filter((c) => c.grupa === 'sprz').map((c) => c.slug)
    expect(sales).toEqual(expect.arrayContaining(['wagi', 'kody', 'vend']))
    const akc = categoryData(
      catalog.kategorie.find((c) => c.slug === 'akc')!,
      1,
      icons.kategoria_ikona,
    )
    expect(akc).toMatchObject({ name: 'Akcesoria POS', slug: 'akcesoria-pos' })
  })

  it('remembers the old address of every renamed category', () => {
    const current = new Set(Object.values(CATEGORY_SLUGS))
    for (const [slug, previous] of Object.entries(PREVIOUS_CATEGORY_SLUGS)) {
      expect(current.has(slug)).toBe(true)
      for (const old of previous) expect(current.has(old)).toBe(false)
    }
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

  it('gives every product a unique valid address and import keys no other product has', () => {
    const data = catalog.produkty.map((p) => productData(p, catalog, files, anyRefs))
    const slugs = data.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(225)
    for (const slug of slugs) expect(isValidSlug(slug)).toBe(true)
    const keys = data.flatMap((p) => p.legacyIds)
    expect(new Set(keys).size).toBe(keys.length)
    expect(data.map((p) => p.legacyIds[0])).toEqual(catalog.produkty.map((p) => p.slug))
  })

  it('keeps the short id first, then the sheet ids', () => {
    const jota = catalog.produkty.find((p) => p.slug === 'jota')!
    expect(productLegacyIds(jota)).toEqual([
      'jota',
      'elzab-jota-online',
      'elzab-jota-online-bt-wifi',
      'elzab-kasa-jota-lan-gprs',
    ])
  })

  it('maps katalog v2 fields: variants, sources without duplicates, status and batch', () => {
    const jota = catalog.produkty.find((p) => p.slug === 'jota')!
    const data = productData(jota, catalog, files, anyRefs)
    expect(data.variants).toHaveLength(3)
    expect(data.sources.productPages).toHaveLength(3)
    // The same PDF for all three variants → one link.
    expect(data.sources.datasheets).toEqual([
      'https://www.elzab.com.pl/download/reklamowe/elzab_jota_online.pdf',
    ])
    expect(data.sources.checkedAt).toBeNull()
    expect(data.contentStatus).toMatch(/^(ready|needs-review)$/)
    expect(data.batch).toMatch(/^[012]$/)
  })

  it('maps every status and batch of the package', () => {
    const data = catalog.produkty.map((p) => productData(p, catalog, files, anyRefs))
    expect(new Set(data.map((p) => p.contentStatus))).toEqual(new Set(['ready', 'needs-review']))
    expect(new Set(data.map((p) => p.batch))).toEqual(new Set(['0', '1', '2']))
  })

  it('has subcategory chips in akc and kody (ZMIANY-katalog-v2 §4)', () => {
    const chips = (category: string) =>
      new Set(catalog.produkty.filter((p) => p.kategoria === category).map((p) => p.podkategoria))
    expect(chips('akc').size).toBeGreaterThan(1)
    expect(chips('kody').size).toBeGreaterThan(1)
    expect(chips('akc').has(null)).toBe(false)
    expect(chips('kody').has(null)).toBe(false)
  })

  it('moves the scale and the scanner to the new categories', () => {
    const category = (slug: string) => catalog.produkty.find((p) => p.slug === slug)!.kategoria
    expect(category('waga')).toBe('wagi')
    expect(category('skaner')).toBe('kody')
  })

  it('writes empty seed-owned fields as null, so an update clears them', () => {
    const opieka = catalog.produkty.find((p) => p.slug === 'opieka')!
    expect(productData(opieka, catalog, files, anyRefs)).toMatchObject({
      badge: null,
      subcategory: null,
      images: [],
      variants: [],
      featuredOrder: null,
    })
    // Not a cash register: every comparison key empty, so stale parameters get cleared.
    expect(Object.values(productData(opieka, catalog, files, anyRefs).comparison)).toEqual(
      Array(8).fill(null),
    )
  })

  it('stores a check date of the package as Payload returns it', () => {
    const ergo = catalog.produkty.find((p) => p.slug === 'ergo')!
    const checked = { ...ergo, zrodla: { ...ergo.zrodla, sprawdzono: '2026-10-23' } }
    expect(productData(checked, catalog, files, anyRefs).sources.checkedAt).toBe(
      '2026-10-23T00:00:00.000Z',
    )
    const broken = { ...ergo, zrodla: { ...ergo.zrodla, sprawdzono: '23.10.2026' } }
    expect(() => productData(broken, catalog, files, anyRefs)).toThrow('invalid date')
  })
})

describe('productUpdateData (fields a person sets only move forward)', () => {
  const tp = catalog.produkty.find((p) => p.slug === 'tp')!
  const data = productData(tp, catalog, files, anyRefs)
  const stored = (contentStatus: 'ready' | 'needs-review', checkedAt: string | null) => ({
    contentStatus,
    sources: { checkedAt },
  })

  it('keeps „Gotowe” and a check date set in the panel against the package', () => {
    expect(data.contentStatus).toBe('needs-review')
    expect(data.sources.checkedAt).toBeNull()
    const update = productUpdateData(data, stored('ready', '2026-10-24T00:00:00.000Z'))
    expect(update.contentStatus).toBe('ready')
    expect(update.sources.checkedAt).toBe('2026-10-24T00:00:00.000Z')
    // The links still come from the package.
    expect(update.sources.productPages).toEqual(data.sources.productPages)
  })

  it('takes „Gotowe” and a check date from the package', () => {
    const promoted = { ...data, contentStatus: 'ready' as const }
    promoted.sources = { ...data.sources, checkedAt: '2026-10-25T00:00:00.000Z' }
    const update = productUpdateData(promoted, stored('needs-review', null))
    expect(update.contentStatus).toBe('ready')
    expect(update.sources.checkedAt).toBe('2026-10-25T00:00:00.000Z')
  })

  it('needs no update when the panel moved forward and the package did not change', () => {
    const inDatabase = {
      ...structuredClone(data),
      contentStatus: 'ready',
      sources: { ...data.sources, checkedAt: '2026-10-24T00:00:00.000Z' },
    }
    const update = productUpdateData(data, inDatabase as Parameters<typeof productUpdateData>[1])
    expect(hasSameValues(inDatabase, update)).toBe(true)
  })

  it('maps the card, flags and register comparison of a product', () => {
    const ergo = catalog.produkty.find((p) => p.slug === 'ergo')!
    const refs: ProductRefs = {
      brand: (name) => (name === 'Posnet' ? 10 : undefined),
      category: (slug) => (slug === 'kasy' ? 20 : undefined),
      industry: (slug) => ({ uslugi: 31, gastro: 32, handel: 33 })[slug],
      image: (file) =>
        ({ 'produkty/ergo/ergo-01.webp': 40, 'produkty/ergo/ergo-02.webp': 41 })[file],
    }
    expect(productData(ergo, catalog, files, refs)).toMatchObject({
      name: 'Posnet Ergo Online',
      slug: 'posnet-ergo-online',
      legacyIds: ['ergo', 'posnet-ergo-online'],
      kind: 'device',
      brand: 10,
      categories: [20],
      industries: [31, 32, 33],
      features: ['Online', 'WiFi / LTE', '0,6 kg'],
      badge: 'Ulga do 700 zł',
      images: [40, 41],
      authorized: true,
      isNew: false,
      popularity: 98,
      registerTypes: ['mobile', 'small'],
      comparison: { type: 'mała / mobilna', weight: '0,6 kg', audience: expect.any(String) },
      featured: true,
      featuredOrder: 0,
    })
  })

  it('features the products of the package order (8 since v20)', () => {
    const featured = catalog.produkty
      .map((p) => productData(p, catalog, files, anyRefs))
      .filter((p) => p.featured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    expect(featured.map((p) => p.legacyIds[0])).toEqual(catalog.kolejnosc_wyroznionych)
  })

  it('fails loudly on a reference that was not imported', () => {
    const ergo = catalog.produkty.find((p) => p.slug === 'ergo')!
    expect(() => productData(ergo, catalog, files, { ...anyRefs, brand: () => undefined })).toThrow(
      'brand "Posnet"',
    )
  })

  it('takes the katalog v2 gallery in its order, else the design files', () => {
    const product = (slug: string) => catalog.produkty.find((p) => p.slug === slug)!
    expect(productImageFiles(product('tp'), files)).toEqual([
      'produkty/tp/tp-01.webp',
      'produkty/tp/tp-02.webp',
    ])
    // A service without a gallery keeps its design file.
    expect(productImageFiles(product('ksef'), files)).toContain('p-ksef.webp')
    expect(productImageFiles(product('opieka'), files)).toEqual([])
  })

  it('keeps only the first photos of a gallery with a limit (SEED_GALLERY_LIMIT in CI)', () => {
    const product = (slug: string) => catalog.produkty.find((p) => p.slug === slug)!
    expect(productImageFiles(product('tp'), files, 1)).toEqual(['produkty/tp/tp-01.webp'])
    expect(productImageFiles(product('tp'), files, 2)).toHaveLength(2)
    // Design files of a service are not a gallery: the limit does not touch them.
    expect(productImageFiles(product('ksef'), files, 1)).toContain('p-ksef.webp')
  })
})

describe('galleryFilesToImport', () => {
  const all = new Set(gallery.pliki.map((file) => file.plik))

  it('without a limit imports every gallery photo', () => {
    expect(galleryFilesToImport(catalog.produkty, gallery.pliki, null)).toEqual(all)
  })

  it('with a limit imports at most that many photos per product, always the card photo', () => {
    const wanted = galleryFilesToImport(catalog.produkty, gallery.pliki, 2)
    expect(wanted.size).toBeLessThan(all.size)
    for (const product of catalog.produkty) {
      const kept = (product.galeria ?? []).filter((file) => wanted.has(file))
      expect(kept).toEqual([...new Set(product.galeria ?? [])].slice(0, 2))
    }
    for (const file of wanted) expect(all.has(file)).toBe(true)
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

describe('katalog v2 galleries and logos', () => {
  it('stores gallery files under unique names', () => {
    const names = gallery.pliki.map((file) => galleryFileName(file.plik))
    expect(galleryFileName('produkty/jota/jota-01.webp')).toBe('jota-01.webp')
    expect(new Set(names).size).toBe(names.length)
    // No gallery name is a design file name (or its `-N` copy), so lookups never mix them.
    const design = files.map((file) => file.plik)
    for (const name of names) {
      expect(design.some((file) => isImportedFileName(name, file))).toBe(false)
    }
  })

  it('names gallery photos after the product and keeps their source', () => {
    const [first, second] = gallery.pliki.filter((file) => file.produkt === 'jota')
    expect(galleryMediaData(first!, catalog.produkty)).toMatchObject({
      alt: 'Elzab Jota Online',
      requiresConsent: false,
      source: expect.stringContaining('elzab-jota-online_01.png'),
    })
    expect(galleryMediaData(second!, catalog.produkty).alt).toBe('Elzab Jota Online — zdjęcie 2')
  })

  it('finds a logo for every brand except SVG-only ones and those without a file', () => {
    const missing = catalog.marki.filter((brand) => !brandLogoFile(brand, files))
    expect(missing.map((brand) => brand.nazwa).sort()).toEqual(
      ['APC', 'Honeywell', 'PRO-KOM', 'Samsung', 'Zebra'].sort(),
    )
    expect(
      brandLogoFile(
        catalog.marki.find((b) => b.nazwa === 'Dibal')!,
        files,
      ),
    ).toEqual({
      from: 'seed',
      file: 'logo-dibal.webp',
    })
  })
})

describe('hasSameValues (update only on change)', () => {
  it('treats null and missing as equal and ignores keys the data does not set', () => {
    expect(
      hasSameValues(
        { name: 'A', badge: null, description: { root: {} }, comparison: { type: 'x', plu: null } },
        { name: 'A', badge: undefined, comparison: { type: 'x' } },
      ),
    ).toBe(true)
  })

  it('sees a changed value, order of a list and a cleared value', () => {
    expect(hasSameValues({ name: 'A' }, { name: 'B' })).toBe(false)
    expect(hasSameValues({ images: [1, 2] }, { images: [2, 1] })).toBe(false)
    expect(hasSameValues({ badge: 'Nowość' }, { badge: null })).toBe(false)
  })

  it('matches a product read back from the data it was created from', () => {
    const ergo = catalog.produkty.find((p) => p.slug === 'ergo')!
    const data = productData(ergo, catalog, files, anyRefs)
    const stored = { ...structuredClone(data), id: 5, description: null, updatedAt: 'x' }
    expect(hasSameValues(stored, data)).toBe(true)
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
