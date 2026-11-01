import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import k4Brands from '../../../seed/prokombiznes/k4/marki-k4.json'
import k4SlugMap from '../../../seed/prokombiznes/k4/mapa-slugow-k4.json'
import { forbiddenContent } from '../../lib/catalog/contentRules'
import { k31Catalog, type K31Card } from './k31'
import { k31Input } from './k31Data'
import {
  k4Aliases,
  k4BrandRecord,
  k4Colors,
  k4ImageKeys,
  k4NewCards,
  k4PhotoFile,
  k4PhotoMediaData,
  k4ProductFields,
  k4Relations,
  k4SlugRedirects,
  withK4Content,
  type K4Card,
} from './k4Catalog'

const repoCard: K31Card = {
  slug_seed: 'posnet-ergo',
  legacyIds: ['ergo'],
  nazwa_poprzednia: 'Ergo',
  kategoria: 'kasy',
  nazwa: 'Posnet Ergo (K3)',
  korzysc: 'stara korzyść',
  opis: ['stary opis'],
  cechy: ['a', 'b', 'c'],
  parametry: [{ k: 'Typ', v: 'stary' }],
  konfigurator: null,
  faq: [],
  pakiety: [{ nazwa: 'Pakiet' }],
  dobierz: ['szuflada kasowa'],
  branze: ['handel'],
  zrodla: [{ url: 'https://www.posnet.com.pl/ergo', typ: 'producent' }],
  status: 'do-sprawdzenia',
  uwagi: 'notatka wewnętrzna',
  marka: 'Posnet',
  seria: null,
}

const k4Card: K4Card = {
  slug_seed: 'posnet-ergo',
  zmiana_k4: 'zmieniona',
  status: 'gotowe',
  dzial: 'kasy',
  kategoria: 'kasy',
  marka: 'Posnet',
  rodzaj: 'Urządzenia',
  nazwa: 'Posnet Ergo Online',
  krotka: 'Posnet Ergo',
  podtytul: 'Kasa mała do sklepu',
  korzysc: 'nowa korzyść',
  opis: ['nowy opis'],
  cechy: ['x', 'y', 'z'],
  parametry: [{ k: 'Typ', v: 'nowy' }],
  faq: [{ q: 'Pytanie?', a: 'Odpowiedź.' }],
  konfigurator: {
    opis: 'Wybierasz łączność.',
    opcje: [
      { nazwa: 'Łączność', wartosci: ['BT', 'Wi-Fi'], dl: false, pom: 'Wi-Fi do sieci w sklepie.' },
      {
        nazwa: 'Moduł',
        wartosci: ['bardzo długa wartość opcji'],
        uwaga: 'Przy zamówieniu.',
        dl: true,
        pom: '',
      },
    ],
    std: [{ k: 'Kolor obudowy', v: 'grafitowy' }],
    popularne: [{ nazwa: 'Sklep', konfiguracja: 'Ergo Wi-Fi' }],
  },
  polecane: [
    { slug: 'szuf', etykieta: 'Szuflada' },
    { slug: 'nie-ma-takiej', etykieta: 'Brak' },
  ],
  podobne: ['posnet-neo', 'posnet-ergo'],
  branze: ['Handel', 'Gastronomia'],
  zrodla: [
    {
      url: 'https://www.posnet.com.pl/ergo',
      etykieta: 'Strona producenta — Posnet',
      host: 'posnet.com.pl',
    },
  ],
  wyrozniki: ['x', 'y', 'z'],
  w_skrocie_wzorzec: [],
  nowosc: true,
  seria: null,
}

