import { describe, expect, it } from 'vitest'

import { layoutTowns } from './areaLayout'

const zones = [
  { name: 'Rabka', towns: ['Chabówka', 'Jordanów'], note: null },
  { name: 'Podhale', towns: ['Nowy Targ', 'Szaflary', 'Czarny Dunajec'], note: null },
  { name: 'Małopolska', towns: ['Limanowa', 'Kraków'], note: null },
]

describe('layoutTowns (ServiceAreaMap)', () => {
  it('places every town of the panel, the same way on every call', () => {
    const towns = layoutTowns(zones)
    expect(towns.map((t) => t.town)).toEqual([
      'Chabówka',
      'Jordanów',
      'Nowy Targ',
      'Szaflary',
      'Czarny Dunajec',
      'Limanowa',
      'Kraków',
    ])
    expect(layoutTowns(zones)).toEqual(towns)
  })

  it('a farther zone sits on a wider ring around the middle', () => {
    const towns = layoutTowns(zones)
    const distance = (t: { x: number; y: number }) => Math.hypot(t.x - 50, t.y - 50)
    const ring = (zone: string) => distance(towns.find((t) => t.zone === zone)!)
    expect(ring('Rabka')).toBeLessThan(ring('Podhale'))
    expect(ring('Podhale')).toBeLessThan(ring('Małopolska'))
  })

  it('keeps labels inside the box', () => {
    for (const t of layoutTowns(zones)) {
      expect(t.x).toBeGreaterThanOrEqual(8)
      expect(t.x).toBeLessThanOrEqual(92)
      expect(t.y).toBeGreaterThanOrEqual(8)
      expect(t.y).toBeLessThanOrEqual(92)
    }
  })
})
