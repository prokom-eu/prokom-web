import { describe, expect, it } from 'vitest'

import { HOME_SLUG, isValidPageSlug, pagePath, slugFromSegment } from './slug'

describe('isValidPageSlug', () => {
  it.each(['home', 'kontakt', 'serwis-drukarek', 'oferta2'])('accepts %s', (slug) => {
    expect(isValidPageSlug(slug)).toBe(true)
  })

  it.each(['', 'Kontakt', 'o nas', 'a--b', '-a', 'a/b', 'zażółć', 'podglad'])(
    'rejects %j',
    (slug) => {
      expect(isValidPageSlug(slug)).toBe(false)
    },
  )
})

describe('pagePath', () => {
  it('maps the home page to /', () => {
    expect(pagePath(HOME_SLUG)).toBe('/')
  })

  it('maps other pages to one segment', () => {
    expect(pagePath('kontakt')).toBe('/kontakt')
  })
})

describe('slugFromSegment', () => {
  it('accepts a valid segment', () => {
    expect(slugFromSegment('kontakt')).toBe('kontakt')
  })

  it('never serves the home page under its own slug (one URL per page)', () => {
    expect(slugFromSegment(HOME_SLUG)).toBeNull()
  })

  it('rejects invalid or encoded segments', () => {
    expect(slugFromSegment('Kontakt')).toBeNull()
    expect(slugFromSegment('a%2Fb')).toBeNull()
  })
})
