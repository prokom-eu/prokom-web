import { describe, expect, it } from 'vitest'

import { isValidNavHref, toDirectionsHref, toMapsHref, toTelHref } from './link'

describe('isValidNavHref', () => {
  it.each([
    '/',
    '/kontakt',
    '/oferta/kasy-fiskalne#gopos',
    'https://prokominstalacje.pl',
    'https://pro-kom.eu/o-nas',
    'mailto:biuro@pro-kom.eu',
    'tel:+48182677000',
  ])('accepts %j', (href) => {
    expect(isValidNavHref(href)).toBe(true)
  })

  it.each([
    '',
    'kontakt',
    '//evil.pl',
    // Browsers read `\` as `/` in http(s) URLs, so this is `//evil.pl` too.
    '/\\evil.pl',
    'javascript:alert(1)',
    'http://pro-kom.eu',
    'https://',
    '/ma spacje',
    'ftp://pro-kom.eu',
  ])('rejects %j', (href) => {
    expect(isValidNavHref(href)).toBe(false)
  })
})

describe('toTelHref', () => {
  it('keeps digits and a leading plus', () => {
    expect(toTelHref('+48 18 267-70 00')).toBe('tel:+48182677000')
  })

  it('returns null when there are no digits', () => {
    expect(toTelHref('brak')).toBeNull()
  })

  it('adds the Polish code to a bare 9-digit number (Software v23: „883 200 151”)', () => {
    expect(toTelHref('883 200 151')).toBe('tel:+48883200151')
    expect(toTelHref('0048 883 200 151')).toBe('tel:0048883200151')
  })
})

describe('Google Maps links (no embedded map before cookie consent, spec. §6.9)', () => {
  it('opens the address or the route to it', () => {
    expect(toMapsHref('ul. Orkana 16B, Rabka-Zdrój')).toBe(
      'https://www.google.com/maps/search/?api=1&query=ul.%20Orkana%2016B%2C%20Rabka-Zdr%C3%B3j',
    )
    expect(toDirectionsHref('ul. Orkana 16B, Rabka-Zdrój')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=ul.%20Orkana%2016B%2C%20Rabka-Zdr%C3%B3j',
    )
  })
})
