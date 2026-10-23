import { describe, expect, it } from 'vitest'

import { industryTiles, WIZARD_HREF } from './tiles'

const tile = (name: string, extra: Record<string, unknown> = {}) => ({
  name,
  icon: 'store' as const,
  tone: 'blue' as const,
  ...extra,
})

describe('industryTiles', () => {
  it('splits tiles into the ones shown at once and the rest, keeping the order', () => {
    const { visible, hidden } = industryTiles(
      [tile('A', { visibleFirst: true }), tile('B'), tile('C', { visibleFirst: true }), tile('D')],
      1,
    )
    expect(visible.map((t) => t.name)).toEqual(['A', 'C'])
    expect(hidden.map((t) => t.name)).toEqual(['B', 'D'])
  })

  it('links to the page of an active industry of this tenant only, otherwise to the wizard', () => {
    const { hidden } = industryTiles(
      [
        tile('Własna', { industry: { slug: 'gastronomia', tenant: 1, active: true } }),
        tile('Wkrótce', { industry: { slug: 'beauty', tenant: 1, active: false } }),
        tile('Obca', { industry: { slug: 'obca', tenant: { id: 2 }, active: true } }),
        tile('Id bez danych', { industry: 7 }),
        tile('Bez branży'),
      ],
      1,
    )
    expect(hidden.map((t) => t.href)).toEqual([
      '/branze/gastronomia',
      // An inactive industry („Wkrótce”) has no page of its own (`Industries`).
      WIZARD_HREF,
      WIZARD_HREF,
      WIZARD_HREF,
      WIZARD_HREF,
    ])
  })

  it('handles no tiles', () => {
    expect(industryTiles(null, 1)).toEqual({ visible: [], hidden: [] })
  })
})
