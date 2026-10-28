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

  it('has 10 entries, without „Zasady” (board `Main`)', () => {
    expect(Object.keys(RAIL_LABELS)).toHaveLength(10)
    const items = softwareRailItems(
      [{ blockType: 'swHero' }, ...ALL.map((section) => ({ blockType: 'swHomeSection', section }))],
      ALL,
    )
    expect(items.map((item) => item.id)).not.toContain('zasady')
  })

  it('lists „Dlaczego nie WordPress” of SW8a, but not „Zasady” next to it', () => {
    const items = softwareRailItems([
      { blockType: 'swHomeSection', section: 'wizard' },
      { blockType: 'swHomeSection', section: 'whyNotWordpress' },
      { blockType: 'swHomeSection', section: 'guarantees' },
    ])
    expect(items.map((item) => item.id)).toEqual(['dobierz', 'bez-wordpressa'])
  })

  it('skips a section without its component yet (no anchor on the page)', () => {
    const items = softwareRailItems([
      { blockType: 'swHomeSection', section: 'showcase' },
      { blockType: 'swHomeSection', section: 'areas' },
      { blockType: 'faq' },
    ])
    expect(items.map((item) => item.id)).toEqual(['oferta'])
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
