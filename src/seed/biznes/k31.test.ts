import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import katalog from '../../../seed/prokombiznes/katalog.json'
import k3Dictionaries from '../../../seed/prokombiznes/k3/slowniki-k3.json'
import k31Media from '../../../seed/prokombiznes/k31/media-k31.json'
import { isYoutubeId } from '../../lib/catalog/videos'
import { k3GalleryFile, k3ImageKeys, k3SubcategoryName, matchCards, type K3Card } from './k3'
import {
  k31Catalog,
  k31Dictionaries,
  k31Gallery,
  k31ProductFields,
  k31Retired,
  splitCards,
  withSupplement,
  type K31Card,
  type K31Split,
  type K31SplitContent,
} from './k31'
import { k31Featured, k31Input, k31Series, k31Videos, loadK31Catalog } from './k31Data'

const { catalog, gallery } = loadK31Catalog()
const bySlug = new Map(catalog.cards.map((card) => [card.slug_seed, card]))
const splitSlugs = new Set(k31Input.splits.flatMap((split) => split.nowe.map((item) => item.slug)))

const card = (over: Partial<K31Card> = {}): K31Card => ({
  slug_seed: 'karta',
  kategoria: 'komp',
  nazwa: 'Karta',
  korzysc: 'Korzyść',
  opis: ['Opis'],
  cechy: [],
  parametry: [
    { k: 'Ekran', v: '14"' },
    { k: 'Waga', v: '1 kg' },
  ],
  dobierz: [],
  branze: [],
  zrodla: [{ url: 'https://dell.com/a', typ: 'producent' }],
  status: 'gotowe',
  uwagi: '',
  faq: [{ q: 'Pytanie?', a: 'Tak.' }],
  ...over,
})

describe('K3.1 catalog (PRZEKAZANIE-K31 §4 „K31a”)', () => {
  it('has 269 cards before the split and 275 after (6 cards → 12)', () => {
    expect(k31Input.k3Cards.length + k31Input.newCards.length).toBe(269)
    expect(k31Input.newCards).toHaveLength(26)
    expect(catalog.cards).toHaveLength(275)
    expect(new Set(catalog.cards.map((item) => item.slug_seed)).size).toBe(275)
    expect(catalog.splits.map(({ source }) => source.slug_seed)).toEqual(
      k31Input.splits.map((split) => split.z),
    )
  })

  it('makes 11 new records „do sprawdzenia” — Avtek TS 9 keeps its record', () => {
    const parts = catalog.cards.filter((item) => item.zrodlo_podzialu)
    expect(parts).toHaveLength(12)
    expect(parts.every((item) => item.status === 'do-sprawdzenia')).toBe(true)
    const avtek = bySlug.get('avtek-ts-9-mate-g')!
    const source = k31Input.k3Cards.find((item) => item.slug_seed === 'avtek-ts-9-mate-g')!
    expect(avtek.legacyIds).toEqual(source.legacyIds)
    expect(parts.filter((item) => item.slug_seed !== 'avtek-ts-9-mate-g')).toHaveLength(11)
  })

  it('puts every Lenovo and Dell card in exactly one series (44 + 34 before the split)', () => {
    const before = [...k31Input.k3Cards, ...k31Input.newCards]
    const count = (brand: string) => before.filter((item) => item.marka === brand).length
    expect([count('Lenovo'), count('Dell')]).toEqual([44, 34])
    const branded = before.filter((item) => item.marka === 'Lenovo' || item.marka === 'Dell')
    expect(Object.keys(k31Series).sort()).toEqual(branded.map((item) => item.slug_seed).sort())
    for (const item of catalog.cards.filter((c) => c.marka === 'Lenovo' || c.marka === 'Dell')) {
      expect(
        k31ProductFields(item, k31Series, k31Videos, undefined).series,
        item.slug_seed,
      ).toBeTruthy()
    }
  })

  it('gives films to 122 package cards, all with a valid YouTube id', () => {
    expect(Object.keys(k31Videos)).toHaveLength(122)
    const before = new Set([...k31Input.k3Cards, ...k31Input.newCards].map((c) => c.slug_seed))
    expect(Object.keys(k31Videos).every((slug) => before.has(slug))).toBe(true)
    const ids = Object.values(k31Videos).flatMap((list) => list.map((item) => item.youtube_id))
    expect(ids.every(isYoutubeId)).toBe(true)
  })

  it('leaves no published card with fewer than 3 FAQ (§13.6)', () => {
    const short = catalog.cards
      .filter((item) => item.status !== 'do-akceptacji-szefa' && (item.faq ?? []).length < 3)
      .map((item) => item.slug_seed)
    expect(short).toEqual([])
  })

  it('features the 8 homepage cards of strona-glowna-k31.json (§13.3)', () => {
    expect(k31Featured).toHaveLength(8)
    expect(k31Featured.every((slug) => bySlug.has(slug))).toBe(true)
  })

  it('knows every subcategory of the K3.1 cards', () => {
    const dictionaries = k31Dictionaries(k3Dictionaries, k31Featured)
    for (const item of catalog.cards) {
      expect(() => k3SubcategoryName(item, dictionaries), item.slug_seed).not.toThrow()
    }
  })

  it('fits the panel limits (benefit ≤ 160 characters, ≤ 3 features)', () => {
    for (const item of catalog.cards) {
      expect(item.korzysc.length, item.slug_seed).toBeLessThanOrEqual(160)
      expect(item.cechy.length, item.slug_seed).toBeLessThanOrEqual(3)
    }
  })
})

