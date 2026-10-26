import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import media from '../../../seed/prokombiznes/media.json'
import k3Catalog from '../../../seed/prokombiznes/k3/katalog-k3.json'
import k3Dictionaries from '../../../seed/prokombiznes/k3/slowniki-k3.json'
import k3Media from '../../../seed/prokombiznes/k3/media-k3.json'
import k3Removed from '../../../seed/prokombiznes/k3/usuniete.json'
import { isValidSlug } from '../../lib/tenant/uniqueSlug'
import { hasSameValues } from '../compare'
import {
  K3_MEDIA_DIR,
  k3CategoryData,
  k3CreateFields,
  k3GalleryFile,
  k3GalleryMediaData,
  k3ImageKeys,
  k3PartnerData,
  k3BrandNeedsRecord,
  k3ProductData,
  k3PublishStatus,
  k3Retired,
  k3SubcategoryName,
  matchCards,
  REPLACED_PRODUCTS,
  type K3Card,
  type K3Dictionaries,
  type K3RemovedCard,
  type K3Refs,
} from './k3'
import { CATEGORY_SLUGS, productLegacyIds, slugFromName, type SeedCatalog } from './map'

const v2: SeedCatalog = katalog
const cards: K3Card[] = k3Catalog.produkty
const removed: K3RemovedCard[] = k3Removed.produkty
const dictionaries: K3Dictionaries = k3Dictionaries
const gallery = k3Media.zdjecia
const card = (slug: string) => cards.find((item) => item.slug_seed === slug)!
const v2Product = (slug: string) => v2.produkty.find((item) => item.slug === slug)!

const matches = matchCards(cards, v2.produkty)
const removedMatches = matchCards(removed, v2.produkty)

/** Every lookup succeeds with a fake id, so a failing map points at the data, not the refs. */
const anyRefs: K3Refs = { brand: () => 1, category: () => 2, industry: () => 3, image: () => 4 }
const data = (slug: string, refs: K3Refs = anyRefs) =>
  k3ProductData(card(slug), matches.get(slug), dictionaries, refs, [])

describe('package counts (K3-KATALOG §1)', () => {
  it('has 243 cards: 230 ready, 10 to check, 3 waiting for the boss; 79 removed', () => {
    expect(cards).toHaveLength(243)
    const statuses = cards.map((item) => item.status)
    expect(statuses.filter((status) => status === 'gotowe')).toHaveLength(230)
    expect(statuses.filter((status) => status === 'do-sprawdzenia')).toHaveLength(10)
    expect(statuses.filter((status) => status === 'do-akceptacji-szefa')).toHaveLength(3)
    expect(removed).toHaveLength(79)
  })

  it('has every listed gallery photo on disk, for cards of the catalog only', () => {
    const slugs = Object.keys(gallery)
    expect(slugs).toHaveLength(215)
    for (const slug of slugs) {
      expect(cards.some((item) => item.slug_seed === slug)).toBe(true)
      for (const file of gallery[slug as keyof typeof gallery].pliki) {
        expect(fs.existsSync(path.join(K3_MEDIA_DIR, 'produkty', slug, file))).toBe(true)
      }
    }
  })
})

