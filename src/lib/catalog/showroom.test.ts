import { describe, expect, it } from 'vitest'

import type { Partner, Product } from '@/payload-types'

import showrooms from '../../../seed/prokombiznes/k31/marki-salony-k31.json'

import {
  buildShowroomView,
  listShowroom,
  pickWizardRule,
  seriesColumns,
  seriesSlug,
  seriesVideo,
  showroomStats,
  type ShowroomRule,
  type ShowroomView,
} from './showroom'

const BIZNES = 1
const OTHER = 2

const product = (id: number, slug: string, tenant = BIZNES) =>
  ({ id, slug, tenant }) as unknown as Product

const LENOVO_RULES: NonNullable<Partner['showroom']>['wizardRules'] = [
  { when: ['cad'], series: 'ThinkPad P', why: 'CAD', products: [product(1, 'p14s')] },
  { when: ['pen'], series: 'ThinkPad 2-in-1', why: 'Pióro', products: [] },
  { when: ['teren', 'light'], series: 'ThinkPad X1 i T14s', why: 'Lekki', products: [] },
  { when: ['big'], series: 'ThinkBook 16 / ThinkPad E16', why: 'Ekran', products: [] },
  { when: ['tough'], series: 'ThinkPad T', why: 'Na lata', products: [] },
  { when: [], series: 'ThinkBook', why: 'Uniwersalny', products: [] },
]

const partner = (showroom: Partner['showroom']): Partner =>
  ({
    id: 7,
    name: 'Lenovo',
    slug: 'lenovo',
    tenants: [BIZNES],
    showroom,
  }) as unknown as Partner

const SHOWROOM: NonNullable<Partner['showroom']> = {
  h1: ' Lenovo dla firm ',
  lead: 'Laptopy i komputery.',
  heroProducts: [product(1, 'p14s'), product(2, 'thinkbook-14'), 99],
  compareTitle: null,
  wizardTitle: 'Który Lenovo dla Ciebie?',
  segments: [
    {
      name: 'Laptopy',
      key: 'laptopy',
      iconPath: 'M4 6h16v10H4z',
      series: [
        {
          name: 'ThinkBook',
          tier: 'Biznes',
          audience: 'Biuro',
          highlight: 'Złącza',
          imageProduct: product(2, 'thinkbook-14'),
          products: [product(2, 'thinkbook-14'), product(3, 'thinkbook-16')],
        },
        {
          name: 'ThinkPad P',
          tier: 'Pro',
          audience: 'CAD',
          highlight: null,
          imageProduct: null,
          products: [product(1, 'p14s'), product(8, 'obcy', OTHER)],
        },
        { name: 'Yoga', tier: 'Premium', products: [product(4, 'yoga-szkic')] },
      ],
    },
    { name: 'Sale spotkań', key: 'sale', series: [{ name: 'ThinkSmart', products: [] }] },
  ],
  wizard: [
    {
      question: 'Gdzie pracujesz?',
      options: [
        { label: 'W biurze', key: 'biuro' },
        { label: 'W terenie', key: 'teren' },
      ],
    },
  ],
  wizardRules: LENOVO_RULES,
  services: [{ title: 'Konfiguracja', iconPath: null, description: 'Instalujemy.' }],
  videos: [
    { series: 'ThinkBook', youtubeId: 'UFXLZ4kSjD0', title: 'ThinkBook', active: true },
    { series: 'Yoga', youtubeId: 'aaaaaaaaaaa', title: 'Yoga', active: false },
  ],
}

describe('buildShowroomView', () => {
  const view = buildShowroomView(partner(SHOWROOM), BIZNES)!

  it('reads the panel data: texts trimmed, products as slugs of this site only', () => {
    expect(view.h1).toBe('Lenovo dla firm')
    expect(view.compareTitle).toBeNull()
    expect(view.hero).toEqual(['p14s', 'thinkbook-14'])
    const laptops = view.segments[0]!
    expect(laptops.series.map((series) => series.name)).toEqual(['ThinkBook', 'ThinkPad P', 'Yoga'])
    expect(laptops.series[1]!.products).toEqual(['p14s'])
    expect(laptops.series[0]!.image).toBe('thinkbook-14')
    expect(laptops.series[0]!.slug).toBe('thinkbook')
    expect(view.rules[0]).toEqual({
      when: ['cad'],
      series: 'ThinkPad P',
      why: 'CAD',
      products: ['p14s'],
    })
  })

  it('keeps only active films (ADR-016)', () => {
    expect(view.videos.map((video) => video.series)).toEqual(['ThinkBook'])
  })

  it('is null without a showroom, for another site or without segments', () => {
    expect(buildShowroomView(partner(undefined), BIZNES)).toBeNull()
    expect(buildShowroomView(partner(SHOWROOM), OTHER)).toBeNull()
    expect(buildShowroomView(partner({ ...SHOWROOM, segments: [] }), BIZNES)).toBeNull()
  })
})

