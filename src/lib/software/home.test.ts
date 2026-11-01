import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import { softwareSettingsData, solutionsToImport } from '../../seed/software/map'
import { homeSchema, homeSolutionSlugs, validateHome } from './home'

/** What the seed stores (SW3): the start page texts without `homeOrder` (decision D2). */
const seedHome = () => softwareSettingsData().home

describe('Software home texts schema', () => {
  it('accepts the seed package (v20)', () => {
    expect(homeSchema.safeParse(seedHome()).error?.issues).toBeUndefined()
  })

  it('points all 12 cards to solutions of the package (v22: no generic cards)', () => {
    const slugs = new Set(solutionsToImport().map((item) => item.slug))
    const cards = homeSolutionSlugs(homeSchema.parse(seedHome()))
    expect(cards).toHaveLength(12)
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

  it('keeps the phone hero card „Twoja Firma · panel” with at most 3 notifications (SWV3)', () => {
    const value = seedHome()
    const panel = value.sections?.heroPanel
    expect(panel?.items.map((item) => item.title)).toEqual([
      'Nowe zapytanie ze strony',
      'Ekipa Marka na miejscu',
      'Faktura wysłana sama',
    ])
    const withoutPanel = seedHome()
    delete withoutPanel.sections?.heroPanel
    expect(validateHome(withoutPanel)).toBe(true)
    if (!panel) return
    panel.items.push(panel.items[0])
    expect(validateHome(value)).toMatch(/sections\.heroPanel\.items/)
  })

  it('allows at most 12 cards', () => {
    const value = seedHome()
    value.popular.order = [...value.popular.order, 'strona-wizytowka']
    expect(validateHome(value)).toMatch(/popular\.order/)
  })
})
