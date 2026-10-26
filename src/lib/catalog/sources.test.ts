import { describe, expect, it } from 'vitest'

import { validateHttpsUrls, validateHttpUrls } from './sources'

describe('validateHttpUrls (Products.sources)', () => {
  it('accepts no value and http(s) links', () => {
    expect(validateHttpUrls(undefined)).toBe(true)
    expect(validateHttpUrls(null)).toBe(true)
    expect(validateHttpUrls([])).toBe(true)
    expect(
      validateHttpUrls([
        'https://www.elzab.com.pl/pl/kasy-i-drukarki-online/kasy-srednie-online/elzab-jota-online',
        'http://example.com/karta.pdf',
      ]),
    ).toBe(true)
  })

  it('rejects other schemes, relative links and plain text', () => {
    for (const bad of ['javascript:alert(1)', 'ftp://example.com/a.pdf', '/karta.pdf', 'karta']) {
      expect(validateHttpUrls([bad])).toMatch(bad)
    }
  })

  it('rejects links with spaces or backslashes', () => {
    expect(validateHttpUrls(['https://example.com/a b.pdf'])).not.toBe(true)
    expect(validateHttpUrls(['https://example.com\\@evil.com'])).not.toBe(true)
  })
})

describe('validateHttpsUrls (Partners.brandPage.sources)', () => {
  it('accepts no value and https links only, like the source of a brand fact', () => {
    expect(validateHttpsUrls(undefined)).toBe(true)
    expect(validateHttpsUrls(['https://www.posnet.com.pl/o-nas'])).toBe(true)
    expect(validateHttpsUrls(['http://www.posnet.com.pl/o-nas'])).not.toBe(true)
    expect(validateHttpsUrls(['https://example.com/a b'])).not.toBe(true)
  })
})
