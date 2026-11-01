import { describe, expect, it } from 'vitest'

import { k4Wizard, type K4WizardFile } from '../../seed/biznes/k4Wizard'
import file from '../../../seed/prokombiznes/k4/konfigurator-k4.json'
import { wizardSchema } from './wizard'
import {
  emptyWizardState,
  formatKr,
  parseKr,
  runWizard,
  stepReady,
  type WizardBundle,
  type WizardState,
  wizardProfile,
} from './wizardEngine'

// Rules of the package with product keys kept as slugs, every product available — the engine
// as the board runs it (K35 §1.2, `k3model`).
const rules = wizardSchema.parse(k4Wizard(file as unknown as K4WizardFile, (key) => key).wizard)
const all = (_slug: string): boolean => true

const bundles: WizardBundle[] = [
  { slug: 'gastro-maly', area: 'gastronomia', level: 'Mały' },
  { slug: 'gastro-standard', area: 'gastronomia', level: 'Standard' },
  { slug: 'gastro-sredni', area: 'gastronomia', level: 'Średni' },
  { slug: 'gastro-duzy', area: 'gastronomia', level: 'Duży' },
  { slug: 'sklep-maly', area: 'sklep', level: 'Mały' },
]

const state = (patch: Partial<WizardState>): WizardState => ({ ...emptyWizardState(), ...patch })
const run = (s: WizardState, available = all) => runWizard(rules, s, available, bundles)
const need = (result: ReturnType<typeof run>, id: string) => result.needs.find((n) => n.id === id)

describe('runWizard (K35 §8 and §1.2)', () => {
  it('gastro|nowa|2||dowozy:1 → GoHub, GoOrder, GoPOS for „Program do sprzedaży”', () => {
    const result = run(parseKr(rules, 'gastro|nowa|2||dowozy:1')!)
    const prog = need(result, 'prog')!
    expect(prog.title).toBe('Program do sprzedaży i magazynu')
    expect([prog.top, ...prog.alts]).toEqual(['gohub', 'goorder', 'gopos'])
    expect(prog.reasons[0]).toBe('dowozy i zamówienia online')
  })

  it('collects needs from the preset, the answers, the situation and the scale, in order', () => {
    const result = run(state({ firm: 'gastro', stage: 'nowa', scale: '4' }))
    expect(result.selected).toEqual(['pos', 'plat', 'prog', 'ksef', 'siec', 'kopie', 'opieka'])
    expect(result.sources.plat).toEqual(['typ', 'ans', 'etap'])
    expect(result.sources.kopie).toEqual(['skala'])
  })

  it('adds UPS above 10 stations', () => {
    const result = run(state({ firm: 'biuro', stage: 'wymiana', scale: '10' }))
    expect(result.selected).toContain('ups')
    expect(result.sources.ups).toEqual(['skala'])
  })

  it('a „Tak” answer adds its needs at once; „Nie” leaves them out', () => {
    const on = run(state({ firm: 'gastro', stage: 'wymiana', scale: '1', answers: { menu: true } }))
    expect(on.selected).toContain('ekr')
    expect(need(on, 'ekr')!.top).toBe('samsung-qbc')
    const off = run(
      state({ firm: 'gastro', stage: 'wymiana', scale: '1', answers: { menu: false } }),
    )
    expect(off.selected).not.toContain('ekr')
  })

  it('uses the usual answer of a question without an explicit one', () => {
    const result = run(state({ firm: 'gastro', stage: 'wymiana', scale: '1' }))
    expect(result.answers).toMatchObject({ stolik: true, dowozy: false, menu: false })
  })

  it('a need switched off by hand always wins', () => {
    const result = run(
      state({ firm: 'sklep', stage: 'ksef', scale: '1', manual: { ksef: false, kasa: false } }),
    )
    expect(result.selected).not.toContain('ksef')
    expect(result.selected).not.toContain('kasa')
  })

  it('a need ticked by hand gets the „man” source and its reason', () => {
    const result = run(
      state({ firm: 'sklep', stage: 'wymiana', scale: '1', manual: { vend: true } }),
    )
    expect(result.sources.vend).toEqual(['man'])
    expect(need(result, 'vend')!.reasons).toContain('zaznaczone przez Ciebie')
  })

  it('takes the firm list, then the scale list, then the default list', () => {
    const sklep = run(state({ firm: 'sklep', stage: 'wymiana', scale: '1' }))
    expect(need(sklep, 'kasa')!.top).toBe('neo')
    expect(need(sklep, 'kasa')!.reasons[0]).toBe('sklep')
    const inna = run(state({ firm: 'inna', stage: 'wymiana', scale: '4', answers: { det: true } }))
    expect(need(inna, 'kasa')!.top).toBe('neo')
    expect(need(inna, 'kasa')!.reasons[0]).toBe('4–10 stanowisk')
  })

  it('skips products not listed and drops a need without any', () => {
    const result = run(
      parseKr(rules, 'gastro|nowa|2||dowozy:1')!,
      (slug) => slug !== 'gohub' && slug !== 'nexo' && slug !== 's123' && slug !== 'pcpos',
    )
    expect([need(result, 'prog')!.top, ...need(result, 'prog')!.alts]).toEqual([
      'goorder',
      'gopos',
      'gokds',
    ])
    const none = run(state({ firm: 'gastro', stage: 'wymiana', scale: '1' }), () => false)
    expect(none.needs).toEqual([])
  })

  it('never repeats a product within a need and gives at most 3 reasons', () => {
    const result = run(parseKr(rules, 'gastro|nowa|2||dowozy:1')!)
    for (const n of result.needs) {
      const picks = [n.top, ...n.alts]
      expect(new Set(picks).size).toBe(picks.length)
      expect(picks.length).toBeLessThanOrEqual(3)
      expect(n.reasons.length).toBeLessThanOrEqual(3)
    }
    expect(need(result, 'ksef')!.reasons).toEqual(['typowe: gastronomia'])
  })

  it('picks the bundle of the firm by scale, with fallbacks, and the plan scene', () => {
    expect(run(state({ firm: 'gastro', stage: 'nowa', scale: '1' })).bundle).toBe('gastro-maly')
    expect(run(state({ firm: 'gastro', stage: 'nowa', scale: '2' })).bundle).toBe('gastro-standard')
    expect(run(state({ firm: 'gastro', stage: 'nowa', scale: '10' })).bundle).toBe('gastro-duzy')
    expect(run(state({ firm: 'sklep', stage: 'nowa', scale: '10' })).bundle).toBe('sklep-maly')
    const inna = run(state({ firm: 'inna', stage: 'nowa', scale: '1' }))
    expect(inna.bundle).toBeNull()
    expect(inna.scene).toBeNull()
    expect(run(state({ firm: 'gastro', stage: 'nowa', scale: '1' })).scene).toBe('gastro')
  })

  it('names the profile', () => {
    const result = run(state({ firm: 'gastro', stage: 'nowa', scale: '2' }))
    expect([result.firmName, result.stageName, result.scaleName]).toEqual([
      'Gastronomia',
      'Otwieram firmę lub lokal',
      '2–3 stanowiska',
    ])
  })
})