describe('withK4Content (K4-FINAL §4.3 pkt 1)', () => {
  it('takes the public content of the K4 card', () => {
    const card = withK4Content(repoCard, k4Card)
    expect(card).toMatchObject({
      nazwa: 'Posnet Ergo Online',
      podtytul: 'Kasa mała do sklepu',
      korzysc: 'nowa korzyść',
      opis: ['nowy opis'],
      cechy: ['x', 'y', 'z'],
      parametry: [{ k: 'Typ', v: 'nowy' }],
      faq: [{ q: 'Pytanie?', a: 'Odpowiedź.' }],
      branze: ['handel', 'gastronomia'],
      status: 'gotowe',
    })
  })

  it('keeps what only the repo has: keys, packages, phrases, typed sources, notes', () => {
    const card = withK4Content(repoCard, k4Card)
    expect(card).toMatchObject({
      slug_seed: 'posnet-ergo',
      legacyIds: ['ergo'],
      nazwa_poprzednia: 'Ergo',
      pakiety: [{ nazwa: 'Pakiet' }],
      dobierz: ['szuflada kasowa'],
      zrodla: repoCard.zrodla,
      uwagi: 'notatka wewnętrzna',
    })
  })

  it('turns industry names into the repo slugs and rejects an unknown one', () => {
    expect(() => withK4Content(repoCard, { ...k4Card, branze: ['Rolnictwo'] })).toThrow(/Rolnictwo/)
  })

  it('leaves a card the K4 package does not have as it is', () => {
    expect(withK4Content(repoCard, undefined)).toBe(repoCard)
  })
})

describe('k4ProductFields (K4-FINAL §4.2)', () => {
  it('maps the K4 fields of a product', () => {
    expect(k4ProductFields(k4Card, 'Posnet Ergo Online')).toEqual({
      shortName: 'Posnet Ergo',
      kind: 'device',
      isNew: true,
      configurator: {
        description: 'Wybierasz łączność.',
        options: [
          {
            name: 'Łączność',
            values: ['BT', 'Wi-Fi'],
            note: null,
            help: 'Wi-Fi do sieci w sklepie.',
            longValues: false,
          },
          {
            name: 'Moduł',
            values: ['bardzo długa wartość opcji'],
            note: 'Przy zamówieniu.',
            help: null,
            longValues: true,
          },
        ],
        fixed: [{ label: 'Kolor obudowy', value: 'grafitowy' }],
        popular: [{ name: 'Sklep', configuration: 'Ergo Wi-Fi' }],
      },
      sourceLinks: [{ label: 'Strona producenta — Posnet', url: 'https://www.posnet.com.pl/ergo' }],
    })
  })

  it('keeps only the address of a source link with a note after it', () => {
    const zrodla = [
      {
        url: 'https://www.kobra.com/contents/poland/datasheet-pl.zip (kobra-plus1-cc4-karta.pdf)',
        etykieta: 'Karta katalogowa (PDF) — Kobra',
        host: 'kobra.com',
      },
    ]
    expect(k4ProductFields({ ...k4Card, zrodla }, '').sourceLinks).toEqual([
      {
        label: 'Karta katalogowa (PDF) — Kobra',
        url: 'https://www.kobra.com/contents/poland/datasheet-pl.zip',
      },
    ])
  })

  it('rejects a source without a link', () => {
    const zrodla = [{ url: '  ', etykieta: 'Strona producenta', host: '' }]
    expect(() => k4ProductFields({ ...k4Card, zrodla }, '')).toThrow(/Strona producenta/)
  })

  it('leaves the short name empty when it is the name itself', () => {
    expect(k4ProductFields(k4Card, 'Posnet Ergo').shortName).toBeNull()
  })

  it('maps every kind and rejects an unknown one', () => {
    expect(k4ProductFields({ ...k4Card, rodzaj: 'Oprogramowanie' }, '').kind).toBe('software')
    expect(k4ProductFields({ ...k4Card, rodzaj: 'Usługi' }, '').kind).toBe('service')
    expect(() => k4ProductFields({ ...k4Card, rodzaj: 'Inne' }, '')).toThrow(/Inne/)
  })

  it('gives an empty configurator to a card without one', () => {
    expect(k4ProductFields({ ...k4Card, konfigurator: undefined }, '').configurator).toEqual({
      description: null,
      options: [],
      fixed: [],
      popular: [],
    })
  })
})

describe('k4Relations (polecane, podobne)', () => {
  const ids = new Map([
    ['posnet-ergo', 1],
    ['szuf', 2],
    ['posnet-neo', 3],
  ])

  it('turns slugs into records and reports the unknown ones', () => {
    expect(k4Relations(k4Card, (slug) => ids.get(slug))).toEqual({
      recommended: [{ product: 2, label: 'Szuflada' }],
      alternatives: [3],
      unknown: ['nie-ma-takiej'],
    })
  })
})

