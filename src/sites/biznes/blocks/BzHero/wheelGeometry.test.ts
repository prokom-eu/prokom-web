import { describe, expect, it } from 'vitest'

import { nameSize, WHEEL, wheelLayout } from './wheelGeometry'

const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

describe('wheelLayout (runda 1411, Main.dc.html)', () => {
  // Five departments × three products (PRZEKAZANIE-RUNDA-1411 §1 „Hero — koło”).
  const layout = wheelLayout([3, 3, 3, 3, 3])

  it('puts the departments evenly on R 165, the first at the top', () => {
    expect(layout.groups.map((group) => group.angle)).toEqual([-90, -18, 54, 126, 198])
    layout.groups.forEach((group) => expect(Math.hypot(group.x, group.y)).toBeCloseTo(165, 1))
  })

  it('fans each department out on R 290 at −20° / 0° / +20° of its own angle', () => {
    layout.groups.forEach((group) => {
      expect(group.items.map((item) => item.angle - group.angle)).toEqual([-20, 0, 20])
      group.items.forEach((item) => expect(Math.hypot(item.x, item.y)).toBeCloseTo(290, 1))
    })
  })

  it('never lets two bubbles touch, even when the active ones grow to 76', () => {
    const items = layout.groups.flatMap((group, g) => group.items.map((item) => ({ ...item, g })))
    for (const active of layout.groups.keys()) {
      const size = (g: number) => (g === active ? WHEEL.bubble.on : WHEEL.bubble.off)
      items.forEach((a, i) =>
        items.slice(i + 1).forEach((b) => {
          // Hover grows a bubble × 1.12: room for that too.
          const room = (size(a.g) + size(b.g)) * 0.56
          expect(dist(a, b), `${a.angle}° / ${b.angle}°`).toBeGreaterThan(room)
        }),
      )
    }
  })

  it('keeps the department icons clear of the core and of the products', () => {
    const dot = (WHEEL.dot * 1.1) / 2
    layout.groups.forEach((group) => {
      expect(Math.hypot(group.x, group.y) - dot).toBeGreaterThan(WHEEL.core / 2)
      layout.groups
        .flatMap((other) => other.items)
        .forEach((item) => expect(dist(group, item)).toBeGreaterThan(dot + WHEEL.bubble.on / 2))
    })
  })

  it('keeps every bubble inside the wheel', () => {
    layout.groups
      .flatMap((group) => group.items)
      .forEach((item) =>
        expect(Math.hypot(item.x, item.y) + WHEEL.bubble.on / 2).toBeLessThan(WHEEL.size / 2),
      )
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
    expect(layout.groups[0]!.arcHalf).toBe(27)
  })

  it('moves the side labels outwards and the lower ones inwards', () => {
    expect(layout.groups.map((group) => group.labelShift)).toEqual([0, 14, -20, 20, -14])
  })

  it('centres any count around the department and handles empty ones', () => {
    const two = wheelLayout([2, 4, 0])
    expect(two.groups[0]!.items.map((item) => item.angle)).toEqual([-100, -80])
    expect(two.groups[1]!.items.map((item) => angleDiff(item.angle, two.groups[1]!.angle))).toEqual(
      [30, 10, 10, 30],
    )
    expect(two.groups[2]!.items).toEqual([])
    expect(two.groups[2]!.arcHalf).toBe(0)
    expect(wheelLayout([]).groups).toEqual([])
  })
})

describe('nameSize (rdzeń: nazwa działu mieści się w kole)', () => {
  it('keeps 15 units for short names', () => {
    expect(nameSize('Kasy i sprzedaż')).toBe(15)
  })

  it('shrinks to the longest word', () => {
    // „Oprogramowanie” = 14 letters: 124 / (0.6 · 14) = 14.8
    expect(nameSize('Oprogramowanie')).toBe(14.8)
    // „Bezpieczeństwo,” = 15 characters with the comma
    expect(nameSize('Bezpieczeństwo, sieć i podpis')).toBe(13.8)
  })

  it('never returns more than 15', () => {
    expect(nameSize('IT')).toBe(15)
    expect(nameSize('')).toBe(15)
  })
})
