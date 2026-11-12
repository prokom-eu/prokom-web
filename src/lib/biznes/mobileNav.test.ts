import { describe, expect, it } from 'vitest'

import { activeBiznesTab, parentPath, phoneContactHref } from './mobileNav'

describe('activeBiznesTab', () => {
  it('marks Start only on the start page itself', () => {
    expect(activeBiznesTab('/')).toBe('start')
    expect(activeBiznesTab('/o-firmie')).toBeNull()
  })

  it('marks Oferta on the catalog, products, brands, bundles and vending', () => {
    for (const path of [
      '/oferta',
      '/oferta/laptopy',
      '/produkt/lenovo-thinkbook-14',
      '/marki',
      '/marki/lenovo',
      '/zestawy',
      '/zestawy/maly-sklep',
      '/automaty-vendingowe',
    ]) {
      expect(activeBiznesTab(path), path).toBe('oferta')
    }
  })

  it('marks Zapytanie and Kontakt on their pages', () => {
    expect(activeBiznesTab('/zapytanie')).toBe('zapytanie')
    expect(activeBiznesTab('/kontakt')).toBe('kontakt')
  })

  it('does not match a path that only starts with the same letters', () => {
    expect(activeBiznesTab('/ofertax')).toBeNull()
    expect(activeBiznesTab('/kontakty')).toBeNull()
  })

  it('leaves other pages without an active tab', () => {
    for (const path of ['/gopos', '/aktualnosci/ksef', '/konfigurator', '/plan-firmy']) {
      expect(activeBiznesTab(path), path).toBeNull()
    }
  })
})

describe('parentPath', () => {
  it('drops the last segment', () => {
    expect(parentPath('/oferta/laptopy')).toBe('/oferta')
    expect(parentPath('/aktualnosci/ksef-2026')).toBe('/aktualnosci')
  })

  it('goes to the start page from a first-level page', () => {
    expect(parentPath('/kontakt')).toBe('/')
    expect(parentPath('/')).toBe('/')
  })

  it('sends a product to the catalog (there is no /produkt page)', () => {
    expect(parentPath('/produkt/lenovo-thinkbook-14')).toBe('/oferta')
  })

  it('sends an industry to „Plan Twojej firmy” on the home page (there is no /branze page)', () => {
    expect(parentPath('/branze/gastronomia')).toBe('/#plan')
  })

  it('ignores a trailing slash', () => {
    expect(parentPath('/oferta/laptopy/')).toBe('/oferta')
  })
})

describe('phoneContactHref', () => {
  it('a link to the contact section leads to the inquiry page; others stay', () => {
    expect(phoneContactHref('/aktualnosci/ksef#kontakt')).toBe('/zapytanie')
    expect(phoneContactHref('#kontakt')).toBe('/zapytanie')
    expect(phoneContactHref('/konfigurator?firma=gastro')).toBe('/konfigurator?firma=gastro')
  })
})
