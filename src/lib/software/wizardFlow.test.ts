import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokomsoftware/kreator.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { wizardSeed } from '../../seed/software/wizardExtras'
import { softwareWizardSchema } from './wizard'
import {
  EMPTY_ANSWERS,
  fillWizardTexts,
  orderedNeeds,
  parseSoftwareAnswers,
  parseWizardParams,
  previewOf,
  resultView,
  type WizardAnswers,
  type WizardSolution,
  wizardMessage,
  wizardSummary,
} from './wizardFlow'

const rules = softwareWizardSchema.parse(wizardSeed(kreator))
const NBSP = String.fromCharCode(0xa0) // formatPrice groups thousands with it

/** Prices and terms of the package, as the solutions index carries them. */
const solutions: Record<string, WizardSolution> = Object.fromEntries(
  rozwiazania.items.map((item) => [
    item.slug,
    {
      name: item.name,
      prices: Object.fromEntries(Object.entries(item.prices).filter(([, value]) => value !== null)),
      leadTimes: Object.fromEntries(
        Object.entries(item.leadTimes).filter(([, value]) => value !== null),
      ),
      priceMonthly: item.slug === 'opieka-nad-strona-i-systemem',
    },
  ]),
)

const answers = (patch: Partial<WizardAnswers>): WizardAnswers => ({ ...EMPTY_ANSWERS, ...patch })

describe('Software wizard result (stany 50–55)', () => {
  it('50: firm + pensjonat, Standard, an old site → hotel page at the Standard price', () => {
    const view = resultView(
      rules,
      answers({ need: 'firm', options: ['nocleg'], size: 'std', have: 'stara' }),
      solutions,
    )
    expect(view.resultId).toBe('pensjonat')
    expect(view.result.n).toBe('Strona dla pensjonatu lub hotelu')
    expect(view.price).toBe(`2${NBSP}990 zł netto`)
    expect(view.term).toBe('3 tygodnie')
    expect(view.ask).toBe(false)
    expect(view.scope).toBe(rules.scopeNotes.pensjonatStartStd)
    expect(view.resultNote).toBe('+ przebudowa starej strony, bez utraty pozycji w Google')
    expect(view.whenNote).toBe(rules.whenNotes.default)
    expect(view.checklist).toEqual(['Logo', 'Zdjęcia', 'Teksty o firmie', 'Domena'])
    expect(view.gains.at(-1)).toBe(rules.sizeGains.std)
    expect(view.choice).toEqual(['Strona firmowa', 'Pensjonat, hotel, apartamenty', 'Standard'])
  })

  it('50: the full version of the hotel page has no scope line', () => {
    const view = resultView(
      rules,
      answers({ need: 'firm', options: ['nocleg'], size: 'full' }),
      solutions,
    )
    expect(view.price).toBe(`4${NBSP}490 zł netto`)
    expect(view.scope).toBeNull()
  })

  it('51: program + zlecenia → orders system; start size adds the system scope', () => {
    const std = resultView(rules, answers({ need: 'prog', options: ['zlec'] }), solutions)
    expect(std.resultId).toBe('zlecenia')
    expect(std.price).toBe(`5${NBSP}990 zł netto`)
    expect(std.term).toBe('6 tygodni')
    expect(std.scope).toBeNull()
    const start = resultView(
      rules,
      answers({ need: 'prog', options: ['zlec'], size: 'start' }),
      solutions,
    )
    expect(start.price).toBe(`3${NBSP}490 zł netto`)
    expect(start.scope).toBe(rules.scopeNotes.systemStart)
  })

  it('51: another program answer falls to the `*` result', () => {
    expect(resultView(rules, answers({ need: 'prog', options: [] }), solutions).resultId).toBe(
      'zlecenia',
    )
    expect(
      resultView(rules, answers({ need: 'prog', options: ['klienci'] }), solutions).resultId,
    ).toBe('crm')
  })

  it('52: refresh with three problems → rebuild at the Standard price', () => {
    const view = resultView(
      rules,
      answers({ need: 'odsw', options: ['wolna', 'tel', 'google'], url: 'stara.pl' }),
      solutions,
    )
    expect(view.resultId).toBe('przebudowa')
    expect(view.price).toBe(`2${NBSP}490 zł netto`)
    expect(view.choice).toEqual([
      'Odświeżenie obecnej strony',
      'Wolno się ładuje',
      'Źle wygląda na telefonie',
      'Nikt jej nie znajduje',
      'Standard',
    ])
  })

  it('55: an app has no price in the panel → „Zapytaj o wycenę”, term fallback', () => {
    const view = resultView(rules, answers({ need: 'app', options: ['ekipa'] }), solutions)
    expect(view.resultId).toBe('app')
    expect(view.price).toBe('Zapytaj o wycenę')
    expect(view.term).toBe('po krótkiej rozmowie')
    expect(view.ask).toBe(true)
  })

  it('a solution missing on the site (removed, draft) asks for a quote, never fails', () => {
    const view = resultView(rules, answers({ need: 'firm', options: ['nocleg'] }), {})
    expect(view.price).toBe('Zapytaj o wycenę')
    expect(view.ask).toBe(true)
  })

  it('a result without sizes shows the lowest price with „od” and the first term', () => {
    const view = resultView(rules, answers({ need: 'wiz', options: ['bud'] }), solutions)
    expect(view.hasSize).toBe(false)
    expect(view.price).toBe('od 999 zł netto')
    expect(view.term).toBe('od 1 tydzień')
    expect(view.choice).toEqual(['Wizytówka', 'Budowlanka i remonty'])
  })

  it('53: „opisz po swojemu” is free advice, no size, its own choice chip', () => {
    const view = resultView(rules, answers({ own: true, description: 'Coś' }), solutions)
    expect(view.resultId).toBe('own')
    expect(view.price).toBe('Bezpłatnie')
    expect(view.term).toBe(rules.free.term)
    expect(view.hasSize).toBe(false)
    expect(view.choice).toEqual(['Opis po swojemu'])
  })

  it('winter note depends on the size of the job (bigWhen)', () => {
    const small = resultView(rules, answers({ need: 'firm', when: 'zima' }), solutions)
    expect(small.whenNote).toBe(rules.whenNotes.zimaSmall)
    const full = resultView(rules, answers({ need: 'firm', when: 'zima', size: 'full' }), solutions)
    expect(full.whenNote).toBe(rules.whenNotes.zimaBig)
    const prog = resultView(rules, answers({ need: 'prog', when: 'zima' }), solutions)
    expect(prog.whenNote).toBe(rules.whenNotes.zimaBig)
    const asap = resultView(rules, answers({ need: 'prog', when: 'asap' }), solutions)
    expect(asap.whenNote).toBe(rules.whenNotes.asap)
  })
})

