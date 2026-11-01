import { describe, expect, it } from 'vitest'

import file from '../../../seed/prokombiznes/k4/konfigurator-k4.json'
import { k4Wizard, type K4WizardFile } from '../../seed/biznes/k4Wizard'
import { validateWizard, wizardSchema } from './wizard'

const rules = k4Wizard(file as unknown as K4WizardFile, (key) => key).wizard

describe('wizardSchema (Konfigurator 3.0, D-K4-4)', () => {
  it('accepts the rules of the package', () => {
    expect(validateWizard(rules)).toBe(true)
    expect(validateWizard(null)).toBe(true)
  })

  it('rejects the B10c kreator format — the seed then replaces it', () => {
    expect(wizardSchema.safeParse({ steps: [], businessTypes: [] }).success).toBe(false)
  })

  it('names the first problem for the panel', () => {
    const broken = { ...rules, presets: { ...rules.presets, sklep: ['teleport'] } }
    expect(validateWizard(broken)).toMatch(/^Reguły konfiguratora: presets\.sklep — .*teleport/)
  })

  it('requires the needs the engine adds and a product list for every need', () => {
    const withoutUps = {
      ...rules,
      needs: rules.needs.filter((need) => need.id !== 'ups'),
    }
    expect(validateWizard(withoutUps)).toMatch(/ups/)
    const { kasa: _kasa, ...recommendations } = rules.recommendations
    expect(validateWizard({ ...rules, recommendations })).toMatch(/kasa/)
  })

  it('checks the firms of questions, bundles and scenes', () => {
    expect(validateWizard({ ...rules, scenes: { ...rules.scenes, kosmos: 'sklep' } })).toMatch(
      /kosmos/,
    )
    expect(validateWizard({ ...rules, questions: { ...rules.questions, kosmos: [] } })).toMatch(
      /kosmos/,
    )
  })
})
