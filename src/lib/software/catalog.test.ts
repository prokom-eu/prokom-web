import { describe, expect, it } from 'vitest'

import {
  CATALOG_PATH,
  catalogHref,
  catalogSeo,
  DEFAULT_CATALOG_STATE,
  parseCatalogState,
  runCatalog,
  type SoftwareCatalogState,
} from './catalog'
import { prepareSolutionSearch } from './search'
import { buildSolutionsIndex } from './solutionsIndex'
import { solutionsSourceFromSeed } from './solutionsIndex.fixture'

const index = buildSolutionsIndex(solutionsSourceFromSeed())
const prepared = prepareSolutionSearch(index)
const run = (patch: Partial<SoftwareCatalogState>) =>
  runCatalog(index, prepared, { ...DEFAULT_CATALOG_STATE, ...patch })
const slugs = (state: Partial<SoftwareCatalogState>) => run(state).results.map((s) => s.slug)

describe('parseCatalogState', () => {
  it('reads the addresses of the menu, the tiles and the menu search', () => {
    expect(parseCatalogState({ kategoria: 'systemy', q: 'excel' })).toEqual({
      ...DEFAULT_CATALOG_STATE,
      category: 'systemy',
      query: 'excel',
    })
  })

  it('reads every filter', () => {
    expect(
      parseCatalogState(
        new URLSearchParams('kategoria=strony&sytuacja=od-zera&branza=noclegi&podglad=1'),
      ),
    ).toEqual({
      ...DEFAULT_CATALOG_STATE,
      category: 'strony',
      situation: 'Z',
      group: 'noclegi',
      preview: true,
    })
  })

  it('drops unknown values instead of showing an empty catalog', () => {
    expect(
      parseCatalogState({
        kategoria: 'gry',
        sytuacja: 'x',
        branza: 'kosmos',
        podglad: 'tak',
        q: '  ',
      }),
    ).toEqual(DEFAULT_CATALOG_STATE)
  })

  it('takes the first of repeated parameters and cuts a long query', () => {
    const state = parseCatalogState({ kategoria: ['opieka', 'strony'], q: 'a'.repeat(300) })
    expect(state.category).toBe('opieka')
    expect(state.query).toHaveLength(100)
  })
})

describe('catalogHref', () => {
  it('leaves defaults out, in a fixed order', () => {
    expect(catalogHref(DEFAULT_CATALOG_STATE)).toBe(CATALOG_PATH)
    expect(
      catalogHref({
        ...DEFAULT_CATALOG_STATE,
        preview: true,
        group: 'gastronomia',
        situation: 'P',
        category: 'systemy',
        query: 'grafik ekip',
      }),
    ).toBe(
      '/rozwiazania?q=grafik+ekip&kategoria=systemy&sytuacja=kilka-programow&branza=gastronomia&podglad=1',
    )
  })

  it('reads back what it writes', () => {
    const state: SoftwareCatalogState = {
      query: 'pensjonat',
      category: 'strony',
      situation: 'R',
      group: 'noclegi',
      preview: true,
      solution: 'strona-dla-hotelu-lub-pensjonatu',
    }
    const url = new URL(catalogHref(state), 'https://prokomsoftware.pl')
    expect(parseCatalogState(url.searchParams)).toEqual(state)
  })
})

describe('runCatalog', () => {
  it('lists every solution in the catalog order without filters', () => {
    expect(run({}).results).toHaveLength(29)
    expect(slugs({})[0]).toBe(index.solutions[0]!.slug)
  })

  it('filters by category, situation, industry and live preview together', () => {
    const results = run({ category: 'systemy', situation: 'P', preview: true }).results
    expect(results.length).toBeGreaterThan(0)
    for (const solution of results) {
      expect(solution.category).toBe('systemy')
      expect(solution.situations).toContain('P')
      expect(solution.hasLivePreview).toBe(true)
    }
    for (const solution of run({ group: 'gastronomia' }).results) {
      expect(solution.industryGroups).toContain('gastronomia')
    }
  })

  it('counts each facet with the other filters on, not itself (spec. §5)', () => {
    const { facets, results } = run({ category: 'strony', situation: 'Z' })
    // The category counts ignore the category, keep the situation.
    const withZ = index.solutions.filter((s) => s.situations.includes('Z'))
    expect(facets.category.all).toBe(withZ.length)
    expect(facets.category.strony).toBe(withZ.filter((s) => s.category === 'strony').length)
    // The situation counts keep the category.
    expect(facets.situation.all).toBe(index.solutions.filter((s) => s.category === 'strony').length)
    expect(facets.situation.Z).toBe(results.length)
    expect(facets.preview).toBe(results.filter((s) => s.hasLivePreview).length)
  })

  it('finds by a typo and keeps the search order („exel” → „Z Excela do systemu”, kryt. 4)', () => {
    expect(slugs({ query: 'exel' })[0]).toBe('z-excela-do-systemu')
  })

  it('searches within the filters and counts within the search', () => {
    const { results, facets } = run({ query: 'rezerwacje', category: 'aplikacje' })
    for (const solution of results) expect(solution.category).toBe('aplikacje')
    expect(facets.category.all).toBe(run({ query: 'rezerwacje' }).results.length)
  })

  it('an empty result keeps its counts', () => {
    const { results, facets } = run({ query: 'qqqqzzzz' })
    expect(results).toEqual([])
    expect(facets.category.all).toBe(0)
  })
})

describe('catalogSeo', () => {
  it('indexes only the plain catalog, the rest points to it (noindex)', () => {
    expect(catalogSeo(DEFAULT_CATALOG_STATE)).toEqual({ index: true, canonical: CATALOG_PATH })
    expect(catalogSeo({ ...DEFAULT_CATALOG_STATE, category: 'systemy' })).toEqual({
      index: false,
      canonical: CATALOG_PATH,
    })
    expect(catalogSeo({ ...DEFAULT_CATALOG_STATE, query: 'crm' }).index).toBe(false)
  })
})

describe('offer window in the address (?rozwiazanie=, plan §3b decyzja 1)', () => {
  it('reads the open solution, only a well-formed slug', () => {
    expect(parseCatalogState(new URLSearchParams('rozwiazanie=strona-wizytowka')).solution).toBe(
      'strona-wizytowka',
    )
    expect(parseCatalogState(new URLSearchParams('rozwiazanie=../admin')).solution).toBeNull()
    expect(parseCatalogState(new URLSearchParams('rozwiazanie=')).solution).toBeNull()
  })

  it('writes it last, after the filters', () => {
    expect(
      catalogHref({
        ...DEFAULT_CATALOG_STATE,
        category: 'strony',
        solution: 'strona-wizytowka',
      }),
    ).toBe('/rozwiazania?kategoria=strony&rozwiazanie=strona-wizytowka')
  })

  it('an open window is never indexed — the canonical stays the catalog', () => {
    expect(catalogSeo({ ...DEFAULT_CATALOG_STATE, solution: 'strona-wizytowka' })).toEqual({
      index: false,
      canonical: CATALOG_PATH,
    })
  })
})
