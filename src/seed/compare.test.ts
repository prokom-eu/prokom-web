import { describe, expect, it } from 'vitest'

import { hasSameValues } from './compare'

describe('hasSameValues', () => {
  it('ignores keys Payload adds to groups and array rows', () => {
    const stored = { chips: [{ id: 'a1', label: 'Wizytówka', solution: 3 }], cta: { label: 'X' } }
    expect(hasSameValues(stored, { chips: [{ label: 'Wizytówka', solution: 3 }] })).toBe(true)
  })

  it('treats null and missing as equal, also inside rows', () => {
    expect(hasSameValues({ prices: { start: 1, std: null } }, { prices: { start: 1 } })).toBe(true)
    expect(hasSameValues({ note: undefined }, { note: null })).toBe(true)
  })

  it('sees a changed, added, removed or reordered row', () => {
    const stored = {
      chips: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
    }
    expect(hasSameValues(stored, { chips: [{ label: 'A' }, { label: 'C' }] })).toBe(false)
    expect(hasSameValues(stored, { chips: [{ label: 'A' }] })).toBe(false)
    expect(hasSameValues(stored, { chips: [{ label: 'B' }, { label: 'A' }] })).toBe(false)
  })

  it('sees a cleared value and a value set where nothing was stored', () => {
    expect(hasSameValues({ tag: 'PANEL' }, { tag: null })).toBe(false)
    expect(hasSameValues({ tag: null }, { tag: 'PANEL' })).toBe(false)
    expect(hasSameValues({ prices: null }, { prices: { start: 1 } })).toBe(false)
  })
})
