import { describe, expect, it } from 'vitest'

import { hasMarker, stripMarked } from './markers'

describe('hasMarker', () => {
  it('finds the boss and Krystian markers, any case, with spaces', () => {
    expect(hasMarker('[SZEF] 100+')).toBe(true)
    expect(hasMarker('Autoryzacja [ szef: Satel]')).toBe(true)
    expect(hasMarker('[Krystian: link do listy]')).toBe(true)
    expect(hasMarker('[KRYSTIAN] sprawdzić')).toBe(true)
  })

  it('leaves plain text and other brackets alone', () => {
    expect(hasMarker('Oddzwaniamy w 60 minut')).toBe(false)
    expect(hasMarker('[CENA] od 99 zł')).toBe(false)
    expect(hasMarker('Szef [kuchni]')).toBe(false)
  })
})

describe('stripMarked', () => {
  it('turns a marked text into null and keeps the rest', () => {
    expect(stripMarked({ h1: '[SZEF] Tytuł', lead: 'Lead' })).toEqual({ h1: null, lead: 'Lead' })
  })

  it('drops marked texts from a list of texts', () => {
    expect(stripMarked(['[SZEF: Satel]', 'Elzab EcoPower'])).toEqual(['Elzab EcoPower'])
  })

  it('keeps a row whose optional text is marked, with that text emptied', () => {
    const salons = [
      { name: 'Rabka-Zdrój', street: 'ul. Orkana 16B', parkingNote: '[SZEF] parking' },
    ]
    expect(stripMarked(salons)).toEqual([
      { name: 'Rabka-Zdrój', street: 'ul. Orkana 16B', parkingNote: null },
    ])
    const lines = [{ name: 'Biznes', descriptionLong: '[Krystian] opis' }]
    expect(stripMarked(lines)).toEqual([{ name: 'Biznes', descriptionLong: null }])
  })

  it('drops a whole row when its main text is marked', () => {
    const verify = [
      { title: 'CEIDG', text: 'Dane firmy po NIP.' },
      { title: 'Lista serwisów Posnet', text: '[Krystian: link do listy]' },
    ]
    expect(stripMarked(verify)).toEqual([verify[0]])
  })

  it('looks into nested groups and rows', () => {
    const about = { stats: [{ value: '24', label: 'miesiące', meta: { title: '[szef]' } }] }
    expect(stripMarked(about)).toEqual({ stats: [] })
  })

  it('keeps numbers, booleans and nulls as they are', () => {
    expect(stripMarked({ order: 2, published: false, geo: null })).toEqual({
      order: 2,
      published: false,
      geo: null,
    })
  })
})
