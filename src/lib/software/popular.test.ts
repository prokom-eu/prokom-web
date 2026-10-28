import { describe, expect, it } from 'vitest'

import { softwareSettingsData } from '../../seed/software/map'
import { homeSchema } from './home'
import { popularCards, popularTabs, visibleCards } from './popular'
import { buildSolutionsIndex } from './solutionsIndex'
import { solutionsSourceFromSeed } from './solutionsIndex.fixture'

const index = buildSolutionsIndex(solutionsSourceFromSeed())
const home = homeSchema.parse(softwareSettingsData().home)
const cards = popularCards(home.popular.order, index.solutions)

describe('„12 rzeczy” cards', () => {
  it('are the 12 cards of the package in its order, the last two generic', () => {
    expect(cards).toHaveLength(12)
    expect(cards[0]?.solution.slug).toBe('strona-wizytowka')
    expect(cards.slice(10).map((card) => card.solution.name)).toEqual([
      'Aplikacja na telefon',
      'Automatyzacje',
    ])
    expect(cards[10]).toMatchObject({
      generic: true,
      href: '/rozwiazania?kategoria=aplikacje',
      variants: [
        'Dla pracowników w terenie',
        'Dla klientów: rezerwacje, zamówienia',
        'Do programu, który już masz',
      ],
    })
  })

  it('take the fields of the „12 rzeczy” card over the catalog card', () => {
    const [first] = popularCards(
      ['strona-wizytowka'],
      [
        {
          ...index.solutions.find((solution) => solution.slug === 'strona-wizytowka')!,
          featured: { name: 'Wizytówka', features: ['Jedna strona'] },
        },
      ],
    )
    expect(first?.solution).toMatchObject({ name: 'Wizytówka', features: ['Jedna strona'] })
    expect(first?.solution.lead).toBeTruthy()
  })

  it('skip a slug that is not published in the tenant', () => {
    expect(popularCards(['nie-ma-takiego', 'strona-wizytowka'], index.solutions)).toHaveLength(1)
  })

  it('count the cards per tab and filter them by category', () => {
    const tabs = popularTabs(home.popular.tabs, cards)
    expect(tabs.map((tab) => [tab.key, tab.count])).toEqual([
      ['all', 12],
      ['www', 6],
      ['sys', 4],
      ['app', 1],
      ['auto', 1],
    ])
    expect(visibleCards(cards, 'sys').map((card) => card.solution.category)).toEqual([
      'systemy',
      'systemy',
      'systemy',
      'systemy',
    ])
    expect(visibleCards(cards, 'all')).toHaveLength(12)
  })

  it('drop a tab without cards (a solution unpublished in the panel)', () => {
    const withoutApps = cards.filter((card) => card.solution.category !== 'aplikacje')
    expect(popularTabs(home.popular.tabs, withoutApps).map((tab) => tab.key)).toEqual([
      'all',
      'www',
      'sys',
      'auto',
    ])
  })
})