describe('split cards — content only from the source card (§13.5)', () => {
  /** Numbers of a text: "1,19 kg", "2.5K", "P713260" → "1,19", "2.5", "713260". */
  const numbers = (text: string) => text.match(/\d+(?:[.,]\d+)?/g) ?? []
  const publicText = (value: unknown): string => JSON.stringify(value)

  it('uses no number the source card and its supplement do not have', () => {
    for (const content of k31Input.splitContents) {
      const source = [...k31Input.k3Cards, ...k31Input.newCards].find(
        (item) => item.slug_seed === content.z,
      )!
      const known = new Set(numbers(publicText([source, k31Input.supplements[content.z] ?? null])))
      const {
        slug: _slug,
        z: _z,
        uwagi: _uwagi,
        zrodla: _zrodla,
        zdjecia: _zdjecia,
        ...shown
      } = content
      const unknown = numbers(publicText(shown)).filter((value) => !known.has(value))
      expect(unknown, content.slug).toEqual([])
    }
  })

  it('has content for every card of karty-podzial-k31.json and no other', () => {
    expect(k31Input.splitContents.map((item) => item.slug).sort()).toEqual([...splitSlugs].sort())
  })

  it('takes category, brand and industries from the source; fails without content', () => {
    const source = card({
      slug_seed: 'zrodlo',
      marka: 'Dell',
      branze: ['handel'],
      seria: 'Dell Pro',
    })
    const split: K31Split = {
      z: 'zrodlo',
      redirect_301: 'a',
      nowe: [{ slug: 'a', nazwa: 'A', warianty: [], klucz_modelu: 'A' }],
    }
    const content: K31SplitContent = {
      slug: 'a',
      z: 'zrodlo',
      nazwa: 'A',
      korzysc: 'K',
      cechy: [],
      opis: ['O'],
      parametry: [],
      konfigurator: { opcje: [] },
      faq: [],
      zdjecia: [],
      filmy: [],
      uwagi: 'Uwaga.',
      zrodla: ['https://dell.com/a'],
    }
    const [part] = splitCards(source, split, [content])
    expect(part).toMatchObject({
      slug_seed: 'a',
      legacyIds: null,
      marka: 'Dell',
      branze: ['handel'],
      seria: 'Dell Pro',
      status: 'do-sprawdzenia',
      zrodlo_podzialu: 'zrodlo',
      zrodla: [{ url: 'https://dell.com/a', typ: 'producent' }],
    })
    expect(() => splitCards(source, split, [])).toThrow(/no content/)
    expect(() =>
      splitCards(source, split, [{ ...content, zrodla: ['https://sklep.pl/a'] }]),
    ).toThrow(/not on "zrodlo"/)
  })

  it('never pairs a new split card with the katalog v2 record of its source', () => {
    // A pair would give the new card the source's keys: it would take over the record that
    // `k31Retired` then hides.
    const matches = matchCards(catalog.cards, katalog.produkty)
    const taken = catalog.cards
      .filter((item) => item.zrodlo_podzialu && item.slug_seed !== item.zrodlo_podzialu)
      .filter((item) => matches.has(item.slug_seed))
      .map((item) => item.slug_seed)
    expect(taken).toEqual([])
  })

  it('hides 5 source records with a 301 to the first new card; Avtek stays', () => {
    const retired = k31Retired(catalog, katalog.produkty)
    expect(retired).toHaveLength(5)
    expect(retired.map((item) => item.to)).toEqual(
      k31Input.splits
        .filter((split) => split.z !== 'avtek-ts-9-mate-g')
        .map((split) => `/produkt/${split.redirect_301}`),
    )
    expect(retired.every((item) => item.unpublish && item.reason === 'podzielona')).toBe(true)
    expect(retired.find((item) => item.from === '/produkt/dell-pro-7')?.legacyIds).toContain(
      'dell-pro-7',
    )
  })
})

