import { describe, expect, it } from 'vitest'

import { formatPrice } from './price'
import { buildSearchExtras } from './searchExtras'
import {
  priceLine,
  searchSettings,
  softwareSearchEntries,
  softwareSearchProvider,
  softwareShortcuts,
  type SearchPage,
} from './searchEntries'
import { DEFAULT_PRICE_DISPLAY, type SolutionsIndex } from './solutionsIndex'

const solution = (slug: string, category: string, priceFrom: number | null) => ({
  slug,
  name: slug,
  category,
  lead: `Opis ${slug}.`,
  features: ['Mapa', 'Formularz'],
  priceFrom,
  priceMonthly: false,
  leadTime: null,
})

const index = {
  solutions: [
    { ...solution('strona-wizytowka', 'strony', 999), name: 'Strona wizytówka' },
    solution('crm', 'systemy', 2990),
    solution('aplikacja', 'aplikacje', null),
  ],
  search: { synonyms: { www: ['strona', 'witryna'] }, stopWords: [], popular: ['sklep', 'CRM'] },
  priceDisplay: DEFAULT_PRICE_DISPLAY,
} as unknown as SolutionsIndex

const extras = buildSearchExtras({
  posts: [
    {
      slug: 'excel-w-firmie',
      title: 'Excel w firmie',
      lead: 'Kiedy arkusz przestaje wystarczać.',
      categoryValue: 'systemy',
      minutes: 5,
    },
  ],
  industries: [{ slug: 'noclegi', name: 'Noclegi' }],
  cities: [{ slug: 'rabka-zdroj', name: 'Rabka-Zdrój' }],
})

const pages: SearchPage[] = [
  { label: 'Cennik', href: '/cennik', hint: 'Ceny „od” i terminy' },
  { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
]

describe('softwareSearchEntries — the search window of Software', () => {
  it('a solution is an „Oferta” result with its price and offer group, opening its offer window', () => {
    expect(softwareSearchEntries(index, pages)[0]).toMatchObject({
      id: 'oferta:strona-wizytowka',
      group: 'Oferta',
      title: 'Strona wizytówka',
      hint: 'od 999 zł netto · Strony internetowe',
      href: '/rozwiazania?rozwiazanie=strona-wizytowka',
      icon: 'site',
      text: 'Opis strona-wizytowka. Mapa Formularz',
    })
  })

  it('no price reads as the quote fallback; apps go with the systems', () => {
    const app = softwareSearchEntries(index, pages).find((e) => e.id === 'oferta:aplikacja')
    expect(app).toMatchObject({ hint: 'Wycena po rozmowie · Systemy dla firm', icon: 'panel' })
  })

  it('then industries, posts, cities and pages — in that order of groups', () => {
    const groups = [...new Set(softwareSearchEntries(index, pages, extras).map((e) => e.group))]
    expect(groups).toEqual(['Oferta', 'Dla branż', 'Poradnik', 'Miejscowości', 'Strony'])
  })

  it('a post leads to its page and is found by its lead', () => {
    const post = softwareSearchEntries(null, [], extras).find((e) => e.group === 'Poradnik')
    expect(post).toEqual({
      id: 'poradnik:excel-w-firmie',
      group: 'Poradnik',
      title: 'Excel w firmie',
      hint: 'Systemy · 5 min czytania',
      href: '/aktualnosci/excel-w-firmie',
      icon: 'news',
      text: 'Kiedy arkusz przestaje wystarczać.',
    })
  })

  it('industry and city pages under their addresses', () => {
    const entries = softwareSearchEntries(null, [], extras)
    expect(entries.find((e) => e.group === 'Dla branż')?.href).toBe('/dla-branz/noclegi')
    expect(entries.find((e) => e.group === 'Miejscowości')?.href).toBe('/miejscowosci/rabka-zdroj')
  })

  it('no index nor extras yet: only the pages', () => {
    expect(softwareSearchEntries(null, pages)).toHaveLength(2)
  })
})

describe('priceLine', () => {
  it('reads the card price as one line', () => {
    expect(priceLine(index.solutions[1], DEFAULT_PRICE_DISPLAY)).toBe(
      `od ${formatPrice(2990)} zł netto`,
    )
  })
})

describe('softwareShortcuts — „Na skróty” as Biznes shows its categories', () => {
  const panel = [
    { label: 'Dobierz rozwiązanie', href: '/dobierz' },
    { label: 'Aktualności', href: '/aktualnosci' },
    { label: 'Inne', href: '/inne' },
  ]

  it('offer groups with counts, the news with its posts, then the panel links with icons', () => {
    expect(softwareShortcuts(index, extras, panel)).toEqual([
      {
        id: 'grupa:strony',
        title: 'Strony internetowe',
        hint: '1 rozwiązanie',
        href: '/rozwiazania?kategoria=strony',
        icon: 'site',
      },
      {
        id: 'grupa:systemy',
        title: 'Systemy dla firm',
        hint: '2 rozwiązania',
        href: '/rozwiazania?kategoria=systemy',
        icon: 'panel',
      },
      {
        id: 'aktualnosci',
        title: 'Aktualności i poradnik',
        hint: '1 wpis',
        href: '/aktualnosci',
        icon: 'news',
      },
      { id: 'shortcut-/dobierz', title: 'Dobierz rozwiązanie', href: '/dobierz', icon: 'target' },
      { id: 'shortcut-/inne', title: 'Inne', href: '/inne', icon: 'arrow' },
    ])
  })

  it('before the data: only the panel links', () => {
    expect(softwareShortcuts(null, null, panel).map((r) => r.href)).toEqual([
      '/dobierz',
      '/aktualnosci',
      '/inne',
    ])
  })
})

describe('softwareSearchProvider', () => {
  it('the empty window shows „Na skróty”, a query finds a post', () => {
    const provider = softwareSearchProvider(index, extras, pages, [])
    expect(provider.empty()[0]?.title).toBe('Na skróty')
    expect(provider.popular).toEqual(['sklep', 'CRM'])
    const found = provider.query('arkusz').flatMap((group) => group.results.map((r) => r.id))
    expect(found).toContain('poradnik:excel-w-firmie')
  })
})

describe('searchSettings', () => {
  it('synonyms of the panel as word groups, popular phrases as they are', () => {
    expect(searchSettings(index, [{ label: 'Cennik', href: '/cennik' }])).toEqual({
      synonyms: ['www, strona, witryna'],
      popular: ['sklep', 'CRM'],
      shortcuts: [{ label: 'Cennik', href: '/cennik' }],
    })
  })
})
