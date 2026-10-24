import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokombiznes/kreator.json'
import { validateWizard, wizardFromSeed, wizardSchema, type Wizard } from './wizard'

/** Short id of the package → slug of the product in the catalog (as the B2 import makes it). */
const SLUGS: Record<string, string> = {
  hx: 'posnet-thermal-hx-online',
  k10: 'elzab-k10-online',
  temo: 'posnet-temo-online',
  neo: 'posnet-neo-online',
  ergo: 'posnet-ergo-online',
  gopos: 'gopos',
  d3: 'sunmi-d3-pro',
  pol: 'terminal-platniczy-polcard',
  optima: 'comarch-erp-optima',
  nexo: 'insert-subiekt-nexo',
  nfh: 'nfhotel',
  ksef: 'wdrozenie-ksef-w-firmie',
  tc: 'lenovo-thinkcentre',
  tp: 'lenovo-thinkpad-t14s-gen-6',
  u7: 'ubiquiti-unifi-u7-pro',
  nas: 'synology-nas',
  eset: 'eset-protect',
  avtek: 'monitory-interaktywne-avtek',
  opieka: 'opieka-informatyczna',
  euro: 'podpis-kwalifikowany-eurocert',
}

const fromSeed = () => wizardFromSeed(kreator, (id) => SLUGS[id]) as Wizard

describe('wizard rules', () => {
  it('accepts the rules made from the seed package', () => {
    const result = wizardSchema.safeParse(fromSeed())
    expect(result.error?.issues).toBeUndefined()
    expect(result.data?.businessTypes).toHaveLength(kreator.rodzaje_firm.length)
    expect(result.data?.includedServices.always).toEqual(kreator.uslugi_w_cenie.zawsze)
  })

  it('turns short ids and descriptions of the package into product slugs', () => {
    const { proposals } = fromSeed()
    expect(proposals.kasa).toMatchObject({
      gastro: 'posnet-thermal-hx-online',
      '*': 'posnet-ergo-online',
    })
    // „gopos (GoPOS na Sunmi D3 PRO)”, „nfhotel”, „thinkpad” — the package's descriptions.
    expect(proposals.pos?.gastro).toBe('gopos')
    expect(proposals.prog?.sklep).toBe('insert-subiekt-nexo')
    expect(proposals.hotel?.['*']).toBe('nfhotel')
    expect(proposals.komp).toEqual({
      szkola: 'lenovo-thinkcentre',
      '*': 'lenovo-thinkpad-t14s-gen-6',
    })
  })

  it('leaves out a proposal whose product is not in the catalog', () => {
    const rules = wizardFromSeed(kreator, (id) => (id === 'ergo' ? undefined : SLUGS[id])) as Wizard
    expect(rules.proposals.kasa?.['*']).toBeUndefined()
    expect(rules.proposals.kasa?.gastro).toBe('posnet-thermal-hx-online')
  })

  it('keeps the conditions of the board as data, not as text', () => {
    const rules = fromSeed()
    expect(rules.multiplyBySalesPoints).toEqual(['kasa', 'pos'])
    expect(rules.includedServices.rules).toContainEqual({
      needs: ['pos'],
      businessTypes: ['gastro'],
      text: 'Wgranie menu',
    })
    expect(rules.badges.map((badge) => badge.needs)).toEqual([['kasa'], ['ksef']])
    expect(rules.badges[0]).toMatchObject({ premises: 'nowy' })
  })

  it('treats an empty field as no rules yet', () => {
    expect(validateWizard(null)).toBe(true)
  })

  it('rejects a default need that does not exist', () => {
    const wizard = fromSeed()
    const result = validateWizard({
      ...wizard,
      defaultNeeds: { ...wizard.defaultNeeds, sklep: ['kasa', 'drukarka-3d'] },
    })
    expect(result).toContain('drukarka-3d')
    expect(result).toContain('defaultNeeds.sklep.1')
  })

  it('rejects a business type outside the fixed list (Industries.wizardBusinessType)', () => {
    const wizard = fromSeed()
    expect(
      validateWizard({
        ...wizard,
        businessTypes: [
          ...wizard.businessTypes,
          { id: 'kosmos', name: 'X', icon: 'plus', tone: 'blue' },
        ],
      }),
    ).not.toBe(true)
  })

  it('rejects unknown needs in proposals, services and badges, and a default outside the options', () => {
    const wizard = fromSeed()
    expect(
      validateWizard({ ...wizard, proposals: { ...wizard.proposals, teleport: {} } }),
    ).toContain('teleport')
    expect(
      validateWizard({
        ...wizard,
        badges: [...wizard.badges, { needs: ['drukarka-3d'], value: 'X', text: 'Y' }],
      }),
    ).toContain('drukarka-3d')
    expect(
      validateWizard({
        ...wizard,
        scale: { ...wizard.scale, salesPoints: { options: ['0', '1'], default: '7' } },
      }),
    ).not.toBe(true)
  })

  it('rejects the rules of the old format (B1) and anything that is not an object', () => {
    expect(
      validateWizard({ ...fromSeed(), badges: [{ when: 'kasa i nowy lokal', text: 'Ulga' }] }),
    ).not.toBe(true)
    expect(validateWizard('kreator')).not.toBe(true)
    expect(validateWizard([])).not.toBe(true)
  })
})