describe('content supplements (§13.6)', () => {
  it('adds FAQ once, replaces the description, inserts a parameter before „przed”', () => {
    const result = withSupplement(card(), {
      opis: ['Nowy opis'],
      faq: [
        { q: 'Pytanie?', a: 'Inna odpowiedź' },
        { q: 'Nowe?', a: 'Tak.' },
      ],
      parametry_dodaj: [
        { k: 'Procesor', v: 'Intel', przed: 'Waga' },
        { k: 'System', v: 'Windows' },
      ],
      zrodla_dodaj: [
        { url: 'https://dell.com/a', typ: 'producent' },
        { url: 'https://dell.com/b.pdf', typ: 'specyfikacja' },
      ],
    })
    expect(result.opis).toEqual(['Nowy opis'])
    expect(result.faq).toEqual([
      { q: 'Pytanie?', a: 'Tak.' },
      { q: 'Nowe?', a: 'Tak.' },
    ])
    expect(result.parametry.map((item) => item.k)).toEqual(['Ekran', 'Procesor', 'Waga', 'System'])
    expect(result.zrodla.map((item) => item.url)).toEqual([
      'https://dell.com/a',
      'https://dell.com/b.pdf',
    ])
  })

  it('keeps the description without a new one and refuses a parameter the card has', () => {
    expect(withSupplement(card(), { faq: [] }).opis).toEqual(['Opis'])
    expect(() => withSupplement(card(), { parametry_dodaj: [{ k: 'Waga', v: '2 kg' }] })).toThrow(
      /already has/,
    )
  })

  it('applies all 135 supplements of the package', () => {
    expect(Object.keys(k31Input.supplements)).toHaveLength(135)
    const thinkStation = bySlug.get('lenovo-thinkstation-p4')!
    expect(thinkStation.parametry.some((item) => item.k === 'System')).toBe(true)
  })

  it('refuses a supplement for an unknown card and a card in K3 and K3.1', () => {
    expect(() => k31Catalog({ ...k31Input, supplements: { brak: {} } })).toThrow(/unknown card/)
    expect(() =>
      k31Catalog({ ...k31Input, newCards: [...k31Input.newCards, k31Input.k3Cards[0] as K3Card] }),
    ).toThrow(/in K3 and K3.1/)
  })
})

