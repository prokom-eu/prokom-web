import { describe, expect, it } from 'vitest'

import { isValidNavHref, toDirectionsHref, toMapsHref, toTelHref, toWhatsAppHref } from './link'

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
})

describe('toWhatsAppHref', () => {
  it('builds a wa.me link from an international number', () => {
    expect(toWhatsAppHref('+48 889 003 889')).toBe('https://wa.me/48889003889')
  })

  // wa.me needs the country code; a local number would open someone else's chat.
  it('adds the Polish code to a 9-digit number', () => {
    expect(toWhatsAppHref('889 003 889')).toBe('https://wa.me/48889003889')
  })

  // "00" is the dialling prefix, not part of the number wa.me expects.
  it('drops a leading 00', () => {
    expect(toWhatsAppHref('0048 889 003 889')).toBe('https://wa.me/48889003889')
  })

  it('returns null without a usable number', () => {
    expect(toWhatsAppHref('brak')).toBeNull()
    expect(toWhatsAppHref('12 34')).toBeNull()
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
