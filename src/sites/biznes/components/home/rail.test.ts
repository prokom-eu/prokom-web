import { describe, expect, it } from 'vitest'

import { railItems } from './rail'

/** The home page of the seed in the order of plan 0611 §7.1 (B3-1, B3-2), with the deciding data. */
const HOME = [
  { blockType: 'bzHero' },
  { blockType: 'bzNeeds' },
  { blockType: 'bzOffer', systems: [{ title: 'GoPOS' }] },
  { blockType: 'bzProcurement' },
  { blockType: 'partners' },
  { blockType: 'bzFeatured' },
  { blockType: 'bzKsef', variant: 'band' },
  {
    blockType: 'bzPlan',
    industries: { heading: 'Firmy każdej wielkości.', tiles: [{ name: 'Sklep' }] },
    funding: {},
  },
  { blockType: 'bzSteps' },
  { blockType: 'bzReferences', reviews: [{ quote: 'Polecam.', author: 'E. S.' }] },
  { blockType: 'bzFacts' },
  { blockType: 'bzNewsHome' },
  { blockType: 'faq' },
  { blockType: 'bzContact' },
]

const ON = { reviews: true, placeholders: false }

describe('railItems', () => {
  it('lists the sections of plan 0611 §7.1 in the page order when reviews are shown', () => {
    const items = railItems(HOME, ON)
    expect(items.map((item) => item.label)).toEqual([
      'Start',
      'Oferta',
      'Zaopatrzenie firm',
      'Marki',
      'Najczęściej wybierane',
      'KSeF',
      'Plan Twojej firmy',
      'Jak pracujemy',
      'Opinie',
      'O firmie',
      'Aktualności',
      'Pytania',
      'Kontakt',
    ])
    expect(items.map((item) => item.id)).toEqual([
      'start',
      'oferta',
      'zaopatrzenie',
      'marki',
      'wybierane',
      'ksef',
      'plan',
      'jak-pracujemy',
      'opinie',
      'fakty',
      'aktualnosci',
      'faq',
      'kontakt',
    ])
  })

  it('leaves out „Opinie” while reviews are hidden (D-K4-6)', () => {
    const ids = railItems(HOME, { reviews: false, placeholders: true }).map((item) => item.id)
    expect(ids).not.toContain('opinie')
    expect(ids).toHaveLength(12)
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

  it('D8: the plan with the industries is one entry — no „Dla kogo”, no „Systemy”', () => {
    const ids = railItems(HOME, ON).map((item) => item.id)
    expect(ids).not.toContain('dla-kogo')
    expect(ids).not.toContain('systemy')
    expect(
      railItems([{ blockType: 'bzPlan', funding: { heading: 'Dofinansowania' } }], ON),
    ).toEqual([{ id: 'plan', label: 'Plan Twojej firmy', icon: 'map' }])
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
