import { describe, expect, it } from 'vitest'

import {
  deliverySplit,
  fillDelivery,
  initialState,
  liveChipText,
  offerRows,
  procurementMessage,
  procurementReducer,
  procurementTotals,
  redactWidth,
  scheduleRows,
  type ConfiguratorData,
  type Service,
} from './logic'

const AGD: ConfiguratorData = {
  unit: ['lokal', 'lokale', 'lokali'],
  start: 12,
  types: [
    {
      title: 'Kawalerka',
      short: 'kawalerka',
      slug: 'kawalerka',
      items: [
        { image: 1, name: 'Lodówka', desc: 'z zamrażarką', qty: 1, params: '177 cm', energy: 'E' },
        { image: 2, name: 'Płyta', desc: '2–4 pola', qty: 1 },
        { image: null, name: 'Telewizor', desc: 'Smart TV', qty: 2, params: '43"', energy: 'F' },
      ],
    },
    {
      title: 'Pokój w pensjonacie',
      short: 'pokój',
      slug: 'pokoj',
      items: [{ image: 3, name: 'Czajnik', desc: '360°', qty: 1 }],
    },
  ],
  classes: ['Ekonomiczny', 'Standard', 'Premium'],
  defaultClass: 1,
  delivery: {
    options: [
      { label: 'Naraz', stages: 1 },
      { label: '2 etapy', stages: 2 },
      { label: '3 etapy', stages: 3 },
    ],
    defaultStages: 3,
    word: ['etap', 'etapy', 'etapów'],
    unit: ['lokal', 'lokale', 'lokali'],
    set: ['komplet', 'komplety', 'kompletów'],
  },
}

const IT: ConfiguratorData = {
  unit: ['stanowisko', 'stanowiska', 'stanowisk'],
  start: 12,
  types: [
    {
      title: 'Biuro',
      short: 'biuro',
      slug: 'biuro',
      items: [
        { image: 4, name: 'Laptop 14"', desc: 'Intel Core / AMD Ryzen, 16 GB', qty: 1 },
        { image: 5, name: 'Monitor 24"', desc: 'Full HD', qty: 1 },
      ],
    },
  ],
  delivery: {
    options: [
      { label: 'Jedna tura', stages: 1 },
      { label: '2 tury', stages: 2 },
    ],
    defaultStages: 2,
    word: ['tura', 'tury', 'tur'],
    unit: ['stanowisko', 'stanowiska', 'stanowisk'],
    set: ['stanowisko', 'stanowiska', 'stanowisk'],
  },
}

const SERVICES: Service[] = [
  { label: 'Instalacja systemu i programów', kind: 'system' },
  { label: 'Numery inwentarzowe', kind: 'inventory' },
  { label: 'Odbiór starego sprzętu z usunięciem danych', kind: 'pickup' },
]

describe('deliverySplit (ZAOPATRZENIE §6)', () => {
  it('splits almost evenly, larger stages first, and sums to n', () => {
    expect(deliverySplit(12, 3)).toEqual([4, 4, 4])
    expect(deliverySplit(10, 3)).toEqual([4, 3, 3])
    expect(deliverySplit(5, 4)).toEqual([2, 1, 1, 1])
    for (const [n, k] of [
      [1, 1],
      [7, 2],
      [500, 3],
      [13, 4],
    ] as const) {
      expect(deliverySplit(n, k).reduce((a, b) => a + b, 0)).toBe(n)
    }
  })

  it('never makes more stages than units, nor fewer than one', () => {
    expect(deliverySplit(2, 4)).toEqual([1, 1])
    expect(deliverySplit(3, 0)).toEqual([3])
  })
})

describe('initialState', () => {
  it('starts on the first type, the start count, the default class and stages, all services', () => {
    expect(initialState(AGD, 0)).toEqual({
      type: 0,
      count: 12,
      off: [],
      cls: 1,
      services: [],
      stages: 3,
      more: '',
      variant: 0,
    })
    expect(initialState(IT, 3).services).toEqual([0, 1, 2])
  })
})

