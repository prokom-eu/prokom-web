import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokomsoftware/kreator.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { softwareWizardSchema, validateSoftwareWizard, wizardSolutionSlugs } from './wizard'

type Seed = typeof kreator & Record<string, unknown>
const clone = () => structuredClone(kreator) as Seed

describe('Software wizard schema', () => {
  it('accepts the seed package (v20)', () => {
    expect(softwareWizardSchema.safeParse(kreator).error?.issues).toBeUndefined()
  })

  it('prices results only with solutions of the package, never removed ones', () => {
    const wizard = softwareWizardSchema.parse(kreator)
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
})
