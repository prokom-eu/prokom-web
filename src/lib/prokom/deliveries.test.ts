import { describe, expect, it } from 'vitest'

import cooperationFile from '../../../seed/prokomeu/model/Wspolpraca.json'
import deliveriesFile from '../../../seed/prokomeu/model/Dostawy.json'
import { cooperationSchema, validateCooperation } from './cooperation'
import { deliveriesSchema, MAX_QTY, validateDeliveries } from './deliveries'

// `_zrodlo` documents the file; the panel value has no such key (the schemas are strict).
const { _zrodlo: _d, ...deliveriesModel } = deliveriesFile
const { _zrodlo: _c, ...cooperationModel } = cooperationFile

const deliveries = deliveriesSchema.parse(deliveriesModel)
const cooperation = cooperationSchema.parse(cooperationModel)

describe('deliveries model of board 17 (spec §6.5)', () => {
  it('6 segments, 3 list groups, 9 objects, 3 levels, 5 tabs, 7 questions', () => {
    expect(deliveries.segments.map((s) => s.name)).toEqual([
      'Firma',
      'Instytucja',
      'Hotel i pensjonat',
      'Inwestor',
      'Deweloper',
      'Architekt',
    ])
    expect(deliveries.listGroups.map((g) => g.title)).toEqual([
      'Sprzęt IT',
      'RTV i AGD dla firm',
      'Instalacje',
    ])
    expect(deliveries.objects).toHaveLength(9)
    expect(deliveries.levels).toHaveLength(3)
    expect(deliveries.prepTabs).toHaveLength(5)
    expect(deliveries.faq).toHaveLength(7)
    expect(deliveries.services).toHaveLength(6)
    expect(deliveries.terms).toHaveLength(4)
  })

  it('RTV and AGD go without assembly, only for companies (spec §3)', () => {
    const agd = deliveries.listGroups.find((group) => group.key === 'agd')
    expect(agd?.note).toMatch(/bez montażu/)
    expect(agd?.note).toMatch(/firm i instytucji/)
  })

  it('every preset quantity fits the list (1–999)', () => {
    for (const object of deliveries.objects) {
      for (const row of object.preset) expect(row.qty).toBeLessThanOrEqual(MAX_QTY)
    }
  })

  it('refuses a preset of an item that is not on the list', () => {
    const broken = structuredClone(deliveriesModel)
    broken.objects[0]!.preset.push({ item: 'nieznany', qty: 1 })
    expect(validateDeliveries(broken)).toMatch(/„nieznany” nie ma na liście zapytania/)
  })

  it('refuses a column item without a quantity in the example', () => {
    const broken = structuredClone(deliveriesModel)
    broken.objects[0]!.preset = broken.objects[0]!.preset.filter((row) => row.item !== 'tv')
    expect(validateDeliveries(broken)).toMatch(/„tv” nie ma ilości w przykładzie/)
  })

  it('refuses a board file as a link and a quantity over 999', () => {
    const link = structuredClone(deliveriesModel)
    link.segments[0]!.cta.href = 'DlaFirm.dc.html'
    expect(validateDeliveries(link)).toMatch(/segments\.0\.cta\.href/)
    const qty = structuredClone(deliveriesModel)
    qty.objects[0]!.preset[0]!.qty = 1000
    expect(validateDeliveries(qty)).not.toBe(true)
  })

  it('refuses a protocol-relative link and an unknown top-level key', () => {
    const link = structuredClone(deliveriesModel)
    link.segments[0]!.cta.href = '//example.com'
    expect(validateDeliveries(link)).toMatch(/segments\.0\.cta\.href/)
    expect(validateDeliveries({ ...deliveriesModel, notes: 'literówka' })).not.toBe(true)
  })

  it('an empty value is fine until the page is filled', () => {
    expect(validateDeliveries(null)).toBe(true)
  })
})

describe('cooperation model of board 16 (spec §6.6)', () => {
  it('6 roles, 5 stages, 3 scope tabs, 6 rules, 6 questions', () => {
    expect(cooperation.roles.map((r) => r.key)).toEqual([
      'architekt',
      'projektant-wnetrz',
      'deweloper',
      'wykonawca',
      'instytucja',
      'dostawca',
    ])
    expect(cooperation.stages).toHaveLength(5)
    expect(cooperation.scopes).toHaveLength(3)
    expect(cooperation.rules).toHaveLength(6)
    expect(cooperation.faq).toHaveLength(6)
  })

  it('refuses two roles with one key', () => {
    const broken = structuredClone(cooperationModel)
    broken.roles[1]!.key = broken.roles[0]!.key
    expect(validateCooperation(broken)).toMatch(/Rola „architekt” jest dwa razy/)
  })
})

describe('content rules of both pages (spec §3)', () => {
  const all = JSON.stringify([deliveriesModel, cooperationModel])
  it('no prices, financing or WhatsApp; no phone numbers in the texts', () => {
    expect(all).not.toMatch(/(?<!\p{L})(zł|rat[yaę]?)(?!\p{L})|whatsapp|leasing|gratis|w cenie/iu)
    expect(all).not.toMatch(/\d{3} \d{3} \d{3}/)
  })
})
