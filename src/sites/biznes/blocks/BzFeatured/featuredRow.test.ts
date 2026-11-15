import { describe, expect, it } from 'vitest'

import { activeCard, firstDelay, ROW_DIRECTIONS, startIndex, stepRow } from './featuredRow'

describe('stepRow (runda 1411 R5: one card at a time, endless)', () => {
  it('moves left by one card and jumps back to the start at the copy', () => {
    let index = startIndex(1, 8)
    const seen: number[] = []
    for (let i = 0; i < 9; i++) {
      const step = stepRow(index, 1, 8)
      seen.push(step.index)
      index = step.resetTo ?? step.index
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 1])
    expect(stepRow(7, 1, 8)).toEqual({ index: 8, resetTo: 0 })
  })

  it('moves right from the copy and jumps back to the copy at 0', () => {
    let index = startIndex(-1, 8)
    expect(index).toBe(8)
    const seen: number[] = []
    for (let i = 0; i < 9; i++) {
      const step = stepRow(index, -1, 8)
      seen.push(step.index)
      index = step.resetTo ?? step.index
    }
    expect(seen).toEqual([7, 6, 5, 4, 3, 2, 1, 0, 7])
    expect(stepRow(1, -1, 8)).toEqual({ index: 0, resetTo: 8 })
  })

  it('takes an arrow against the row’s direction from the other end', () => {
    expect(stepRow(0, -1, 8)).toEqual({ index: 7, resetTo: null })
    expect(stepRow(8, 1, 8)).toEqual({ index: 1, resetTo: null })
  })

  it('shows the right progress dot, also on the copy', () => {
    expect(activeCard(0, 8)).toBe(0)
    expect(activeCard(8, 8)).toBe(0)
    expect(activeCard(11, 8)).toBe(3)
    expect(activeCard(3, 0)).toBe(0)
  })

  it('handles an empty row and staggers the rows by 1.5 s, directions ← → ←', () => {
    expect(stepRow(0, 1, 0)).toEqual({ index: 0, resetTo: null })
    expect([0, 1, 2].map(firstDelay)).toEqual([4500, 6000, 7500])
    expect([...ROW_DIRECTIONS]).toEqual([1, -1, 1])
  })
})
