import { describe, expect, it } from 'vitest'

import { nameSize, WHEEL, wheelLayout } from './wheelGeometry'

const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)

describe('wheelLayout (KOLO-HERO.md, geometria)', () => {
  const layout = wheelLayout([4, 6, 3, 3, 3])

  it('puts all 19 products on one even ring, 360/19 apart', () => {
    const angles = layout.groups.flatMap((group) => group.items.map((item) => item.angle))
    expect(angles).toHaveLength(19)
    expect(layout.step).toBeCloseTo(360 / 19, 6)
    angles.slice(1).forEach((angle, i) => expect(angle - angles[i]!).toBeCloseTo(360 / 19, 6))
  })

  it('centres the first department at the top (−90°)', () => {
    expect(layout.groups[0]!.angle).toBeCloseTo(-90, 6)
  })

  it('points every department at the middle of its own run', () => {
    layout.groups.forEach((group) => {
      const first = group.items[0]!.angle
      const last = group.items.at(-1)!.angle
      expect(group.angle).toBeCloseTo((first + last) / 2, 6)
    })
  })

  it('places products on R 282 and departments on R 168', () => {
    const item = layout.groups[1]!.items[2]!
    expect(Math.hypot(item.x, item.y)).toBeCloseTo(WHEEL.orbit, 1)
    const group = layout.groups[2]!
    expect(Math.hypot(group.x, group.y)).toBeCloseTo(WHEEL.node, 1)
  })

  it('rounds positions to 2 decimals (the same on the server and in the browser)', () => {
    layout.groups.forEach((group) =>
      [group, ...group.items].forEach(({ x, y }) => {
        expect(Number(x.toFixed(2))).toBe(x)
        expect(Number(y.toFixed(2))).toBe(y)
      }),
    )
  })

  it('makes the highlight arc span the run ± 7°', () => {
    expect(layout.groups[0]!.arcHalf).toBeCloseTo(1.5 * (360 / 19) + 7, 6)
    expect(layout.groups[2]!.arcHalf).toBeCloseTo(360 / 19 + 7, 6)
  })

  it('puts the labels of the lower departments above their icon', () => {
    layout.groups.forEach((group) => expect(group.labelAbove).toBe(group.y > 100))
    expect(layout.groups.some((group) => group.labelAbove)).toBe(true)
    expect(layout.groups[0]!.labelAbove).toBe(false)
  })

  it('follows the data: 3 → 4 products in a department keeps the ring even', () => {
    const changed = wheelLayout([4, 6, 3, 4, 3])
    expect(changed.step).toBeCloseTo(360 / 20, 6)
    const angles = changed.groups.flatMap((group) => group.items.map((item) => item.angle))
    expect(angles).toHaveLength(20)
    expect(angleDiff(angles.at(-1)! + changed.step, angles[0]!)).toBeCloseTo(0, 6)
    changed.groups.forEach((group) => {
      const mid = (group.items[0]!.angle + group.items.at(-1)!.angle) / 2
      expect(group.angle).toBeCloseTo(mid, 6)
    })
  })

  it('handles one department and departments without products', () => {
    const one = wheelLayout([3])
    expect(one.groups[0]!.angle).toBeCloseTo(-90, 6)
    const empty = wheelLayout([0, 0, 0, 0])
    expect(empty.groups.map((group) => group.angle)).toEqual([-90, 0, 90, 180])
    empty.groups.forEach((group) => expect(group.items).toEqual([]))
  })
})

describe('nameSize (rdzeń: nazwa działu mieści się w kole)', () => {
  it('keeps 16 units for short names', () => {
    expect(nameSize('Kasy i sprzedaż')).toBe(16)
  })

  it('shrinks to the longest word', () => {
    // „Oprogramowanie” = 14 letters: 124 / (0.6 · 14) = 14.8
    expect(nameSize('Oprogramowanie')).toBe(14.8)
    // „Bezpieczeństwo,” = 15 characters with the comma
    expect(nameSize('Bezpieczeństwo, sieć i podpis')).toBe(13.8)
  })

  it('never returns more than 16', () => {
    expect(nameSize('IT')).toBe(16)
    expect(nameSize('')).toBe(16)
  })
})
