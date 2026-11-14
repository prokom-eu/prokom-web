import { describe, expect, it } from 'vitest'

import { hubHelp, hubPlans, hubServices, hubTools, hubTrust, mergeTrust, slugOf } from './map'

const services = hubServices()
const tools = hubTools()
const help = hubHelp()
const plans = hubPlans()

const unique = (values: string[]) => new Set(values).size === values.length

describe('hub seed — counts of the design package (ADR-H002 §3)', () => {
  it('49 services, 20 tools, 26 help situations', () => {
    expect(services).toHaveLength(49)
    expect(tools).toHaveLength(20)
    expect(help).toHaveLength(26)
  })

  it('13 personas, 13 industries and 7 home situations as separate plans', () => {
    const count = (type: string) => plans.filter((plan) => plan.type === type).length
    expect(count('persona')).toBe(13)
    expect(count('branza')).toBe(13)
    expect(count('sytuacja-dom')).toBe(7)
  })

  it('keys and slugs are unique, so a second run finds every record', () => {
    expect(unique(services.map((s) => s.key))).toBe(true)
    expect(unique(tools.map((t) => t.key))).toBe(true)
    expect(unique(help.map((h) => h.slug))).toBe(true)
    expect(unique(plans.map((p) => `${p.type}:${p.key}`))).toBe(true)
  })
})

describe('hub seed — services', () => {
  it('lead to the line home, except b11/b12 (deliveries) and i10 (cooperation)', () => {
    const byKey = Object.fromEntries(services.map((s) => [s.key, s]))
    expect(byKey.b11).toMatchObject({
      url: '/inwestycje-i-dostawy',
      ctaLabel: 'Złóż listę zapytania',
    })
    expect(byKey.b12).toMatchObject({ url: '/inwestycje-i-dostawy' })
    expect(byKey.i10).toMatchObject({ url: '/wspolpraca', ctaLabel: 'Współpraca z pracownią' })
    expect(byKey.b1).toMatchObject({
      url: 'https://prokombiznes.pl',
      ctaLabel: 'Zobacz na prokombiznes.pl',
    })
  })

  it('relate only to existing services', () => {
    const keys = new Set(services.map((s) => s.key))
    for (const service of services) {
      for (const related of service.relatedKeys) expect(keys).toContain(related)
    }
  })
})

describe('hub seed — tools and plans', () => {
  it('two tools per line are featured on the home page', () => {
    for (const line of ['biznes', 'instalacje', 'software', 'tech', 'gaming']) {
      expect(tools.filter((t) => t.line === line && t.featuredOnHome)).toHaveLength(2)
    }
  })

  it('industries map the short line keys of the board (b/i/s/t) to lines', () => {
    const gastro = plans.find((p) => p.type === 'branza' && p.key === 'gastro')
    expect(gastro?.groups?.map((g) => g.line)).toEqual(['biznes', 'instalacje', 'software'])
    expect(gastro?.start?.length).toBeGreaterThan(0)
  })

  it('home situations name the line to call', () => {
    for (const plan of plans.filter((p) => p.type === 'sytuacja-dom'))
      expect(plan.call).toBeTruthy()
  })
})

describe('hub seed — content rules (spec §3)', () => {
  const all = JSON.stringify([services, tools, help, plans])
  it('has no prices, financing or WhatsApp', () => {
    // `\b` of JS regexes knows only ASCII letters, so „złożony” would match `\bzł\b`.
    expect(all).not.toMatch(/(?<!\p{L})(zł|rat[yaę]?)(?!\p{L})|whatsapp|leasing|gratis|w cenie/iu)
  })
})

describe('slugOf', () => {
  it('gives an address part without Polish letters', () => {
    expect(slugOf('Pęknięty ekran telefonu')).toBe('pekniety-ekran-telefonu')
    expect(slugOf('Zgłoś awarię — instalacji!')).toBe('zglos-awarie-instalacji')
  })
})

describe('hub seed — company facts (spec §3)', () => {
  it('has the facts and statuses of the spec, all approved', () => {
    expect(hubTrust().map((row) => `${row.value}: ${row.label}`)).toEqual([
      'Od 2004: firma z Rabki-Zdroju',
      '100+: klientów firmowych',
      'Posnet: Autoryzowany serwis',
      'Elzab: Autoryzowany serwis',
      'GoPOS: Autoryzowany partner',
      'InsERT: Autoryzowany partner',
      'Optivendi: Partner',
      'COMEX: We współpracy',
    ])
    expect(hubTrust().every((row) => row.approved)).toBe(true)
  })

  it('keeps facts added in the panel and the row ids of the package facts', () => {
    const stored = [
      { id: 'a', value: 'Posnet', label: 'stary opis', approved: false },
      { id: 'b', value: '30 lat', label: 'na rynku', approved: false },
    ]
    const merged = mergeTrust(stored, hubTrust())
    expect(merged.find((row) => row.value === 'Posnet')).toMatchObject({
      id: 'a',
      label: 'Autoryzowany serwis',
      approved: true,
    })
    expect(merged.at(-1)).toEqual(stored[1])
    expect(merged).toHaveLength(hubTrust().length + 1)
  })
})
