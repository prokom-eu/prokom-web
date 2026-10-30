import { describe, expect, it } from 'vitest'

import { prepareSearch } from '../search'
import { buildCatalogIndex } from './catalogIndex'
import {
  activeFilters,
  CATALOG_PAGE_SIZE,
  catalogQueryString,
  catalogSeo,
  clearFilters,
  DEFAULT_STATE,
  parseCatalogState,
  runCatalog,
  updateState,
  type CatalogState,
} from './filters'
import { sourceFromSeed } from './seedSource.fixture'

const index = buildCatalogIndex(sourceFromSeed())
const search = prepareSearch(index)

const parse = (query: string) => parseCatalogState(new URLSearchParams(query), index)
const run = (state: Partial<CatalogState>) =>
  runCatalog(index, search, { ...DEFAULT_STATE, ...state })

describe('parseCatalogState', () => {
  it('reads every filter from the URL (spec. §2, ADR-012 §2.2)', () => {
    expect(
      parse(
        'szukaj=kasa&rodzaj=urzadzenia&grupa=sprzedaz&kategoria=kasy-fiskalne,drukarki-fiskalne' +
          '&marka=posnet&branza=gastronomia&autoryzacja=1&nowosci=1&sortuj=a-z&widok=lista&strona=2',
      ),
    ).toEqual({
      query: 'kasa',
      kind: 'device',
      group: 'sprzedaz',
      categories: ['kasy-fiskalne', 'drukarki-fiskalne'],
      brands: ['posnet'],
      industries: ['gastronomia'],
      authorized: true,
      isNew: true,
      sort: 'az',
      view: 'list',
      page: 2,
    })
  })

  it('gives the default view without parameters', () => {
    expect(parse('')).toEqual(DEFAULT_STATE)
  })

  it('accepts repeated parameters as well as commas', () => {
    expect(parse('marka=posnet&marka=elzab').brands).toEqual(['posnet', 'elzab'])
  })

  it('drops unknown slugs and values instead of showing an empty list', () => {
    expect(
      parse('grupa=nie-ma&kategoria=kasy-fiskalne,nie-ma&marka=x&branza=y&rodzaj=z&sortuj=w'),
    ).toEqual({ ...DEFAULT_STATE, categories: ['kasy-fiskalne'] })
  })

  it('drops categories outside the chosen group (the panel lists only its own)', () => {
    expect(parse('grupa=komputery-biuro&kategoria=kasy-fiskalne,laptopy')).toMatchObject({
      group: 'komputery-biuro',
      categories: ['laptopy'],
    })
  })

  it('takes a page from 1 up, anything else is page 1', () => {
    expect(parse('strona=0').page).toBe(1)
    expect(parse('strona=-3').page).toBe(1)
    expect(parse('strona=abc').page).toBe(1)
    expect(parse('strona=2.5').page).toBe(1)
    expect(parse('strona=3').page).toBe(3)
  })

  it('reads the search params object of a Next page', () => {
    expect(parseCatalogState({ grupa: 'sprzedaz', marka: ['posnet', 'elzab'] }, index)).toEqual({
      ...DEFAULT_STATE,
      group: 'sprzedaz',
      brands: ['posnet', 'elzab'],
    })
  })

  it('trims the search phrase and limits its length', () => {
    expect(parse('szukaj=%20%20terminal%20').query).toBe('terminal')
    expect(parse(`szukaj=${'a'.repeat(300)}`).query).toHaveLength(100)
    expect(parse('szukaj=kasa,%20drukarka').query).toBe('kasa, drukarka')
  })
})

describe('catalogQueryString', () => {
  it('is empty for the default view', () => {
    expect(catalogQueryString(DEFAULT_STATE)).toBe('')
  })

  it('round-trips through parseCatalogState', () => {
    const state = parse(
      'szukaj=kasa fiskalna&rodzaj=uslugi&kategoria=kasy-fiskalne,drukarki-fiskalne&marka=posnet' +
        '&branza=gastronomia,handel&nowosci=1&sortuj=nowosci&widok=lista&strona=3',
    )
    expect(parse(catalogQueryString(state))).toEqual(state)
  })

  it('writes readable parameters in a fixed order', () => {
    expect(
      catalogQueryString({
        ...DEFAULT_STATE,
        brands: ['posnet', 'elzab'],
        group: 'sprzedaz',
        query: 'kasa',
      }),
    ).toBe('szukaj=kasa&grupa=sprzedaz&marka=posnet%2Celzab')
  })
})