describe('matchCards (legacyIds → slug_seed → nazwa_poprzednia)', () => {
  it('pairs 140 cards with katalog v2 products, the rest are new', () => {
    expect(matches.size).toBe(140)
    // slug_seed equal to a sheet id of a v2 record is a pair too (mfp, srvr).
    expect(matches.get('konica-minolta-bizhub-c301i')?.slug).toBe('mfp')
    expect(matches.get('dell-poweredge-r360')?.slug).toBe('srvr')
    expect(matches.get('ergo')?.slug).toBe('ergo')
    // Found by the previous name only (no legacy id in common).
    expect(
      cards.filter((item) => matches.has(item.slug_seed) && !item.legacyIds?.length).length,
    ).toBeGreaterThan(0)
  })

  it('gives a product claimed by several cards to the card with its short id', () => {
    expect(matches.get('xl2')?.slug).toBe('xl2')
    expect(matches.has('posnet-thermal-xl2-a-online')).toBe(false)
    expect(matches.has('posnet-thermal-xl2-b-online')).toBe(false)
    // The sheet ids of XL2 A and B stay with their own cards, not with the XL2 record.
    expect(v2Product('xl2').id_z_arkusza).toContain('posnet-thermal-xl2-a')
    expect(productLegacyIds(matches.get('xl2')!)).not.toContain('posnet-thermal-xl2-a')
    expect(data('posnet-thermal-xl2-a-online').legacyIds).toContain('posnet-thermal-xl2-a')
  })

  it('never pairs one product twice', () => {
    const paired = [...matches.values(), ...removedMatches.values()].map((item) => item.slug)
    expect(new Set(paired).size).toBe(paired.length)
  })

  it('finds 75 of the 79 removed cards; the other 4 never were in the catalog', () => {
    expect(removedMatches.size).toBe(75)
  })

  it('leaves no katalog v2 product without a K3 card, a removal or a replacement', () => {
    const covered = new Set([
      ...[...matches.values(), ...removedMatches.values()].map((item) => item.slug),
      ...Object.keys(REPLACED_PRODUCTS),
    ])
    expect(v2.produkty.filter((item) => !covered.has(item.slug)).map((item) => item.slug)).toEqual(
      [],
    )
  })

  it('fails loudly when a card matches two products', () => {
    const both = { slug_seed: 'x', legacyIds: ['ergo', 'k10'], nazwa_poprzednia: null }
    expect(() => matchCards([both], v2.produkty)).toThrow('matches 2')
  })
})

describe('REPLACED_PRODUCTS (K3-KATALOG §4 pkt 2, §8)', () => {
  it('points at K3 cards and categories that exist', () => {
    for (const [shortId, target] of Object.entries(REPLACED_PRODUCTS)) {
      if ('product' in target) expect(cards.some((c) => c.slug_seed === target.product)).toBe(true)
      else expect(CATEGORY_SLUGS[target.category]).toBeDefined()
      // The key is a katalog v2 product, unless the table says "if it exists" (ubnt).
      if (shortId !== 'ubnt') expect(v2.produkty.some((p) => p.slug === shortId)).toBe(true)
    }
  })
})

describe('k3Retired (hidden cards and 301)', () => {
  const retired = k3Retired(cards, removed, v2.produkty)
  const bySource = new Map(retired.map((item) => [item.from, item]))

  it('moves a card replaced by a family to its new address and keeps the record', () => {
    expect(bySource.get(`/produkt/${slugFromName(v2Product('tb').nazwa)}`)).toMatchObject({
      to: '/produkt/lenovo-thinkbook-14-g8-g9',
      unpublish: false,
    })
  })

  it('hides a replaced product without a K3 pair and sends it to its successor', () => {
    expect(bySource.get(`/produkt/${slugFromName(v2Product('tc').nazwa)}`)).toMatchObject({
      to: '/produkt/lenovo-thinkcentre-neo-50s-55s',
      unpublish: true,
      legacyIds: productLegacyIds(v2Product('tc')),
    })
    expect(bySource.get(`/produkt/${slugFromName(v2Product('mslic').nazwa)}`)?.to).toBe(
      '/oferta/microsoft-365-licencje',
    )
    // srvr lives on as the K3 card with its sheet id: moved, not hidden.
    expect(bySource.get(`/produkt/${slugFromName(v2Product('srvr').nazwa)}`)).toMatchObject({
      to: '/produkt/dell-poweredge-r360',
      unpublish: false,
    })
  })

  it('hides a removed card and sends it to its category', () => {
    const honeywell = v2Product('honeywell-ct45')
    expect(bySource.get(`/produkt/${slugFromName(honeywell.nazwa)}`)).toMatchObject({
      to: '/oferta/skanery-kolektory-etykiety',
      unpublish: true,
      reason: 'usunięta',
    })
  })

  it('has 90 rules: 75 removed, 5 moved cards and 10 replaced products', () => {
    // `m365` keeps its address (its name already was „Microsoft 365 Business”).
    expect(slugFromName(v2Product('m365').nazwa)).toBe('microsoft-365-business')
    expect(retired).toHaveLength(90)
    expect(retired.filter((item) => item.unpublish)).toHaveLength(85)
    expect(new Set(retired.map((item) => item.from)).size).toBe(90)
  })

  it('fails loudly when a removed card is also a card of the catalog', () => {
    const live = card('ergo')
    expect(() => k3Retired(cards, [{ ...live, slug_seed: 'removed-ergo' }], v2.produkty)).toThrow(
      'removed card "removed-ergo"',
    )
  })

  it('never redirects to a source or away from an address of a K3 card', () => {
    const live = new Set(
      cards.map(
        (item) =>
          `/produkt/${k3ProductData(item, matches.get(item.slug_seed), dictionaries, anyRefs, []).slug}`,
      ),
    )
    for (const item of retired) {
      expect(bySource.has(item.to)).toBe(false)
      expect(live.has(item.from)).toBe(false)
    }
  })
})

