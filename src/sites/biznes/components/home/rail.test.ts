import { describe, expect, it } from 'vitest'

import { railItems } from './rail'

/** The home page of the seed, v150 (K36 §1), with the data that decides the sections. */
const HOME = [
  { blockType: 'bzHero' },
  { blockType: 'bzNeeds' },
  { blockType: 'bzOffer', systems: [{ title: 'GoPOS' }] },
  { blockType: 'partners' },
  { blockType: 'bzFeatured' },
  {
    blockType: 'bzPlan',
    industries: { heading: 'Firmy każdej wielkości.', tiles: [{ name: 'Sklep' }] },
    funding: {},
  },
  { blockType: 'bzSteps' },
  { blockType: 'bzReferences', reviews: [{ quote: 'Polecam.', author: 'E. S.' }] },
  { blockType: 'bzFacts' },
  { blockType: 'faq' },
  { blockType: 'bzContact' },
]

const ON = { reviews: true, placeholders: false }

describe('railItems', () => {
  it('lists the 12 anchors of K36 §1 in the page order when reviews are shown', () => {
    const items = railItems(HOME, ON)
    expect(items.map((item) => item.label)).toEqual([
      'Start',
      'Działy oferty',
      'Systemy i opieka IT',
      'Marki',
      'Najczęściej wybierane',
      'Dla kogo',
      'Plan Twojej firmy',
      'Jak pracujemy',
      'Opinie',
      'O firmie',
      'Pytania',
      'Kontakt',
    ])
    expect(items.map((item) => item.id)).toEqual([
      'start',
      'oferta',
      'systemy',
      'marki',
      'wybierane',
      'dla-kogo',
      'plan',
      'jak-pracujemy',
      'opinie',
      'fakty',
      'faq',
      'kontakt',
    ])
  })

  it('leaves out „Opinie” while reviews are hidden (D-K4-6)', () => {
    const ids = railItems(HOME, { reviews: false, placeholders: true }).map((item) => item.id)
    expect(ids).not.toContain('opinie')
    expect(ids).toHaveLength(11)
  })

  it('leaves out „Opinie” without reviews in production, keeps it with placeholders', () => {
    const page = HOME.map((block) =>
      block.blockType === 'bzReferences' ? { blockType: 'bzReferences', reviews: [] } : block,
    )
    expect(railItems(page, ON).map((item) => item.id)).not.toContain('opinie')
    expect(railItems(page, { reviews: true, placeholders: true }).map((item) => item.id)).toContain(
      'opinie',
    )
  })

  it('leaves out sections their block does not render (empty data)', () => {
    const ids = railItems(
      [
        { blockType: 'bzOffer', systems: [] },
        {
          blockType: 'bzPlan',
          industries: { heading: 'Firmy', tiles: [] },
          funding: { heading: null },
        },
      ],
      ON,
    ).map((item) => item.id)
    expect(ids).toEqual(['oferta', 'plan'])
    // The funding bar alone keeps „Dla kogo”.
    expect(
      railItems(
        [
          {
            blockType: 'bzPlan',
            industries: { heading: 'Firmy' },
            funding: { heading: 'Dofinansowania' },
          },
        ],
        ON,
      ).map((item) => item.id),
    ).toEqual(['dla-kogo', 'plan'])
  })

  it('leaves out „Dla kogo” without its heading (the section needs it)', () => {
    const ids = railItems([{ blockType: 'bzPlan', industries: { tiles: [{ name: 'Sklep' }] } }], ON)
    expect(ids.map((item) => item.id)).toEqual(['plan'])
  })

  it('names a section once, even when its block is there twice', () => {
    expect(railItems([{ blockType: 'bzHero' }, { blockType: 'bzHero' }], ON)).toHaveLength(1)
  })

  it('is empty for a page without home sections', () => {
    const blocks = ['hero', 'richText', 'bzOnePartner', 'bzNews'].map((blockType) => ({
      blockType,
    }))
    expect(railItems(blocks, ON)).toEqual([])
  })
})
