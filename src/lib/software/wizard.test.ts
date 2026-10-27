import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokomsoftware/kreator.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { isPreSw7Wizard, wizardSeed } from '../../seed/software/wizardExtras'
import { softwareWizardSchema, validateSoftwareWizard, wizardSolutionSlugs } from './wizard'

const seed = wizardSeed(kreator)
type Seed = typeof seed & Record<string, unknown>
const clone = () => structuredClone(seed) as Seed

describe('Software wizard schema', () => {
  it('accepts the seed value: the package (v20) with the SW7 rules', () => {
    expect(softwareWizardSchema.safeParse(seed).error?.issues).toBeUndefined()
  })

  it('rejects the package alone: its rules lived in the board script', () => {
    expect(validateSoftwareWizard(kreator)).toMatch(/Reguły kreatora/)
    expect(isPreSw7Wizard(kreator)).toBe(true)
    expect(isPreSw7Wizard(seed)).toBe(false)
    expect(isPreSw7Wizard(null)).toBe(false)
  })

  it('prices results only with solutions of the package, never removed ones', () => {
    const wizard = softwareWizardSchema.parse(seed)
    const slugs = new Set(rozwiazania.items.map((item) => item.slug))
    const removed = new Set(rozwiazania.removed.map((item) => item.slug))
    for (const slug of wizardSolutionSlugs(wizard)) {
      expect(slugs.has(slug), slug).toBe(true)
      expect(removed.has(slug), slug).toBe(false)
    }
  })

  it('rejects a mapping to an unknown result', () => {
    const value = clone()
    value.mapping = { ...value.mapping, wiz: 'nie-ma' }
    expect(validateSoftwareWizard(value)).toMatch(/mapping\.wiz.*nie-ma/)
  })

  it('rejects a mapping of an option to an unknown result', () => {
    const value = clone()
    value.mapping = { ...value.mapping, prog: { ...value.mapping.prog, zlec: 'nie-ma' } }
    expect(validateSoftwareWizard(value)).toMatch(/mapping\.prog\.zlec/)
  })

  it('needs a solution entry (or null) for every result', () => {
    const value = clone()
    const { pensjonat: _removed, ...rest } = value.resultToSolutionSlug
    value.resultToSolutionSlug = rest as typeof value.resultToSolutionSlug
    expect(validateSoftwareWizard(value)).toMatch(/resultToSolutionSlug\.pensjonat/)
  })

  it('keeps {cena} in the price templates', () => {
    const value = clone()
    value.priceDisplay = { ...value.priceDisplay, template: '2 490 zł netto' }
    expect(validateSoftwareWizard(value)).toMatch(/priceDisplay\.template/)
  })

  it('accepts only SVG path data as an icon', () => {
    const value = clone()
    value.icons = { ...value.icons, site: '<script>alert(1)</script>' }
    expect(validateSoftwareWizard(value)).toMatch(/icons\.site/)
  })

  it('has every size once', () => {
    const value = clone()
    value.sizes = [value.sizes[0], value.sizes[0], value.sizes[2]]
    expect(validateSoftwareWizard(value)).toMatch(/sizes\.1\.id/)
  })

  it('maps contact preferences only to values of the inquiry', () => {
    const value = clone()
    value.contactPrefs = [{ id: 'fax', n: 'Faks', inquiryValue: 'fax' }] as never
    expect(validateSoftwareWizard(value)).toMatch(/contactPrefs\.0\.inquiryValue/)
  })

  it('rejects a scope rule with a note missing in scopeNotes', () => {
    const value = clone()
    value.scopeRules = [{ when: [{ sizes: ['start'] }], note: 'nie-ma' }] as never
    expect(validateSoftwareWizard(value)).toMatch(/scopeRules.0.note/)
  })

  it('rejects conditions naming an unknown need or result', () => {
    const need = clone()
    need.bigWhen = [{ needs: ['nie-ma'] }]
    expect(validateSoftwareWizard(need)).toMatch(/bigWhen.0.needs/)
    const result = clone()
    result.scopeRules = [{ when: [{ results: ['nie-ma'] }], note: 'systemStart' }] as never
    expect(validateSoftwareWizard(result)).toMatch(/scopeRules.0.when.0.results/)
  })

  it('rejects a need pointing to an unknown set of chips', () => {
    const value = clone()
    value.needs = { ...value.needs, firm: { ...value.needs.firm, have: 'nie-ma' } } as never
    expect(validateSoftwareWizard(value)).toMatch(/needs.firm.have/)
  })

  it('needs a contact verb for the success steps', () => {
    const value = clone()
    value.contactPrefs = [{ id: 'tel', n: 'Telefon', inquiryValue: 'phone' }] as never
    expect(validateSoftwareWizard(value)).toMatch(/contactPrefs.0.verb/)
  })

  it('keeps {nr} in the sent label', () => {
    const value = clone()
    value.send = { ...value.send, sentLabel: 'Wysłane' }
    expect(validateSoftwareWizard(value)).toMatch(/send.sentLabel/)
  })
})