describe('k3ProductData', () => {
  it('keeps the address of a katalog v2 product, a new card takes slug_seed', () => {
    expect(data('ergo').slug).toBe('posnet-ergo-online')
    expect(data('posnet-thermal-xl2-a-online').slug).toBe('posnet-thermal-xl2-a-online')
    // Replaced by a family: the matched record moves to the new address (301 from the old one).
    expect(data('lenovo-thinkbook-14-g8-g9').slug).toBe('lenovo-thinkbook-14-g8-g9')
  })

  it('gives every card a unique valid address and import keys no other card has', () => {
    const all = cards.map((item) =>
      k3ProductData(item, matches.get(item.slug_seed), dictionaries, anyRefs, []),
    )
    expect(new Set(all.map((item) => item.slug)).size).toBe(243)
    for (const item of all) expect(isValidSlug(item.slug)).toBe(true)
    const keys = all.flatMap((item) => item.legacyIds)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('finds the katalog v2 record by its ids, also for a card paired by name', () => {
    const named = cards.find((item) => matches.has(item.slug_seed) && !item.legacyIds?.length)!
    const ids = k3ProductData(
      named,
      matches.get(named.slug_seed),
      dictionaries,
      anyRefs,
      [],
    ).legacyIds
    expect(ids).toEqual(expect.arrayContaining(productLegacyIds(matches.get(named.slug_seed)!)))
    expect(ids[0]).toBe(named.slug_seed)
  })

  it('maps the K3 fields of a card', () => {
    const refs: K3Refs = {
      brand: (name) => (name === 'Lenovo' ? 10 : undefined),
      category: (code) => (code === 'komp' ? 20 : undefined),
      industry: (slug) => ({ 'biura-uslugi': 31, 'szkoly-instytucje': 32 })[slug] ?? 33,
      image: () => 4,
    }
    const thinkbook = data('lenovo-thinkbook-14-g8-g9', refs)
    const source = card('lenovo-thinkbook-14-g8-g9')
    expect(thinkbook).toMatchObject({
      name: 'Lenovo ThinkBook 14 G8 / G9',
      subtitle: source.podtytul,
      brand: 10,
      categories: [20],
      subcategory: 'Laptopy',
      benefit: source.korzysc,
      features: source.cechy,
      suggestions: source.dobierz,
      internalNotes: source.uwagi,
      contentStatus: 'ready',
      featured: true,
      featuredOrder: 5,
    })
    expect(thinkbook.specs[0]).toEqual({ label: 'Ekran', value: source.parametry[0]!.v })
    expect(thinkbook.variants[0]).toEqual({
      name: 'G8 IRL (Intel)',
      difference: source.warianty_opis![0]!.roznica,
    })
    expect(thinkbook.configurator.description).toBe(source.konfigurator!.opis)
    expect(thinkbook.configurator.options[0]).toEqual({
      name: source.konfigurator!.opcje[0]!.nazwa,
      values: source.konfigurator!.opcje[0]!.wartosci,
      note: source.konfigurator!.opcje[0]!.uwaga ?? null,
    })
    expect(thinkbook.configurator.popular).toHaveLength(source.konfigurator!.popularne!.length)
    expect(thinkbook.description?.root.children).toHaveLength(3)
  })

  it('splits sources by type and keeps the latest check date', () => {
    const jota = data('jota')
    const links = (type: string) =>
      card('jota')
        .zrodla.filter((item) => item.typ === type)
        .map((item) => item.url)
    expect(jota.sources.productPages).toEqual(links('producent'))
    expect(jota.sources.datasheets).toEqual(links('karta-pdf'))
    expect(jota.sources.distributorPages).toEqual(links('dystrybutor'))
    expect(jota.sources.checkedAt).toBe('2026-10-25T00:00:00.000Z')
    // Regulations and ministry pages are public sources too.
    const withLaw = cards.find((item) => item.zrodla.some((z) => z.typ === 'przepisy'))!
    const law = withLaw.zrodla.find((z) => z.typ === 'przepisy')!.url
    expect(
      k3ProductData(withLaw, matches.get(withLaw.slug_seed), dictionaries, anyRefs, []).sources
        .productPages,
    ).toContain(law)
  })

  it('writes empty K3 fields as empty values, so an update clears them', () => {
    const without = (has: (item: K3Card) => unknown) => {
      const found = cards.find((item) => !has(item))!
      return k3ProductData(found, matches.get(found.slug_seed), dictionaries, anyRefs, [])
    }
    expect(without((item) => item.podtytul).subtitle).toBeNull()
    expect(without((item) => item.faq).faq).toEqual([])
    expect(without((item) => item.pakiety).packages).toEqual([])
    expect(without((item) => item.warianty_opis).variants).toEqual([])
    expect(without((item) => item.konfigurator).configurator).toEqual({
      description: null,
      options: [],
      popular: [],
    })
  })

  it('maps FAQ and the care packages (only the IT care card has them)', () => {
    expect(data('jota').faq[0]).toEqual({
      question: card('jota').faq![0]!.q,
      answer: card('jota').faq![0]!.a,
    })
    const packages = data('opieka').packages
    expect(packages.map((item) => item.name)).toEqual(['Start', 'Firma', 'Firma+'])
    expect(packages[0]).toMatchObject({
      audience: expect.any(String),
      inSubscription: expect.any(Array),
      outsideSubscription: expect.any(Array),
      rules: expect.any(Array),
    })
  })

  it('skips the industry without a page and resolves the others', () => {
    const asked: string[] = []
    const refs = { ...anyRefs, industry: (slug: string) => (asked.push(slug), 3) }
    for (const item of cards)
      k3ProductData(item, matches.get(item.slug_seed), dictionaries, refs, [])
    expect(asked).not.toContain('magazyn-produkcja')
    expect(new Set(asked)).toEqual(
      new Set([
        'handel',
        'gastronomia',
        'noclegi',
        'biura-uslugi',
        'szkoly-instytucje',
        'zdrowie-uzdrowiska',
        'beauty',
      ]),
    )
  })

  it('features the 8 cards of the dictionary order', () => {
    const featured = cards
      .map((item) => k3ProductData(item, matches.get(item.slug_seed), dictionaries, anyRefs, []))
      .filter((item) => item.featured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    expect(featured.map((item) => item.legacyIds[0])).toEqual(dictionaries.kolejnosc_wyroznionych)
  })

  it('maps the statuses: waiting for the boss is a draft „Do sprawdzenia”', () => {
    expect(data('jota').contentStatus).toBe('ready')
    expect(data('druks').contentStatus).toBe('needs-review')
    expect(data('opieka').contentStatus).toBe('needs-review')
    expect(k3PublishStatus(card('opieka'))).toBe('draft')
    expect(k3PublishStatus(card('druks'))).toBe('published')
    expect(
      cards.filter((item) => k3PublishStatus(item) === 'draft').map((c) => c.slug_seed),
    ).toEqual(['opieka', 'przeglad', 'kopie'])
  })

  it('fails loudly on a reference that was not imported', () => {
    expect(() => data('ergo', { ...anyRefs, brand: () => undefined })).toThrow('brand "Posnet"')
  })

  it('needs no update when read back from the data it was created from', () => {
    const created = structuredClone(data('lenovo-thinkbook-14-g8-g9'))
    expect(hasSameValues(created, data('lenovo-thinkbook-14-g8-g9'))).toBe(true)
  })
})

describe('k3SubcategoryName', () => {
  it('stores the name of the subcategory, also where K3 gives its address', () => {
    expect(k3SubcategoryName(card('lenovo-thinkbook-14-g8-g9'), dictionaries)).toBe('Laptopy')
    const drawer = cards.find((item) => item.podkategoria === 'Szuflady kasowe')!
    expect(k3SubcategoryName(drawer, dictionaries)).toBe('Szuflady kasowe')
    expect(k3SubcategoryName(card('jota'), dictionaries)).toBeNull()
  })

  it('resolves the subcategory of every card in its own category', () => {
    for (const item of cards) expect(() => k3SubcategoryName(item, dictionaries)).not.toThrow()
    const wrong = { ...card('lenovo-thinkbook-14-g8-g9'), podkategoria: 'Kasy' }
    expect(() => k3SubcategoryName(wrong, dictionaries)).toThrow('subcategory "Kasy"')
  })
})

describe('k3CreateFields (panel fields, written only when a card is created)', () => {
  it('takes them from the katalog v2 product of the card', () => {
    expect(k3CreateFields(card('ergo'), matches.get('ergo'), dictionaries)).toMatchObject({
      kind: 'device',
      popularity: 98,
      registerTypes: ['mobile', 'small'],
      authorized: true,
      keywords: expect.any(String),
    })
  })

  it('drops a v2 badge with a price (K3-KATALOG §10)', () => {
    expect(v2Product('ergo').odznaka).toBe('Ulga do 700 zł')
    expect(k3CreateFields(card('ergo'), matches.get('ergo'), dictionaries).badge).toBeNull()
    expect(k3CreateFields(card('pol'), matches.get('pol'), dictionaries).badge).toBeNull()
  })

  it('gives a new card defaults and its kind from the group of its category', () => {
    const fields = (slug: string) => k3CreateFields(card(slug), undefined, dictionaries)
    expect(fields('omada-routery')).toMatchObject({
      kind: 'device',
      popularity: 50,
      badge: null,
      registerTypes: [],
      isNew: false,
    })
    expect(fields('gopos-hotel').kind).toBe('software')
    expect(fields('microsoft-office-2024').kind).toBe('software')
    expect(Object.values(fields('omada-routery').comparison)).toEqual(Array(8).fill(null))
  })
})

describe('galleries (K3-KATALOG §4 pkt 5)', () => {
  it('takes the K3 photos of a card in their order, under keys of their own', () => {
    expect(
      k3ImageKeys(card('lenovo-thinkbook-14-g8-g9'), gallery, undefined, media.pliki, null),
    ).toEqual(
      gallery['lenovo-thinkbook-14-g8-g9'].pliki.map(
        (file) => `k3:lenovo-thinkbook-14-g8-g9/${file}`,
      ),
    )
    expect(
      k3ImageKeys(card('lenovo-thinkbook-14-g8-g9'), gallery, undefined, media.pliki, 1),
    ).toHaveLength(1)
  })

  it('keeps the katalog v2 gallery (or design files) of a card without K3 photos', () => {
    expect(k3ImageKeys(card('jota'), gallery, matches.get('jota'), media.pliki, null)[0]).toBe(
      'produkty/jota/jota-01.webp',
    )
    expect(k3ImageKeys(card('ksef'), gallery, matches.get('ksef'), media.pliki, null)).toContain(
      'p-ksef.webp',
    )
  })

  it('uploads K3 photos under a k3- name (272 names are taken by katalog v2)', () => {
    expect(k3GalleryFile('k3:k10/k10-01.webp')).toEqual({
      filePath: path.join(K3_MEDIA_DIR, 'produkty', 'k10', 'k10-01.webp'),
      uploadName: 'k3-k10-01.webp',
    })
    expect(k3GalleryFile('produkty/jota/jota-01.webp')).toBeNull()
    // Uploaded as WebP: another type would be stored with a wrong mimetype.
    expect(() => k3GalleryFile('k3:k10/k10-01.png')).toThrow('not WebP')
  })

  it('names a photo after the card with its number and keeps its origin', () => {
    expect(k3GalleryMediaData(card('k10'), 'k3:k10/k10-02.webp', gallery)).toEqual({
      alt: `${card('k10').nazwa} — zdjęcie 2`,
      source: `${gallery.k10.zrodlo_domeny[0]} — paczka K3 (25.10.2026), prawo użycia do potwierdzenia`,
      requiresConsent: false,
    })
  })
})

describe('k3CategoryData and k3PartnerData (dictionaries)', () => {
  const category = (code: string) => dictionaries.kategorie.find((item) => item.slug === code)!

  it('takes names, descriptions and subcategories; an address only where it has a page', () => {
    const komp = k3CategoryData(category('komp'), 7, icons.kategoria_ikona)
    expect(komp).toMatchObject({ slug: 'komputery-monitory', group: 7 })
    expect(komp.subcategories).toEqual([
      { name: 'Laptopy', slug: 'laptopy' },
      { name: 'Komputery i All-in-One', slug: 'komputery' },
      { name: 'Monitory', slug: 'monitory' },
    ])
    expect(k3CategoryData(category('kody'), 7, icons.kategoria_ikona)).toMatchObject({
      name: 'Skanery, etykiety i kolektory',
      subcategories: expect.arrayContaining([{ name: 'Skanery kodów', slug: null }]),
    })
    expect(k3CategoryData(category('kasy'), 7, icons.kategoria_ikona).subcategories).toEqual([])
  })

  it('creates a brand record for a page or a card, never for neither (Ingenico)', () => {
    const brand = (slug: string) => dictionaries.marki.find((item) => item.slug === slug)!
    // PRO-KOM has no page, but 13 cards (services): a fresh database needs the record.
    expect(k3BrandNeedsRecord(brand('pro-kom'), cards)).toBe(true)
    expect(k3BrandNeedsRecord(brand('posnet'), cards)).toBe(true)
    expect(k3BrandNeedsRecord(brand('ingenico'), cards)).toBe(false)
    const used = new Set(cards.map((item) => item.marka))
    for (const item of dictionaries.marki.filter((b) => used.has(b.marka))) {
      expect(k3BrandNeedsRecord(item, cards)).toBe(true)
    }
  })

  it('fills the brand page from the dictionary (31 brands have one)', () => {
    const brands = dictionaries.marki.map(k3PartnerData)
    expect(brands.filter((item) => item.brandPage.hasPage)).toHaveLength(31)
    const posnet = k3PartnerData(dictionaries.marki.find((item) => item.slug === 'posnet')!)
    const source = dictionaries.marki.find((item) => item.slug === 'posnet')!
    expect(posnet.brandPage).toMatchObject({
      hasPage: true,
      country: 'Polska',
      shortDescription: source.opis_krotki,
      productLines: source.linie_produktow,
      sources: source.zrodla!.map((item) => item.url),
    })
    expect(posnet.brandPage.facts![0]).toEqual({
      label: source.fakty![0]!.k,
      value: source.fakty![0]!.v,
      sourceUrl: source.fakty![0]!.zrodlo,
    })
    expect(posnet.brandPage.description?.root.children).toHaveLength(source.opis!.length)
    expect(posnet.website).toBe(source.strona_producenta)
  })
})