describe('updateState', () => {
  it('goes back to page 1 when a filter changes', () => {
    expect(updateState({ ...DEFAULT_STATE, page: 3 }, { isNew: true })).toMatchObject({
      isNew: true,
      page: 1,
    })
  })

  it('keeps the page when only the page or the view changes', () => {
    expect(updateState({ ...DEFAULT_STATE, page: 3 }, { view: 'list' }).page).toBe(3)
    expect(updateState(DEFAULT_STATE, { page: 2 }).page).toBe(2)
  })
})

describe('runCatalog on the seed package', () => {
  it('lists all 225 products by popularity without filters', () => {
    const { results } = run({})
    expect(results).toHaveLength(225)
    const popularity = results.map((product) => product.popularity)
    expect(popularity).toEqual([...popularity].sort((a, b) => b - a))
  })

  it('counts kinds and groups of katalog v2 (ZMIANY-katalog-v2 §1)', () => {
    const { facets } = run({})
    expect(facets.kinds).toEqual({ all: 225, device: 186, software: 26, service: 13 })
    expect(facets.groups).toEqual({
      all: 225,
      sprzedaz: 159,
      'komputery-biuro': 16,
      oprogramowanie: 25,
      'bezpieczenstwo-siec': 12,
      'serwis-uslugi': 13,
    })
    expect(facets.categories['kasy-fiskalne']).toBe(11)
  })

  it('combines filters: AND between groups, OR inside one', () => {
    const one = run({ brands: ['posnet'] }).results
    const two = run({ brands: ['posnet', 'elzab'] }).results
    expect(two.length).toBeGreaterThan(one.length)
    expect(two.every((p) => p.brand === 'posnet' || p.brand === 'elzab')).toBe(true)

    const both = run({ brands: ['posnet', 'elzab'], categories: ['kasy-fiskalne'] }).results
    expect(both.length).toBeGreaterThan(0)
    expect(
      both.every(
        (p) =>
          (p.brand === 'posnet' || p.brand === 'elzab') && p.categories.includes('kasy-fiskalne'),
      ),
    ).toBe(true)
  })

  it('counts each facet with the other filters but without its own (spec. §8.3)', () => {
    const state = { brands: ['posnet'], kind: 'device' as const }
    const { facets, results } = run(state)
    // Brands: counted without the brand filter, but with the kind.
    expect(facets.brands.posnet).toBe(results.length)
    expect(facets.brands.elzab).toBe(run({ brands: ['elzab'], kind: 'device' }).results.length)
    // Kinds: counted without the kind filter, but with the brand.
    expect(facets.kinds.all).toBe(run({ brands: ['posnet'] }).results.length)
    expect(facets.kinds.service).toBe(run({ brands: ['posnet'], kind: 'service' }).results.length)
  })

  it('filters by industry, authorization and news', () => {
    const gastro = run({ industries: ['gastronomia'] }).results
    expect(gastro.length).toBeGreaterThan(0)
    expect(gastro.every((p) => p.industries.includes('gastronomia'))).toBe(true)
    expect(run({ authorized: true }).results.every((p) => p.authorized)).toBe(true)
    const news = run({ isNew: true })
    expect(news.results.every((p) => p.isNew)).toBe(true)
    expect(news.facets.isNew).toBe(news.results.length)
    expect(news.facets.authorized).toBe(run({ isNew: true, authorized: true }).results.length)
  })

  it('counts group tiles as their click shows them: without the categories it clears', () => {
    const { facets } = run({ categories: ['kasy-fiskalne'] })
    expect(facets.groups['komputery-biuro']).toBe(16)
    expect(facets.groups.all).toBe(225)
    // Other filters still apply.
    expect(run({ brands: ['posnet'] }).facets.groups.all).toBe(
      run({ brands: ['posnet'] }).results.length,
    )
  })

  it('takes the group of the main category', () => {
    const { results } = run({ group: 'sprzedaz' })
    expect(results).toHaveLength(159)
    expect(results.every((p) => p.group === 'sprzedaz')).toBe(true)
  })

  it('searches with the phrase from the search box (?szukaj=)', () => {
    const { results } = run({ query: 'kasa fiskalan' })
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.categories).toContain('kasy-fiskalne')
    expect(run({ query: 'nic-takiego-nie-ma' }).results).toEqual([])
  })

  it('sorts by name and by news', () => {
    const names = run({ sort: 'az' }).results.map((p) => p.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pl')))
    const news = run({ sort: 'new' }).results
    const firstOld = news.findIndex((p) => !p.isNew)
    expect(firstOld).toBeGreaterThan(0)
    expect(news.slice(firstOld).some((p) => p.isNew)).toBe(false)
  })

  it('shows pages cumulatively: page N = the first N × 12', () => {
    expect(run({}).visible).toHaveLength(CATALOG_PAGE_SIZE)
    expect(run({ page: 2 }).visible).toHaveLength(2 * CATALOG_PAGE_SIZE)
    expect(run({ page: 99 }).visible).toHaveLength(225)
    expect(run({ page: 2 }).visible).toEqual(run({}).results.slice(0, 24))
  })
})