describe('listShowroom — only listed (published) cards', () => {
  const view = buildShowroomView(partner(SHOWROOM), BIZNES)!
  const listed = listShowroom(view, new Set(['p14s', 'thinkbook-14', 'thinkbook-16']))!

  it('drops unlisted cards, then series and segments left empty', () => {
    expect(listed.segments).toHaveLength(1)
    expect(listed.segments[0]!.series.map((series) => series.name)).toEqual([
      'ThinkBook',
      'ThinkPad P',
    ])
  })

  it('a series picture of an unlisted card is dropped (icon of the segment instead)', () => {
    const noImage = listShowroom(view, new Set(['p14s', 'thinkbook-16']))!
    expect(noImage.segments[0]!.series[0]!.image).toBeNull()
  })

  it('counts listed cards, series and segments for the hero', () => {
    expect(showroomStats(listed)).toEqual({ products: 3, series: 2, segments: 1 })
  })

  it('is null when no listed card is left', () => {
    expect(listShowroom(view, new Set())).toBeNull()
  })

  it('a rule keeps only listed products and stays without them', () => {
    expect(listShowroom(view, new Set(['thinkbook-14']))!.rules[0]!.products).toEqual([])
  })
})

describe('pickWizardRule — first matching, the last is the default', () => {
  const rules: ShowroomView['rules'] = (LENOVO_RULES ?? []).map((rule) => ({
    when: rule.when ?? [],
    series: rule.series,
    why: rule.why,
    products: [],
  }))
  const series = (answers: string[]) => pickWizardRule(rules, answers)?.series

  it('CAD wins over everything else', () => {
    expect(series(['teren', 'cad', 'light'])).toBe('ThinkPad P')
  })

  it('all keys of a rule must be among the answers', () => {
    expect(series(['teren', 'office', 'light'])).toBe('ThinkPad X1 i T14s')
    expect(series(['biuro', 'office', 'light'])).toBe('ThinkBook')
  })

  it('the first answers of each question (start of the wizard) give the default series', () => {
    expect(series(['biuro', 'office', 'tough'])).toBe('ThinkPad T')
  })

  it('no rules → null', () => {
    expect(pickWizardRule([], ['biuro'])).toBeNull()
  })
})

describe('layout helpers', () => {
  it('series grid: up to 6 in one row (at least 3 columns), more in two rows', () => {
    expect(seriesColumns(1)).toBe(3)
    expect(seriesColumns(5)).toBe(5)
    expect(seriesColumns(6)).toBe(6)
    expect(seriesColumns(9)).toBe(5)
  })

  it('series slug for `?seria=`', () => {
    expect(seriesSlug('ThinkPad T i X13')).toBe('thinkpad-t-i-x13')
    expect(seriesSlug('ThinkPad 2-in-1')).toBe('thinkpad-2-in-1')
    expect(seriesSlug(' Dell Pro P i Plus ')).toBe('dell-pro-p-i-plus')
    expect(seriesSlug('Monitory z kamerą')).toBe('monitory-z-kamera')
  })

  it('film of the chosen series, else of the first series that has one', () => {
    const videos = [
      { series: 'ThinkPad T', id: 'a', title: 'T', channel: null, lang: null },
      { series: 'ThinkBook', id: 'b', title: 'B', channel: null, lang: null },
    ]
    expect(seriesVideo(videos, ['ThinkBook', 'ThinkPad T'])?.id).toBe('b')
    expect(seriesVideo(videos, ['Yoga', 'ThinkPad T'])?.id).toBe('a')
    expect(seriesVideo(videos, ['Yoga'])?.id).toBe('a')
    expect(seriesVideo([], ['Yoga'])).toBeNull()
  })
})

describe('wizard on the package rules (K31c acceptance: 3 answer sets → expected series)', () => {
  const rulesOf = (brand: 'Lenovo' | 'Dell'): ShowroomRule[] =>
    showrooms.salony[brand].wizRules.map((rule) => ({
      when: rule.when,
      series: rule.ser,
      why: rule.why,
      products: rule.p,
    }))

  it.each([
    ['Lenovo', ['biuro', 'cad', 'tough'], 'ThinkPad P'],
    ['Lenovo', ['dom', 'pen', 'light'], 'ThinkPad 2-in-1'],
    ['Lenovo', ['teren', 'office', 'light'], 'ThinkPad X1 i T14s'],
    ['Lenovo', ['biuro', 'office', 'tough'], 'ThinkPad T'],
    ['Dell', ['biuro', 'cad', 'tough'], 'Dell Pro Precision'],
    ['Dell', ['teren', 'office', 'light'], 'XPS / Dell Pro 14'],
    ['Dell', ['biuro', 'office', 'tough'], 'Dell Pro'],
  ] as const)('%s %j → %s', (brand, answers, series) => {
    expect(pickWizardRule(rulesOf(brand), answers)?.series).toBe(series)
  })
})
