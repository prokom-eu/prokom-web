import { describe, expect, it } from 'vitest'

import { findDuplicateHosts, normalizeHost } from './host'

describe('normalizeHost', () => {
  it('lowercases and strips the port', () => {
    expect(normalizeHost('Biznes.LOCALHOST:3000')).toBe('biznes.localhost')
  })

  it('strips a trailing dot and surrounding whitespace', () => {
    expect(normalizeHost('  prokombiznes.pl.  ')).toBe('prokombiznes.pl')
  })

  it('keeps a bare IPv6 host without its port', () => {
    expect(normalizeHost('[::1]:3000')).toBe('[::1]')
  })

  it.each([null, undefined, '', '   ', 'a b.pl', 'evil.pl/path', 'user@evil.pl', 'a..pl', ':3000'])(
    'rejects %j',
    (raw) => {
      expect(normalizeHost(raw)).toBeNull()
    },
  )
})

describe('findDuplicateHosts', () => {
  it('returns nothing for distinct hosts', () => {
    expect(findDuplicateHosts(['a.pl', 'b.pl'])).toEqual([])
  })

  it('finds duplicates after normalization', () => {
    expect(findDuplicateHosts(['a.pl', 'A.pl:443', 'b.pl'])).toEqual(['a.pl'])
  })
})
