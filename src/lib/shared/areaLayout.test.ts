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

describe('layoutTowns — the middle and repeats', () => {
  it('leaves out the salon town (it is the middle) and a town listed twice', () => {
    const towns = layoutTowns(
      [
        { name: 'Rabka', towns: ['Rabka-Zdrój', 'Chabówka'], note: null },
        { name: 'Podhale', towns: ['chabówka', 'Nowy Targ'], note: null },
      ],
      'Rabka-Zdrój',
    )
    expect(towns.map((t) => t.town)).toEqual(['Chabówka', 'Nowy Targ'])
  })

  it('labels near the left and right edges grow inwards', () => {
    for (const t of layoutTowns(zones)) {
      if (t.x < 25) expect(t.align).toBe('start')
      else if (t.x > 75) expect(t.align).toBe('end')
      else expect(t.align).toBe('center')
    }
  })
})
