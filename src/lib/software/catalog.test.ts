import { describe, expect, it } from 'vitest'

import {
  CATALOG_PATH,
  catalogHref,
  catalogSeo,
  DEFAULT_CATALOG_STATE,
  OFFER_GROUPS,
  offerGroup,
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
        new URLSearchParams('kategoria=przebudowa&sytuacja=od-zera&branza=noclegi'),
      ),
    ).toEqual({
      ...DEFAULT_CATALOG_STATE,
      category: 'przebudowa',
      situation: 'Z',
      group: 'noclegi',
    })
  })

  it('reads the old category words of saved links as their v24 group (D10)', () => {
    expect(parseCatalogState({ kategoria: 'aplikacje' }).category).toBe('systemy')
    expect(parseCatalogState({ kategoria: 'opieka' }).category).toBe('przebudowa')
  })

  it('drops unknown values instead of showing an empty catalog', () => {
    expect(
      parseCatalogState({
        kategoria: 'gry',
        sytuacja: 'x',
        branza: 'kosmos',
        q: '  ',
      }),
    ).toEqual(DEFAULT_CATALOG_STATE)
  })

  it('takes the first of repeated parameters and cuts a long query', () => {
    const state = parseCatalogState({ kategoria: ['systemy', 'strony'], q: 'a'.repeat(300) })
    expect(state.category).toBe('systemy')
    expect(state.query).toHaveLength(100)
  })
})

describe('catalogHref', () => {
  it('leaves defaults out, in a fixed order', () => {
    expect(catalogHref(DEFAULT_CATALOG_STATE)).toBe(CATALOG_PATH)
    expect(
      catalogHref({
        ...DEFAULT_CATALOG_STATE,
        group: 'gastronomia',
        situation: 'P',
        category: 'systemy',
        query: 'grafik ekip',
      }),
    ).toBe(
      '/rozwiazania?q=grafik+ekip&kategoria=systemy&sytuacja=kilka-programow&branza=gastronomia',
    )
  })

  it('reads back what it writes', () => {
    const state: SoftwareCatalogState = {
      query: 'pensjonat',
      category: 'strony',
      situation: 'R',
      group: 'noclegi',
      solution: 'strona-dla-hotelu-lub-pensjonatu',
    }
    const url = new URL(catalogHref(state), 'https://prokomsoftware.pl')
    expect(parseCatalogState(url.searchParams)).toEqual(state)
  })
})

describe('offer groups (ZMIANY-v24 §6.2, D10)', () => {
  const groupOf = (slug: string) => offerGroup(index.solutions.find((s) => s.slug === slug)!)

  it('maps the five data categories to four groups without touching the enum', () => {
    expect(OFFER_GROUPS.map(({ value }) => value)).toEqual([
      'strony',
      'przebudowa',
      'systemy',
      'automatyzacje',
    ])
    expect(groupOf('strona-wizytowka')).toBe('strony')
    expect(groupOf('aplikacja-dla-ekip-w-terenie')).toBe('systemy')
    expect(groupOf('opieka-nad-strona-i-systemem')).toBe('przebudowa')
    expect(groupOf('asystent-ai-do-zapytan')).toBe('automatyzacje')
  })

  it('puts the rebuild (a page by data) into „Przebudowa i opieka”', () => {
    expect(groupOf('przebudowa-starej-strony')).toBe('przebudowa')
  })

  it('without a search the cards go group by group, in the board order', () => {
    const order = run({}).results.map((s) =>
      OFFER_GROUPS.findIndex((g) => g.value === offerGroup(s)),
    )
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(slugs({}).indexOf('przebudowa-starej-strony')).toBe(7)
  })

  it('every solution lands in exactly one group and the counts add up', () => {
    const { facets } = run({})
    const sum = OFFER_GROUPS.reduce((total, { value }) => total + (facets.category[value] ?? 0), 0)
    expect(sum).toBe(29)
    expect(facets.category.all).toBe(29)
    expect(facets.category.przebudowa).toBe(4)
  })
})

describe('runCatalog', () => {
  it('lists every solution in the catalog order without filters', () => {
    expect(run({}).results).toHaveLength(29)
    expect(slugs({})[0]).toBe(index.solutions[0]!.slug)
  })

  it('filters by group, situation and industry together', () => {
    const results = run({ category: 'systemy', situation: 'P' }).results
    expect(results.length).toBeGreaterThan(0)
    for (const solution of results) {
      expect(offerGroup(solution)).toBe('systemy')
      expect(solution.situations).toContain('P')
    }
    for (const solution of run({ group: 'gastronomia' }).results) {
      expect(solution.industryGroups).toContain('gastronomia')
    }
  })

  it('counts each facet with the other filters on, not itself (spec. §5)', () => {
    const { facets, results } = run({ category: 'strony', situation: 'Z' })
    // The group counts ignore the group, keep the situation.
    const withZ = index.solutions.filter((s) => s.situations.includes('Z'))
    expect(facets.category.all).toBe(withZ.length)
    expect(facets.category.strony).toBe(withZ.filter((s) => offerGroup(s) === 'strony').length)
    // The situation counts keep the group.
    expect(facets.situation.all).toBe(
      index.solutions.filter((s) => offerGroup(s) === 'strony').length,
    )
    expect(facets.situation.Z).toBe(results.length)
  })

  it('finds by a typo and keeps the search order („exel” → „Z Excela do systemu”, kryt. 4)', () => {
    expect(slugs({ query: 'exel' })[0]).toBe('z-excela-do-systemu')
  })

  it('searches within the filters and counts within the search', () => {
    const { results, facets } = run({ query: 'rezerwacje', category: 'systemy' })
    for (const solution of results) expect(offerGroup(solution)).toBe('systemy')
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
