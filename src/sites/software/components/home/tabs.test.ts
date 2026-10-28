import { describe, expect, it } from 'vitest'

import { tabKeyTarget } from './tabs'

describe('tabKeyTarget', () => {
  it('moves by one with the arrows and wraps around', () => {
    expect(tabKeyTarget('ArrowRight', 0, 5)).toBe(1)
    expect(tabKeyTarget('ArrowDown', 4, 5)).toBe(0)
    expect(tabKeyTarget('ArrowLeft', 0, 5)).toBe(4)
    expect(tabKeyTarget('ArrowUp', 3, 5)).toBe(2)
  })

  it('jumps to the ends with Home and End', () => {
    expect(tabKeyTarget('Home', 3, 5)).toBe(0)
    expect(tabKeyTarget('End', 1, 5)).toBe(4)
  })

  it('ignores other keys and an empty list', () => {
    expect(tabKeyTarget('Enter', 1, 5)).toBeNull()
    expect(tabKeyTarget('ArrowRight', 0, 0)).toBeNull()
  })
})
