import { describe, expect, it } from 'vitest'

import {
  bundleCartItems,
  bundlesOfIndustry,
  bundlesWithProduct,
  buildBundleView,
  itemNote,
  listBundle,
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
  compatChecks: [{ pair: 'D3 ↔ Zeta', source: null, status: 'potwierdzona' }],
} as unknown as BundleDoc

const view = buildBundleView(doc, TENANT)!

describe('buildBundleView (K3c)', () => {
  it('copies public fields only', () => {
    const json = JSON.stringify(view)
    expect(json).not.toMatch(/Potwierdzić|Integracja z GoPOS|potwierdzona|toConfirm|internalNotes/)
    expect(view.areaLabel).toBe('Gastronomia')
    expect(view.description).toEqual(['Akapit 1.'])
    expect(view.indexable).toBe(false)
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
  it('finds bundles of a product and „Gotowe” bundles of an industry', () => {
    expect(bundlesWithProduct([view, ready], 'ux').map((b) => b.slug)).toEqual([
      'zestaw-kawiarnia-lada',
      'gotowy',
    ])
    expect(bundlesOfIndustry([view, ready], 'gastronomia').map((b) => b.slug)).toEqual(['gotowy'])
  })
})
