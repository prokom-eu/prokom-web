import { describe, expect, it } from 'vitest'

import {
  formatTextReport,
  homeLayoutWithHero,
  layoutWithBlockTexts,
  overlay,
  planTextChange,
  TEXT_FIELDS,
} from './texts'

const stored = {
  id: 7,
  key: 'kam',
  name: 'Monitoring',
  color: '#123456', // not a text field: never touched
  hero: { h1a: 'Stary nagłówek', lead: 'Lead' },
  faq: [
    { id: 'a', question: 'P1', answer: 'O1' },
    { id: 'b', question: 'P2', answer: 'Stara odpowiedź' },
  ],
  tile: { description: 'Opis', priceFrom: 'od 1999 zł' },
  packages: [{ id: 'p', name: 'Dom', description: 'Stary', price: 'od 2500 zł' }],
}

describe('planTextChange (runda v6 D4)', () => {
  it('gives nothing when the listed fields already match', () => {
    const desired = { name: 'Monitoring', hero: { h1a: 'Stary nagłówek', lead: 'Lead' } }
    expect(planTextChange('inst-services', 'kam', stored, desired)).toBeNull()
  })

  it('sends only the listed fields that differ', () => {
    const desired = {
      name: 'Monitoring',
      color: '#ffffff',
      hero: { h1a: 'Nowy nagłówek', lead: 'Lead' },
      faq: [
        { question: 'P1', answer: 'O1' },
        { question: 'P2', answer: 'Nowa odpowiedź' },
      ],
    }
    const change = planTextChange('inst-services', 'kam', stored, desired)
    expect(change?.id).toBe(7)
    expect(Object.keys(change?.data ?? {})).toEqual(['hero', 'faq'])
    expect(change?.changes).toEqual([
      { path: 'hero.h1a', before: 'Stary nagłówek', after: 'Nowy nagłówek' },
      { path: 'faq[1].answer', before: 'Stara odpowiedź', after: 'Nowa odpowiedź' },
    ])
  })

  it('keeps the prices of the panel (tile and packages)', () => {
    const desired = {
      tile: { description: 'Nowy opis', priceFrom: 'Cena po wizji lokalnej' },
      packages: [{ name: 'Dom', description: 'Nowy', price: 'Cena po wizji lokalnej' }],
    }
    const change = planTextChange('inst-services', 'kam', stored, desired)
    expect(change?.data.tile).toEqual({ description: 'Nowy opis', priceFrom: 'od 1999 zł' })
    expect(change?.data.packages).toEqual([
      { name: 'Dom', description: 'Nowy', price: 'od 2500 zł' },
    ])
    expect(change?.changes.map((c) => c.path)).toEqual([
      'tile.description',
      'packages[0].description',
    ])
  })

  it('a package keeps the price of the stored package with its name, wherever it moved', () => {
    const two = {
      ...stored,
      packages: [
        { id: 'p', name: 'Dom', description: 'A', price: 'od 2500 zł' },
        { id: 'q', name: 'Firma', description: 'B', price: 'od 9000 zł' },
      ],
    }
    const desired = {
      packages: [
        { name: 'Firma', description: 'B', price: 'Cena po wizji lokalnej' },
        { name: 'Dom', description: 'A', price: 'Cena po wizji lokalnej' },
      ],
    }
    const change = planTextChange('inst-services', 'kam', two, desired)
    expect(change?.data.packages).toEqual([
      { name: 'Firma', description: 'B', price: 'od 9000 zł' },
      { name: 'Dom', description: 'A', price: 'od 2500 zł' },
    ])
  })

  it('a renamed package keeps the price at its place and the report says so', () => {
    const desired = { packages: [{ name: 'Dom i domek', description: 'Stary', price: 'x' }] }
    const change = planTextChange('inst-services', 'kam', stored, desired)
    expect(change?.data.packages).toEqual([
      { name: 'Dom i domek', description: 'Stary', price: 'od 2500 zł' },
    ])
    expect(change?.changes).toContainEqual({
      path: 'packages[0].price',
      before: 'od 2500 zł',
      after: 'zachowana z „Dom”',
    })
  })

  it('reports a shorter or longer list as a change of its length', () => {
    const desired = { faq: [{ question: 'P1', answer: 'O1' }] }
    const change = planTextChange('inst-services', 'kam', stored, desired)
    expect(change?.changes).toEqual([{ path: 'faq', before: '2 pozycje', after: '1 pozycja' }])
  })

  it('lists text fields only — no relations, colours or prices of their own', () => {
    for (const fields of Object.values(TEXT_FIELDS)) {
      for (const field of fields) expect(field).not.toMatch(/relatedServices|similar|color|price$/i)
    }
  })
})

