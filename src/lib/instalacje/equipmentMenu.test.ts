import { describe, expect, it } from 'vitest'

import { equipmentColumns } from './equipmentMenu'

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
