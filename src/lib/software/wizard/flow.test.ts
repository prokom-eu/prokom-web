import { describe, expect, it } from 'vitest'

import { WIZARD_V3 as w } from '../../../seed/software/wizard'
import {
  canNext,
  chooseIndustry,
  chooseType,
  EMPTY_ANSWERS,
  parseParams,
  pickOptions,
  previewOf,
  prune,
  resultOf,
  shownAnswers,
  stepsOf,
  summaryOf,
  tipOf,
  toggle,
  type WizardAnswers,
  type WizardSolution,
} from './flow'

const typed = (type: string, more: Partial<WizardAnswers> = {}): WizardAnswers => ({
  ...chooseType(w, EMPTY_ANSWERS, type),
  ...more,
})
const ids = (list: { id: string }[]) => list.map((o) => o.id)

const SOLUTION: WizardSolution = {
  slug: 'strona-firmowa-z-panelem',
  name: 'Strona firmowa z panelem',
  priceFrom: 2490,
  leadTime: 'od 2 tygodni',
  priceMonthly: false,
  features: ['Oferta i realizacje', 'Panel po polsku', 'Gotowa pod Google', 'Czwarty punkt'],
}

describe('wizard v3 — steps of each group (ZMIANY-v24 §7.1)', () => {
  it.each([
    ['wizytowka', ['type', 'ind', 'have', 'feat', 'res']],
    ['landing', ['type', 'ind', 'have', 'feat', 'res']],
    ['przebudowa', ['type', 'ind', 'redo', 'fix', 'res']],
    ['system', ['type', 'ind', 'today', 'sysf', 'res']],
    ['automatyzacje', ['type', 'ind', 'auto', 'res']],
    ['nie-wiem', ['type', 'ind', 'desc', 'res']],
  ])('%s → %j', (type, steps) => {
    expect(stepsOf(w, typed(type))).toEqual(steps)
  })

  it('shows the steps of the first kind before anything is chosen', () => {
    expect(stepsOf(w, EMPTY_ANSWERS)).toEqual(['type', 'ind', 'have', 'feat', 'res'])
  })

  it('needs a kind to go on; every other step may be skipped', () => {
    expect(canNext('type', EMPTY_ANSWERS)).toBe(false)
    expect(canNext('type', typed('firmowa'))).toBe(true)
    expect(canNext('ind', typed('firmowa'))).toBe(true)
    expect(canNext('sysf', typed('system'))).toBe(true)
  })

  it('asks for the team size only in the system group, never for sites', () => {
    for (const type of w.types) {
      const asksSize = stepsOf(w, typed(type.id)).includes('sysf')
      expect([type.id, asksSize]).toEqual([type.id, type.group === 'sys'])
    }
  })
})

describe('wizard v3 — answers', () => {
  it('„Zaczynamy od zera” excludes the other things you have, and the other way round', () => {
    let a = typed('firmowa')
    a = toggle(w, a, 'have', 'domena')
    a = toggle(w, a, 'have', 'logo')
    expect(a.picks.have).toEqual(['domena', 'logo'])
    a = toggle(w, a, 'have', 'zero')
    expect(a.picks.have).toEqual(['zero'])
    a = toggle(w, a, 'have', 'teksty')
    expect(a.picks.have).toEqual(['teksty'])
    a = toggle(w, a, 'have', 'teksty')
    expect(a.picks.have).toEqual([])
  })

  it('offers the kind’s features plus 2 of the industry, without repeats', () => {
    const plain = ids(pickOptions(w, typed('wizytowka'), 'feat'))
    expect(plain).toEqual(['telefon', 'mapa', 'opinie', 'galeria'])
    const hotel = pickOptions(w, chooseIndustry(w, typed('wizytowka'), 'nocleg'), 'feat')
    expect(hotel.map((o) => o.label)).toEqual([
      'Telefon i formularz',
      'Mapa i godziny',
      'Opinie z Google',
      'Galeria zdjęć',
      'Zapytanie o termin bez prowizji portalu',
      'Pokoje z galerią i cenami',
    ])
    expect(ids(pickOptions(w, chooseIndustry(w, typed('wizytowka'), 'inna'), 'feat'))).toEqual(
      plain,
    )
  })

  it('a new industry drops the features of the previous one', () => {
    let a = chooseIndustry(w, typed('wizytowka'), 'nocleg')
    a = toggle(w, a, 'feat', 'nocleg-1')
    a = toggle(w, a, 'feat', 'mapa')
    a = chooseIndustry(w, a, 'gastro')
    expect(a.picks.feat).toEqual(['mapa'])
  })

  it('SEO is not an option of any step: it is in the price of every site', () => {
    const labels = [
      ...Object.values(w.options.featByType).flat(),
      ...w.options.have,
      ...w.industries.flatMap((i) => i.features),
    ].map((o) => o.label.toLowerCase())
    expect(labels.some((label) => label.includes('seo'))).toBe(false)
    expect(w.inPrice.items).toContain('podstawowe SEO')
  })

  it('a new kind drops the answers its group does not ask (team size only in sys)', () => {
    let a = typed('system', { size: '4-10', url: 'stara.pl' })
    a = toggle(w, a, 'sysf', 'czas')
    a = toggle(w, a, 'today', 'excel')
    a = chooseType(w, chooseIndustry(w, a, 'bud'), 'firmowa')
    expect(a.picks).toEqual({})
    expect(a.size).toBeNull()
    expect(a.url).toBe('')
    expect(a.industry).toBe('bud')
  })

  it('a new site kind keeps „Co już masz” but drops features the kind does not offer', () => {
    let a = typed('firmowa')
    a = toggle(w, a, 'have', 'logo')
    a = toggle(w, a, 'feat', 'jezyki')
    a = toggle(w, a, 'feat', 'oferta')
    a = chooseType(w, a, 'rozbudowana')
    expect(a.picks).toEqual({ have: ['logo'], feat: ['jezyki'] })
  })

  it('prune drops unknown ids and a description outside the idk group', () => {
    const a = prune(w, {
      ...typed('przebudowa'),
      picks: { fix: ['wolna', 'nic'], desc: ['excel'] },
      description: 'x',
    })
    expect(a.picks).toEqual({ fix: ['wolna'] })
    expect(a.description).toBe('')
  })
})

