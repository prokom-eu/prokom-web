import { describe, expect, it } from 'vitest'

import { equipmentColumns, equipmentExtras, pickBundles } from './equipmentMenu'

const index = {
  groups: [
    { slug: 'mon', name: 'Monitoring' },
    { slug: 'alarm', name: 'Alarmy' },
    { slug: 'av', name: 'Obraz i dźwięk' },
  ],
  categories: [
    { slug: 'kamery-ip', name: 'Kamery IP', group: 'mon', count: 24 },
    { slug: 'rejestratory', name: 'Rejestratory', group: 'mon', count: 1 },
    { slug: 'alarmy-przewodowe', name: 'Alarmy przewodowe', group: 'alarm', count: 3 },
    { slug: 'nieznana', name: 'Bez działu', group: 'brak', count: 2 },
  ],
}

describe('equipmentColumns', () => {
  it('makes a column per department with its categories linked to their pages', () => {
    const columns = equipmentColumns(index)
    expect(columns.map((column) => column.label)).toEqual(['Monitoring', 'Alarmy'])
    expect(columns[0]?.items[0]).toEqual({
      key: 'kamery-ip',
      label: 'Kamery IP',
      caption: '24 pozycje',
      icon: 'cam',
      color: null,
      href: '/oferta/kamery-ip',
    })
  })

  it('counts in Polish and falls back to a neutral icon', () => {
    const [mon, alarm] = equipmentColumns(index)
    expect(mon?.items[1]?.caption).toBe('1 pozycja')
    expect(alarm?.items[0]?.caption).toBe('3 pozycje')
    expect(
      equipmentColumns({
        groups: [{ slug: 'x', name: 'X' }],
        categories: [{ slug: 'nowa', name: 'Nowa', group: 'x', count: 5 }],
      })[0]?.items[0],
    ).toMatchObject({ caption: '5 pozycji', icon: 'tool' })
  })

  it('is empty without categories (the header keeps the plain link)', () => {
    expect(equipmentColumns({ groups: index.groups, categories: [] })).toEqual([])
  })
})

describe('equipmentExtras (INST-K3)', () => {
  const view = (slug: string, ready: boolean, product = 'cam') =>
    ({
      slug,
      name: `Zestaw ${slug}`,
      area: 'dom',
      areaLabel: 'Dom i apartament',
      level: 'Start',
      indexable: ready,
      items: [{ product, mandatory: true }],
      swaps: [],
      services: [],
    }) as never
  it('names the first ready bundles with listed cards, counts them and lists the salons', () => {
    const extras = equipmentExtras(
      {
        brands: [{ slug: 'dahua', name: 'Dahua', salon: 'dahua' }] as never,
        products: [{ slug: 'cam', brand: 'dahua' }] as never,
      },
      [
        view('a', true),
        view('b', false),
        view('c', true, 'gone'),
        view('d', true),
        view('e', true),
        view('f', true),
      ],
    )
    expect(extras.bundleCount).toBe(4)
    expect(extras.bundles.map((bundle) => bundle.slug)).toEqual(['a', 'd', 'e'])
    expect(extras.bundles[0]).toEqual({
      slug: 'a',
      name: 'Zestaw a',
      label: 'Dom i apartament · Start',
      href: '/zestawy/a',
    })
    expect(extras.salons.map((salon) => salon.slug)).toEqual(['dahua'])
  })
})

describe('pickBundles (INST-K3)', () => {
  it('takes the first bundle of each area, then fills up in order', () => {
    const b = (slug: string, area: string) => ({ slug, area })
    const list = [
      b('d1', 'dom'),
      b('d2', 'dom'),
      b('n1', 'noclegi'),
      b('d3', 'dom'),
      b('f1', 'firma'),
    ]
    expect(pickBundles(list, 3).map((x) => x.slug)).toEqual(['d1', 'n1', 'f1'])
    expect(pickBundles(list, 4).map((x) => x.slug)).toEqual(['d1', 'n1', 'f1', 'd2'])
  })
})