describe('procurementTotals (§3)', () => {
  it('multiplies chosen items by the count and leaves out unticked ones', () => {
    const totals = procurementTotals({ ...initialState(AGD, 0), off: [1] }, AGD)
    expect(totals.chosen.map((item) => [item.name, item.total])).toEqual([
      ['Lodówka', 12],
      ['Telewizor', 24],
    ])
    expect(totals.devices).toBe(36)
    expect(totals.kinds).toBe(2)
  })

  it('describes the delivery: at once, or stages of about N units', () => {
    expect(procurementTotals(initialState(AGD, 0), AGD).deliveryText).toBe(
      '3 etapy po ok. 4 lokale',
    )
    expect(procurementTotals({ ...initialState(AGD, 0), stages: 1 }, AGD).deliveryText).toBe(
      'naraz',
    )
    expect(
      procurementTotals({ ...initialState(AGD, 0), count: 10, stages: 3 }, AGD).deliveryText,
    ).toBe('3 etapy po ok. 4 lokale')
    expect(procurementTotals({ ...initialState(IT, 0), count: 1 }, IT).deliveryText).toBe(
      'jedna tura',
    )
    expect(procurementTotals({ ...initialState(IT, 0), count: 5 }, IT).deliveryText).toBe(
      '2 tury po ok. 3 stanowiska',
    )
  })

  it('falls back to the first type for an index out of range', () => {
    expect(procurementTotals({ ...initialState(AGD, 0), type: 9 }, AGD).type.slug).toBe('kawalerka')
  })
})

describe('offerRows (§4)', () => {
  it('lists chosen items with parameters (else the description), energy class for AGD', () => {
    const { rows, total, services } = offerRows(initialState(AGD, 0), AGD, [])
    expect(rows).toEqual([
      { name: 'Lodówka', params: '177 cm', energy: 'E', qty: 12 },
      { name: 'Płyta', params: '2–4 pola', energy: '—', qty: 12 },
      { name: 'Telewizor', params: '43"', energy: 'F', qty: 24 },
    ])
    expect(total).toBe(48)
    expect(services).toEqual([])
  })

  it('adds the chosen services as rows for IT, without the energy class', () => {
    const state = { ...initialState(IT, SERVICES.length), services: [0, 2] }
    const { rows, services } = offerRows(state, IT, SERVICES)
    expect(rows[0]).toEqual({
      name: 'Laptop 14"',
      params: 'Intel Core / AMD Ryzen, 16 GB',
      qty: 12,
    })
    expect(services).toEqual([
      { name: 'Usługa', params: 'Instalacja systemu i programów', qty: 12 },
      { name: 'Usługa', params: 'Odbiór starego sprzętu z usunięciem danych', qty: 12 },
    ])
  })
})

describe('scheduleRows (§6)', () => {
  it('AGD: a show flat in week 1 with two or more stages, then the stages with ranges', () => {
    const rows = scheduleRows({ ...initialState(AGD, 0), count: 10 }, AGD, [])
    expect(rows.map((row) => [row.label, row.note, row.tone])).toEqual([
      ['Lokal pokazowy', '1 komplet', 'hot'],
      ['Etap 1 · lokale 1–4', '4 komplety', 'plain'],
      ['Etap 2 · lokale 5–7', '3 komplety', 'plain'],
      ['Etap 3 · lokale 8–10', '3 komplety', 'plain'],
    ])
    expect(rows[0]).toMatchObject({ from: 0, to: 1 })
    expect(rows[1]!.from).toBe(2)
    expect(rows[3]!.to).toBeLessThanOrEqual(10)
  })

  it('AGD at once: one row for the whole count, no show flat', () => {
    const rows = scheduleRows({ ...initialState(AGD, 0), stages: 1, count: 1 }, AGD, [])
    expect(rows.map((row) => row.label)).toEqual(['Całość · lokal 1'])
  })

  it('IT: preparation, tours, and the pickup only when that service is chosen', () => {
    const base = { ...initialState(IT, SERVICES.length), count: 5 }
    const withPickup = scheduleRows(base, IT, SERVICES)
    expect(withPickup.map((row) => [row.label, row.note])).toEqual([
      ['Przygotowanie w Rabce', 'system i programy'],
      ['Tura 1 · stanowiska 1–3', '3 stanowiska'],
      ['Tura 2 · stanowiska 4–5', '2 stanowiska'],
      ['Odbiór starego sprzętu', 'z usunięciem danych'],
    ])
    const plain = scheduleRows({ ...base, services: [1] }, IT, SERVICES)
    expect(plain.map((row) => row.label)).not.toContain('Odbiór starego sprzętu')
    expect(plain[0]!.note).toBe('sprawdzenie sprzętu')
    expect(plain.at(-1)!.to).toBeCloseTo(9.8)
  })
})