describe('wizard v3 — summary, tip and preview (aurora.js)', () => {
  it('summarises the choices of the group as chips', () => {
    let a = chooseIndustry(w, typed('system'), 'bud')
    a = toggle(w, a, 'today', 'excel')
    a = toggle(w, a, 'sysf', 'czas')
    a = toggle(w, a, 'sysf', 'raporty')
    a = { ...a, size: '4-10' }
    expect(summaryOf(w, a)).toEqual([
      { label: 'Branża', values: ['Budowlanka i remonty'] },
      { label: 'Dziś', values: ['Excel i arkusze'] },
      { label: 'System ma', values: ['Czas pracy', 'Raporty dla szefa'] },
      { label: 'Użytkownicy', values: ['4–10 osób'] },
    ])
  })

  it.each<[string, WizardAnswers, RegExp]>([
    ['site from scratch', toggle(w, typed('firmowa'), 'have', 'zero'), /^Zaczynamy od zera\?/],
    ['site without texts', toggle(w, typed('firmowa'), 'have', 'logo'), /^Nie masz tekstów\?/],
    ['hotel site', chooseIndustry(w, typed('wizytowka'), 'nocleg'), /obiektu noclegowego/],
    ['landing', typed('landing'), /^Landing najlepiej/],
    ['site', typed('rozbudowana'), /^W cenie każdej strony/],
    ['redo + Google', toggle(w, typed('przebudowa'), 'fix', 'google'), /darmowego audytu/],
    ['redo, no access', toggle(w, typed('przebudowa'), 'redo', 'dostepy'), /Odzyskamy dostęp/],
    ['redo', typed('przebudowa'), /^Stare adresy/],
    ['sys + program', toggle(w, typed('system'), 'today', 'program'), /da się rozbudować/],
    ['small team', typed('system', { size: '1-3' }), /jeden moduł/],
    ['sys', typed('system', { size: '30-plus' }), /najbardziej boli/],
    ['AI', toggle(w, typed('automatyzacje'), 'auto', 'ai'), /Asystent AI/],
    ['auto', typed('automatyzacje'), /testujemy na Twoich danych/],
    ['idk', typed('nie-wiem'), /Nie musisz znać nazw/],
    ['nothing chosen', EMPTY_ANSWERS, /^Po 5–7 dniach/],
  ])('tip: %s', (_, answers, tip) => {
    expect(tipOf(w, answers)).toMatch(tip)
  })

  it.each<[string, WizardAnswers, { kind: string; variant: string }]>([
    ['firmowa', typed('firmowa'), { kind: 'site', variant: 'firmowa' }],
    ['wizytowka', typed('wizytowka'), { kind: 'site', variant: 'wizytowka' }],
    ['rozbudowana', typed('rozbudowana'), { kind: 'site', variant: 'rozbudowana' }],
    [
      'site + industry',
      chooseIndustry(w, typed('rozbudowana'), 'gastro'),
      { kind: 'site', variant: 'restauracja' },
    ],
    [
      'landing + industry',
      chooseIndustry(w, typed('landing'), 'gastro'),
      { kind: 'site', variant: 'landing' },
    ],
    ['redo', typed('przebudowa'), { kind: 'before', variant: 'przebudowa' }],
    ['sys', typed('system'), { kind: 'dash', variant: 'zamowienia' }],
    [
      'sys + industry',
      chooseIndustry(w, typed('system'), 'bud'),
      { kind: 'dash', variant: 'czas' },
    ],
    ['auto', typed('automatyzacje'), { kind: 'flow', variant: 'sms' }],
    [
      'auto: invoices',
      toggle(w, typed('automatyzacje'), 'auto', 'faktury'),
      { kind: 'flow', variant: 'faktury' },
    ],
    [
      'auto: AI wins',
      toggle(w, toggle(w, typed('automatyzacje'), 'auto', 'faktury'), 'auto', 'ai'),
      { kind: 'flow', variant: 'ai' },
    ],
  ])('preview: %s', (_, answers, preview) => {
    expect(previewOf(w, answers)).toEqual(preview)
  })
})

