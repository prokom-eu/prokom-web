import { describe, expect, it } from 'vitest'

import { hubDeliveries } from '../../../seed/prokom/map'
import { changeQty, fromPreset, listText, listTotals, sanitizeList } from './list'

const groups = hubDeliveries().listGroups

describe('request list (spec §6.5 pkt 3)', () => {
  it('adds, keeps within 999 and drops an item at 0', () => {
    let list = changeQty({}, 'pc', 1)
    list = changeQty(list, 'pc', 10)
    expect(list.pc).toBe(11)
    expect(changeQty({ pc: 995 }, 'pc', 10).pc).toBe(999)
    expect(changeQty({ pc: 1 }, 'pc', -1)).toEqual({})
    expect(changeQty({}, 'pc', -1)).toEqual({})
  })

  it('a preset replaces the list; clearing is an empty list', () => {
    const preset = hubDeliveries().objects[0]!.preset
    const list = fromPreset(preset)
    expect(Object.keys(list)).toHaveLength(preset.length)
    expect(listTotals(list, groups).positions).toBe(preset.length)
    expect(listTotals({}, groups)).toMatchObject({ pieces: 0, positions: 0, groups: [] })
  })

  it('counts pieces, positions and the groups on the list', () => {
    const totals = listTotals({ pc: 3, tv: 2 }, groups)
    expect(totals).toMatchObject({ pieces: 5, positions: 2 })
    expect(totals.groups.map((group) => group.key)).toEqual(['it', 'agd'])
  })

  it('ignores unknown items and bad quantities from storage', () => {
    expect(sanitizeList({ pc: 2, xyz: 3, tv: 'a', lap: -1 }, groups)).toEqual({ pc: 2 })
    expect(sanitizeList(null, groups)).toEqual({})
  })

  it('writes the list as text with services and term', () => {
    const text = listText({ pc: 3 }, groups, {
      services: ['Konfiguracja'],
      term: 'Do miesiąca',
      pcs: 'szt.',
    })
    expect(text).toContain('3 szt.')
    expect(text).toContain('+ Konfiguracja')
    expect(text.trim().endsWith('Do miesiąca')).toBe(true)
  })
})
