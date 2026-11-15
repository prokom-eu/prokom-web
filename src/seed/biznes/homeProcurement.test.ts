import { describe, expect, it } from 'vitest'

import { upgradeHomeProcurement } from './homeProcurement'

type Block = { blockType: string; heading?: string; data?: unknown; id?: string }

const block: Block = { blockType: 'bzProcurement', heading: 'Zaopatrzenie', data: { cards: [1] } }

describe('upgradeHomeProcurement (ZAOPATRZENIE §8)', () => {
  it('inserts the section right after the offer, before the brands', () => {
    const layout = [{ blockType: 'bzHero' }, { blockType: 'bzOffer' }, { blockType: 'partners' }]
    expect(upgradeHomeProcurement(layout, block)?.map((b) => b.blockType)).toEqual([
      'bzHero',
      'bzOffer',
      'bzProcurement',
      'partners',
    ])
  })

  it('without the offer goes before the brands, without both at the end', () => {
    expect(
      upgradeHomeProcurement([{ blockType: 'bzHero' }, { blockType: 'partners' }], block)?.map(
        (b) => b.blockType,
      ),
    ).toEqual(['bzHero', 'bzProcurement', 'partners'])
    expect(
      upgradeHomeProcurement([{ blockType: 'bzHero' }], block)?.map((b) => b.blockType),
    ).toEqual(['bzHero', 'bzProcurement'])
  })

  it('is idempotent: a stored section with the package data stays where the panel put it', () => {
    const stored = [
      { blockType: 'bzOffer' },
      { blockType: 'partners' },
      { ...block, id: 'x', heading: 'Edytowany w panelu', data: { cards: [1] } },
    ]
    expect(upgradeHomeProcurement(stored, block)).toBeNull()
  })

  it('brings the stored data back to the package, keeping the edited head texts', () => {
    const stored = [
      { blockType: 'bzOffer' },
      { ...block, heading: 'Edytowany', data: { cards: [] } },
    ]
    expect(upgradeHomeProcurement(stored, block)?.[1]).toEqual({
      blockType: 'bzProcurement',
      heading: 'Edytowany',
      data: { cards: [1] },
    })
  })
})

describe('package „zaopatrzenie” of the home page', () => {
  it('matches the block schema and the configurator types of both pages', async () => {
    const { homeProcurementPackage } = await import('./homeProcurement')
    const { resolveProcurementImages } = await import('./procurementPages')
    const { validateProcurementHome, buildProcurementHome } =
      await import('../../lib/biznes/procurement/home')
    const pages = (await import('../../../seed/prokombiznes/k4/strony-k4.json'))
      .default as unknown as {
      zaopatrzenie: Record<
        'agd' | 'it',
        {
          configurator: {
            unit: [string, string, string]
            types: { slug: string; items: { qty: number }[] }[]
          }
        }
      >
    }
    const { eyebrow, heading, lead, ...rest } = homeProcurementPackage
    expect([eyebrow, heading, lead].every(Boolean)).toBe(true)
    const { data } = resolveProcurementImages(rest, () => 1)
    expect(validateProcurementHome(data)).toBe(true)
    const page = (variant: 'agd' | 'it') => ({
      pickup: false,
      ...pages.zaopatrzenie[variant].configurator,
    })
    const home = buildProcurementHome(data, {
      pages: { 'agd-rtv-dla-firm': page('agd'), 'dostawy-it-dla-firm': page('it') },
      callback: null,
    })
    // Every calculator type exists on its page (the `?typ=` link lands on it).
    expect(home?.cards.map((card) => card.types.length)).toEqual([3, 3])
  })
})
