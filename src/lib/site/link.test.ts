import { describe, expect, it } from 'vitest'

import { isValidNavHref, toTelHref, toWhatsAppHref } from './link'

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

  it('returns null without a usable number', () => {
    expect(toWhatsAppHref('brak')).toBeNull()
    expect(toWhatsAppHref('12 34')).toBeNull()
  })
})
