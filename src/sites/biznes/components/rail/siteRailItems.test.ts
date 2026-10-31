import { describe, expect, it } from 'vitest'

import { SITE_RAIL, siteRailCurrent } from './siteRailItems'

describe('SITE_RAIL (K33 §2.4, plansza „Menu” na podstronach)', () => {
  it('lists the global pages in the order of the board', () => {
    expect(SITE_RAIL.map((item) => item.label)).toEqual([
      'Strona główna',
      'Oferta',
      'Konfigurator',
      'Plan Twojej firmy',
      'Gotowe zestawy',
      'Opieka IT',
      'O firmie',
      'Kontakt',
    ])
  })
})

describe('siteRailCurrent', () => {
  it('marks the page itself', () => {
    expect(siteRailCurrent('/')).toBe('/')
    expect(siteRailCurrent('/opieka-it')).toBe('/opieka-it')
    expect(siteRailCurrent('/kontakt')).toBe('/kontakt')
  })

  it('marks „Oferta” on categories, products and brand pages', () => {
    expect(siteRailCurrent('/oferta')).toBe('/oferta')
    expect(siteRailCurrent('/oferta/laptopy/stacje-robocze')).toBe('/oferta')
    expect(siteRailCurrent('/produkt/posnet-ergo-online')).toBe('/oferta')
    // „Marki” joins the menu with /marki (K4f); until then brands sit under the offer.
    expect(siteRailCurrent('/marki/lenovo')).toBe('/oferta')
  })

  it('marks „Gotowe zestawy” on a set page', () => {
    expect(siteRailCurrent('/zestawy/kawiarnia-start')).toBe('/zestawy')
  })

  it('marks nothing on other pages, and never by a prefix of another word', () => {
    expect(siteRailCurrent('/zapytanie')).toBeNull()
    expect(siteRailCurrent('/ofertax')).toBeNull()
    expect(siteRailCurrent('/kontakty')).toBeNull()
  })
})
