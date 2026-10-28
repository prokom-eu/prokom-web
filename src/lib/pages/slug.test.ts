import { readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { HOME_SLUG, isValidPageSlug, pagePath, RESERVED_PAGE_SLUGS, slugFromSegment } from './slug'

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

  // A static route wins over `[slug]` on every domain (Biznes catalog, ADR-012).
  it.each(RESERVED_PAGE_SLUGS)('rejects the route path %s', (slug) => {
    expect(isValidPageSlug(slug)).toBe(false)
  })
})

/** Static route segments under `[domain]`, also inside route groups like `(biznes)`. */
function routeSegments(): string[] {
  const root = path.join(__dirname, '../../app/(sites)/[domain]')
  const dirs = (dir: string) =>
    readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  return dirs(root).flatMap((name) =>
    name.startsWith('(') ? dirs(path.join(root, name)) : name.startsWith('[') ? [] : [name],
  )
}

describe('RESERVED_PAGE_SLUGS', () => {
  it.each(routeSegments().filter((name) => !name.includes('.')))(
    'covers the route /%s',
    (segment) => {
      expect(RESERVED_PAGE_SLUGS).toContain(segment)
    },
  )

  // Software routes (ADR-014 §2, v20 pkt 11): reserved before their pages exist (SW9–SW11).
  it.each(['rozwiazania', 'dobierz', 'dla-branz', 'miejscowosci', 'dziekujemy'])(
    'reserves the Software path %s',
    (slug) => {
      expect(RESERVED_PAGE_SLUGS).toContain(slug)
    },
  )

  // Instalacje routes (ADR-I002 §0): reserved before their pages exist (I10, I11).
  it.each(['dla-kogo', 'wyslane'])('reserves the Instalacje path %s', (slug) => {
    expect(RESERVED_PAGE_SLUGS).toContain(slug)
  })

  // The guide list `/poradnik` is a page of `Pages`; the route group serves only its entries.
  it('keeps poradnik free for a page', () => {
    expect(isValidPageSlug('poradnik')).toBe(true)
  })
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
