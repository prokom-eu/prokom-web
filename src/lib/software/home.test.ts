import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import { softwareSettingsData, solutionsToImport } from '../../seed/software/map'
import { homeSchema, homeSolutionSlugs, validateHome } from './home'

/** What the seed stores (SW3): the start page texts without `homeOrder` (decision D2). */
const seedHome = () => softwareSettingsData().home

describe('Software home texts schema', () => {
  it('accepts the seed package', () => {
    expect(homeSchema.safeParse(seedHome()).error?.issues).toBeUndefined()
  })

  it('points the v24 items to solutions of the package', () => {
    const slugs = new Set(solutionsToImport().map((item) => item.slug))
    const cards = homeSolutionSlugs(homeSchema.parse(seedHome()))
    expect(cards.length).toBeGreaterThan(0)
    for (const slug of cards) expect(slugs.has(slug), slug).toBe(true)
  })

  it('refuses a v23 key left in the data (decision D6: the migration removes them)', () => {
    expect(validateHome({ ...seedHome(), popular: { order: [], tabs: [] } })).toMatch(/popular/)
  })

  it('does not store the section order (it is the order of the blocks)', () => {
    expect(validateHome({ ...seedHome(), homeOrder: stronaGlowna.homeOrder })).toMatch(/homeOrder/)
  })

  it('needs one cell per column in the comparison tables', () => {
    const value = seedHome()
    value.compare.rows[0] = value.compare.rows[0].slice(0, 2)
    expect(validateHome(value)).toMatch(/compare\.rows\.0/)
  })
})

describe('home.pricing (SWA2c-2)', () => {
  it('does not take the same solution twice', () => {
    const home = seedHome() as Record<string, unknown> & { pricing: { groups: unknown[] } }
    const twice = {
      ...home,
      pricing: {
        ...home.pricing,
        groups: [
          { label: 'Strony', solutions: ['strona-wizytowka'] },
          { label: 'Inne', solutions: ['strona-wizytowka'] },
        ],
      },
    }
    expect(validateHome(twice)).toMatch(/strona-wizytowka/)
  })
})
