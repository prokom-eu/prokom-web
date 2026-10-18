import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokombiznes/kreator.json'
import { validateWizard, wizardFromSeed, wizardSchema } from './wizard'

const fromSeed = () => wizardFromSeed(kreator) as Record<string, unknown>

describe('wizard rules', () => {
  it('accepts the rules of the seed package', () => {
    const result = wizardSchema.safeParse(fromSeed())
    expect(result.error?.issues).toBeUndefined()
    expect(result.data?.businessTypes).toHaveLength(kreator.rodzaje_firm.length)
    expect(result.data?.includedServices.always).toEqual(kreator.uslugi_w_cenie.zawsze)
  })

  it('treats an empty field as no rules yet', () => {
    expect(validateWizard(null)).toBe(true)
  })

  it('rejects a default need that does not exist', () => {
    const wizard = fromSeed()
    const result = validateWizard({
      ...wizard,
      defaultNeeds: { ...(wizard.defaultNeeds as object), sklep: ['kasa', 'drukarka-3d'] },
    })
    expect(result).toContain('drukarka-3d')
    expect(result).toContain('defaultNeeds.sklep.1')
  })

  it('rejects a business type outside the fixed list (Industries.wizardBusinessType)', () => {
    const wizard = fromSeed()
    const types = wizard.businessTypes as object[]
    expect(
      validateWizard({ ...wizard, businessTypes: [...types, { id: 'kosmos', name: 'X' }] }),
    ).not.toBe(true)
  })

  it('rejects a proposal for an unknown need', () => {
    const wizard = fromSeed()
    const proposals = { ...(wizard.proposals as object), teleport: { '*': 'nic' } }
    expect(validateWizard({ ...wizard, proposals })).toContain('teleport')
  })

  it('rejects anything that is not an object', () => {
    expect(validateWizard('kreator')).not.toBe(true)
    expect(validateWizard([])).not.toBe(true)
  })
})
