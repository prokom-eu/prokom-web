import { describe, expect, it } from 'vitest'

import { railItems } from './rail'

/** The home page of the seed, v150 (K36 §1). */
const HOME = [
  'bzHero',
  'bzNeeds',
  'bzOffer',
  'partners',
  'bzFeatured',
  'bzPlan',
  'bzSteps',
  'bzReferences',
  'bzFacts',
  'faq',
  'bzContact',
]

describe('railItems', () => {
  it('lists the 12 anchors of K36 §1 in the page order when reviews are shown', () => {
    const items = railItems(HOME, { reviews: true })
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
    const ids = railItems(HOME, { reviews: false }).map((item) => item.id)
    expect(ids).not.toContain('opinie')
    expect(ids).toHaveLength(11)
  })

  it('names a section once, even when its block is there twice', () => {
    expect(railItems(['bzHero', 'bzHero'], { reviews: true }).map((item) => item.id)).toEqual([
      'start',
    ])
  })

  it('is empty for a page without home sections', () => {
    expect(railItems(['hero', 'richText', 'bzOnePartner', 'bzNews'], { reviews: true })).toEqual([])
  })
})
