import { describe, expect, it } from 'vitest'

import { HOME_SECTIONS } from '@/lib/software/homeSections'

import { RAIL_LABELS, softwareRailItems } from './rail'

const ALL = HOME_SECTIONS.map(({ value }) => value)

describe('Software section rail', () => {
  it('lists the anchored sections in the order of the blocks', () => {
    const items = softwareRailItems([
      { blockType: 'swHero' },
      { blockType: 'swHomeSection', section: 'areas' },
      { blockType: 'swHomeSection', section: 'popular' },
      { blockType: 'swHomeSection', section: 'wizard' },
    ])
    expect(items.map((item) => [item.id, item.label])).toEqual([
      ['start', 'Start'],
      ['oferta', 'Oferta'],
      ['popularne', 'Najczęściej zamawiane'],
      ['dobierz', 'Dobierz rozwiązanie'],
    ])
  })

  it('has the 11 entries of the board v22: with „Zasady”, without „Proces” and „Kontakt”', () => {
    const items = softwareRailItems(
      [
        { blockType: 'swHero' },
        ...[
          'areas',
          'popular',
          'livePreviews',
          'wizard',
          'process',
          'howWeBuild',
          'whyNotWordpress',
          'technologies',
          'showcase',
          'guarantees',
        ].map((section) => ({ blockType: 'swHomeSection', section })),
        { blockType: 'faq' },
        { blockType: 'swContact' },
      ],
      ALL,
    )
    expect(items.map((item) => item.id)).toEqual([
      'start',
      'oferta',
      'popularne',
      'podglady',
      'dobierz',
      'jak-robimy',
      'bez-wordpressa',
      'technologie',
      'realizacje',
      'zasady',
      'faq',
    ])
    expect(Object.keys(RAIL_LABELS)).toHaveLength(11)
  })

  it('skips a section without its component yet (no anchor on the page)', () => {
    const items = softwareRailItems(
      [
        { blockType: 'swHomeSection', section: 'showcase' },
        { blockType: 'swHomeSection', section: 'areas' },
      ],
      ['areas'],
    )
    expect(items.map((item) => item.id)).toEqual(['oferta'])
  })

  it('ends with „Realizacje”, „Zasady” and the FAQ block — the contact block is not listed', () => {
    const items = softwareRailItems([
      { blockType: 'swHomeSection', section: 'showcase' },
      { blockType: 'swHomeSection', section: 'guarantees' },
      { blockType: 'faq' },
      { blockType: 'swContact' },
    ])
    expect(items.map((item) => [item.id, item.label])).toEqual([
      ['realizacje', 'Realizacje'],
      ['zasady', 'Zasady'],
      ['faq', 'Pytania'],
    ])
  })

  it('skips other blocks and repeated sections', () => {
    const items = softwareRailItems([
      { blockType: 'richText' },
      { blockType: 'swHomeSection', section: 'areas' },
      { blockType: 'swHomeSection', section: 'areas' },
      { blockType: 'swHomeSection', section: null },
    ])
    expect(items.map((item) => item.id)).toEqual(['oferta'])
  })
})
