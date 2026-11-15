import { describe, expect, it } from 'vitest'

import { isSearchShortcut } from './searchShortcut'

const key = (
  init: Partial<{
    key: string
    ctrlKey: boolean
    metaKey: boolean
    altKey: boolean
    typing: boolean
  }>,
) => ({
  key: init.key ?? '',
  ctrlKey: init.ctrlKey ?? false,
  metaKey: init.metaKey ?? false,
  altKey: init.altKey ?? false,
  typing: init.typing ?? false,
})

describe('isSearchShortcut (K33 §2.5: Ctrl/Cmd+K and „/”)', () => {
  it('opens on Ctrl+K and Cmd+K, also while typing in a field', () => {
    expect(isSearchShortcut(key({ key: 'k', ctrlKey: true }))).toBe(true)
    expect(isSearchShortcut(key({ key: 'K', metaKey: true }))).toBe(true)
    expect(isSearchShortcut(key({ key: 'k', ctrlKey: true, typing: true }))).toBe(true)
  })

  it('opens on „/” only outside fields and without modifiers', () => {
    expect(isSearchShortcut(key({ key: '/' }))).toBe(true)
    expect(isSearchShortcut(key({ key: '/', typing: true }))).toBe(false)
    expect(isSearchShortcut(key({ key: '/', ctrlKey: true }))).toBe(false)
  })

  it('ignores other keys', () => {
    expect(isSearchShortcut(key({ key: 'k' }))).toBe(false)
    expect(isSearchShortcut(key({ key: 'k', ctrlKey: true, altKey: true }))).toBe(false)
  })
})
