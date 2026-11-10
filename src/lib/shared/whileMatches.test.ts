import { describe, expect, it, vi } from 'vitest'

import { CAPSULE_LINKS_QUERY, RAIL_QUERY, whileMatches, type MediaList } from './whileMatches'

/** A media query list the test switches by hand. */
function fakeMedia(initial: boolean) {
  const listeners = new Set<() => void>()
  const media: { -readonly [K in keyof MediaList]: MediaList[K] } = {
    matches: initial,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  }
  return {
    media,
    set(value: boolean) {
      media.matches = value
      listeners.forEach((listener) => listener())
    },
    listeners,
  }
}

describe('whileMatches', () => {
  it('starts at once when the layout matches and stops on cleanup', () => {
    const { media, listeners } = fakeMedia(true)
    const stop = vi.fn()
    const start = vi.fn(() => stop)
    const cleanup = whileMatches(media, start)
    expect(start).toHaveBeenCalledTimes(1)
    cleanup()
    expect(stop).toHaveBeenCalledTimes(1)
    expect(listeners.size).toBe(0)
  })

  it('does nothing on a layout without the element (a phone: no rail, no capsule links)', () => {
    const { media } = fakeMedia(false)
    const start = vi.fn(() => () => {})
    const cleanup = whileMatches(media, start)
    expect(start).not.toHaveBeenCalled()
    cleanup()
  })

  it('follows the layout: starts when it begins to match, stops when it no longer does', () => {
    const control = fakeMedia(false)
    const stop = vi.fn()
    const start = vi.fn(() => stop)
    const cleanup = whileMatches(control.media, start)
    control.set(true)
    expect(start).toHaveBeenCalledTimes(1)
    control.set(true)
    expect(start).toHaveBeenCalledTimes(1)
    control.set(false)
    expect(stop).toHaveBeenCalledTimes(1)
    cleanup()
    expect(stop).toHaveBeenCalledTimes(1)
  })

  // The CSS side (rail hidden below 1400 px) is guarded by the e2e `wspolne-szyna`.
  it('keeps the thresholds of wspolne.css (capsule links from 1081 px, rail from 1400 px)', () => {
    expect(CAPSULE_LINKS_QUERY).toBe('(min-width: 1081px)')
    expect(RAIL_QUERY).toBe('(min-width: 1400px)')
  })
})
