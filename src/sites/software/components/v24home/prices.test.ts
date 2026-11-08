import { describe, expect, it } from 'vitest'

import { buildSolutionsIndex } from '@/lib/software/solutionsIndex'
import { solutionsSourceFromSeed } from '@/lib/software/solutionsIndex.fixture'

import { pricingCards } from './prices'

const index = buildSolutionsIndex(solutionsSourceFromSeed())

const pricing = {
  eyebrow: 'Cennik',
  title: 'Cena i termin.',
  all: 'Wszystko',
  details: 'Szczegóły →',
  groups: [
    {
      label: 'Strony',
      solutions: ['strona-firmowa-z-panelem', 'nie-ma-takiego', 'strona-wizytowka'],
    },
    { label: 'Automatyzacje', solutions: ['asystent-ai-do-zapytan'] },
  ],
}

describe('pricingCards (ZMIANY-v24 §4.2, price list of the start page)', () => {
  const cards = pricingCards(pricing, index)

  it('keeps the order of the groups and of their solutions, skipping unknown ones', () => {
    expect(cards.map((card) => [card.group, card.slug])).toEqual([
      ['Strony', 'strona-firmowa-z-panelem'],
      ['Strony', 'strona-wizytowka'],
      ['Automatyzacje', 'asystent-ai-do-zapytan'],
    ])
  })

  it('takes the name, lead, price, term and mock-up from Solutions', () => {
    expect(cards[0]).toMatchObject({
      name: index.solutions.find((s) => s.slug === 'strona-firmowa-z-panelem')?.name,
      price: expect.stringMatching(/^od 2\s?490 zł/),
      term: 'od 2 tygodni',
      mockup: { kind: 'site', variant: 'firmowa' },
    })
  })

  it('asks for a quote when the solution has no price', () => {
    const ai = cards.find((card) => card.slug === 'asystent-ai-do-zapytan')
    expect(ai?.price).toBe(index.priceDisplay.fallback)
  })
})