describe('K3.1 fields of a product', () => {
  const films = {
    karta: [
      {
        youtube_id: 'UFXLZ4kSjD0',
        tytul: 'Film',
        kanal: 'Dell',
        jezyk: 'pl',
        dopasowanie: 'seria',
      },
    ],
  }

  it('maps a film and keeps one the weekly check switched off (ADR-016)', () => {
    expect(k31ProductFields(card(), { karta: 'Dell Pro' }, films, undefined)).toEqual({
      series: 'Dell Pro',
      videos: [
        {
          youtubeId: 'UFXLZ4kSjD0',
          title: 'Film',
          channel: 'Dell',
          lang: 'pl',
          match: 'series',
          active: true,
        },
      ],
    })
    const stored = {
      videos: [
        { youtubeId: 'UFXLZ4kSjD0', title: 'Film', match: 'series' as const, active: false },
      ],
    }
    expect(k31ProductFields(card(), {}, films, stored).videos[0]?.active).toBe(false)
  })

  it('gives a split card the series of its source and only the films it names', () => {
    const modelFilm = { ...films.karta[0]!, dopasowanie: 'model' }
    const source = { karta: [modelFilm, { ...modelFilm, youtube_id: 'abcdefghijk' }] }
    const part = card({ slug_seed: 'nowa', zrodlo_podzialu: 'karta', filmy: ['UFXLZ4kSjD0'] })
    const fields = k31ProductFields(part, { karta: 'Dell Pro' }, source, undefined)
    expect(fields.series).toBe('Dell Pro')
    // A film of one model of the multi-model card shows the series on the split card.
    expect(fields.videos).toEqual([
      expect.objectContaining({ youtubeId: 'UFXLZ4kSjD0', match: 'series' }),
    ])
    expect(k31ProductFields({ ...part, filmy: [] }, {}, source, undefined).videos).toEqual([])
    expect(() =>
      k31ProductFields({ ...part, filmy: ['zzzzzzzzzzz'] }, {}, source, undefined),
    ).toThrow(/not on "karta"/)
  })

  it('shows no film of the other model on the split cards of the package', () => {
    const titles = (slug: string) =>
      k31ProductFields(bySlug.get(slug)!, k31Series, k31Videos, undefined).videos.map(
        (v) => v.title,
      )
    expect(titles('lenovo-yoga-pro-7-15').join()).not.toMatch(/Pro 9/)
    expect(titles('lenovo-yoga-pro-9-16').join()).not.toMatch(/Pro 7/)
    expect(titles('lenovo-thinkstation-p3-tower-gen-2')).toEqual([])
    expect(titles('dell-ultrasharp-32-qd-oled-u3226q')).toEqual([])
    const parts = catalog.cards.filter((item) => item.zrodlo_podzialu)
    for (const part of parts) {
      const videos = k31ProductFields(part, k31Series, k31Videos, undefined).videos
      expect(
        videos.every((v) => v.match !== 'model'),
        part.slug_seed,
      ).toBe(true)
    }
  })
})

describe('K3.1 dictionaries and galleries', () => {
  it('adds the K3.1 subcategories once and takes the homepage list', () => {
    const once = k31Dictionaries(k3Dictionaries, ['ergo'])
    const twice = k31Dictionaries(once, ['ergo'])
    const komp = twice.kategorie.find((item) => item.slug === 'komp')!
    expect(komp.podkategorie?.map((item) => item.slug)).toEqual([
      'laptopy',
      'komputery',
      'monitory',
      'stacje-robocze',
      'stacje-dokujace',
    ])
    expect(twice.kolejnosc_wyroznionych).toEqual(['ergo'])
  })

  it('uploads K3.1 photos from their folder under a `k31-` name', () => {
    const keys = k3ImageKeys({ slug_seed: 'dell-pro-14-premium' }, gallery, undefined, [], null)
    expect(keys.length).toBeGreaterThan(0)
    const file = k3GalleryFile(keys[0]!)!
    expect(file.uploadName).toMatch(/^k31-dell-pro-14-premium-/)
    expect(fs.existsSync(path.resolve(file.filePath))).toBe(true)
  })

  it('has every photo file of the K3.1 package and 24 cards with a gallery', () => {
    const entries = Object.entries(k31Media.zdjecia)
    expect(entries).toHaveLength(24)
    for (const [slug, entry] of entries) {
      for (const file of entry.pliki) {
        expect(fs.existsSync(path.resolve(k3GalleryFile(`k31:${slug}/${file}`)!.filePath))).toBe(
          true,
        )
      }
    }
  })

  it('gives a split card only its photos from the source folder; none = placeholder', () => {
    const yoga = k3ImageKeys({ slug_seed: 'lenovo-yoga-pro-9-16' }, gallery, undefined, [], null)
    expect(yoga).toEqual([
      'k3:lenovo-yoga-pro/lenovo-yoga-pro-06.webp',
      'k3:lenovo-yoga-pro/lenovo-yoga-pro-07.webp',
      'k3:lenovo-yoga-pro/lenovo-yoga-pro-08.webp',
    ])
    expect(gallery['lenovo-yoga-pro']).toBeUndefined()
    expect(gallery['lenovo-thinkstation-p3-tower-gen-2']).toBeUndefined()
    expect(gallery['lenovo-thinkstation-p4']?.katalog).toBe('lenovo-thinkstation-p3-tower-gen-2-p4')
    expect(() =>
      k31Gallery({}, {}, catalog, [{ ...k31Input.splitContents[0]!, zdjecia: ['brak.webp'] }]),
    ).toThrow(/has none|not in/)
  })
})
