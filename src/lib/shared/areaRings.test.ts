import { describe, expect, it } from 'vitest'

import { COMPANY_ZONES } from '../../seed/shared/company'
import { AREA_BOX, AREA_CARD, areaRings, distanceKm, placeLabels, type Box } from './areaRings'
import { TOWN_GEO } from './townGeo'

/** The salon (ul. Orkana 16B), as in the company seed. */
const SALON = { lat: 49.60994, lng: 19.95339 }
const zones = COMPANY_ZONES.map(({ name, towns }) => ({ name, towns: towns ?? [], note: null }))

describe('distanceKm (runda 1411, Obszar)', () => {
  it.each([
    ['Zakopane', 34],
    ['Kraków', 50],
    ['Nowy Sącz', 54],
  ])('Rabka → %s ≈ %i km', (town, km) => {
    const geo = TOWN_GEO[town]
    expect(geo).toBeDefined()
    expect(Math.abs(distanceKm(SALON, geo!) - km)).toBeLessThanOrEqual(3)
  })
})

describe('areaRings', () => {
  const rings = areaRings(zones, SALON, 'Rabka-Zdrój')

  it('places every town of the seed, without the salon town, nearest first', () => {
    const all = zones.flatMap((zone) => zone.towns).filter((town) => town !== 'Rabka-Zdrój')
    expect(rings.unplaced).toEqual([])
    expect(rings.towns.map((t) => t.town).sort()).toEqual([...all].sort())
    const km = rings.towns.map((t) => t.km)
    expect(km).toEqual([...km].sort((a, b) => a - b))
  })

  it('puts towns on the 15 / 35 / 55 km rings', () => {
    const ring = (town: string) => rings.towns.find((t) => t.town === town)?.ring
    expect(ring('Chabówka')).toBe(0)
    expect(ring('Nowy Targ')).toBe(1)
    expect(ring('Zakopane')).toBe(1)
    expect(ring('Kraków')).toBe(2)
    expect(ring('Nowy Sącz')).toBe(2)
  })

  it('keeps every point in the box, north up and east right', () => {
    for (const t of rings.towns) {
      expect(t.x).toBeGreaterThan(0)
      expect(t.x).toBeLessThan(AREA_BOX.width)
      expect(t.y).toBeGreaterThan(0)
      expect(t.y).toBeLessThan(AREA_BOX.height)
    }
    const at = (town: string) => rings.towns.find((t) => t.town === town)!
    expect(at('Kraków').y).toBeLessThan(rings.center.y)
    expect(at('Zakopane').y).toBeGreaterThan(rings.center.y)
    expect(at('Nowy Sącz').x).toBeGreaterThan(rings.center.x)
  })

  it('lists a town without coordinates instead of drawing it', () => {
    const extra = areaRings(
      [{ name: 'X', towns: ['Wioska Nieznana', 'Zakopane'], note: null }],
      SALON,
    )
    expect(extra.unplaced).toEqual(['Wioska Nieznana'])
    expect(extra.towns.map((t) => t.town)).toEqual(['Zakopane'])
  })
})

describe('placeLabels', () => {
  const overlap = (a: Box, b: Box) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

  it('gives every seed town a label that overlaps no other label and no obstacle', () => {
    const card = AREA_CARD
    const labels = placeLabels(areaRings(zones, SALON, 'Rabka-Zdrój').towns, [card])
    expect(labels).toHaveLength(zones.flatMap((z) => z.towns).length - 1)
    for (const [i, a] of labels.entries()) {
      expect(overlap(a.label, card)).toBe(false)
      expect(a.label.x).toBeGreaterThanOrEqual(0)
      expect(a.label.x + a.label.width).toBeLessThanOrEqual(AREA_BOX.width)
      for (const b of labels.slice(i + 1))
        expect(overlap(a.label, b.label), `${a.town}/${b.town}`).toBe(false)
    }
  })

  it('pushes a label off a neighbour that already took its place', () => {
    const near = [
      { town: 'Alfa', km: 10, ring: 0, x: 500, y: 300 },
      { town: 'Beta', km: 11, ring: 0, x: 502, y: 302 },
    ]
    const [a, b] = placeLabels(near)
    expect(a && b && overlap(a.label, b.label)).toBe(false)
  })
})
