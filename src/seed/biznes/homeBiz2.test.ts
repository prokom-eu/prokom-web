import { describe, expect, it } from 'vitest'

import { biznesHomeLayout } from './home'
import {
  HOME_BUNDLES,
  HOME_ORDER_BIZ2,
  homeBundlesUpdate,
  reorderHomeBiz2,
  upgradeHomeBiz2,
} from './homeBiz2'
import { FAQ_LEAD_BIZ2, FAQ_LEAD_OLD } from './homeFacts'
import { PLAN_BIZ2, PLAN_LABELS, PLAN_LEAD } from './homePlan'

type Block = { blockType: string; id?: string; [field: string]: unknown }

const blocks = (types: readonly string[]): Block[] =>
  types.map((blockType) => ({ blockType, id: blockType }))
const types = (layout: readonly Block[] | null) => layout?.map((block) => block.blockType)

describe('reorderHomeBiz2 (plan 0611 §7.1)', () => {
  it('puts the blocks of the earlier seed in the order of §7.1, keeping their data', () => {
    const old = blocks([
      'bzHero',
      'bzNeeds',
      'bzOffer',
      'partners',
      'bzProcurement',
      'bzFeatured',
      'bzSteps',
      'bzPlan',
      'bzFacts',
      'bzReferences',
      'faq',
      'bzContact',
    ])
    old[3] = { ...old[3]!, heading: 'Marki z panelu' }
    const next = reorderHomeBiz2(old)
    expect(types(next)).toEqual([...HOME_ORDER_BIZ2])
    expect(next?.find((block) => block.blockType === 'partners')?.heading).toBe('Marki z panelu')
  })

  it('is idempotent: a page already in order is not written again', () => {
    expect(reorderHomeBiz2(blocks(HOME_ORDER_BIZ2))).toBeNull()
  })

  it('leaves a layout edited in the panel alone (a block added, removed or doubled)', () => {
    const reversed = [...HOME_ORDER_BIZ2].reverse()
    expect(reorderHomeBiz2(blocks([...reversed, 'richText']))).toBeNull()
    expect(reorderHomeBiz2(blocks(reversed.filter((type) => type !== 'faq')))).toBeNull()
    expect(
      reorderHomeBiz2(blocks([...reversed.filter((type) => type !== 'faq'), 'bzHero'])),
    ).toBeNull()
  })

  it('the seed itself, with „Zaopatrzenie firm” after the offer, is in the order of §7.1', () => {
    const seed = biznesHomeLayout().map((block) => block.blockType)
    const offer = seed.indexOf('bzOffer')
    const withProcurement = [...seed.slice(0, offer + 1), 'bzProcurement', ...seed.slice(offer + 1)]
    expect(withProcurement).toEqual([...HOME_ORDER_BIZ2])
  })
})

describe('upgradeHomeBiz2: texts of the plan with the industries and the FAQ lead', () => {
  const old = (): Block[] =>
    blocks(HOME_ORDER_BIZ2).map((block) =>
      block.blockType === 'bzPlan'
        ? {
            ...block,
            eyebrow: 'Plan Twojej firmy',
            heading: 'Zobacz, co ustawimy w Twoim lokalu.',
            lead: PLAN_LEAD,
            moreLabel: PLAN_LABELS.moreLabel,
          }
        : block.blockType === 'faq'
          ? { ...block, lead: FAQ_LEAD_OLD }
          : block,
    )

  it('replaces the old seed values and drops „60 minut” from the FAQ lead', () => {
    const next = upgradeHomeBiz2(old())
    const plan = next?.find((block) => block.blockType === 'bzPlan')
    expect(plan).toMatchObject(PLAN_BIZ2)
    const faq = next?.find((block) => block.blockType === 'faq')
    expect(faq?.lead).toBe(FAQ_LEAD_BIZ2)
    expect(faq?.lead).not.toMatch(/60 min/)
  })

  it('keeps texts edited in the panel, and a second run changes nothing', () => {
    const edited = old().map((block) =>
      block.blockType === 'bzPlan' ? { ...block, heading: 'Mój nagłówek' } : block,
    )
    const next = upgradeHomeBiz2(edited)
    expect(next?.find((block) => block.blockType === 'bzPlan')?.heading).toBe('Mój nagłówek')
    expect(upgradeHomeBiz2(next)).toBeNull()
  })

  it('is null for an empty page', () => {
    expect(upgradeHomeBiz2([])).toBeNull()
    expect(upgradeHomeBiz2(null)).toBeNull()
  })
})

describe('homeBundlesUpdate (`zestawy_na_glownej`)', () => {
  const ids = new Map(HOME_BUNDLES.map((slug, i) => [slug, i + 10]))

  it('fills the empty field with the package bundles, in their order', () => {
    expect(HOME_BUNDLES).toEqual([
      'zestaw-sklep-kasa-start',
      'zestaw-kawiarnia-lada',
      'zestaw-noclegi-pensjonat',
      'zestaw-biuro-3-5',
    ])
    expect(homeBundlesUpdate([], (slug) => ids.get(slug))).toEqual([10, 11, 12, 13])
    expect(homeBundlesUpdate(null, (slug) => ids.get(slug))).toEqual([10, 11, 12, 13])
  })

  it('keeps the panel choice and skips bundles without a record', () => {
    expect(homeBundlesUpdate([99], (slug) => ids.get(slug))).toBeNull()
    expect(homeBundlesUpdate([], (slug) => (slug === 'zestaw-biuro-3-5' ? 7 : undefined))).toEqual([
      7,
    ])
    expect(homeBundlesUpdate([], () => undefined)).toBeNull()
  })
})
