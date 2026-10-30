import { describe, expect, it } from 'vitest'

import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import { forbiddenContent } from '../../lib/catalog/contentRules'
import { k31Catalog, type K31Card } from './k31'
import { k31Input } from './k31Data'
import { k4ProductFields, k4Relations, withK4Content, type K4Card } from './k4Catalog'

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
    expect(card.konfigurator?.opcje[1]).toEqual({
      nazwa: 'Moduł',
      wartosci: ['bardzo długa wartość opcji'],
      uwaga: 'Przy zamówieniu.',
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
