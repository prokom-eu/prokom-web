import { describe, expect, it } from 'vitest'

import {
  bundleCard,
  bundleCartItems,
  filterBundleCards,
  bundlesOfIndustry,
  bundlesWithProduct,
  buildBundleView,
  itemNote,
  listBundle,
  readyBundlesInOrder,
  type BundleView,
} from './bundle'

type BundleDoc = Parameters<typeof buildBundleView>[0]

const TENANT = 1
const OTHER = 2
const ref = (slug: string, tenant = TENANT) => ({ slug, tenant })

// Relations populated with slug and tenant only, as `getBundles` reads them.
const doc = {
  tenant: TENANT,
  slug: 'zestaw-kawiarnia-lada',
  name: 'Kawiarnia — stanowisko przy ladzie',
  area: 'gastronomia' as const,
  level: 'Średni',
  series: 'gastronomia-lada',
  audience: 'Kawiarnia z jedną ladą.',
  benefit: 'Paragon drukuje się sam.',
  description: [{ text: 'Akapit 1.' }, { text: ' ' }],
  items: [
    {
      product: ref('d3'),
      role: 'terminal POS',
      quantity: '1',
      mandatory: true,
      suggestedVersion: 'D3 PRO',
      toConfirm: null,
    },
    {
      product: ref('pol'),
      role: 'terminal płatniczy',
      quantity: '2–3',
      mandatory: true,
      suggestedVersion: null,
      toConfirm: 'Integracja z GoPOS — sprawdzić.',
    },
    {
      product: ref('ux'),
      role: 'router',
      quantity: '1',
      mandatory: false,
      suggestedVersion: 'UniFi Express',
      toConfirm: null,
    },
    {
      product: ref('obcy', OTHER),
      role: 'obcy',
      quantity: '1',
      mandatory: true,
      suggestedVersion: null,
      toConfirm: null,
    },
    {
      product: 7,
      role: 'nie wczytany',
      quantity: '1',
      mandatory: true,
      suggestedVersion: null,
      toConfirm: null,
    },
  ],
  swaps: [{ from: ref('d3'), to: ref('vero'), when: 'Gdy wolisz jedno urządzenie.' }],
  services: [ref('szkol'), ref('wdrprog')],
  reasons: ['Bo działa.'],
  faq: [{ question: 'Czy działa bez internetu?', answer: 'Tak.' }],
  related: [ref('dofinansowania')],
  industries: [ref('gastronomia'), ref('handel', OTHER)],
  contentStatus: 'needs-review' as const,
  internalNotes: 'Potwierdzić u Elzab.',
  compatChecks: [
    {
      pair: 'D3 ↔ Zeta',
      source: 'karta: „Zeta”',
      status: 'potwierdzona',
      url: 'https://gopos.pl/x',
    },
    {
      pair: 'GoPOS ↔ PolCard',
      source: null,
      status: 'bez-integracji',
      url: 'https://help.gopos.pl/y',
    },
    {
      pair: 'Kiosk ↔ GoKiosk',
      source: null,
      status: 'do_potwierdzenia',
      url: 'https://gopos.pl/z',
    },
    { pair: 'Bez adresu', source: null, status: 'potwierdzona', url: null },
    { pair: 'Zły adres', source: null, status: 'potwierdzona', url: 'javascript:alert(1)' },
  ],
} as unknown as BundleDoc

const view = buildBundleView(doc, TENANT)!

describe('buildBundleView (K3c)', () => {
  it('copies public fields only', () => {
    const json = JSON.stringify(view)
    expect(json).not.toMatch(
      /Potwierdzić|Integracja z GoPOS|potwierdzona|do_potwierdzenia|karta: |toConfirm|internalNotes/,
    )
    expect(view.areaLabel).toBe('Gastronomia')
    expect(view.description).toEqual(['Akapit 1.'])
    expect(view.indexable).toBe(false)
  })

  it('lists official sources of confirmed pairs only (https) — never „bez integracji”', () => {
    expect(view.sources).toEqual([{ pair: 'D3 ↔ Zeta', url: 'https://gopos.pl/x' }])
  })

  it('keeps relations of its own tenant only', () => {
    expect(view.items.map((item) => item.product)).toEqual(['d3', 'pol', 'ux'])
    expect(view.industries).toEqual(['gastronomia'])
    expect(buildBundleView(doc, OTHER)).toBeNull()
  })
})

describe('listBundle', () => {
  it('drops hidden cards and keeps the bundle while a required item is left', () => {
    const listed = listBundle(view, new Set(['d3', 'ux', 'szkol']))!
    expect(listed.items.map((item) => item.product)).toEqual(['d3', 'ux'])
    expect(listed.swaps).toEqual([])
    expect(listed.services).toEqual(['szkol'])
  })

  it('hides a bundle without a required item', () => {
    expect(listBundle(view, new Set(['ux']))).toBeNull()
  })
})

