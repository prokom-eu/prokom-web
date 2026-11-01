import { describe, expect, it } from 'vitest'

import {
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

  it('the ticket shows the kitchen until a step is picked', () => {
    expect(INITIAL_TICKET_STEP).toBe(1)
    expect(ticketStep(null)).toBe(1)
    expect(ticketStep(0)).toBe(0)
    expect(ticketStep(3)).toBe(3)
  })
})
