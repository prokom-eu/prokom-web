import { describe, expect, it } from 'vitest'

import { isProducerSource, publicSources, validateHttpsUrls, validateHttpUrls } from './sources'

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

describe('publicSources (K31-ZMIANY §4 pkt 9, ADR-012 rozstrz. 19)', () => {
  it('shows producers and their subdomains, never shops or distributors', () => {
    expect(isProducerSource('https://psref.lenovo.com/Product/ThinkPad_X9')).toBe(true)
    expect(isProducerSource('https://www.dell.com/pl-pl/shop')).toBe(true)
    expect(isProducerSource('https://ksef.podatki.gov.pl/')).toBe(true)
    expect(isProducerSource('https://elenovo.pl/kategoria/seria-yoga-pro-7/')).toBe(false)
    expect(isProducerSource('https://www.senetic.pl/category/synology-hdd-30243/')).toBe(false)
    expect(isProducerSource('https://backend.vidis.pl/api/media/karta.pdf')).toBe(false)
    expect(isProducerSource('https://notdell.com/')).toBe(false)
    // K4: Apple and Brother Polska — but not Brother's shop (K36 §13).
    expect(isProducerSource('https://support.apple.com/pl-pl/111')).toBe(true)
    expect(isProducerSource('https://www.brother.pl/drukarki')).toBe(true)
    expect(isProducerSource('https://store.brother.pl/mfc-l2922dw')).toBe(false)
    // Producers' shops: prices (K4-FINAL §1).
    expect(isProducerSource('https://eu.store.ui.com/eu/en/products/u7-pro')).toBe(false)
    expect(isProducerSource('https://sklep.eurocert.pl/podpis')).toBe(false)
    expect(isProducerSource('https://www.ui.com/wi-fi')).toBe(true)
    expect(isProducerSource('nie-adres')).toBe(false)
  })

  it('drops price pages while another producer link is left', () => {
    expect(
      publicSources({
        datasheets: ['https://www.gopos.pl/karta.pdf'],
        productPages: ['https://www.gopos.pl/cennik', 'https://sklep.pl/a'],
      }),
    ).toEqual({ datasheets: ['https://www.gopos.pl/karta.pdf'], productPages: [] })
    // Only the path counts: a word in the query is not a price page.
    expect(publicSources({ productPages: ['https://www.gopos.pl/?ref=cennik'] })).toEqual({
      productPages: ['https://www.gopos.pl/?ref=cennik'],
    })
    expect(publicSources({ productPages: ['https://www.gopos.pl/cennik'] })).toEqual({
      productPages: ['https://www.gopos.pl/cennik'],
    })
  })
})
