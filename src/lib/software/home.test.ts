import { describe, expect, it } from 'vitest'

import popularne from '../../../seed/prokomsoftware/popularne.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import technologie from '../../../seed/prokomsoftware/technologie.json'
import { homeSchema, homeSolutionSlugs, validateHome } from './home'

/** What the seed (SW3) stores: the start page texts without `homeOrder` (decision D2). */
function seedHome() {
  const { homeOrder: _order, ...texts } = structuredClone(stronaGlowna)
  return {
    ...texts,
    technologies: structuredClone(technologie.layers),
    popular: { order: structuredClone(popularne.order), tabs: structuredClone(popularne.tabs) },
  }
}

describe('Software home texts schema', () => {
  it('accepts the seed package (v20)', () => {
    expect(homeSchema.safeParse(seedHome()).error?.issues).toBeUndefined()
  })

  it('points the 12 cards only to solutions of the package', () => {
    const slugs = new Set(rozwiazania.items.map((item) => item.slug))
    const cards = homeSolutionSlugs(homeSchema.parse(seedHome()))
    expect(cards).toHaveLength(10)
    for (const slug of cards) expect(slugs.has(slug), slug).toBe(true)
  })

  it('does not store the section order (it is the order of the blocks)', () => {
    expect(validateHome({ ...seedHome(), homeOrder: stronaGlowna.homeOrder })).toMatch(/homeOrder/)
  })

  it('needs one cell per column in the comparison tables', () => {
    const value = seedHome()
    value.compare.rows[0] = value.compare.rows[0].slice(0, 2)
    expect(validateHome(value)).toMatch(/compare\.rows\.0/)
  })

  it('needs a source for every fact of „Dlaczego nie WordPress”', () => {
    const value = seedHome()
    const [first] = value.whyNotWordpress.facts
    value.whyNotWordpress.facts[0] = { ...first, src: '' } as typeof first
    expect(validateHome(value)).toMatch(/whyNotWordpress\.facts\.0\.src/)
  })

  it('allows at most 12 cards', () => {
    const value = seedHome()
    value.popular.order = [...value.popular.order, 'strona-wizytowka']
    expect(validateHome(value)).toMatch(/popular\.order/)
  })
})
