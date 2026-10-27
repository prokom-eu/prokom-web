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

  it('computes the price „od” and the term from the sizes', () => {
    expect(solutionOf('strona-firmowa-z-panelem')).toMatchObject({
      prices: { start: 2490, std: 3390, full: 5490 },
      priceFrom: 2490,
      leadTime: '2 tygodnie',
    })
  })

  it('keeps 0 as a price and an empty price as none', () => {
    const audit = index.solutions.find((solution) => solution.prices.start === 0)
    expect(audit?.priceFrom).toBe(0)
    const app = index.solutions.find((solution) => solution.category === 'aplikacje')
    expect(app?.prices).toEqual({})
    expect(app?.priceFrom).toBeNull()
  })

  it('carries the monthly flag and the version names (SW9)', () => {
    expect(solutionOf('opieka-nad-strona-i-systemem')).toMatchObject({
      priceMonthly: true,
      sizeNames: { start: 'Podstawowa', std: 'Standard', full: 'Systemy' },
    })
    expect(solutionOf('strona-firmowa-z-panelem')).toMatchObject({
      priceMonthly: false,
      sizeNames: {},
    })
  })

  it('has the price templates of the wizard settings', () => {
    expect(index.priceDisplay).toMatchObject({
      templateFrom: 'od {cena} zł netto',
      monthTemplate: 'od {cena} zł / mies.',
      fallback: 'Zapytaj o wycenę',
      termFallback: 'po krótkiej rozmowie',
    })
  })

  it('falls back to the default templates without valid wizard settings', () => {
    const source = solutionsSourceFromSeed()
    const broken = buildSolutionsIndex({ ...source, priceDisplay: { template: 'bez tokenu' } })
    expect(broken.priceDisplay.templateFrom).toBe('od {cena} zł netto')
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
