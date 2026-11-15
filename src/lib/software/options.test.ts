import { describe, expect, it } from 'vitest'

import branze from '../../../seed/prokomsoftware/branze.json'
import obszary from '../../../seed/prokomsoftware/obszary.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { SOFTWARE_INDUSTRIES } from '../../seed/software/industries'
import {
  AREA_KEYS,
  INDUSTRY_GROUPS,
  SITUATIONS,
  SOLUTION_CATEGORIES,
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

  it('has the industries of the wizard and the showroom, with their names', () => {
    const firms = SOFTWARE_INDUSTRIES.map((industry) => ({
      label: industry.name,
      value: industry.key,
    }))
    expect([...WIZARD_FIRMS]).toEqual(firms)
    expect(values(WIZARD_FIRMS)).toEqual(branze.wizardBusinessTypes.map((firm) => firm.id))
  })
})
