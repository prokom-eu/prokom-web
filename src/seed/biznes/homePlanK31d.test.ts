import { describe, expect, it } from 'vitest'

import { PLAN_LABELS, PLAN_LEAD } from './homePlan'
import { upgradeHomePlan } from './homePlanK31d'

const OLD = {
  blockType: 'bzPlan',
  lead: 'Wybierz rodzaj firmy i zobacz, co zwykle ustawiamy — a my dobierzemy, skonfigurujemy i będziemy serwisować całość.',
  sceneNote: 'z jednej ręki',
  moreLabel: 'Więcej o branży',
  inquiryLabel: 'Przygotuj zapytanie:',
  industries: {
    heading: 'Firmy każdej wielkości.',
    tiles: [
      { id: 'a', name: 'Sklep spożywczy', planScene: null },
      { id: 'b', name: 'Apteka', planScene: 'gabinet' },
      { id: 'c', name: 'Każda inna firma' },
    ],
  },
}

describe('upgradeHomePlan', () => {
  it('replaces the stage 1 texts of the seed and fills empty tile scenes', () => {
    const [plan] = upgradeHomePlan([OLD, { blockType: 'faq' }])!
    expect(plan).toMatchObject({
      lead: PLAN_LEAD,
      sceneNote: PLAN_LABELS.sceneNote,
      moreLabel: PLAN_LABELS.moreLabel,
      inquiryLabel: PLAN_LABELS.inquiryLabel,
    })
    expect((plan as typeof OLD).industries.tiles).toEqual([
      { id: 'a', name: 'Sklep spożywczy', planScene: 'sklep' },
      // A scene set in the panel stays; a tile without a mapping stays without one.
      { id: 'b', name: 'Apteka', planScene: 'gabinet' },
      { id: 'c', name: 'Każda inna firma' },
    ])
  })

  it('keeps texts edited in the panel', () => {
    const [plan] = upgradeHomePlan([{ ...OLD, lead: 'Własny wstęp', moreLabel: 'Zestawy' }])!
    expect(plan).toMatchObject({ lead: 'Własny wstęp', moreLabel: 'Zestawy' })
  })

  it('returns null when nothing changes (second run)', () => {
    const once = upgradeHomePlan([OLD])!
    expect(upgradeHomePlan(once)).toBeNull()
    expect(upgradeHomePlan(null)).toBeNull()
  })
})
