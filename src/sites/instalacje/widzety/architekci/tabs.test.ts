import { describe, expect, it } from 'vitest'

import { nextTab } from './tabs'

describe('nextTab', () => {
  it('moves with the arrows, round', () => {
    expect(nextTab('ArrowRight', 0, 4)).toBe(1)
    expect(nextTab('ArrowRight', 3, 4)).toBe(0)
    expect(nextTab('ArrowLeft', 0, 4)).toBe(3)
    expect(nextTab('ArrowDown', 1, 4)).toBe(2)
    expect(nextTab('ArrowUp', 1, 4)).toBe(0)
  })

  it('jumps with Home and End, ignores other keys', () => {
    expect(nextTab('Home', 2, 6)).toBe(0)
    expect(nextTab('End', 2, 6)).toBe(5)
    expect(nextTab('Enter', 2, 6)).toBeNull()
    expect(nextTab('ArrowRight', 0, 0)).toBeNull()
  })
})
