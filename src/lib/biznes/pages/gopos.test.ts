import { describe, expect, it } from 'vitest'

import {
  goposHeroSchema,
  goposVenuesSchema,
  stagePlacement,
  GOPOS_PACKAGE_NOTE,
  INITIAL_TICKET_STEP,
  packageHardware,
  packageItems,
  packageModules,
  selectionForVenue,
  ticketStep,
  toggleModule,
  type GoposModule,
} from './gopos'

const MODULES: GoposModule[] = [
  { slug: 'gopos', core: true, name: 'GoPOS', text: 'System', hw: ['Sunmi D3 PRO', 'Terminal'] },
  { slug: 'gokds', name: 'KDS', text: 'Kuchnia', hw: ['Sunmi FLEX 3'] },
  { slug: 'emenu', name: 'E-Menu', text: 'QR', hw: ['Kody QR', 'Terminal'] },
  { slug: 'gohub', name: 'GoHub', text: 'Dowozy', hw: [] },
]

describe('GoPOS package (K4h, K32 §3)', () => {
  it('always keeps the core system in the package', () => {
    expect(packageModules(MODULES, new Set()).map((m) => m.slug)).toEqual(['gopos'])
    expect(toggleModule(MODULES, new Set(['gopos']), 'gopos')).toEqual(new Set(['gopos']))
  })

  it('toggles a module in and out', () => {
    const on = toggleModule(MODULES, new Set(), 'gokds')
    expect([...on]).toEqual(['gokds'])
    expect([...toggleModule(MODULES, on, 'gokds')]).toEqual([])
  })

  it('ignores a module that is not on the list', () => {
    expect(toggleModule(MODULES, new Set(), 'nope')).toEqual(new Set())
  })

  it('a package with 3 modules gives 3 inquiry items with the note', () => {
    const items = packageItems(MODULES, new Set(['gokds', 'emenu']))
    expect(items).toEqual([
      { id: 'gopos', q: 1, uwaga: GOPOS_PACKAGE_NOTE },
      { id: 'gokds', q: 1, uwaga: GOPOS_PACKAGE_NOTE },
      { id: 'emenu', q: 1, uwaga: GOPOS_PACKAGE_NOTE },
    ])
  })

  it('hardware is the union of the modules, in order, without repeats', () => {
    expect(packageHardware(MODULES, new Set(['gokds', 'emenu']))).toEqual([
      'Sunmi D3 PRO',
      'Terminal',
      'Sunmi FLEX 3',
      'Kody QR',
    ])
  })

  it('a venue tab sets the package to its starting modules', () => {
    expect([...selectionForVenue(MODULES, ['gohub', 'gokds', 'missing'])]).toEqual([
      'gohub',
      'gokds',
    ])
  })

  it('the order starts on the hall, step 1 (POPRAWKI-0311 §A)', () => {
    expect(INITIAL_TICKET_STEP).toBe(0)
    expect(ticketStep(null)).toBe(0)
    expect(ticketStep(0)).toBe(0)
    expect(ticketStep(3)).toBe(3)
  })
})

describe('stagePlacement (POPRAWKI-0311 §A: composition from the data)', () => {
  it('reads the position of a device as a style object', () => {
    expect(stagePlacement('left:2%;top:10%;width:50%;height:54%')).toEqual({
      left: '2%',
      top: '10%',
      width: '50%',
      height: '54%',
    })
    expect(stagePlacement(' right: 0 ; top: -14px ')).toEqual({ right: '0', top: '-14px' })
  })

  it('drops anything that is not a plain length of a known side', () => {
    expect(stagePlacement('left:2%;color:red;width:url(x)')).toEqual({ left: '2%' })
    expect(stagePlacement('top:calc(1px + 2px);height:10vh')).toEqual({})
    expect(stagePlacement(undefined)).toEqual({})
  })
})

describe('GoPOS section data (POPRAWKI-0311 §A, §B)', () => {
  const hero = {
    pill: 'P',
    presentation: { slug: 'gopos', note: 'N' },
    proof: [],
    flow: [1, 2, 3, 4].map((n) => ({ k: `K${n}`, t: 'T', d: 'D' })),
    ticket: { label: 'L', text: 'T', statuses: ['a', 'b', 'c', 'd'] },
  }

  it('keeps the photo (media id) and the placement of each stage device', () => {
    const parsed = goposHeroSchema.parse({
      ...hero,
      stage: [{ slug: 'kds', label: 'Kuchnia', step: 1, image: 7, pos: 'right:0', lab: 'top:0' }],
    })
    expect(parsed.stage[0]).toMatchObject({ image: 7, pos: 'right:0', lab: 'top:0' })
  })

  it('takes a venue picture as a media id or, as before, a product slug', () => {
    const venue = {
      key: 'rest',
      tab: 'Restauracja',
      h1a: 'A',
      h1b: 'B',
      lead: 'L',
      modules: [],
      ticket: hero.ticket,
    }
    expect(goposVenuesSchema.parse({ venues: [{ ...venue, image: 12 }] }).venues[0]!.image).toBe(12)
    expect(goposVenuesSchema.parse({ venues: [{ ...venue, image: 'd3' }] }).venues[0]!.image).toBe(
      'd3',
    )
  })
})
