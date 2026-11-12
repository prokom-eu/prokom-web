import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import { softwareSettingsData, solutionsToImport } from '../../seed/software/map'
import { HOME_HERO } from '../../seed/software/homeHero'
import { heroV24Schema, homeSchema, homeSolutionSlugs, validateHome } from './home'

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

  it('takes a short word of a slide for the phone, never longer than the word (SWA12b #14)', () => {
    expect(heroV24Schema.safeParse(HOME_HERO).error?.issues).toBeUndefined()
    const ai = HOME_HERO.slides.find((slide) => slide.word === 'automatyzacje i AI.')
    expect(ai?.wordShort).toBe('automatyzacje.')
    const slides = HOME_HERO.slides.map((slide, i) =>
      i === 0 ? { ...slide, wordShort: 'stronę wizytówkę i jeszcze więcej.' } : slide,
    )
    const issues = heroV24Schema.safeParse({ ...HOME_HERO, slides }).error?.issues ?? []
    expect(issues.map((issue) => issue.path.join('.'))).toEqual(['slides.0.wordShort'])
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