describe('stepReady', () => {
  it('opens a step only when the earlier answers are there', () => {
    const empty = emptyWizardState()
    expect(stepReady(rules, empty, 0)).toBe(true)
    expect(stepReady(rules, empty, 1)).toBe(false)
    expect(stepReady(rules, state({ firm: 'sklep' }), 1)).toBe(true)
    expect(stepReady(rules, state({ firm: 'sklep', stage: 'nowa' }), 2)).toBe(false)
    expect(stepReady(rules, state({ firm: 'sklep', stage: 'nowa', scale: '1' }), 3)).toBe(true)
  })
})

describe('parseKr / formatKr (K35 §1.3)', () => {
  it('reads the link of the board', () => {
    expect(parseKr(rules, 'gastro|nowa|2||dowozy:1')).toEqual(
      state({ firm: 'gastro', stage: 'nowa', scale: '2', answers: { dowozy: true } }),
    )
  })

  it('a list of needs is the exact selection, also against automatic needs', () => {
    const parsed = parseKr(rules, 'gastro|nowa|2|pos,plat,vend|')!
    const result = run(parsed)
    expect(result.selected).toEqual(['pos', 'plat', 'vend'])
  })

  it('rejects unknown kinds, situations, scales, answers and needs', () => {
    expect(parseKr(rules, 'kosmos|nowa|2||')).toBeNull()
    expect(parseKr(rules, 'gastro|zle|2||')).toBeNull()
    expect(parseKr(rules, 'gastro|nowa|3||')).toBeNull()
    expect(parseKr(rules, 'gastro|nowa|2||nieznane:1')).toBeNull()
    expect(parseKr(rules, 'gastro|nowa|2|nieznana|')).toBeNull()
    expect(parseKr(rules, 'gastro|nowa|2||dowozy:2')).toBeNull()
    expect(parseKr(rules, 'x'.repeat(600))).toBeNull()
    expect(parseKr(rules, '')).toBeNull()
  })

  it('writes the link back: needs only after changes by hand', () => {
    const s = state({ firm: 'gastro', stage: 'nowa', scale: '2', answers: { dowozy: true } })
    expect(formatKr(s, run(s).selected)).toBe('gastro|nowa|2||dowozy:1')
    const manual = { ...s, manual: { vend: true } }
    const link = formatKr(manual, run(manual).selected)
    expect(link).toMatch(/^gastro\|nowa\|2\|[a-z,-]*vend[a-z,-]*\|dowozy:1$/)
    expect(run(parseKr(rules, link)!).selected).toEqual(run(manual).selected)
  })
})

describe('wizardProfile (the profile in the inquiry, K35 §1.3)', () => {
  it('names the firm, situation, scale, every answer and the needs, with the link', () => {
    const s = parseKr(rules, 'gastro|nowa|2||dowozy:1')!
    expect(wizardProfile(rules, s)).toEqual({
      'Rodzaj firmy': 'Gastronomia',
      Sytuacja: 'Otwieram firmę lub lokal',
      Skala: '2–3 stanowiska',
      Odpowiedzi: [
        'Obsługa kelnerska przy stolikach? — Tak',
        'Osobna kuchnia albo bar? — Tak',
        'Dowozy albo zamówienia online? — Tak',
        'Wi-Fi dla gości? — Tak',
        'Menu na ekranie albo kiosk? — Nie',
      ],
      Potrzeby: [
        'Dotykowy system POS',
        'Płatności kartą i BLIK',
        'Program do sprzedaży i magazynu',
        'Faktury i KSeF',
        'Sieć i Wi-Fi dla gości',
      ],
      Link: '/konfigurator?kr=gastro%7Cnowa%7C2%7C%7Cdowozy%3A1',
    })
  })
})
