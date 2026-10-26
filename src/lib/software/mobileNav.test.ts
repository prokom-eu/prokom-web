import { describe, expect, it } from 'vitest'

import { activeTab, areaPriceText, menuTiles, type MenuArea } from './mobileNav'

const TABS: [string, string][] = [
  ['Start', '/'],
  ['Oferta', '/rozwiazania'],
  ['Kreator', '/dobierz'],
  ['Kontakt', '/kontakt'],
  ['Menu', '#menu'],
]

describe('activeTab', () => {
  it.each([
    ['/', 0],
    ['/rozwiazania', 1],
    ['/rozwiazania/strona-wizytowka', 1],
    ['/dobierz', 2],
    ['/kontakt', 3],
  ])('%s → item %i', (pathname, index) => {
    expect(activeTab(TABS, pathname)).toBe(index)
  })

  it.each(['/o-firmie', '/aktualnosci', '/rozwiazaniax', '/kontakty'])(
    'none on %s (Start only on the start page itself)',
    (pathname) => {
      expect(activeTab(TABS, pathname)).toBe(-1)
    },
  )

  it('never marks the menu button or a query/anchor part', () => {
    expect(
      activeTab([['Oferta', '/rozwiazania?kategoria=strony'], ...TABS.slice(4)], '/rozwiazania'),
    ).toBe(0)
    expect(activeTab([['Menu', '#menu']], '/')).toBe(-1)
  })
})

describe('areaPriceText', () => {
  it('the label wins over the number', () => {
    expect(areaPriceText({ priceFrom: 149, priceLabel: 'od 149 zł / mies.' })).toBe(
      'od 149 zł / mies.',
    )
  })

  it('„od {cena} zł” from the number', () => {
    expect(areaPriceText({ priceFrom: 2990, priceLabel: null })).toBe('od 2 990 zł')
  })

  it('both empty → ask for a quote', () => {
    expect(areaPriceText({ priceFrom: null, priceLabel: '  ' })).toBe('Zapytaj o wycenę')
  })
})

describe('menuTiles', () => {
  const areas: MenuArea[] = [
    { name: 'Strony internetowe', key: 'www', icon: 'site', priceFrom: 999, priceLabel: null },
    { name: 'Aplikacje mobilne', key: 'app', icon: null, priceFrom: null, priceLabel: null },
  ]

  it('takes the price, key and icon of the area with the same name', () => {
    expect(
      menuTiles(
        [
          ['Strony internetowe', 'od 1 zł', '/rozwiazania?kategoria=strony'],
          ['Aplikacje mobilne', 'zapytaj', '/rozwiazania?kategoria=aplikacje'],
        ],
        areas,
      ),
    ).toEqual([
      {
        name: 'Strony internetowe',
        price: 'od 999 zł',
        href: '/rozwiazania?kategoria=strony',
        key: 'www',
        icon: 'site',
      },
      {
        name: 'Aplikacje mobilne',
        price: 'Zapytaj o wycenę',
        href: '/rozwiazania?kategoria=aplikacje',
        key: 'app',
        icon: null,
      },
    ])
  })

  // Prices are [SZEF], from the areas only: a renamed area must not bring back the package's
  // price kept in the navigation (the frame logs the tile without an area).
  it('without a matching area asks for a quote, with no key or icon', () => {
    expect(menuTiles([['Inne', 'od 1 zł', '/kontakt']], areas)).toEqual([
      { name: 'Inne', price: 'Zapytaj o wycenę', href: '/kontakt', key: null, icon: null },
    ])
  })
})
