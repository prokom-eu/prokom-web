import { describe, expect, it } from 'vitest'

import kreatorV22 from '../../../../seed/prokomsoftware/kreator.json'
import rozwiazania from '../../../../seed/prokomsoftware/rozwiazania.json'
import { WIZARD_V3 } from '../../../seed/software/wizard'
import { softwareWizardSchema, validateSoftwareWizard, wizardSolutionSlugs } from './schema'

const clone = () => structuredClone(WIZARD_V3)
const issues = (value: unknown) =>
  softwareWizardSchema.safeParse(value).error?.issues.map((i) => i.path.join('.')) ?? []

describe('Software wizard v3 schema', () => {
  it('accepts the seed value', () => {
    expect(softwareWizardSchema.safeParse(WIZARD_V3).error?.issues).toBeUndefined()
  })

  it('rejects the v22 shape, so a stored old wizard is rewritten', () => {
    expect(validateSoftwareWizard(kreatorV22)).toMatch(/Reguły kreatora/)
  })

  it('keeps the v22 price display: the cards and the offer window read it too', () => {
    const { _info, ...v22 } = kreatorV22.priceDisplay
    expect(_info).toBeTruthy()
    expect(WIZARD_V3.priceDisplay).toEqual(v22)
  })

  it('prices only with published solutions of the package', () => {
    const slugs = new Set(rozwiazania.items.map((item) => item.slug))
    const used = wizardSolutionSlugs(WIZARD_V3)
    expect(used).toHaveLength(7)
    expect(used.filter((s) => !slugs.has(s))).toEqual([])
  })

  it('needs a price block for a kind without a solution', () => {
    const wizard = clone()
    const idk = wizard.types.find((type) => type.id === 'nie-wiem')
    if (idk) delete idk.noPrice
    expect(issues(wizard)).toContain('types.7.noPrice')
  })

  it('wants every group to start with the kind and the industry and end with the result', () => {
    const wizard = clone()
    wizard.groups.auto = ['type', 'auto', 'res']
    expect(issues(wizard)).toContain('groups.auto')
  })

  it('asks „Co ma umieć” only with options for every site kind', () => {
    const wizard = clone()
    delete wizard.options.featByType.landing
    expect(issues(wizard)).toContain('options.featByType.landing')
  })

  it('rejects tip and preview rules with unknown options or a variant of another mock-up', () => {
    const wizard = clone()
    wizard.tips[0] = { when: { has: { have: ['nic'] } }, text: 'x' }
    wizard.preview[0] = { kind: 'dash', variant: 'przebudowa' }
    expect(issues(wizard)).toEqual(
      expect.arrayContaining(['tips.0.when.has.have', 'preview.0.variant']),
    )
  })

  it('takes an industry variant only of the same mock-up', () => {
    const wizard = clone()
    wizard.preview[0] = { kind: 'site', variant: 'firmowa', fromIndustry: 'system' }
    expect(issues(wizard)).toContain('preview.0.fromIndustry')
  })

  it('wants a last tip and a last preview rule that always apply', () => {
    const wizard = clone()
    wizard.tips.push({ when: { groups: ['idk'] }, text: 'x' })
    expect(issues(wizard)).toContain('tips')
  })

  it('takes the exclusive option from its own pick', () => {
    const wizard = clone()
    wizard.exclusive = { have: 'domena-x' }
    expect(issues(wizard)).toContain('exclusive.have')
  })
})
