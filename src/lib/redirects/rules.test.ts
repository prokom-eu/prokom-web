import { describe, expect, it } from 'vitest'

import {
  buildRedirectMap,
  isValidRedirectTarget,
  matchRedirect,
  normalizeRedirectPath,
} from './rules'

describe('normalizeRedirectPath', () => {
  it('keeps a plain path and drops the trailing slash', () => {
    expect(normalizeRedirectPath('/stara-oferta')).toBe('/stara-oferta')
    expect(normalizeRedirectPath(' /stara-oferta/ ')).toBe('/stara-oferta')
    expect(normalizeRedirectPath('/oferta/kasy.html')).toBe('/oferta/kasy.html')
    expect(normalizeRedirectPath('/')).toBe('/')
  })

  it('compares percent-encoded and typed characters alike', () => {
    expect(normalizeRedirectPath('/o-%C5%BCaglach')).toBe('/o-żaglach')
    expect(normalizeRedirectPath('/o-żaglach')).toBe('/o-żaglach')
  })

  it.each(['', 'stara', '//evil.pl', '/a b', '/a\\b', '/a?x=1', '/a#b', 'https://a.pl/x', '/%E0'])(
    'rejects %s',
    (value) => {
      expect(normalizeRedirectPath(value)).toBeNull()
    },
  )
})

describe('isValidRedirectTarget', () => {
  it('accepts a site path or an https address', () => {
    expect(isValidRedirectTarget('/kontakt')).toBe(true)
    expect(isValidRedirectTarget('https://prokominstalacje.pl/fotowoltaika')).toBe(true)
  })

  it.each(['mailto:a@b.pl', 'tel:+48000', 'http://a.pl', '//a.pl', 'javascript:alert(1)', ''])(
    'rejects %s',
    (value) => {
      expect(isValidRedirectTarget(value)).toBe(false)
    },
  )
})

describe('matchRedirect', () => {
  const map = buildRedirectMap([
    { from: '/stara-oferta', to: '/oferta' },
    { from: '/o-żaglach', to: 'https://pro-kom.eu/' },
  ])

  it('finds the rule for a request path, with or without the trailing slash', () => {
    expect(matchRedirect('/stara-oferta', map)).toBe('/oferta')
    expect(matchRedirect('/stara-oferta/', map)).toBe('/oferta')
    expect(matchRedirect('/o-%C5%BCaglach', map)).toBe('https://pro-kom.eu/')
  })

  it('returns null for paths without a rule', () => {
    expect(matchRedirect('/oferta', map)).toBeNull()
    expect(matchRedirect('/stara-oferta/x', map)).toBeNull()
  })

  it('matches a stored source with a literal % (stored decoded, decoded only once)', () => {
    const stored = normalizeRedirectPath('/rabat-100%25')
    expect(stored).toBe('/rabat-100%')
    const percent = buildRedirectMap([{ from: stored ?? '', to: '/oferta' }])
    expect(matchRedirect('/rabat-100%25', percent)).toBe('/oferta')
  })

  it('skips stored rules that are invalid instead of redirecting anywhere', () => {
    const broken = buildRedirectMap([{ from: '/a', to: 'javascript:alert(1)' }])
    expect(matchRedirect('/a', broken)).toBeNull()
  })
})
