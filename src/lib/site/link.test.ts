import { describe, expect, it } from 'vitest'

import { isValidNavHref, toTelHref } from './link'

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