describe('Software wizard preview', () => {
  it('is idle before a need and for „opisz po swojemu”', () => {
    expect(previewOf(rules, EMPTY_ANSWERS).kind).toBe('idle')
    expect(previewOf(rules, answers({ own: true })).kind).toBe('idle')
  })

  it('50: hotel site with languages, booking and cards; 3-item menu at Standard', () => {
    const preview = previewOf(rules, answers({ need: 'firm', options: ['nocleg'] }))
    if (preview.kind !== 'www') throw new Error(preview.kind)
    expect(preview.brand[0]).toBe('Twój Pensjonat')
    expect(preview.features).toEqual(expect.arrayContaining(['lang', 'booking', 'cards']))
    expect(preview.features).not.toContain('map')
    expect(preview.navs).toEqual(['Oferta', 'O nas', 'Kontakt'])
  })

  it('a business card has a map and no menu; unknown answers use the default brand', () => {
    const preview = previewOf(rules, answers({ need: 'wiz' }))
    if (preview.kind !== 'www') throw new Error(preview.kind)
    expect(preview.features).toEqual(['map'])
    expect(preview.navs).toEqual([])
    expect(preview.brand[0]).toBe('Twoja Firma')
  })

  it('51: orders system view; 52: chosen problems before and after', () => {
    const sys = previewOf(rules, answers({ need: 'prog', options: ['zlec'] }))
    expect(sys.kind === 'sys' && sys.view.t).toBe('Zlecenia · ten tydzień')
    const odsw = previewOf(rules, answers({ need: 'odsw', options: ['google'] }))
    expect(odsw.kind === 'odsw' && odsw.issues).toEqual([
      ['nikt jej nie znajduje', 'gotowa pod Google i AI'],
    ])
    const empty = previewOf(rules, answers({ need: 'odsw' }))
    expect(empty.kind === 'odsw' && empty.issues).toHaveLength(3)
  })

  it('app and automation views follow the answers, else the defaults', () => {
    const app = previewOf(rules, answers({ need: 'app', options: ['klienci'] }))
    expect(app.kind === 'app' && app.view.t).toBe('Twój Pensjonat')
    const auto = previewOf(rules, answers({ need: 'auto', options: ['ai'] }))
    expect(auto.kind === 'auto' && auto.actions).toEqual(['Odpowiedź na zapytanie, PL · EN · DE'])
    const autoDefault = previewOf(rules, answers({ need: 'auto' }))
    expect(autoDefault.kind === 'auto' && autoDefault.actions).toHaveLength(3)
  })
})

