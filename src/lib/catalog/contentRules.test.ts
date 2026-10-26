import { describe, expect, it } from 'vitest'

import { forbiddenContent } from './contentRules'

describe('forbiddenContent (K3-KATALOG §10: zero prices, banned brands)', () => {
  it('finds amounts in złoty, free offers, instalments and leasing', () => {
    expect(forbiddenContent('Ulga do 700 zł')).toEqual(['kwota w zł'])
    expect(forbiddenContent('0 zł przez 12 mies.')).toEqual(['kwota w zł'])
    expect(forbiddenContent('od 1 299,00 zł netto')).toEqual(['kwota w zł'])
    expect(forbiddenContent('Szkolenie gratis')).toEqual(['gratis'])
    expect(forbiddenContent('Montaż w cenie')).toEqual(['w cenie'])
    expect(forbiddenContent('Kup na raty')).toEqual(['raty'])
    expect(forbiddenContent('Leasing dla firm')).toEqual(['leasing'])
  })

  it('finds the brands that must not appear in public texts', () => {
    expect(forbiddenContent('Skaner Honeywell albo Datalogic')).toEqual([
      'marka Honeywell',
      'marka Datalogic',
    ])
    for (const brand of ['Novitus', 'Barracuda', 'Streamsoft', 'Verifone']) {
      expect(forbiddenContent(`Zamiast ${brand.toLowerCase()}`)).toEqual([`marka ${brand}`])
    }
  })

  it('lets ordinary texts through', () => {
    expect(forbiddenContent('Kasa z 2 drukarkami, 5 lat gwarancji, PLU 10 000')).toEqual([])
    expect(forbiddenContent('Wiraty, ratunek i karaty — nie raty')).toEqual(['raty'])
    expect(forbiddenContent('Ceny na zapytanie. Złącza: USB, LAN')).toEqual([])
    expect(forbiddenContent('Drukarka bonów 80 mm, 4 złącza')).toEqual([])
    expect(forbiddenContent('Bezpłatny przegląd IT')).toEqual([])
  })
})
