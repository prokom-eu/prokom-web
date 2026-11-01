import { describe, expect, it } from 'vitest'

import {
  buildPlanScenes,
  parseViewBox,
  pickScene,
  planCartItems,
  planHref,
  planParams,
  planStats,
  type FloorPlanRecord,
} from './floorPlan'

const record = (overrides: Partial<FloorPlanRecord> = {}): FloorPlanRecord => ({
  slug: 'sklep',
  name: 'Sklep',
  title: 'Sklep spożywczy',
  lead: ' Kasa i waga. ',
  iconPath: 'M3 9l2-5h14l2 5',
  viewBox: '0 0 1600 800',
  bundles: [{ slug: 'maly-sklep' }, 7, { slug: 'maly-sklep' }],
  points: [
    { x: 800, y: 400, product: { slug: 'ergo' }, label: 'Kasa', description: 'przy ladzie' },
    { x: 100, y: 80, product: { slug: 'ukryta' }, label: 'Ukryta' },
    { x: 1600, y: 0, product: 12, label: 'Bez populacji' },
    { x: 400, y: 200, product: { slug: 'waga' }, label: 'Waga', description: '  ' },
    { x: 10, y: 10, product: null, label: 'Bez karty' },
  ],
  ...overrides,
})

describe('parseViewBox', () => {
  it('reads width and height', () => {
    expect(parseViewBox('0 0 1600 820')).toEqual({ width: 1600, height: 820 })
  })
  it('falls back to the default plan size', () => {
    expect(parseViewBox('bad')).toEqual({ width: 1600, height: 820 })
    expect(parseViewBox('0 0 0 820')).toEqual({ width: 1600, height: 820 })
  })
})

describe('buildPlanScenes', () => {
  const listed = new Set(['ergo', 'waga'])

  it('keeps points of listed cards only and renumbers them', () => {
    const [scene] = buildPlanScenes([record()], listed)
    expect(scene.points.map((p) => [p.n, p.product])).toEqual([
      [1, 'ergo'],
      [2, 'waga'],
    ])
  })

  it('converts the position to percent of the drawing', () => {
    const [scene] = buildPlanScenes([record()], listed)
    expect(scene.points[0]).toMatchObject({ x: 50, y: 50 })
    expect(scene.points[1]).toMatchObject({ x: 25, y: 25 })
    expect(scene).toMatchObject({ width: 1600, height: 800 })
  })

  it('trims texts and drops empty ones', () => {
    const [scene] = buildPlanScenes([record()], listed)
    expect(scene.lead).toBe('Kasa i waga.')
    expect(scene.points[0].description).toBe('przy ladzie')
    expect(scene.points[1].description).toBeNull()
  })

  it('lists each bundle once, populated ones only', () => {
    const [scene] = buildPlanScenes([record()], listed)
    expect(scene.bundles).toEqual(['maly-sklep'])
  })

  it('skips a scene without a visible point', () => {
    expect(buildPlanScenes([record()], new Set())).toEqual([])
  })
})

describe('planStats', () => {
  it('counts scenes, points and distinct products', () => {
    const scenes = buildPlanScenes(
      [record(), record({ slug: 'biuro', title: 'Biuro' })],
      new Set(['ergo', 'waga']),
    )
    expect(planStats(scenes)).toEqual({ scenes: 2, points: 4, products: 2 })
  })
})

describe('pickScene', () => {
  const scenes = buildPlanScenes(
    [record(), record({ slug: 'biuro', title: 'Biuro' })],
    new Set(['ergo']),
  )
  it('finds the scene of the address', () => {
    expect(pickScene(scenes, 'biuro')?.slug).toBe('biuro')
  })
  it('falls back to the first scene', () => {
    expect(pickScene(scenes, 'nie-ma')?.slug).toBe('sklep')
    expect(pickScene(scenes, null)?.slug).toBe('sklep')
    expect(pickScene([], 'sklep')).toBeNull()
  })
})

describe('planCartItems', () => {
  it('adds each product once with the plan note', () => {
    const [scene] = buildPlanScenes(
      [
        record({
          points: [
            { x: 1, y: 1, product: { slug: 'ergo' }, label: 'Kasa 1' },
            { x: 2, y: 2, product: { slug: 'ergo' }, label: 'Kasa 2' },
            { x: 3, y: 3, product: { slug: 'waga' }, label: 'Waga' },
          ],
        }),
      ],
      new Set(['ergo', 'waga']),
    )
    expect(planCartItems(scene)).toEqual([
      { id: 'ergo', q: 1, uwaga: 'Plan: Sklep spożywczy' },
      { id: 'waga', q: 1, uwaga: 'Plan: Sklep spożywczy' },
    ])
  })
})

describe('planHref', () => {
  it('builds the address with the scene', () => {
    expect(planHref()).toBe('/plan-firmy')
    expect(planHref('biuro')).toBe('/plan-firmy?scena=biuro')
  })
})

describe('planParams', () => {
  const specs = ['Procesor', 'Ekran', 'Pamięć RAM', 'Dysk', 'Porty'].map((label) => ({
    label,
    value: `${label} — wartość`,
  }))
  it('takes the key parameters when the card has them', () => {
    expect(planParams([{ label: 'Moc', value: '7 W' }], specs)).toEqual([
      { label: 'Moc', value: '7 W' },
    ])
  })
  it('falls back to the first 4 rows of the specification', () => {
    expect(planParams([], specs).map((p) => p.label)).toEqual([
      'Procesor',
      'Ekran',
      'Pamięć RAM',
      'Dysk',
    ])
  })
  it('skips empty rows', () => {
    expect(
      planParams(null, [
        { label: ' ', value: 'x' },
        { label: 'A', value: null },
      ]),
    ).toEqual([])
  })
})
