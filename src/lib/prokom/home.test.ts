import { describe, expect, it } from 'vitest'

import { hubBrands, hubHelp, hubHome, hubPlans } from '../../seed/prokom/map'
import { brandsSchema } from './brands'
import { fillTokens, homeSchema, withVisibleFacts } from './home'
import { HUB_LINES } from './lines'

describe('home page texts (HubSettings.home, board 01)', () => {
  const home = hubHome()

  it('cover the five lines: 3 slides in the hero, 3 steps in the scene', () => {
    for (const line of HUB_LINES) {
      expect(home.hero.lines[line].slides).toHaveLength(3)
      expect(home.lines.scene[line].steps).toHaveLength(3)
      expect(home.lines.scene[line].services.length).toBeGreaterThan(0)
    }
  })

  it('pick the six board situations among the records of „Pomoc”', () => {
    const slugs = new Set(hubHelp().map((entry) => entry.slug))
    expect(home.help.slugs).toHaveLength(6)
    for (const slug of home.help.slugs) expect(slugs, slug).toContain(slug)
  })

  it('name personas that exist in HubPlans (13, in the board order)', () => {
    const personas = new Set(
      hubPlans()
        .filter((plan) => plan.type === 'persona')
        .map((plan) => plan.key),
    )
    expect(home.choose.personas).toHaveLength(13)
    for (const { persona } of [...home.choose.personas, ...home.team.examples]) {
      expect(personas, persona).toContain(persona)
    }
  })

  it('keep contact data out — the FAQ uses tokens filled from CompanyData', () => {
    const answers = home.faq.items.map((item) => item.answer).join(' ')
    expect(answers).toContain('{telefon}')
    const bad = {
      ...home,
      faq: { ...home.faq, items: [{ question: 'Q?', answer: 'Zadzwoń: 883 200 151' }] },
    }
    expect(homeSchema.safeParse(bad).success).toBe(false)
    expect(
      fillTokens('Zadzwoń pod {telefon}. {adres}. {inne}', {
        telefon: '111 222 333',
        adres: 'ul. Testowa 1',
        godziny: 'pn–pt',
      }),
    ).toBe('Zadzwoń pod 111 222 333. ul. Testowa 1. {inne}')
  })

  it('show a fact-bound counter only while its fact is visible', () => {
    const counters = home.hero.counters
    expect(withVisibleFacts(counters, [])).toEqual(counters.filter((c) => c.fact === null))
    expect(
      withVisibleFacts(counters, [{ value: 'Od 2004' }, { value: '100+' }, { value: 'Posnet' }]),
    ).toEqual(counters)
  })
})

describe('brands (HubSettings.brands)', () => {
  it('have the four authorizations with the statuses of K4-FINAL §1', () => {
    const brands = hubBrands()
    expect(brands.authorizations.map((row) => `${row.name}: ${row.status}`)).toEqual([
      'Posnet: Autoryzowany serwis',
      'Elzab: Autoryzowany serwis',
      'GoPOS: Autoryzowany partner',
      'InsERT: Autoryzowany partner',
    ])
    const promoted = {
      ...brands,
      authorizations: [{ ...brands.authorizations[2]!, status: 'Autoryzowany serwis' }],
    }
    expect(brandsSchema.safeParse(promoted).success).toBe(false)
  })
})