describe('procurementMessage', () => {
  it('writes the list for the form: type × count, items, extra, class or services, delivery', () => {
    const state = { ...initialState(AGD, 0), off: [1], more: 'odkurzacz' }
    expect(procurementMessage(state, AGD, [])).toBe(
      [
        'Kawalerka × 12 lokali:',
        '– Lodówka × 12',
        '– Telewizor × 24',
        '– Dodatkowo: odkurzacz',
        'Klasa sprzętu: Standard',
        'Dostawa: 3 etapy po ok. 4 lokale',
      ].join('\n'),
    )
    const it = { ...initialState(IT, SERVICES.length), services: [0], count: 1 }
    expect(procurementMessage(it, IT, SERVICES)).toBe(
      [
        'Biuro × 1 stanowisko:',
        '– Laptop 14" × 1',
        '– Monitor 24" × 1',
        'Przed dostawą: Instalacja systemu i programów',
        'Dostawa: jedna tura',
      ].join('\n'),
    )
  })
})

describe('procurementReducer (one state for the whole page, §3)', () => {
  const start = initialState(AGD, 0)

  it('changes the type with every item ticked again, and clamps the count to 1–500', () => {
    const off = procurementReducer(start, { type: 'item', index: 1 })
    expect(off.off).toEqual([1])
    expect(procurementReducer(off, { type: 'item', index: 1 }).off).toEqual([])
    expect(procurementReducer(off, { type: 'type', index: 1 })).toMatchObject({ type: 1, off: [] })
    expect(procurementReducer(start, { type: 'count', value: 0 }).count).toBe(1)
    expect(procurementReducer(start, { type: 'count', value: 900 }).count).toBe(500)
  })

  it('sets the class, stages, services, variant and the extra text', () => {
    const it = initialState(IT, SERVICES.length)
    expect(procurementReducer(start, { type: 'cls', index: 2 }).cls).toBe(2)
    expect(procurementReducer(start, { type: 'stages', value: 1 }).stages).toBe(1)
    expect(procurementReducer(it, { type: 'service', index: 1 }).services).toEqual([0, 2])
    expect(
      procurementReducer({ ...it, services: [2] }, { type: 'service', index: 0 }).services,
    ).toEqual([0, 2])
    expect(procurementReducer(it, { type: 'variant', index: 1 }).variant).toBe(1)
    expect(procurementReducer(start, { type: 'more', value: '  odkurzacz ' }).more).toBe(
      'odkurzacz',
    )
  })

  it('takes the home page handoff: known values only, the list ticked again', () => {
    const off = { ...start, off: [0] }
    expect(
      procurementReducer(off, { type: 'handoff', handoff: { type: 1, count: 30 } }),
    ).toMatchObject({ type: 1, count: 30, off: [] })
    expect(
      procurementReducer(off, { type: 'handoff', handoff: { type: null, count: 7 } }),
    ).toMatchObject({ type: 0, count: 7, off: [0] })
  })
})

describe('texts driven by the state', () => {
  it('writes the hero chip as count × short type · devices', () => {
    expect(liveChipText(initialState(AGD, 0), AGD)).toBe('12 × kawalerka · 48 szt.')
  })

  it('puts the delivery of the configurator into the offer footer', () => {
    expect(fillDelivery('Dostawa: {delivery}', '3 etapy po ok. 4 lokale')).toBe(
      'Dostawa: 3 etapy po ok. 4 lokale',
    )
    expect(fillDelivery('Faktura VAT na firmę', 'naraz')).toBe('Faktura VAT na firmę')
  })

  it('gives the redacted prices varying, stable widths', () => {
    expect(redactWidth(0)).toBe(52)
    expect(redactWidth(1)).toBe(59)
    expect(redactWidth(1)).toBe(redactWidth(1))
    expect(new Set([0, 1, 2, 3].map((i) => redactWidth(i))).size).toBe(4)
  })
})