describe('activeFilters', () => {
  it('lists chips with names and the change that removes each', () => {
    const state: CatalogState = {
      ...DEFAULT_STATE,
      query: 'kasa',
      kind: 'device',
      group: 'sprzedaz',
      categories: ['kasy-fiskalne', 'drukarki-fiskalne'],
      brands: ['posnet'],
      industries: ['gastronomia'],
      authorized: true,
      isNew: true,
      page: 2,
    }
    const chips = activeFilters(state, index)
    expect(chips.map((chip) => chip.label)).toEqual([
      '„kasa”',
      'Urządzenia',
      'Kasy i sprzedaż',
      'Kasy fiskalne',
      'Drukarki fiskalne',
      'Posnet',
      'Gastronomia',
      'Autoryzacja PRO-KOM',
      'Nowości',
    ])
    const kasy = chips.find((chip) => chip.label === 'Kasy fiskalne')!
    expect(kasy.remove).toEqual({ categories: ['drukarki-fiskalne'] })
  })

  it('is empty without filters (sort, view and page are not filters)', () => {
    expect(activeFilters({ ...DEFAULT_STATE, sort: 'az', view: 'list', page: 2 }, index)).toEqual(
      [],
    )
  })
})

describe('clearFilters', () => {
  const state: CatalogState = {
    ...DEFAULT_STATE,
    query: 'kasa',
    brands: ['posnet'],
    sort: 'az',
    view: 'list',
    page: 3,
  }

  it('clears every filter and the phrase, keeping the sort and the view', () => {
    expect(clearFilters(state)).toEqual({ ...DEFAULT_STATE, sort: 'az', view: 'list' })
  })

  it('keeps the phrase when asked (the panel clears only its own filters)', () => {
    expect(clearFilters(state, { keepQuery: true })).toEqual({
      ...DEFAULT_STATE,
      query: 'kasa',
      sort: 'az',
      view: 'list',
    })
  })
})

describe('catalogSeo (ADR-012 §2.2)', () => {
  it('indexes the catalog itself', () => {
    expect(catalogSeo(DEFAULT_STATE, 67)).toEqual({ index: true, canonical: '/oferta' })
  })

  it('indexes a page with a canonical to itself', () => {
    expect(catalogSeo({ ...DEFAULT_STATE, page: 2 }, 67)).toEqual({
      index: true,
      canonical: '/oferta?strona=2',
    })
  })

  it('points a page past the end to the last page (no duplicate of it in the index)', () => {
    // 67 positions: pages 1–6.
    expect(catalogSeo({ ...DEFAULT_STATE, page: 6 }, 67).canonical).toBe('/oferta?strona=6')
    expect(catalogSeo({ ...DEFAULT_STATE, page: 999 }, 67).canonical).toBe('/oferta?strona=6')
    expect(catalogSeo({ ...DEFAULT_STATE, page: 3 }, 5).canonical).toBe('/oferta')
  })

  it('keeps any filtered, searched, sorted or switched view out of the index', () => {
    const states: Partial<CatalogState>[] = [
      { brands: ['posnet'] },
      { query: 'kasa' },
      { sort: 'az' },
      { view: 'list' },
      { isNew: true, page: 2 },
    ]
    for (const state of states) {
      expect(catalogSeo({ ...DEFAULT_STATE, ...state }, 67)).toEqual({
        index: false,
        canonical: '/oferta',
      })
    }
  })
})