describe('Software wizard URL parameters', () => {
  it('?potrzeba= opens step 2, with ?firma= step 3', () => {
    expect(parseWizardParams(rules, { potrzeba: 'prog' })).toMatchObject({
      step: 1,
      answers: { need: 'prog' },
    })
    expect(parseWizardParams(rules, { potrzeba: 'firm', firma: 'nocleg' })).toMatchObject({
      step: 2,
      answers: { need: 'firm', options: ['nocleg'] },
    })
  })

  it('?firma= alone picks the first need that asks for the kind of business', () => {
    expect(parseWizardParams(rules, { firma: 'bud' })).toMatchObject({
      step: 2,
      answers: { need: 'firm', options: ['bud'] },
    })
  })

  it('?tryb=opis starts „opisz po swojemu”; unknown values are ignored', () => {
    expect(parseWizardParams(rules, { tryb: 'opis' })).toMatchObject({
      step: 3,
      answers: { own: true },
    })
    expect(parseWizardParams(rules, { potrzeba: 'nie-ma', firma: 'x' })).toEqual({
      step: 0,
      answers: EMPTY_ANSWERS,
    })
    expect(parseWizardParams(rules, { potrzeba: 'prog', firma: 'nocleg' })).toMatchObject({
      step: 1,
      answers: { need: 'prog', options: [] },
    })
  })
})

describe('Software wizard answers on the server', () => {
  const sent = {
    need: 'firm',
    own: false,
    options: ['nocleg'],
    size: 'std',
    have: 'stara',
    url: '',
    when: 'zima',
    description: 'Goście dzwonią o wolne pokoje.',
    checklist: ['Logo'],
    contactPref: 'mail',
  }

  it('accepts answers that fit the rules', () => {
    expect(parseSoftwareAnswers(rules, sent)).toMatchObject({ need: 'firm', options: ['nocleg'] })
  })

  it.each([
    ['an unknown need', { need: 'nie-ma' }],
    ['an option of another need', { options: ['zlec'] }],
    ['two answers to a single question', { options: ['nocleg', 'gastro'] }],
    ['an unknown size', { size: 'xl' }],
    ['a chip of another set', { have: 'excel' }],
    ['an unknown term', { when: 'jutro' }],
    ['a checklist item of another result', { checklist: ['Excel'] }],
    ['an unknown contact preference', { contactPref: 'fax' }],
    ['no need without „opisz po swojemu”', { need: null }],
    ['an address for a need without the field', { url: 'stara.pl' }],
  ])('rejects %s', (_name, patch) => {
    expect(parseSoftwareAnswers(rules, { ...sent, ...patch })).toBeNull()
  })

  it('accepts „opisz po swojemu” without a need', () => {
    expect(
      parseSoftwareAnswers(rules, {
        ...sent,
        need: null,
        own: true,
        options: [],
        have: null,
        checklist: [],
      }),
    ).toMatchObject({ own: true, need: null })
  })

  it('names everything for people and writes the message', () => {
    const parsed = parseSoftwareAnswers(rules, sent)
    if (!parsed) throw new Error('rejected')
    const summary = wizardSummary(rules, parsed)
    expect(summary).toMatchObject({
      Potrzeba: 'Strona firmowa',
      Szczegóły: ['Pensjonat, hotel, apartamenty'],
      Zakres: 'Standard',
      'Co już masz?': 'Starą stronę',
      'Na kiedy?': 'Przed sezonem zimowym',
      Polecamy: 'Strona dla pensjonatu lub hotelu',
      'Już mam': ['Logo'],
      'Jak wolisz rozmawiać?': 'E-mail',
    })
    const message = wizardMessage(rules, parsed)
    expect(message).toContain('Kreator: Strona dla pensjonatu lub hotelu (Standard)')
    expect(message).toContain('Goście dzwonią o wolne pokoje.')
  })
})

describe('fillWizardTexts', () => {
  it('fills facts in every text and empties a text that cannot be shown', () => {
    const filled = fillWizardTexts(rules, (text) =>
      text.includes('[CZAS ODPOWIEDZI]') ? text.replace('[CZAS ODPOWIEDZI]', '1 dnia') : null,
    )
    expect(filled.send.note).toContain('Odpowiadamy w ciągu 1 dnia.')
    expect(filled.whenNotes.zimaSmall).toBe('')
    // Only texts with a bracket go through `fill`; plain labels stay as they are.
    expect(filled.needs.firm?.n).toBe('Strona firmowa')
  })
})

describe('order of the needs', () => {
  it('follows needOrder, not the key order the database returns', () => {
    const shuffled = { ...rules, needs: Object.fromEntries(Object.entries(rules.needs).reverse()) }
    expect(orderedNeeds(shuffled).map(([id]) => id)).toEqual(rules.needOrder)
    expect(parseWizardParams(shuffled, { firma: 'bud' }).answers.need).toBe('firm')
    const sys = previewOf(
      { ...shuffled, systemViews: Object.fromEntries(Object.entries(rules.systemViews).reverse()) },
      answers({ need: 'prog' }),
    )
    expect(sys.kind === 'sys' && sys.view.t).toBe('Zlecenia · ten tydzień')
  })
})
