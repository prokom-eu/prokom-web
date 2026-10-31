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
  it('are the 12 solutions of the package in its order, no generic cards (v22)', () => {
    expect(cards).toHaveLength(12)
    expect(cards[0]?.slug).toBe('strona-wizytowka')
    expect(cards.slice(10).map((card) => card.slug)).toEqual([
      'aplikacja-dla-ekip-w-terenie',
      'powiadomienia-sms-i-e-mail',
    ])
  })

  it('carry the catalog card as it is (name, lead, price, term)', () => {
    const solution = index.solutions.find((item) => item.slug === 'strona-wizytowka')
    expect(popularCards(['strona-wizytowka'], index.solutions)[0]).toBe(solution)
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
    expect(visibleCards(cards, 'sys').map((card) => card.category)).toEqual([
      'systemy',
      'systemy',
      'systemy',
      'systemy',
    ])
    expect(visibleCards(cards, 'all')).toHaveLength(12)
  })

  it('drop a tab without cards (a solution unpublished in the panel)', () => {
    const withoutApps = cards.filter((card) => card.category !== 'aplikacje')
    expect(popularTabs(home.popular.tabs, withoutApps).map((tab) => tab.key)).toEqual([
      'all',
      'www',
      'sys',
      'auto',
    ])
  })
})
