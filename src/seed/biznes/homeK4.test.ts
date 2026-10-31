import { describe, expect, it } from 'vitest'

import {
  K4_BRANDS,
  K4_FEATURED,
  K4_HERO,
  OLD_BRANDS,
  OLD_FEATURED,
  OLD_HERO,
  upgradeHomeK4,
} from './homeK4'

type Block = { blockType: string; [key: string]: unknown }

const oldHero: Block = { blockType: 'bzHero', ...OLD_HERO, pill: 'Rabka-Zdrój' }
const layout: Block[] = [
  oldHero,
  { blockType: 'bzNeeds' },
  { blockType: 'partners', ...OLD_BRANDS },
  { blockType: 'bzOffer' },
  { blockType: 'bzFeatured', ...OLD_FEATURED },
  { blockType: 'faq' },
]

describe('upgradeHomeK4 (K4c, K36 §1)', () => {
  it('puts the v150 texts into a hero still in the seed shape', () => {
    const next = upgradeHomeK4(layout)
    expect(next?.[0]).toMatchObject({ ...K4_HERO, pill: 'Rabka-Zdrój' })
    expect(K4_HERO.heading).toBe('Kasy, komputery i programy dla firm.')
    expect(K4_HERO.headingAccent).toBe('Wszystko z jednego miejsca — z Rabki.')
  })

  it('puts the v150 texts into „Najczęściej wybierane”', () => {
    const featured = upgradeHomeK4(layout)?.find((block) => block.blockType === 'bzFeatured')
    expect(featured).toMatchObject(K4_FEATURED)
  })

  it('moves the brands after the departments, as on the board', () => {
    expect(upgradeHomeK4(layout)?.map((block) => block.blockType)).toEqual([
      'bzHero',
      'bzNeeds',
      'bzOffer',
      'partners',
      'bzFeatured',
      'faq',
    ])
  })

  it('gives the brands block the v150 texts and keeps an order set later in the panel', () => {
    const once = upgradeHomeK4(layout) ?? []
    expect(once.find((block) => block.blockType === 'partners')).toMatchObject(K4_BRANDS)
    // The editor puts the brands back before the departments: the seed leaves it.
    const reordered = [once[0], once[3], once[1], once[2], ...once.slice(4)] as typeof once
    expect(upgradeHomeK4(reordered)).toBeNull()
  })

  it('keeps what the panel changed, field by field', () => {
    const edited = [{ ...oldHero, heading: 'Nasz własny nagłówek' }, ...layout.slice(1)]
    const next = upgradeHomeK4(edited)
    expect(next?.[0]).toMatchObject({ heading: 'Nasz własny nagłówek', lead: K4_HERO.lead })
  })

  it('changes nothing the second time', () => {
    const once = upgradeHomeK4(layout)
    expect(once).not.toBeNull()
    expect(upgradeHomeK4(once)).toBeNull()
  })

  it('leaves a layout without blocks alone', () => {
    expect(upgradeHomeK4(null)).toBeNull()
    expect(upgradeHomeK4([])).toBeNull()
  })
})