describe('formatTextReport', () => {
  it('a markdown table per record, long texts shortened', () => {
    const change = planTextChange('inst-services', 'kam', stored, {
      hero: { h1a: 'x'.repeat(200), lead: 'Lead' },
    })
    const report = formatTextReport(change ? [change] : [])
    expect(report).toContain('### inst-services · kam')
    expect(report).toContain('| hero.h1a | Stary nagłówek | ' + 'x'.repeat(117) + '… |')
    expect(formatTextReport([])).toContain('Brak różnic')
  })
})

describe('homeLayoutWithHero (INST-6 PR2)', () => {
  const layout = [
    {
      id: 'b1',
      blockType: 'instHome',
      hero: { eyebrow: 'E', h1a: 'Stary', trust: [{ id: 't', icon: 'pin', text: 'Salon' }] },
    },
    { id: 'b2', blockType: 'instService', service: 3 },
  ]

  it('puts the repo hero texts into the stored block, the rest as stored', () => {
    const next = homeLayoutWithHero(layout, { h1a: 'Nowy', lead: 'Lead' })
    expect(next).toEqual([
      {
        id: 'b1',
        blockType: 'instHome',
        hero: {
          eyebrow: 'E',
          h1a: 'Nowy',
          lead: 'Lead',
          trust: [{ id: 't', icon: 'pin', text: 'Salon' }],
        },
      },
      layout[1],
    ])
  })

  it('plans only the changed hero texts of the home page', () => {
    const page = { id: 1, slug: 'home', layout, seo: { title: 'T' } }
    const change = planTextChange('pages', 'home', page, {
      seo: { title: 'T' },
      layout: homeLayoutWithHero(layout, { h1a: 'Nowy' }),
    })
    expect(change?.changes).toEqual([
      { path: 'layout[0].hero.h1a', before: 'Stary', after: 'Nowy' },
    ])
  })

  it('gives null without the block or the layout', () => {
    expect(homeLayoutWithHero([layout[1]], { h1a: 'Nowy' })).toBeNull()
    expect(homeLayoutWithHero(undefined, { h1a: 'Nowy' })).toBeNull()
  })
})

describe('layoutWithBlockTexts (INST-6 PR3)', () => {
  it('merges the hero and the CTA band of the page block, the rest as stored', () => {
    const layout = [
      {
        id: 'o',
        blockType: 'instOffer',
        hero: { crumb: 'C', h1a: 'Stary' },
        cta: { heading: 'H' },
      },
    ]
    expect(
      layoutWithBlockTexts(layout, 'instOffer', { hero: { h1a: 'Nowy' }, cta: { text: 'T' } }),
    ).toEqual([
      {
        id: 'o',
        blockType: 'instOffer',
        hero: { crumb: 'C', h1a: 'Nowy' },
        cta: { heading: 'H', text: 'T' },
      },
    ])
    expect(layoutWithBlockTexts(layout, 'instGuide', { hero: { h1a: 'Nowy' } })).toBeNull()
  })
})

describe('overlay (INST-6 PR4)', () => {
  it('keeps the keys and rows typed in the panel, takes the repo texts', () => {
    const stored = {
      verify: [
        { id: 'a', title: 'CEIDG', href: 'https://ceidg' },
        { id: 'b', title: 'Google', href: 'https://g.page/x' },
      ],
      lead: 'Stary',
    }
    const desired = { verify: [{ title: 'CEIDG' }, { title: 'Opinie Google' }], lead: 'Nowy' }
    expect(overlay(stored, desired)).toEqual({
      verify: [
        { id: 'a', title: 'CEIDG', href: 'https://ceidg' },
        { id: 'b', title: 'Opinie Google', href: 'https://g.page/x' },
      ],
      lead: 'Nowy',
    })
    const change = planTextChange(
      'site-settings',
      's',
      { id: 1, shared: { about: stored } },
      {
        shared: { about: overlay(stored, desired) },
      },
    )
    expect(change?.changes.map((c) => c.path)).toEqual([
      'shared.about.verify[1].title',
      'shared.about.lead',
    ])
  })
})
