import { describe, expect, it } from 'vitest'

import { solutionData, solutionsToImport } from '../../seed/software/map'
import { findLevelSolution, levelAccusative, levelPlans, type PricingSolution } from './pricing'

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