describe('wizard v3 — before a kind is chosen', () => {
  it('the live card shows the default kind (board: Strona firmowa), not ticked', () => {
    const shown = shownAnswers(w, EMPTY_ANSWERS)
    expect(shown.type).toBe('firmowa')
    expect(previewOf(w, shown)).toEqual({ kind: 'site', variant: 'firmowa' })
    expect(tipOf(w, shown)).toMatch(/^W cenie każdej strony/)
    expect(shownAnswers(w, typed('system')).type).toBe('system')
  })

  it('without a default kind the first one stands in', () => {
    const { defaultType: _none, ...rules } = w
    expect(shownAnswers(rules, EMPTY_ANSWERS).type).toBe('wizytowka')
  })
})

describe('wizard v3 — result', () => {
  const solutions = new Map([[SOLUTION.slug, SOLUTION]])

  it('takes the price, the term and 3 points from the kind’s solution', () => {
    expect(resultOf(w, typed('firmowa'), solutions)).toEqual({
      name: 'Strona firmowa',
      solution: 'strona-firmowa-z-panelem',
      price: expect.stringMatching(/^od 2\s490\szł$/),
      priceSub: 'netto · stała cena za zakres',
      term: 'od 2 tygodni',
      points: ['Oferta i realizacje', 'Panel po polsku', 'Gotowa pod Google'],
      ask: false,
    })
  })

  it('asks for a quote when the solution has no price or is not published', () => {
    const result = resultOf(w, typed('automatyzacje'), solutions)
    expect(result).toMatchObject({ solution: 'asystent-ai-do-zapytan', ask: true })
    expect(result.price).toBe(w.priceDisplay.noPrice.price)
    expect(result.term).toBe(w.priceDisplay.noPrice.term)
  })

  it('„Nie wiem jeszcze” has no solution: a free 30-minute talk', () => {
    expect(resultOf(w, typed('nie-wiem'), solutions)).toMatchObject({
      solution: null,
      price: '0 zł za rozmowę',
      term: 'rozmowa 30 min',
      ask: false,
    })
  })
})

describe('wizard v3 — links (?firma=, ?rodzaj=, ?tryb=opis)', () => {
  it('?firma= from the showroom chooses the industry and stays on the kind', () => {
    expect(parseParams(w, { firma: 'bud' })).toEqual({
      answers: { ...EMPTY_ANSWERS, industry: 'bud' },
      step: 0,
    })
  })

  it('?rodzaj= chooses the kind and opens the industry step', () => {
    const { answers, step } = parseParams(w, { rodzaj: 'system', firma: 'gastro' })
    expect(answers.type).toBe('system')
    expect(answers.industry).toBe('gastro')
    expect(step).toBe(1)
  })

  it('?tryb=opis opens the description of „Nie wiem jeszcze”', () => {
    const { answers, step } = parseParams(w, { tryb: 'opis' })
    expect(answers.type).toBe('nie-wiem')
    expect(stepsOf(w, answers)[step]).toBe('desc')
  })

  it('ignores unknown values and lists', () => {
    expect(parseParams(w, { firma: 'x', rodzaj: ['system'] })).toEqual({
      answers: EMPTY_ANSWERS,
      step: 0,
    })
  })
})
