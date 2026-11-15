import { describe, expect, it } from 'vitest'

import { megaKey } from './megaKeys'

describe('megaKey (Oferta ▾ keyboard, plan 0611 §8.1 pkt 3)', () => {
  const tabs = (key: string, index: number, count = 5) =>
    megaKey(key, { zone: 'tabs', index, count })

  it('↓ on the trigger opens the panel on the active department', () => {
    expect(megaKey('ArrowDown', { zone: 'trigger', index: 2, count: 5 })).toEqual({
      type: 'open',
      focus: 2,
    })
  })

  it('other keys on the trigger stay with the browser', () => {
    expect(megaKey('ArrowUp', { zone: 'trigger', index: 0, count: 5 })).toEqual({ type: 'none' })
    expect(megaKey('Enter', { zone: 'trigger', index: 0, count: 5 })).toEqual({ type: 'none' })
  })

  it('↑↓ move between departments and wrap around', () => {
    expect(tabs('ArrowDown', 1)).toEqual({ type: 'tab', focus: 2 })
    expect(tabs('ArrowDown', 4)).toEqual({ type: 'tab', focus: 0 })
    expect(tabs('ArrowUp', 0)).toEqual({ type: 'tab', focus: 4 })
    expect(tabs('ArrowUp', 3)).toEqual({ type: 'tab', focus: 2 })
  })

  it('Home and End jump to the first and the last department', () => {
    expect(tabs('Home', 3)).toEqual({ type: 'tab', focus: 0 })
    expect(tabs('End', 1)).toEqual({ type: 'tab', focus: 4 })
  })

  it('→ goes into the categories, ← in the categories comes back', () => {
    expect(tabs('ArrowRight', 1)).toEqual({ type: 'categories' })
    expect(megaKey('ArrowLeft', { zone: 'categories', index: 1, count: 5 })).toEqual({
      type: 'tab',
      focus: 1,
    })
  })

  it('Esc closes from anywhere in the panel and returns focus to the trigger', () => {
    for (const zone of ['tabs', 'categories'] as const) {
      expect(megaKey('Escape', { zone, index: 0, count: 5 })).toEqual({ type: 'close' })
    }
  })

  it('a single department wraps to itself; no departments does nothing', () => {
    expect(tabs('ArrowDown', 0, 1)).toEqual({ type: 'tab', focus: 0 })
    expect(tabs('ArrowDown', 0, 0)).toEqual({ type: 'none' })
    expect(megaKey('ArrowDown', { zone: 'trigger', index: 0, count: 0 })).toEqual({
      type: 'none',
    })
  })

  it('Tab and letters are left to the browser', () => {
    expect(tabs('Tab', 0)).toEqual({ type: 'none' })
    expect(megaKey('a', { zone: 'categories', index: 0, count: 5 })).toEqual({ type: 'none' })
  })
})
