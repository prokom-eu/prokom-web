import { describe, expect, it } from 'vitest'

import { HOME_SECTIONS } from '@/lib/software/homeSections'

import { RAIL_LABELS, softwareRailItems } from './rail'

const ALL = HOME_SECTIONS.map(({ value }) => value)

describe('Software section rail (v24, board `AU-pc`)', () => {
  it('lists the anchored sections in the order of the blocks', () => {
    const items = softwareRailItems([
      { blockType: 'swHero' },
      { blockType: 'swHomeSection', section: 'situations' },
      { blockType: 'swHomeSection', section: 'bento' },
      { blockType: 'swHomeSection', section: 'wizard' },
    ])
    expect(items.map((item) => [item.id, item.label])).toEqual([
      ['start', 'Start'],
      ['sytuacje', 'Od czego zaczynasz'],
      ['oferta', 'Oferta'],
      ['dobierz', 'Kreator 60 s'],
    ])
  })

  it('has the 10 entries of the board: no promises, „Jak robimy” and „Cennik” in', () => {
    const items = softwareRailItems(
      [
        { blockType: 'swHero' },
        ...[
          'promises',
          'situations',
          'bento',
          'showroom',
          'tech',
          'wizard',
          'pricing',
          'process',
        ].map((section) => ({
          blockType: 'swHomeSection',
          section,
        })),
        { blockType: 'faq' },
        { blockType: 'swContact' },
      ],
      ALL,
    )
    expect(items.map((item) => item.id)).toEqual([
      'start',
      'sytuacje',
      'oferta',
      'podglady',
      'technologia',
      'dobierz',
      'cennik',
      'proces',
      'faq',
      'kontakt',
    ])
    expect(Object.keys(RAIL_LABELS)).toHaveLength(10)
  })

  it('skips a v23 section that is no longer rendered', () => {
    const items = softwareRailItems([
      { blockType: 'swHomeSection', section: 'areas' },
      { blockType: 'swHomeSection', section: 'bento' },
    ])
    expect(items.map((item) => item.id)).toEqual(['oferta'])
  })

  it('skips other blocks and repeated sections', () => {
    const items = softwareRailItems([
      { blockType: 'richText' },
      { blockType: 'swHomeSection', section: 'bento' },
      { blockType: 'swHomeSection', section: 'bento' },
      { blockType: 'swHomeSection', section: null },
    ])
    expect(items.map((item) => item.id)).toEqual(['oferta'])
  })
})
