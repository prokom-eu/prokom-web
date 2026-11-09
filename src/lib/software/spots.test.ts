import { describe, expect, it } from 'vitest'

import { SPOT_KEYS, SPOT_WORDS, spotAttr, spotsOf } from './spots'

describe('spots (OKNO-OFERTY-PREMIUM §2.2)', () => {
  it('every key has its words and nothing else is listed', () => {
    expect(Object.keys(SPOT_WORDS).sort()).toEqual([...SPOT_KEYS].sort())
    for (const key of SPOT_KEYS) expect(SPOT_WORDS[key].length).toBeGreaterThan(0)
  })

  it('a point may name several areas', () => {
    expect(spotsOf('Jedna strona: oferta, telefon, mapa i formularz')).toEqual([
      'telefon',
      'mapa',
      'formularz',
    ])
  })

  it('„na telefonie” is the phone version, not the call button', () => {
    expect(spotsOf('Wygodna na telefonie')).toEqual(['mobile'])
    expect(spotsOf('Telefon i dojazd jednym kliknięciem')).toEqual(['telefon', 'mapa'])
  })

  it('reads the mock-up texts the same way', () => {
    expect(spotAttr('Zadzwoń teraz')).toBe('telefon')
    expect(spotAttr('Google', 'gotowa od startu')).toBe('google')
    expect(spotAttr('Szybki kontakt', 'Wyślij zapytanie')).toBe('formularz')
    expect(spotAttr('Korzyści', 'w 5 sekund')).toBeUndefined()
  })

  it('every form of „rezerwacja” (Zarezerwuj, Rezerwuj, rezerwacji)', () => {
    expect(spotAttr('Zarezerwuj stolik')).toBe('rezerwacja')
    expect(spotsOf('Formularz rezerwacji stolika')).toEqual(['formularz', 'rezerwacja'])
  })

  it('a point without a known word stays plain', () => {
    expect(spotsOf('Jeden moduł na gotowym fundamencie')).toEqual([])
  })
})
