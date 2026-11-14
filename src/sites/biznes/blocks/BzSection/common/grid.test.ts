import { describe, expect, it } from 'vitest'

import { balancedGrid, gridColumns } from './grid'

const items = (count: number, phone: 1 | 2) => {
  const grid = balancedGrid(count, { phone })
  return Array.from({ length: count }, (_, index) => grid.item(index))
}

describe('balancedGrid: no orphan card (audit 14.11 P1-4)', () => {
  it('4 cards: 2 × 2 on a tablet, 4 in a row on a computer', () => {
    expect(gridColumns(4)).toEqual({ tablet: 2, desktop: 4, wide: 4 })
    expect(balancedGrid(4, { phone: 1 }).list).toContain('min-[1080px]:grid-cols-8')
    expect(items(4, 1).every((item) => item === 'col-span-2')).toBe(true)
  })

  it('5 cards: 5 in a row from 1280 px, 3 + 2 centred below, the fifth centred on a tablet', () => {
    expect(gridColumns(5)).toEqual({ tablet: 2, desktop: 3, wide: 5 })
    const { list } = balancedGrid(5, { phone: 2 })
    expect(list).toContain('min-[1080px]:grid-cols-6')
    expect(list).toContain('min-[1280px]:grid-cols-10')
    expect(items(5, 2)).toEqual([
      'col-span-2',
      'col-span-2',
      'col-span-2',
      'col-span-2 min-[1080px]:max-[1279px]:col-start-2',
      'col-span-2 max-[1079px]:col-start-2',
    ])
  })

  it('3 cards: one row on a computer, the third centred on a tablet (not on a one-column phone)', () => {
    expect(items(3, 1)).toEqual([
      'col-span-2',
      'col-span-2',
      'col-span-2 min-[640px]:max-[1079px]:col-start-2',
    ])
  })

  it('7 cards: 3 + 3 + 1, the last centred everywhere', () => {
    expect(items(7, 2)[6]).toBe('col-span-2 max-[1079px]:col-start-2 min-[1080px]:col-start-3')
  })
})
