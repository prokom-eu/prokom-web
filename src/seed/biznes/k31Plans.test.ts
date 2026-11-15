import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { k31Series, k31Scenes, loadK31Catalog } from './k31Data'
import { cardsOf, floorPlanData, showroomSeries } from './k31Plans'

const { catalog } = loadK31Catalog()
const cards = cardsOf(catalog)
// Fake record ids: one per live card.
const ids = new Map(catalog.cards.map((card, index) => [card.slug_seed, index + 1]))
const id = (slug: string) => ids.get(slug)
const slugOf = new Map([...ids].map(([slug, value]) => [value, slug]))
const svgOf = (file: string) =>
  readFileSync(path.resolve(__dirname, '../../../seed/prokombiznes/k31', file), 'utf8')

describe('cards named by the K3.1 packages', () => {
  it('a live card is itself, a split source becomes its new cards (301 target first)', () => {
    expect(cards('lenovo-v15')).toEqual(['lenovo-v15'])
    expect(cards('lenovo-yoga-pro')).toHaveLength(2)
    expect(cards('dell-pro-7')[0]).toBe('dell-pro-7-13-14')
    // Avtek TS 9 Mate G keeps its address: still a card of its own.
    expect(cards('avtek-ts-9-mate-g')).toEqual(['avtek-ts-9-mate-g'])
  })

  it('fails on a card the catalog does not know', () => {
    expect(() => cards('nie-ma-takiej')).toThrow(/unknown card/)
  })
})

describe('series of the cards from the K3.1 showrooms', () => {
  it('the showroom series wins over `seria_karty` (decision 28.10: Dell Pro Max)', () => {
    expect(k31Series['dell-pro-max-desktop']).toBe('Dell Pro Max')
    expect(k31Series['dell-pro-max-plus']).toBe('Dell Pro Max')
    expect(k31Series['dell-pro-precision-7']).toBe('Dell Pro Max')
    expect(k31Series['dell-pro-precision-5']).toBe('Dell Pro Precision')
  })

  it('showroomSeries: a card outside every showroom keeps its own series', () => {
    const showroom = { segs: [{ id: 'x', n: 'X', series: [{ n: 'Salon', prods: ['a'] }] }] }
    expect(showroomSeries({ a: 'Karta', b: 'Inna' }, { Dell: showroom })).toEqual({
      a: 'Salon',
      b: 'Inna',
    })
  })
})

describe('floor plans (FloorPlans)', () => {
  const plans = k31Scenes.map((scene, index) =>
    floorPlanData(scene, index, svgOf(scene.svg), cards, id),
  )

  it('imports 12 scenes and 186 points, each linked to a card', () => {
    expect(plans).toHaveLength(12)
    expect(plans.flatMap((plan) => plan.points)).toHaveLength(186)
    expect(
      plans.every((plan) => plan.points.every((point) => slugOf.has(point.product as number))),
    ).toBe(true)
    expect(plans[0]).toMatchObject({
      slug: 'sklep',
      name: 'Sklep',
      order: 0,
      viewBox: '0 0 1600 820',
    })
  })

  it('rejects an unsafe floor plan', () => {
    expect(() => floorPlanData(k31Scenes[0]!, 0, '<svg><script/></svg>', cards, id)).toThrow(
      /not a safe SVG/,
    )
  })
})
