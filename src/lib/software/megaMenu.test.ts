import { describe, expect, it } from 'vitest'

import { megaColumns } from './megaMenu'
import { keepTogether } from './price'
import { DEFAULT_PRICE_DISPLAY, type IndexSolution } from './solutionsIndex'

const solution = (slug: string, priceFrom: number | null, extra: Partial<IndexSolution> = {}) =>
  ({ slug, name: `Nazwa ${slug}`, priceFrom, priceMonthly: false, ...extra }) as IndexSolution

const columns = [
  {
    title: 'Strony internetowe',
    links: [
      ['Strona wizytówka', '/rozwiazania/strona-wizytowka'],
      ['Ukryta', '/rozwiazania/szkic'],
      ['Cennik', '/cennik'],
    ] as [string, string][],
  },
]

describe('megaColumns — „Oferta ▾” of the capsule (ZMIANY-v24 §3.2)', () => {
  it('a solution link shows its name and „od” price and opens its offer window', () => {
    const [column] = megaColumns(
      columns,
      [solution('strona-wizytowka', 999), solution('opieka', 149, { priceMonthly: true })],
      DEFAULT_PRICE_DISPLAY,
    )
    expect(column?.items[0]).toEqual({
      label: 'Nazwa strona-wizytowka',
      note: keepTogether('od 999 zł'),
      href: '/rozwiazania?rozwiazanie=strona-wizytowka',
    })
  })

  it('an unpublished solution is left out; a plain link stays as it is', () => {
    const [column] = megaColumns(columns, [], DEFAULT_PRICE_DISPLAY)
    expect(column?.items).toEqual([{ label: 'Cennik', note: null, href: '/cennik' }])
  })

  it('no price asks for a quote, a monthly price reads per month', () => {
    const [column] = megaColumns(
      [
        {
          title: 'X',
          links: [
            ['A', '/rozwiazania/a'],
            ['B', '/rozwiazania/b'],
          ],
        },
      ],
      [solution('a', null), solution('b', 149, { priceMonthly: true })],
      DEFAULT_PRICE_DISPLAY,
    )
    expect(column?.items.map((item) => item.note)).toEqual([
      DEFAULT_PRICE_DISPLAY.fallback,
      keepTogether(DEFAULT_PRICE_DISPLAY.monthTemplate.replace('{cena}', '149')),
    ])
  })

  it('a column with nothing left is dropped', () => {
    expect(
      megaColumns([{ title: 'X', links: [['A', '/rozwiazania/a']] }], [], DEFAULT_PRICE_DISPLAY),
    ).toEqual([])
  })
})