describe('K4 package (katalog-k4.json)', () => {
  const cards: K4Card[] = k4Catalog.produkty

  it('has 422 cards: 162 new, 129 changed, 131 typography', () => {
    const count = (kind: string) => cards.filter((card) => card.zmiana_k4 === kind).length
    expect(cards).toHaveLength(422)
    expect([count('nowa'), count('zmieniona'), count('drobne')]).toEqual([162, 129, 131])
  })

  it('points polecane and podobne only at cards of the package or of the K3.1 split', () => {
    const known = new Set([
      ...cards.map((card) => card.slug_seed),
      ...k31Catalog(k31Input).cards.map((card) => card.slug_seed),
    ])
    const unknown = cards.flatMap((card) =>
      [...(card.polecane ?? []).map((item) => item.slug), ...(card.podobne ?? [])]
        .filter((slug) => !known.has(slug))
        .map((slug) => `${card.slug_seed} → ${slug}`),
    )
    expect(unknown).toEqual([])
  })

  it('has no price or banned brand in the public fields (K4-FINAL §1)', () => {
    const internal = new Set([
      'slug_seed',
      'status',
      'zmiana_k4',
      'zrodla',
      'zdjecia',
      'kolory',
      'wideo',
    ])
    const texts = (value: unknown, at: string): [string, string][] => {
      if (typeof value === 'string') return [[at, value]]
      if (Array.isArray(value))
        return value.flatMap((item, index) => texts(item, `${at}[${index}]`))
      if (value && typeof value === 'object') {
        return Object.entries(value).flatMap(([key, item]) => texts(item, `${at}.${key}`))
      }
      return []
    }
    const items = cards.flatMap((card) =>
      Object.entries(card)
        .filter(([key]) => !internal.has(key))
        .flatMap(([key, value]) => texts(value, `${card.slug_seed}.${key}`)),
    )
    const broken = items.flatMap(([at, text]) =>
      forbiddenContent(text).map((rule) => `${at}: ${rule} — „${text.slice(0, 80)}”`),
    )
    expect(items.length).toBeGreaterThan(10000)
    expect(broken).toEqual([])
  })
})

describe('k4NewCards (K4-FINAL §4.3, 162 new cards)', () => {
  const cards: K4Card[] = k4Catalog.produkty
  const repo = k31Catalog(k31Input).cards

  it('builds the cards the repo does not have, in the K3 shape', () => {
    const fresh = k4NewCards(cards, repo)
    expect(fresh).toHaveLength(162)
    expect(new Set(fresh.map((card) => card.slug_seed)).size).toBe(162)
    const macbook = fresh.find((card) => card.slug_seed === 'apple-macbook-air-m5')
    expect(macbook).toMatchObject({
      marka: 'Apple',
      kategoria: 'laptopy',
      dobierz: [],
      zrodla: [],
      uwagi: '',
      seria: expect.any(String),
    })
    expect(macbook?.branze.every((slug) => /^[a-z-]+$/.test(slug))).toBe(true)
  })

  it('takes only the cards marked new', () => {
    const fresh = new Set(k4NewCards(cards, repo).map((card) => card.slug_seed))
    expect(
      cards.filter((card) => fresh.has(card.slug_seed)).every((card) => card.zmiana_k4 === 'nowa'),
    ).toBe(true)
  })
})

describe('K4 photos and colors', () => {
  const macbook = k4Catalog.produkty.find(
    (card) => card.slug_seed === 'apple-macbook-air-m5',
  ) as K4Card

  it('keys the gallery and finds every file of the package', () => {
    const keys = k4Catalog.produkty.flatMap((card) => k4ImageKeys(card as K4Card))
    expect(keys.length).toBeGreaterThan(150)
    for (const key of keys) {
      const file = k4PhotoFile(key)
      expect(file && fs.existsSync(path.resolve(file.filePath)), key).toBe(true)
    }
    expect(k4PhotoFile('k3:posnet/x.webp')).toBeNull()
    expect(k4PhotoFile('k4:produkty/x.webp')?.uploadName).toBe('k4-x.webp')
  })

  it('describes a gallery photo and a color photo', () => {
    const [first] = k4ImageKeys(macbook)
    expect(k4PhotoMediaData(macbook, first!).alt).toBe(`${macbook.nazwa} — zdjęcie 1`)
    const color = 'k4:kolory/apple-macbook-air-m5-srebrny.webp'
    expect(k4PhotoMediaData(macbook, color).alt).toBe(`${macbook.nazwa} — kolor srebrny`)
    expect(() => k4PhotoMediaData(macbook, 'k4:produkty/obce.webp')).toThrow(/obce/)
  })

  it('maps the colors with their photo records', () => {
    const ids = new Map([['k4:kolory/apple-macbook-air-m5-srebrny.webp', 7]])
    const all = new Map(
      (macbook.kolory ?? []).map((item, index) => [
        `k4:kolory/${path.basename(item.plik)}`,
        index + 1,
      ]),
    )
    expect(k4Colors(macbook, (key) => all.get(key))[1]).toEqual({
      name: 'srebrny',
      hex: '#E3E4E6',
      image: 2,
    })
    expect(() => k4Colors(macbook, (key) => ids.get(key))).toThrow(/błękitny/)
  })
})