describe('bundleCartItems („Zapytaj o ten zestaw”)', () => {
  it('adds the required items and the chosen optional ones, with quantity and note', () => {
    expect(bundleCartItems(view, new Set())).toEqual([
      { id: 'd3', q: 1, uwaga: 'Zestaw: Kawiarnia — stanowisko przy ladzie; wersja: D3 PRO' },
      { id: 'pol', q: 1, uwaga: 'Zestaw: Kawiarnia — stanowisko przy ladzie; ilość: 2–3' },
    ])
    expect(bundleCartItems(view, new Set(['ux'])).map((item) => item.id)).toEqual([
      'd3',
      'pol',
      'ux',
    ])
  })

  it('counts 0 and numbers past 999 as 1, with the text in the note', () => {
    for (const quantity of ['0', '1000']) {
      const item = { ...view.items[0]!, quantity, suggestedVersion: null }
      expect(bundleCartItems({ name: 'X', items: [item] }, new Set())[0]).toEqual({
        id: 'd3',
        q: 1,
        uwaga: `Zestaw: X; ilość: ${quantity}`,
      })
    }
  })

  it('takes a whole-number quantity as is', () => {
    const item = { ...view.items[0]!, quantity: '4' }
    expect(bundleCartItems({ name: 'X', items: [item] }, new Set())[0]?.q).toBe(4)
    expect(itemNote({ name: 'X' }, item)).toBe('Zestaw: X; wersja: D3 PRO')
  })
})

describe('bundle lists', () => {
  const ready: BundleView = { ...view, slug: 'gotowy', indexable: true }
  it('links „Gotowe” bundles only: of a product and of an industry (BIZ-3 §9.2)', () => {
    expect(bundlesWithProduct([view, ready], 'ux').map((b) => b.slug)).toEqual(['gotowy'])
    expect(bundlesOfIndustry([view, ready], 'gastronomia').map((b) => b.slug)).toEqual(['gotowy'])
  })
})

describe('bundleCard (/zestawy, BIZ-3 §9.2)', () => {
  const names = ['d3', 'pol', 'ux', 'a', 'b', 'c']
  const products = new Map(names.map((slug) => [slug, { name: `Karta ${slug}`, image: undefined }]))
  const card = bundleCard({ ...view, indexable: true }, products)

  it('shows who it is for, up to 4 items (required first) and what is left', () => {
    expect(card.audience).toBe('Kawiarnia z jedną ladą.')
    expect(card.items).toEqual(['Karta d3', 'Karta pol', 'Karta ux'])
    expect(card.more).toBe(0)
    const extra = ['a', 'b', 'c'].map((product) => ({ ...view.items[0]!, product }))
    const many = bundleCard({ ...view, items: [...view.items, ...extra] }, products)
    expect(many.items).toEqual(['Karta d3', 'Karta pol', 'Karta a', 'Karta b'])
    expect(many.more).toBe(2)
  })

  it('„Dodaj zestaw do zapytania” puts the required items with the bundle note', () => {
    expect(card.cartItems.map((item) => item.id)).toEqual(['d3', 'pol'])
    expect(card.cartItems[0]?.uwaga).toMatch(/^Zestaw: Kawiarnia/)
  })
})

describe('filterBundleCards', () => {
  const base = bundleCard({ ...view, indexable: true }, new Map())
  const cards = [
    {
      ...base,
      slug: 'a',
      area: 'gastronomia' as const,
      level: 'Mały',
      industries: ['gastronomia'],
    },
    { ...base, slug: 'b', area: 'sklep' as const, level: 'Duży', industries: ['handel'] },
    {
      ...base,
      slug: 'c',
      area: 'gastronomia' as const,
      level: 'Duży',
      industries: ['gastronomia', 'noclegi'],
    },
  ]
  const slugs = (filter: Parameters<typeof filterBundleCards>[1]) =>
    filterBundleCards(cards, filter).map((card) => card.slug)

  it('filters by area, industry and size together; null = any', () => {
    expect(slugs({ area: null, industry: null, size: null })).toEqual(['a', 'b', 'c'])
    expect(slugs({ area: 'gastronomia', industry: null, size: null })).toEqual(['a', 'c'])
    expect(slugs({ area: null, industry: 'noclegi', size: null })).toEqual(['c'])
    expect(slugs({ area: 'gastronomia', industry: null, size: 'Duży' })).toEqual(['c'])
  })
})

describe('readyBundlesInOrder (GoPOS „Gotowe zestawy dla gastronomii”, PREMIUM-1011)', () => {
  const ready = (slug: string, indexable = true): BundleView => ({ ...view, slug, indexable })
  const listed = [ready('bistro'), ready('kawiarnia'), ready('foodtruck', false), ready('inny')]

  it('keeps the order of the page, only „Gotowe” bundles of the list', () => {
    expect(
      readyBundlesInOrder(['foodtruck', 'kawiarnia', 'bistro', 'brak'], listed).map((b) => b.slug),
    ).toEqual(['kawiarnia', 'bistro'])
  })

  it('nothing ready — nothing to show', () => {
    expect(readyBundlesInOrder(['foodtruck'], listed)).toEqual([])
  })
})
