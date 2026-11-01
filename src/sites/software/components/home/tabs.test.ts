import { describe, expect, it } from 'vitest'

import { autoRotates, tabKeyTarget } from './tabs'

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

describe('autoRotates (audyt 01.11 P1 #19)', () => {
  const base = {
    count: 4,
    reducedMotion: false,
    desktop: true,
    picked: false,
    stopped: false,
    paused: false,
  }

  it('switches by itself only on the desktop, before any pick or hover', () => {
    expect(autoRotates(base)).toBe(true)
  })

  it('never on the phone and tablet — the visitor is reading', () => {
    expect(autoRotates({ ...base, desktop: false })).toBe(false)
  })

  it('stops for good after a pick or the first hover, waits while focused', () => {
    expect(autoRotates({ ...base, picked: true })).toBe(false)
    expect(autoRotates({ ...base, stopped: true })).toBe(false)
    expect(autoRotates({ ...base, paused: true })).toBe(false)
  })

  it('never with reduced motion or a single tab', () => {
    expect(autoRotates({ ...base, reducedMotion: true })).toBe(false)
    expect(autoRotates({ ...base, count: 1 })).toBe(false)
  })
})
