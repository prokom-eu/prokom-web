import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokomsoftware/kreator.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { isPreV22Wizard, wizardSeed } from '../../seed/software/wizardExtras'
import { softwareWizardSchema, validateSoftwareWizard, wizardSolutionSlugs } from './wizard'

const seed = wizardSeed(kreator)
type Seed = typeof seed & Record<string, unknown>
const clone = () => structuredClone(seed) as Seed

describe('Software wizard schema', () => {
  it('accepts the seed value: the v22 package with the board-script rules', () => {
    expect(softwareWizardSchema.safeParse(seed).error?.issues).toBeUndefined()
  })

  it('rejects the package alone: its rules lived in the board script', () => {
    expect(validateSoftwareWizard(kreator)).toMatch(/Reguły kreatora/)
    expect(isPreV22Wizard(kreator)).toBe(true)
    expect(isPreV22Wizard(seed)).toBe(false)
    expect(isPreV22Wizard(null)).toBe(false)
  })

  it('treats a stored wizard with sizes (the SW7 shape) as old', () => {
    expect(isPreV22Wizard({ ...clone(), sizes: [] })).toBe(true)
    expect(validateSoftwareWizard({ ...clone(), sizes: [] })).toMatch(/Reguły kreatora/)
  })

  it('prices results and add-ons only with solutions of the package, never removed ones', () => {
    const wizard = softwareWizardSchema.parse(seed)
    const slugs = new Set(rozwiazania.items.map((item) => item.slug))
    const removed = new Set(rozwiazania.removed.map((item) => item.slug))
    const used = wizardSolutionSlugs(wizard)
    expect(used).toContain('powiadomienia-sms-i-e-mail')
    expect(used).toContain('sklep-internetowy')
    for (const slug of used) {
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

  it('maps contact preferences only to values of the inquiry', () => {
    const value = clone()
    value.contactPrefs = [{ ...value.contactPrefs[0]!, inquiryValue: 'fax' }] as never
    expect(validateSoftwareWizard(value)).toMatch(/contactPrefs\.0\.inquiryValue/)
  })

  it('rejects a scope rule with a note missing in scopeNotes', () => {
    const value = clone()
    value.scopeRules = [{ when: [{ results: ['pensjonat'] }], note: 'nie-ma' }]
    expect(validateSoftwareWizard(value)).toMatch(/scopeRules\.0\.note/)
  })

  it('rejects conditions naming an unknown need, result, chip or term', () => {
    const need = clone()
    need.bigWhen = [{ needs: ['nie-ma'] }]
    expect(validateSoftwareWizard(need)).toMatch(/bigWhen\.0\.needs/)
    const result = clone()
    result.scopeRules = [{ when: [{ results: ['nie-ma'] }], note: 'pensjonat' }]
    expect(validateSoftwareWizard(result)).toMatch(/scopeRules\.0\.when\.0\.results/)
    const have = clone()
    have.honest = [{ when: [{ haves: ['nie-ma'] }], text: 'x' }] as never
    expect(validateSoftwareWizard(have)).toMatch(/honest\.0\.when\.0\.haves/)
    const when = clone()
    when.recommend = [{ when: [{ whens: ['nie-ma'] }], text: 'x' }] as never
    expect(validateSoftwareWizard(when)).toMatch(/recommend\.0\.when\.0\.whens/)
  })

  it('rejects the scope of an unknown result', () => {
    const value = clone()
    value.scope = { ...value.scope, nieMa: { included: ['x'], moreExamples: [] } } as never
    expect(validateSoftwareWizard(value)).toMatch(/scope\.nieMa/)
  })

  it('rejects add-on rules naming an unknown add-on and add-ons with an unknown icon', () => {
    const rule = clone()
    rule.addOns = { ...rule.addOns, rules: [{ when: [{}], items: ['nie-ma'] }] }
    expect(validateSoftwareWizard(rule)).toMatch(/addOns\.rules\.0\.items/)
    const icon = clone()
    const [first, ...rest] = icon.addOns.items
    icon.addOns = { ...icon.addOns, items: [{ ...first!, icon: 'nie-ma' }, ...rest] }
    expect(validateSoftwareWizard(icon)).toMatch(/addOns\.items\.0\.icon/)
  })

  it('switches the shop hint only between known results', () => {
    const value = clone()
    value.shopHint = { ...value.shopHint, toShop: { ...value.shopHint.toShop, result: 'nie-ma' } }
    expect(validateSoftwareWizard(value)).toMatch(/shopHint\.toShop\.result/)
  })

  it('rejects a winter deadline that is not a day of the year', () => {
    const value = clone()
    value.winterDeadline = { day: 31, month: 11 }
    expect(validateSoftwareWizard(value)).toMatch(/winterDeadline/)
  })

  it('rejects a need pointing to an unknown set of chips', () => {
    const value = clone()
    value.needs = { ...value.needs, firm: { ...value.needs.firm, have: 'nie-ma' } } as never
    expect(validateSoftwareWizard(value)).toMatch(/needs\.firm\.have/)
  })

  it('needs a contact verb for the success steps', () => {
    const value = clone()
    const { verb: _verb, ...noVerb } = value.contactPrefs[0]!
    value.contactPrefs = [noVerb] as never
    expect(validateSoftwareWizard(value)).toMatch(/contactPrefs\.0\.verb/)
  })

  it('needs the texts of every contact field a preference asks for, and known trust icons', () => {
    const field = clone()
    const { phone: _phone, ...contact } = field.send.contact
    field.send = { ...field.send, contact } as never
    expect(validateSoftwareWizard(field)).toMatch(/send\.contact\.phone/)
    const trust = clone()
    trust.send = { ...trust.send, trust: [{ icon: 'nie-ma', text: 'x' }] }
    expect(validateSoftwareWizard(trust)).toMatch(/send\.trust\.0\.icon/)
  })

  it('keeps {imie} in the success title', () => {
    const value = clone()
    value.send = { ...value.send, success: { ...value.send.success, title: 'Dziękujemy.' } }
    expect(validateSoftwareWizard(value)).toMatch(/send\.success\.title/)
  })

  it('keeps {nr} in the sent label', () => {
    const value = clone()
    value.send = { ...value.send, sentLabel: 'Wysłane' }
    expect(validateSoftwareWizard(value)).toMatch(/send\.sentLabel/)
  })
})
