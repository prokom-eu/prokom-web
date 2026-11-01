import { describe, expect, it } from 'vitest'

import {
  buildMap,
  classify,
  clipLine,
  HEIGHT,
  insideRing,
  joinRings,
  labelAngle,
  project,
  TARGET,
  WIDTH,
} from '../../../scripts/software-osm-map.mjs'
import { OSM_MAP } from '../../sites/software/blocks/SwContactPage/osmMap.generated'

// SWV4 (ZMIANY-v23 §6): the contact map drawn once from OpenStreetMap data.

describe('software-osm-map', () => {
  it('centres the map on Orkana 16B, north up', () => {
    expect(project(TARGET.lat, TARGET.lon)).toEqual([WIDTH / 2, HEIGHT / 2])
    const [, north] = project(TARGET.lat + 0.001, TARGET.lon)
    const [east] = project(TARGET.lat, TARGET.lon + 0.001)
    expect(north).toBeLessThan(HEIGHT / 2)
    expect(east).toBeGreaterThan(WIDTH / 2)
  })

  it('sorts OSM tags into the layers of the map', () => {
    expect(classify({ highway: 'tertiary' })).toBe('r1')
    expect(classify({ highway: 'residential' })).toBe('r2')
    expect(classify({ highway: 'service' })).toBe('r3')
    expect(classify({ highway: 'footway' })).toBe('r4')
    expect(classify({ building: 'yes', amenity: 'school' })).toBe('b')
    expect(classify({ railway: 'rail' })).toBe('rail')
    expect(classify({ waterway: 'river' })).toBe('ww')
    expect(classify({ amenity: 'parking' })).toBe('park')
    expect(classify({ leisure: 'park' })).toBe('green')
    expect(classify({ natural: 'wood' })).toBe('wood')
    expect(classify({ highway: 'bus_stop' })).toBeNull()
    expect(classify(undefined)).toBeNull()
  })

  it('keeps labels readable (never upside down)', () => {
    expect(labelAngle([0, 0], [10, 0])).toBe(0)
    expect(labelAngle([10, 0], [0, 0])).toBe(0)
    expect(labelAngle([0, 10], [0, 0])).toBe(-90)
  })

  it('finds the building around a point and joins multipolygon parts into rings', () => {
    const square: [number, number][] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ]
    expect(insideRing([5, 5], square)).toBe(true)
    expect(insideRing([15, 5], square)).toBe(false)
    const [ring] = joinRings([square.slice(0, 3), square.slice(2).reverse()])
    expect(ring[0]).toEqual(ring[ring.length - 1])
  })

  it('drops the part of a long road far outside the frame', () => {
    const runs = clipLine(
      [
        [-500, 0],
        [-400, 0],
        [-10, 10],
        [100, 10],
      ],
      40,
    )
    expect(runs).toEqual([
      [
        [-400, 0],
        [-10, 10],
        [100, 10],
      ],
    ])
  })

  it('builds the highlight, the pin and the labels from an OSM answer', () => {
    const node = (id: number, lat: number, lon: number) => ({ type: 'node', id, lat, lon })
    const d = 0.0002
    const map = buildMap({
      elements: [
        node(1, TARGET.lat - d, TARGET.lon - d),
        node(2, TARGET.lat - d, TARGET.lon + d),
        node(3, TARGET.lat + d, TARGET.lon + d),
        node(4, TARGET.lat + d, TARGET.lon - d),
        node(5, TARGET.lat - 0.001, TARGET.lon - 0.002),
        node(6, TARGET.lat - 0.0005, TARGET.lon + 0.002),
        { type: 'way', id: 10, nodes: [1, 2, 3, 4, 1], tags: { building: 'yes' } },
        {
          type: 'way',
          id: 11,
          nodes: [5, 6],
          tags: { highway: 'tertiary', name: 'Władysława Orkana' },
        },
      ],
    })
    expect(map.target).toMatch(/^M.*Z$/)
    expect(map.pin).toEqual([WIDTH / 2, HEIGHT / 2])
    expect(map.labels.map((label) => label.text)).toEqual(['ul. Orkana'])
    expect(map.osmHref).toContain('openstreetmap.org')
  })

  it('has a generated map with the building, the three streets and the station', () => {
    expect(OSM_MAP.target).not.toBe('')
    expect(OSM_MAP.labels.map((label) => label.text)).toEqual([
      'ul. Orkana',
      'ul. Zakopiańska',
      'ul. Piłsudskiego',
    ])
    expect(OSM_MAP.station?.text).toMatch(/Dworzec/)
    for (const layer of ['b', 'r1', 'r2', 'rail'] as const)
      expect(OSM_MAP.layers[layer]).toMatch(/^M/)
  })
})
