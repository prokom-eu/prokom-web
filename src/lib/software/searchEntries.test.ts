import { describe, expect, it } from 'vitest'

import { searchSettings, softwareSearchEntries, type SearchPage } from './searchEntries'
import type { SolutionsIndex } from './solutionsIndex'

const index = {
  solutions: [
    {
      slug: 'strona-wizytowka',
      name: 'Strona wizytówka',
      category: 'strony',
      lead: 'Klient znajduje Twój telefon.',
      features: ['Mapa', 'Formularz'],
    },
  ],
  search: { synonyms: { www: ['strona', 'witryna'] }, stopWords: [], popular: ['sklep', 'CRM'] },
} as unknown as SolutionsIndex

const pages: SearchPage[] = [
  { label: 'Cennik', href: '/cennik', hint: 'Ceny „od” i terminy' },
  { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
]

describe('softwareSearchEntries — the search window of Software (ZMIANY-v24 §3.3)', () => {
  it('a solution is an „Oferta” result that opens its offer window', () => {
    expect(softwareSearchEntries(index, pages)[0]).toMatchObject({
      id: 'oferta:strona-wizytowka',
      group: 'Oferta',
      title: 'Strona wizytówka',
      hint: 'Klient znajduje Twój telefon.',
      href: '/rozwiazania?rozwiazanie=strona-wizytowka',
      text: 'Mapa Formularz',
    })
  })

  it('pages — legal ones too — come after the offer, under „Strony”', () => {
    expect(softwareSearchEntries(index, pages).slice(1)).toEqual([
      {
        id: 'strona:/cennik',
        group: 'Strony',
        title: 'Cennik',
        hint: 'Ceny „od” i terminy',
        href: '/cennik',
        icon: 'doc',
      },
      {
        id: 'strona:/polityka-prywatnosci',
        group: 'Strony',
        title: 'Polityka prywatności',
        hint: null,
        href: '/polityka-prywatnosci',
        icon: 'doc',
      },
    ])
  })

  it('no index yet: only the pages', () => {
    expect(softwareSearchEntries(null, pages)).toHaveLength(2)
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
