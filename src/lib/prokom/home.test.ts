import { describe, expect, it } from 'vitest'

import { hubBrands, hubHelp, hubHome, hubPlans } from '../../seed/prokom/map'
import { brandsSchema, visibleAuthorizations } from './brands'
import { fillPromise, fillTokens, homeSchema, PROMISE, withVisibleFacts } from './home'
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

  it('show a fact-bound text only while all its facts are visible', () => {
    const counters = home.hero.counters
    expect(withVisibleFacts(counters, []).map((c) => c.value)).toEqual(['5'])
    // „4 autoryzacje” needs all four: one approved brand is not enough.
    const some = [{ value: 'Od 2004' }, { value: '100+' }, { value: 'Posnet' }]
    expect(withVisibleFacts(counters, some).map((c) => c.value)).toEqual(['2004', '5', '100+'])
    const all = [...some, { value: 'Elzab' }, { value: 'GoPOS' }, { value: 'InsERT' }]
    expect(withVisibleFacts(counters, all)).toEqual(counters)
    // A scene fact that repeats „100+” is gated the same way.
    const biznes = home.lines.scene.biznes.facts
    expect(withVisibleFacts(biznes, []).some((f) => f.text.includes('100'))).toBe(false)
  })

  it('take each line promise from its panel ({obietnica}), never from the texts', () => {
    for (const line of ['biznes', 'instalacje', 'software', 'tech'] as const) {
      expect(home.lines.scene[line].steps[1]?.title, line).toBe(PROMISE)
    }
    // Steps and facts of a line: there a promise would duplicate the panel's.
    const all = JSON.stringify(
      Object.values(home.lines.scene).map((scene) => [scene.steps, scene.facts]),
    )
    for (const promise of ['60 minut', '24 godziny', '1 dzień roboczy', 'Bezpłatna diagnoza']) {
      expect(all, promise).not.toContain(promise)
    }
    expect(fillPromise(PROMISE, 'Odpowiedź w 1 dzień roboczy')).toBe('Odpowiedź w 1 dzień roboczy')
    expect(fillPromise(PROMISE, null)).toBeNull()
    expect(fillPromise('Zwykły tekst', null)).toBe('Zwykły tekst')
  })

  it('never offer configuration or training at deliveries as standard (spec §3)', () => {
    const texts = JSON.stringify([home, hubBrands()])
    for (const phrase of ['dostawa i konfiguracja', 'konfiguracja i szkolenie na miejscu']) {
      expect(texts, phrase).not.toContain(phrase)
    }
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

  it('show an authorization only while its fact is visible, and carry no contact data', () => {
    const brands = hubBrands()
    expect(visibleAuthorizations(brands, [{ value: 'Elzab' }]).map((row) => row.name)).toEqual([
      'Elzab',
    ])
    const phone = { ...brands, note: 'Zadzwoń: 600 100 200' }
    expect(brandsSchema.safeParse(phone).success).toBe(false)
  })
})
