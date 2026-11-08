import { describe, expect, it } from 'vitest'

import type { SiteMapSection } from '../seo/siteLinks'
import { restOfSiteMap, softwareSiteMapGroups } from './siteMap'

const legal = {
  privacy: '/polityka-prywatnosci',
  cookies: '/cookies',
  accessibility: '/dostepnosc',
}
const lines = [
  { key: 'software', name: 'PRO-KOM Software', url: 'https://prokomsoftware.pl' },
  { key: 'biznes', name: 'PRO-KOM Biznes', url: 'https://prokombiznes.pl' },
  { key: 'zakopane', name: 'Salon Zakopane', url: null },
]

describe('softwareSiteMapGroups (board AU-mapa)', () => {
  const groups = softwareSiteMapGroups({ legal, lines, currentLine: 'software', hasNews: true })

  it('has the six cards of the board in order', () => {
    expect(groups.map((group) => group.title)).toEqual([
      'Strona główna',
      'Oferta',
      'Narzędzia',
      'Firma',
      'Informacje',
      'Linie PRO-KOM',
    ])
  })

  it('lists the four legal pages, the terms included, from the company paths', () => {
    expect(groups.find((group) => group.id === 'informacje')?.links.map((l) => l.href)).toEqual([
      '/polityka-prywatnosci',
      '/regulamin',
      '/cookies',
      '/dostepnosc',
    ])
  })

  it('links other lines with an address only, never the current one', () => {
    expect(groups.find((group) => group.id === 'linie')?.links).toEqual([
      { href: 'https://prokombiznes.pl', label: 'PRO-KOM Biznes', external: true },
    ])
  })

  it('leaves out Aktualności without posts and the lines card without other lines', () => {
    const bare = softwareSiteMapGroups({
      legal,
      lines: lines.slice(0, 1),
      currentLine: 'software',
      hasNews: false,
    })
    expect(bare.map((group) => group.id)).not.toContain('linie')
    expect(JSON.stringify(bare)).not.toContain('/aktualnosci')
  })

  it('offers the search in the tools card', () => {
    expect(groups.find((group) => group.id === 'narzedzia')?.search).toBe(true)
  })
})

describe('restOfSiteMap', () => {
  const groups = softwareSiteMapGroups({ legal, lines, currentLine: 'software', hasNews: true })
  const sections: SiteMapSection[] = [
    {
      id: 'strony',
      title: 'Strony',
      links: [
        { href: '/', label: 'Strona główna' },
        { href: '/kontakt', label: 'Kontakt' },
        { href: '/mapa-strony', label: 'Mapa strony' },
      ],
    },
    {
      id: 'rozwiazania',
      title: 'Rozwiązania',
      links: [
        { href: '/rozwiazania', label: 'Pełna oferta' },
        { href: '/rozwiazania/landing-page', label: 'Landing page' },
      ],
    },
    { id: 'aktualnosci', title: 'Aktualności', links: [{ href: '/aktualnosci', label: 'Wpisy' }] },
  ]

  it('keeps every address the cards do not link, and drops emptied sections', () => {
    expect(restOfSiteMap(sections, groups)).toEqual([
      { id: 'strony', title: 'Strony', links: [{ href: '/mapa-strony', label: 'Mapa strony' }] },
      {
        id: 'rozwiazania',
        title: 'Rozwiązania',
        links: [{ href: '/rozwiazania/landing-page', label: 'Landing page' }],
      },
    ])
  })
})