describe('k4BrandRecord (brands of new cards without a record)', () => {
  it('takes the address from the logo of marki-k4.json', () => {
    expect(k4BrandRecord('Apple', k4Brands.marki)).toEqual({ name: 'Apple', slug: 'apple' })
    expect(k4BrandRecord('COMEX', k4Brands.marki)).toEqual({ name: 'COMEX', slug: 'comex' })
    expect(() => k4BrandRecord('Nieznana', k4Brands.marki)).toThrow(/Nieznana/)
  })
})

describe('mapa-slugow-k4.json', () => {
  const slugs = new Map([
    ['przeglad', 'przeglad-it-stary'],
    ['przeglad-it', 'przeglad-it'],
    ['kopie', 'kopie-stare'],
    ['kopie-zapasowe', 'kopie-zapasowe'],
    ['opieka', 'opieka-it-stara'],
    ['ux', 'ubiquiti-unifi-express'],
    ['ubiquiti-unifi-express-7', 'ubiquiti-unifi-express-7'],
  ])

  it('sends a hidden card to its new card or page (301)', () => {
    expect(k4SlugRedirects(k4SlugMap, (id) => slugs.get(id))).toEqual([
      { from: '/produkt/kopie-stare', to: '/produkt/kopie-zapasowe' },
      { from: '/produkt/opieka-it-stara', to: '/opieka-it' },
      { from: '/produkt/przeglad-it-stary', to: '/produkt/przeglad-it' },
      { from: '/produkt/ubiquiti-unifi-express', to: '/produkt/ubiquiti-unifi-express-7' },
    ])
    expect(() => k4SlugRedirects(k4SlugMap, () => undefined)).toThrow(/kopie/)
  })

  it('lets page seeds name the new card instead of a hidden one with a card', () => {
    expect(k4Aliases(k4SlugMap)).toEqual({
      kopie: 'kopie-zapasowe',
      przeglad: 'przeglad-it',
      ux: 'ubiquiti-unifi-express-7',
    })
  })

  it('agrees with itself and with the K3.1 split', () => {
    for (const [old, target] of Object.entries(k4SlugMap.zmiana_slugu)) {
      expect(k4SlugMap.ukryj[old as keyof typeof k4SlugMap.ukryj]).toBe(target)
    }
    const splits = new Map(k31Input.splits.map((split) => [split.z, split.redirect_301]))
    for (const [old, item] of Object.entries(k4SlugMap.niepodzielone)) {
      expect(splits.get(old), old).toBe(item['301'])
    }
  })
})

describe('HP only with original supplies (K4-FINAL §1, audit 01.11)', () => {
  const cards = (k4Catalog as unknown as { produkty: K4Card[] }).produkty
  const bySlug = new Map(cards.map((card) => [card.slug_seed, card]))
  const hp = cards.filter((card) => card.slug_seed.startsWith('hp-'))

  it.each(hp.map((card) => card.slug_seed))(
    '%s names no „zamiennik”, nor do its suggestions',
    (slug) => {
      const card = bySlug.get(slug)!
      const suggested = (card.polecane ?? []).map((item) => [
        item.etykieta,
        bySlug.get(item.slug)?.nazwa,
      ])
      expect(JSON.stringify([card, suggested])).not.toMatch(/zamiennik/i)
    },
  )
})
