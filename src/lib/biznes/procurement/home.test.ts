import { describe, expect, it } from 'vitest'

import {
  buildProcurementHome,
  calculatorTypes,
  resultLabel,
  validateProcurementHome,
  type HomePage,
} from './home'

const PAGE_TYPES = [
  { slug: 'kawalerka', items: [{ qty: 3 }, { qty: 4 }] },
  { slug: 'mieszkanie', items: [{ qty: 9 }] },
  { slug: 'pokoj', items: [{ qty: 1 }, { qty: 2 }] },
]

const card = (page: string, pills: unknown[] = [{ label: 'Faktura na firmę' }]) => ({
  page,
  badge: 'Deweloperzy',
  title: 'AGD i RTV',
  titleAccent: 'na cały obiekt',
  text: 'Opis',
  scene: [{ image: 5, box: { left: '1%', width: '25%', z: 10 } }],
  pills,
  calculator: {
    types: [
      { label: 'Kawalerka', slug: 'kawalerka' },
      { label: '2 pokoje', slug: 'mieszkanie' },
      { label: 'Pokój', slug: 'pokoj' },
    ],
    count: 12,
  },
  cta: 'AGD i RTV dla firm',
})

const DATA = {
  cards: [
    card('agd-rtv-dla-firm', [
      { label: 'Dostawy etapami' },
      { label: 'Odbiór starego 1 za 1', when: 'pickup' },
    ]),
    card('dostawy-it-dla-firm'),
  ],
  benefits: [
    { icon: 'doc', title: 'Jedna faktura VAT', text: 'na całość' },
    { icon: 'trash', title: 'Odbiór starego sprzętu', text: 'przy dostawie', when: 'pickup' },
    { icon: 'phone', title: '{callback}', text: 'w godzinach pracy', when: 'callback' },
  ],
}

const page = (pickup: boolean, types = PAGE_TYPES): HomePage => ({
  pickup,
  unit: ['lokal', 'lokale', 'lokali'],
  types,
})

describe('calculatorTypes (ZAOPATRZENIE §8)', () => {
  it('takes the devices per unit from the procurement page (sum of the item counts)', () => {
    expect(calculatorTypes(DATA.cards[0]!.calculator.types, PAGE_TYPES)).toEqual([
      { label: 'Kawalerka', slug: 'kawalerka', perUnit: 7 },
      { label: '2 pokoje', slug: 'mieszkanie', perUnit: 9 },
      { label: 'Pokój', slug: 'pokoj', perUnit: 3 },
    ])
  })

  it('drops a type the page does not have (the link would land on the default)', () => {
    expect(
      calculatorTypes([{ label: 'Willa', slug: 'willa' }], PAGE_TYPES).map((type) => type.slug),
    ).toEqual([])
  })
})

describe('resultLabel', () => {
  it('writes the devices and units with Polish plurals', () => {
    expect(resultLabel(84, 12, ['lokal', 'lokale', 'lokali'])).toBe('urządzenia · 12 lokali')
    expect(resultLabel(1, 1, ['lokal', 'lokale', 'lokali'])).toBe('urządzenie · 1 lokal')
    expect(resultLabel(48, 12, ['stanowisko', 'stanowiska', 'stanowisk'])).toBe(
      'urządzeń · 12 stanowisk',
    )
  })
})

describe('buildProcurementHome', () => {
  it('shows a card only when its page is published with valid data', () => {
    const home = buildProcurementHome(DATA, {
      pages: { 'agd-rtv-dla-firm': page(false) },
      callback: null,
    })
    expect(home?.cards.map((item) => item.page)).toEqual(['agd-rtv-dla-firm'])
  })

  it('renders nothing without any published page or with invalid data', () => {
    expect(buildProcurementHome(DATA, { pages: {}, callback: null })).toBeNull()
    expect(buildProcurementHome({ cards: [] }, { pages: {}, callback: null })).toBeNull()
  })

  it('hides the old-equipment pill and benefit until the AGD page flag is on (§0 pkt 1)', () => {
    const off = buildProcurementHome(DATA, {
      pages: { 'agd-rtv-dla-firm': page(false), 'dostawy-it-dla-firm': page(true) },
      callback: null,
    })
    expect(off?.cards[0]?.pills).toEqual(['Dostawy etapami'])
    expect(off?.benefits.map((item) => item.title)).toEqual(['Jedna faktura VAT'])

    const on = buildProcurementHome(DATA, {
      pages: { 'agd-rtv-dla-firm': page(true), 'dostawy-it-dla-firm': page(false) },
      callback: null,
    })
    expect(on?.cards[0]?.pills).toEqual(['Dostawy etapami', 'Odbiór starego 1 za 1'])
    expect(on?.benefits.map((item) => item.title)).toEqual([
      'Jedna faktura VAT',
      'Odbiór starego sprzętu',
    ])
  })

  it('puts the panel promise in the call-back benefit; without it the benefit goes (§0 pkt 7)', () => {
    const home = buildProcurementHome(DATA, {
      pages: { 'agd-rtv-dla-firm': page(false) },
      callback: 'Oddzwaniamy w 60 minut',
    })
    expect(home?.benefits.at(-1)).toEqual({
      icon: 'phone',
      title: 'Oddzwaniamy w 60 minut',
      text: 'w godzinach pracy',
    })
  })

  it('drops a card whose calculator matches no type of its page', () => {
    const home = buildProcurementHome(DATA, {
      pages: {
        'agd-rtv-dla-firm': page(false, [{ slug: 'inny', items: [{ qty: 1 }] }]),
        'dostawy-it-dla-firm': page(false),
      },
      callback: null,
    })
    expect(home?.cards.map((item) => item.page)).toEqual(['dostawy-it-dla-firm'])
  })
})

describe('validateProcurementHome', () => {
  it('accepts the package shape and names the first problem otherwise', () => {
    expect(validateProcurementHome(DATA)).toBe(true)
    expect(validateProcurementHome({ cards: [{ page: 'x' }], benefits: [] })).toMatch(/^Dane/)
  })
})
