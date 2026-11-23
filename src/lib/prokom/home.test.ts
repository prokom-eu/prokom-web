import { describe, expect, it } from 'vitest'

import { hubBrands, hubHelp, hubHome, hubPlans, hubTrust } from '../../seed/prokom/map'
import { brandsSchema, visibleAuthorizations, visibleNetwork } from './brands'
import { fillPromise, fillTokens, homeSchema, PROMISE, withVisibleFacts } from './home'
import { HUB_LINES } from './lines'

/** The client count of the hub (23.11.2026): „10 000+” with a hard space. */
const CLIENTS = '10 000+'

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
    const some = [{ value: 'Od 2004' }, { value: CLIENTS }, { value: 'Posnet' }]
    expect(withVisibleFacts(counters, some).map((c) => c.value)).toEqual(['2004', '5', CLIENTS])
    const all = [...some, { value: 'Elzab' }, { value: 'GoPOS' }, { value: 'InsERT' }]
    expect(withVisibleFacts(counters, all)).toEqual(counters)
    // A scene fact that repeats the client count is gated the same way.
    const biznes = home.lines.scene.biznes.facts
    expect(withVisibleFacts(biznes, []).some((f) => f.facts.includes(CLIENTS))).toBe(false)
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

describe('partner network (runda 1811 D4: ALSEN)', () => {
  const approved = (values: string[]) => values.map((value) => ({ value }))

  it('is ALSEN, an authorised partner with its own https site, not one of the four', () => {
    const { network, authorizations } = hubBrands()
    expect(network).toMatchObject({
      name: 'ALSEN',
      slug: 'alsen',
      status: 'Autoryzowany partner',
      website: 'https://www.alsen.pl/',
    })
    expect(authorizations.map((row) => row.name)).not.toContain('ALSEN')
    const promoted = { ...hubBrands(), network: { ...network!, status: 'Autoryzowany serwis' } }
    expect(brandsSchema.safeParse(promoted).success).toBe(false)
    const http = { ...hubBrands(), network: { ...network!, website: 'http://www.alsen.pl/' } }
    expect(brandsSchema.safeParse(http).success).toBe(false)
  })

  it('shows only while its fact is visible', () => {
    expect(visibleNetwork(hubBrands(), approved(['Posnet']))).toBeNull()
    expect(visibleNetwork(null, approved(['ALSEN']))).toBeNull()
  })

  it('hides unconfirmed figures and the Rabka point until their facts are approved', () => {
    const base = visibleNetwork(hubBrands(), approved(['ALSEN']))!
    expect(base.paragraphs.join(' ')).not.toMatch(/350/)
    expect(base.salonNote).toBeNull()
    const all = visibleNetwork(hubBrands(), approved(['ALSEN', 'ALSEN 350+', 'ALSEN Rabka']))!
    expect(all.paragraphs.join(' ')).toMatch(/350/)
    expect(all.salonNote).toBe('Punkt partnerski ALSEN')
  })

  it('has its facts in the package: the partnership and the figure approved, the Rabka point waiting', () => {
    const facts = new Map(hubTrust().map((row) => [row.value, row.approved]))
    expect(facts.get('ALSEN')).toBe(true)
    expect(facts.get('ALSEN 350+')).toBe(true)
    expect(facts.get('ALSEN Rabka')).toBe(true)
  })
})

describe('procurement (runda 1811 D14)', () => {
  const { procurement } = hubHome()

  it('leads to /inwestycje-i-dostawy, its form and its tenders anchor', () => {
    expect(procurement?.cta.href).toBe('/inwestycje-i-dostawy#formularz')
    expect(procurement?.more.href).toBe('/inwestycje-i-dostawy#przetargi')
    expect(procurement?.points.length).toBeGreaterThanOrEqual(3)
  })

  it('names no buyers and promises no wins or prices', () => {
    expect(procurement?.examples).toEqual([])
    const texts = JSON.stringify(procurement).toLowerCase()
    for (const phrase of ['wygrywamy', 'najtańsz', 'zł', 'cena']) {
      expect(texts, phrase).not.toContain(phrase)
    }
  })

  it('is optional, so texts stored before it stay valid', () => {
    const { procurement: _p, ...older } = hubHome()
    expect(homeSchema.safeParse(older).success).toBe(true)
  })

  it('shows an example of a buyer only with a fact', () => {
    const noFact = {
      ...hubHome(),
      procurement: { ...procurement!, examples: [{ text: 'Gmina X', facts: [] }] },
    }
    expect(homeSchema.safeParse(noFact).success).toBe(false)
  })
})
