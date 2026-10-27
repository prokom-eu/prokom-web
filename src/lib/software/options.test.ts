import { describe, expect, it } from 'vitest'

import branze from '../../../seed/prokomsoftware/branze.json'
import kreator from '../../../seed/prokomsoftware/kreator.json'
import obszary from '../../../seed/prokomsoftware/obszary.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import {
  AREA_KEYS,
  CARD_GRADIENTS,
  INDUSTRY_GROUPS,
  SITUATIONS,
  SOLUTION_CATEGORIES,
  SOLUTION_SIZES,
  WIZARD_FIRMS,
} from './options'

const values = (options: readonly { value: string }[]) => options.map((option) => option.value)

describe('Software options match the seed package (v20)', () => {
  it('has every category of the solutions', () => {
    const used = new Set(rozwiazania.items.map((item) => item.category))
    expect([...used].sort()).toEqual(values(SOLUTION_CATEGORIES).sort())
  })

  it('has every situation', () => {
    expect(values(SITUATIONS)).toEqual(Object.keys(rozwiazania.situations))
  })

  it('has the industry groups in the seed order', () => {
    expect(values(INDUSTRY_GROUPS)).toEqual(branze.groups.map((group) => group.slug))
    for (const item of rozwiazania.items)
      for (const group of item.industryGroups) expect(values(INDUSTRY_GROUPS)).toContain(group)
  })

  it('has every area key', () => {
    expect(values(AREA_KEYS).sort()).toEqual(obszary.items.map((area) => area.key).sort())
  })

  it('has one card gradient key per gradient of the seed', () => {
    const used = new Set(rozwiazania.items.map((item) => item.cardGradient).filter(Boolean))
    expect(used.size).toBe(CARD_GRADIENTS.length)
  })

  it('has the wizard sizes', () => {
    expect([...SOLUTION_SIZES]).toEqual(kreator.sizes.map((size) => size.id))
  })

  it('has the kinds of business of the wizard, with their names', () => {
    const firms = kreator.needs.firm.o.map((firm) => ({ label: firm.n, value: firm.id }))
    expect([...WIZARD_FIRMS]).toEqual(firms)
    expect(values(WIZARD_FIRMS)).toEqual(branze.wizardBusinessTypes.map((firm) => firm.id))
  })
})
