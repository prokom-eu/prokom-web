import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { buildSolutionsIndex } from './solutionsIndex'
import { solutionsSourceFromSeed } from './solutionsIndex.fixture'

const index = buildSolutionsIndex(solutionsSourceFromSeed())
const solutionOf = (slug: string) => index.solutions.find((solution) => solution.slug === slug)

describe('solutions index on the seed package', () => {
  it('lists the 29 solutions, none removed from the offer (ADR-014 v20 pkt 2)', () => {
    expect(index.solutions).toHaveLength(29)
    const slugs = new Set(index.solutions.map((solution) => solution.slug))
    for (const removed of rozwiazania.removed) expect(slugs.has(removed.slug)).toBe(false)
  })

  it('stays under 30 KB gzip (SW3 acceptance)', () => {
    expect(gzipSync(JSON.stringify(index)).length).toBeLessThan(30 * 1024)
  })

  it('carries the one „od” price, the „od” term and the thumbnail (v22)', () => {
    const solution = solutionOf('strona-firmowa-z-panelem')
    expect(solution).toMatchObject({
      priceFrom: 2490,
      leadTime: 'od 2 tygodni',
      thumbnail: '/software/rozwiazania/strona-firmowa-z-panelem.svg',
      levels: [],
    })
    expect(solution).not.toHaveProperty('prices')
    expect(solution).not.toHaveProperty('leadTimes')
    expect(solution).not.toHaveProperty('sizeNames')
  })

  it('keeps 0 as a price and an empty price as none', () => {
    expect(solutionOf('audyt-strony-lub-programu')?.priceFrom).toBe(0)
    const app = index.solutions.find((solution) => solution.category === 'aplikacje')
    expect(app?.priceFrom).toBeNull()
    expect(app?.leadTime).toBeNull()
  })

  it('carries the monthly flag and the levels of care and audit (v22)', () => {
    const care = solutionOf('opieka-nad-strona-i-systemem')
    expect(care).toMatchObject({ priceMonthly: true, priceFrom: 149 })
    expect(care?.levels.map(({ name, price, recommended }) => [name, price, recommended])).toEqual([
      ['Podstawowa', 149, false],
      ['Rozszerzona', 299, true],
      ['Systemy', 790, false],
    ])
    expect(solutionOf('audyt-strony-lub-programu')?.levels.map(({ term }) => term)).toEqual([
      '2 dni robocze',
      '1 tydzień',
      '2 tygodnie',
    ])
    expect(solutionOf('strona-firmowa-z-panelem')?.priceMonthly).toBe(false)
  })

  it('carries the „12 rzeczy” card only when it differs from the catalog card (SW5)', () => {
    const withCard = index.solutions.filter((solution) => solution.featured)
    expect(withCard.length).toBeGreaterThan(0)
    for (const solution of withCard) {
      expect(Object.values(solution.featured ?? {}).every((value) => value !== undefined)).toBe(
        true,
      )
    }
    const source = solutionsSourceFromSeed()
    source.solutions[0] = { ...source.solutions[0], featured: { name: ' ', features: [] } }
    expect(buildSolutionsIndex(source).solutions[0]?.featured).toBeUndefined()
  })

  it('has the price templates of the wizard settings', () => {
    expect(index.priceDisplay).toMatchObject({
      template: 'od {cena} zł netto',
      short: 'od {cena} zł',
      monthTemplate: 'od {cena} zł / mies.',
      fallback: 'Zapytaj o wycenę',
      termFallback: 'po krótkiej rozmowie',
    })
  })

  it('falls back to the default templates without valid wizard settings', () => {
    const source = solutionsSourceFromSeed()
    const broken = buildSolutionsIndex({ ...source, priceDisplay: { template: 'bez tokenu' } })
    expect(broken.priceDisplay.template).toBe('od {cena} zł netto')
    expect(buildSolutionsIndex({ ...source, priceDisplay: null }).priceDisplay.fallback).toBe(
      'Zapytaj o wycenę',
    )
  })

  it('counts solutions per category, in the catalog order', () => {
    expect(index.categories.map((category) => category.slug)).toEqual([
      'strony',
      'systemy',
      'aplikacje',
      'automatyzacje',
      'opieka',
    ])
    const total = index.categories.reduce((sum, category) => sum + category.count, 0)
    expect(total).toBe(29)
  })

  it('leaves out an empty category', () => {
    const source = solutionsSourceFromSeed()
    const onlySites = source.solutions.filter((solution) => solution.category === 'strony')
    const sitesIndex = buildSolutionsIndex({ ...source, solutions: onlySites })
    expect(sitesIndex.categories.map((category) => category.slug)).toEqual(['strony'])
  })

  it('has the filters and the search settings', () => {
    expect(index.industryGroups).toHaveLength(8)
    expect(index.situations.map((situation) => situation.slug)).toEqual(['Z', 'R', 'P'])
    expect(index.search.synonyms.excel).toEqual(['arkusz', 'tabelka', 'z excela do systemu'])
    expect(index.search.popular).toContain('pensjonat')
  })

  it('searches a normalized text of the card, keywords included', () => {
    const site = solutionOf('strona-firmowa-z-panelem')!
    expect(site.hay).toContain('strona firmowa z panelem')
    expect(site.hay).toContain('formularz')
    expect(site.hay).not.toMatch(/[A-ZĄĆĘŁŃÓŚŹŻ]/)
  })
})
