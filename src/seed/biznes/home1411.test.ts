import { describe, expect, it } from 'vitest'

import { HOME_ORDER_1411, SYSTEMS_HEAD, upgradeHome1411 } from './home1411'

type Block = { blockType: string; variant?: unknown; [key: string]: unknown }

const offer: Block = {
  blockType: 'bzOffer',
  systems: [
    { id: 'a', title: 'GoPOS dla gastronomii', mode: 'image' },
    {
      id: 'b',
      title: 'Stała opieka IT',
      mode: 'statuses',
      statuses: [{ id: 's1', label: 'Kopia', value: 'sprawdzona', tone: 'ok' }],
    },
  ],
}
// The home page of the earlier seed (B3-1 + B3-2): the KSeF band after „Najczęściej wybierane”.
const before: Block[] = [
  { blockType: 'bzHero' },
  { blockType: 'bzNeeds' },
  offer,
  { blockType: 'bzProcurement' },
  { blockType: 'partners' },
  { blockType: 'bzFeatured' },
  { blockType: 'bzKsef', variant: 'band' },
  { blockType: 'bzPlan' },
  { blockType: 'bzSteps' },
  { blockType: 'bzReferences' },
  { blockType: 'bzFacts' },
  { blockType: 'bzNewsHome' },
  { blockType: 'faq' },
  { blockType: 'bzContact' },
]

describe('upgradeHome1411 (PRZEKAZANIE-RUNDA-1411 §1 — nowa kolejność)', () => {
  const next = upgradeHome1411(before)!

  it('puts the sections in the order of §1, without the KSeF band', () => {
    expect(next.map((block) => block.blockType)).toEqual([
      'bzHero',
      'bzNeeds',
      'bzOffer',
      'bzSystems',
      'bzFeatured',
      'bzPlan',
      'bzSteps',
      'bzReferences',
      'bzFacts',
      'partners',
      'bzProcurement',
      'bzNewsHome',
      'faq',
      'bzContact',
    ])
    expect(next.some((block) => block.blockType === 'bzKsef')).toBe(false)
  })

  it('makes „Systemy” of the offer’s cards, without the old row ids', () => {
    const systems = next.find((block) => block.blockType === 'bzSystems')!
    expect(systems).toMatchObject(SYSTEMS_HEAD)
    expect(systems.systems).toEqual([
      { title: 'GoPOS dla gastronomii', mode: 'image' },
      {
        title: 'Stała opieka IT',
        mode: 'statuses',
        statuses: [{ label: 'Kopia', value: 'sprawdzona', tone: 'ok' }],
      },
    ])
  })

  it('is idempotent: a second run changes nothing', () => {
    expect(upgradeHome1411(next)).toBeNull()
  })

  it('keeps a full KSeF card (not the band) and a page edited in the panel in its order', () => {
    const edited = [...next.slice(0, 2), { blockType: 'richText' }, ...next.slice(2)]
    expect(upgradeHome1411(edited)).toBeNull()
    const withCard = [...next, { blockType: 'bzKsef', variant: 'full' }]
    expect(upgradeHome1411(withCard)).toBeNull()
  })

  it('no layout: nothing; the order lists every block of the new home page once', () => {
    expect(upgradeHome1411([])).toBeNull()
    expect(upgradeHome1411(null)).toBeNull()
    expect(new Set(HOME_ORDER_1411).size).toBe(HOME_ORDER_1411.length)
  })
})
