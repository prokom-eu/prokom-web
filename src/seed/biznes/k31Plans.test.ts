import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { k31Series, k31SeriesVideos, k31Scenes, k31Showrooms, loadK31Catalog } from './k31Data'
import { cardsOf, floorPlanData, seriesMismatches, showroomData } from './k31Plans'

const { catalog } = loadK31Catalog()
const cards = cardsOf(catalog)
// Fake record ids: one per live card.
const ids = new Map(catalog.cards.map((card, index) => [card.slug_seed, index + 1]))
const id = (slug: string) => ids.get(slug)
const slugOf = new Map([...ids].map(([slug, value]) => [value, slug]))
const slugs = (values: (number | { id: number } | null | undefined)[] | null | undefined) =>
  (values ?? []).map((value) => slugOf.get(typeof value === 'number' ? value : value!.id))
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

describe('showrooms (Partners.showroom)', () => {
  const lenovo = showroomData(
    'Lenovo',
    k31Showrooms.Lenovo!,
    k31SeriesVideos.Lenovo ?? {},
    cards,
    id,
  )
  const dell = showroomData('Dell', k31Showrooms.Dell!, k31SeriesVideos.Dell ?? {}, cards, id)

  it('has the departments, questions, rules and services of the package', () => {
    expect(lenovo.segments?.map((segment) => segment.key)).toEqual([
      'laptopy',
      'komputery',
      'stacje-robocze',
      'monitory',
      'wideokonferencje',
    ])
    expect(dell.segments).toHaveLength(6)
    expect(dell.segments?.find((segment) => segment.key === 'akcesoria')).toBeTruthy()
    expect(lenovo.wizard).toHaveLength(3)
    expect(lenovo.wizardRules).toHaveLength(6)
    expect(dell.wizardRules).toHaveLength(4)
    expect(lenovo.services).toHaveLength(6)
    expect(slugs(lenovo.heroProducts)).toHaveLength(3)
  })

  it('lists both cards of a split series (Yoga Pro 7 and 9) and none of a split source', () => {
    const yoga = lenovo.segments
      ?.flatMap((segment) => segment.series ?? [])
      .find((series) => series.name === 'Yoga')
    const yogaSlugs = slugs(yoga?.products)
    expect(yogaSlugs).not.toContain('lenovo-yoga-pro')
    expect(yogaSlugs.filter((slug) => slug?.startsWith('lenovo-yoga-pro-'))).toHaveLength(2)
    expect(yogaSlugs.every(Boolean)).toBe(true)
  })

  it('keeps the series films as in the package: 4 for Lenovo, none for Dell', () => {
    expect(lenovo.videos?.map((video) => video.series)).toEqual([
      'ThinkPad',
      'ThinkBook',
      'Yoga',
      'IdeaPad',
    ])
    expect(lenovo.videos?.every((video) => video.active)).toBe(true)
    expect(dell.videos).toEqual([])
  })

  it('reports cards whose series differs from the showroom tile (package data)', () => {
    expect(seriesMismatches(k31Showrooms.Lenovo!, k31Series)).toEqual([])
    expect(seriesMismatches(k31Showrooms.Dell!, k31Series)).toEqual([
      'dell-pro-max-desktop: karta „Dell Pro Precision”, salon „Dell Pro Max”',
      'dell-pro-max-plus: karta „Dell Pro Precision”, salon „Dell Pro Max”',
      'dell-pro-precision-7: karta „Dell Pro Precision”, salon „Dell Pro Max”',
    ])
  })

  it('fails when a card has no record yet', () => {
    expect(() => showroomData('Lenovo', k31Showrooms.Lenovo!, {}, cards, () => undefined)).toThrow(
      /no record/,
    )
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

describe('series films switched off by the weekly check', () => {
  it('stay off on the next import', () => {
    const thinkPad = k31SeriesVideos.Lenovo!.ThinkPad!.id
    const data = showroomData('Lenovo', k31Showrooms.Lenovo!, k31SeriesVideos.Lenovo!, cards, id, {
      videos: [{ series: 'ThinkPad', youtubeId: thinkPad, title: 'x', active: false }],
    })
    expect(data.videos?.find((video) => video.youtubeId === thinkPad)?.active).toBe(false)
    expect(data.videos?.filter((video) => video.active)).toHaveLength(3)
  })
})
