import { describe, expect, it } from 'vitest'

import { solutionData, solutionsToImport } from '../../seed/software/map'
import {
  findLevelSolution,
  levelAccusative,
  levelPlans,
  pricingTabs,
  type PricingSolution,
} from './pricing'
import { DEFAULT_PRICE_DISPLAY } from './solutionsIndex'

const NBSP = String.fromCharCode(0xa0)
const nb = (text: string) => text.replace(/ /g, NBSP)

const solutions: PricingSolution[] = solutionsToImport()
  .map(solutionData)
  .map((item) => ({
    slug: item.slug,
    name: item.name,
    category: item.category,
    lead: item.lead ?? null,
    priceFrom: item.priceFrom ?? null,
    leadTime: item.leadTime ?? null,
    priceMonthly: item.priceMonthly ?? false,
    priceNote: item.priceNote ?? null,
    included: item.included ?? [],
    levels: item.levels ?? [],
    levelRows: item.levelRows ?? [],
  }))

describe('price list tabs (spec. §6.4, v22)', () => {
  const tabs = pricingTabs(solutions, DEFAULT_PRICE_DISPLAY)

  it('groups the 29 solutions of the package in the 5 tabs of the board', () => {
    expect(tabs.map((tab) => [tab.slug, tab.rows.length])).toEqual([
      ['strony', 8],
      ['systemy', 10],
      ['aplikacje', 3],
      ['automatyzacje', 5],
      ['opieka', 3],
    ])
  })

  it('one „od” price with its „od” term and „W cenie”', () => {
    const site = tabs[0]!.rows.find((row) => row.slug === 'strona-wizytowka')
    expect(site).toMatchObject({
      name: 'Strona wizytówka',
      price: nb('od 999 zł'),
      term: nb('od 1 tygodnia'),
      ask: false,
      included:
        'Jedna strona: oferta, telefon, mapa i formularz · Wygodna na telefonie · Gotowa pod Google',
    })
  })

  it('asks for a quote where there is no price, never „0 zł”', () => {
    const app = tabs[2]!.rows[0]!
    expect(app).toMatchObject({
      price: 'Zapytaj o wycenę',
      term: 'po krótkiej rozmowie',
      ask: true,
    })
    // „Zapytaj o wycenę” in the price note too: said once, not twice.
    expect(app.note).toBeNull()
  })

  it('care per month, the free audit as „0 zł”, the note kept', () => {
    const [care, takeover, audit] = tabs[4]!.rows
    expect(care).toMatchObject({ price: `${nb('od 149 zł')} / mies.` })
    expect(takeover?.note).toMatch(/^jednorazowo/)
    expect(audit).toMatchObject({ price: nb('0 zł'), term: `2${NBSP}dni robocze` })
  })

  it('names a tab as the block says, else as the catalog', () => {
    const named = pricingTabs(solutions, DEFAULT_PRICE_DISPLAY, { systemy: 'Systemy i panele' })
    expect(named.map((tab) => tab.name).slice(0, 2)).toEqual(['Strony', 'Systemy i panele'])
  })
})

describe('levels of care and audit', () => {
  it('finds care (per month) and the audit (once) among the solutions', () => {
    expect(findLevelSolution(solutions, 'care')?.slug).toBe('opieka-nad-strona-i-systemem')
    expect(findLevelSolution(solutions, 'audit')?.slug).toBe('audyt-strony-lub-programu')
  })

  it('care: price per month, reaction, what each level adds, the contact link', () => {
    const care = findLevelSolution(solutions, 'care')!
    const plans = levelPlans(care)
    expect(plans.map((plan) => [plan.name, plan.price, plan.period, plan.recommended])).toEqual([
      ['Podstawowa', nb('149 zł'), '/ mies.', false],
      ['Rozszerzona', nb('299 zł'), '/ mies.', true],
      ['Systemy', nb('790 zł'), '/ mies.', false],
    ])
    expect(plans[0]).toMatchObject({
      termLabel: 'Reakcja',
      term: 'do końca następnego dnia roboczego',
      href: '/kontakt?poziom=podstawowa',
      points: [
        'Serwer w Polsce i domena',
        'Kopia co noc i aktualizacje',
        'Eksport danych na żądanie',
      ],
    })
    expect(plans[1]?.points).toEqual([
      'Wszystko z Podstawowej',
      'Monitoring 24/7',
      'Drobne zmiany do 1 h w miesiącu',
      'Raport co miesiąc',
    ])
    expect(plans[2]?.points[0]).toBe('Wszystko z Rozszerzonej')
    expect(plans[2]?.href).toBe('/kontakt?poziom=systemy')
  })

  it('audit: one-off price, the term as „Wynik”, the free level „0 zł”', () => {
    const plans = levelPlans(findLevelSolution(solutions, 'audit')!)
    expect(plans.map((plan) => [plan.price, plan.period, plan.term])).toEqual([
      [nb('0 zł'), '', '2 dni robocze'],
      [nb('990 zł'), '', '1 tydzień'],
      [nb('1 990 zł'), '', '2 tygodnie'],
    ])
    expect(plans[0]?.termLabel).toBe('Wynik')
    expect(plans[2]?.points[0]).toBe('Wszystko z poziomu Pełny')
  })
})

describe('button of a care level (board „Zapytaj o opiekę Podstawową →”)', () => {
  it('declines the names in -a, keeps the others', () => {
    expect(['Podstawowa', 'Rozszerzona', 'Systemy'].map(levelAccusative)).toEqual([
      'Podstawową',
      'Rozszerzoną',
      'Systemy',
    ])
  })
})
