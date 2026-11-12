import { describe, expect, it } from 'vitest'

import { HOME_ORDER_BIZ2 } from './homeBiz2'
import {
  KSEF_BAND_BLOCK,
  KSEF_BAND_SETTINGS,
  KSEF_BAND_STEPS,
  KSEF_DEADLINE_SEED,
  ksefBandSettingsUpdate,
  NEWS_HOME_BLOCK,
  upgradeHomeKsefNews,
} from './homeKsefNews'

type Block = { blockType: string; variant?: string }

const blocks: { band: Block; news: Block } = {
  band: { blockType: 'bzKsef', variant: 'band' },
  news: { blockType: 'bzNewsHome' },
}
const layout = (): Block[] => HOME_ORDER_BIZ2.map((blockType) => ({ blockType }))
const types = (list: readonly Block[] | null) => list?.map((block) => block.blockType) ?? null

describe('upgradeHomeKsefNews — plan 0611 §7.1 pkt 7 and 12', () => {
  it('the band after „Najczęściej wybierane”, „Aktualności” before the FAQ', () => {
    expect(types(upgradeHomeKsefNews(layout(), blocks))).toEqual([
      'bzHero',
      'bzNeeds',
      'bzOffer',
      'bzProcurement',
      'partners',
      'bzFeatured',
      'bzKsef',
      'bzPlan',
      'bzSteps',
      'bzReferences',
      'bzFacts',
      'bzNewsHome',
      'faq',
      'bzContact',
    ])
  })

  it('idempotent: a second run changes nothing', () => {
    const once = upgradeHomeKsefNews(layout(), blocks)
    expect(upgradeHomeKsefNews(once, blocks)).toBeNull()
  })

  it('a full KSeF card is not the band: the band is still added', () => {
    const withCard = [...layout(), { blockType: 'bzKsef', variant: 'full' }]
    const next = upgradeHomeKsefNews(withCard, blocks)
    expect(next?.filter((block) => block.variant === 'band')).toHaveLength(1)
  })

  it('without the anchors: before the plan / contact, else at the end', () => {
    expect(
      types(upgradeHomeKsefNews([{ blockType: 'bzPlan' }, { blockType: 'bzContact' }], blocks)),
    ).toEqual(['bzKsef', 'bzPlan', 'bzNewsHome', 'bzContact'])
    expect(types(upgradeHomeKsefNews([{ blockType: 'bzHero' }], blocks))).toEqual([
      'bzHero',
      'bzKsef',
      'bzNewsHome',
    ])
  })

  it('no page layout: nothing', () => {
    expect(upgradeHomeKsefNews([], blocks)).toBeNull()
    expect(upgradeHomeKsefNews(null, blocks)).toBeNull()
  })
})

describe('ksefBandSettingsUpdate — only the empty fields', () => {
  it('fills an empty group with the seed values', () => {
    expect(ksefBandSettingsUpdate(null)).toEqual(KSEF_BAND_SETTINGS)
    expect(ksefBandSettingsUpdate({ deadline: null, textBefore: ' ' })).toEqual(KSEF_BAND_SETTINGS)
  })

  it('keeps the panel values, a second run changes nothing', () => {
    const panel = { deadline: '2027-02-01T00:00:00.000Z', textBefore: 'Z panelu.' }
    const next = ksefBandSettingsUpdate(panel)
    expect(next).toMatchObject(panel)
    expect(next?.textAfter).toBe(KSEF_BAND_SETTINGS.textAfter)
    expect(ksefBandSettingsUpdate(next)).toBeNull()
  })
})

describe('B3-2 seed texts', () => {
  it('the deadline is 1 January 2027 (official sources)', () => {
    expect(KSEF_DEADLINE_SEED.slice(0, 10)).toBe('2027-01-01')
  })

  it('no penalty claims in the band (MF bill postponing penalties — coordinator 08.11)', () => {
    const texts = [
      KSEF_BAND_SETTINGS.textBefore,
      KSEF_BAND_SETTINGS.textAfter,
      KSEF_BAND_BLOCK.eyebrow,
      KSEF_BAND_BLOCK.text,
      ...KSEF_BAND_STEPS,
    ].join(' ')
    expect(texts).not.toMatch(/kar[aęy]?\b|kary|sankcj/i)
  })

  it('six steps, titles within the field limit', () => {
    expect(KSEF_BAND_STEPS).toHaveLength(6)
    expect(KSEF_BAND_STEPS.every((title) => title.length <= 40)).toBe(true)
    expect(NEWS_HOME_BLOCK.heading.length).toBeLessThanOrEqual(90)
    expect(NEWS_HOME_BLOCK.lead.length).toBeLessThanOrEqual(240)
    expect(KSEF_BAND_BLOCK.text.length).toBeLessThanOrEqual(400)
  })
})
