import { describe, expect, it } from 'vitest'

import { forbiddenContent } from './contentRules'

describe('forbiddenContent (K3-KATALOG §10: zero prices, banned brands)', () => {
  it('finds amounts in złoty, free offers, instalments and leasing', () => {
    expect(forbiddenContent('Ulga 700 zł na kasę')).toEqual(['kwota w zł'])
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

  it('lets the amounts that are not prices through on the K4 subpages (K4-FINAL §1)', () => {
    const legal = (text: string) => forbiddenContent(text, { legalAmounts: true })
    expect(legal('Ulga do 700 zł — rozlicza księgowa')).toEqual([])
    expect(legal('90% ceny netto, maks. 700 zł')).toEqual([])
    expect(legal('faktury do 10 000 zł brutto miesięcznie')).toEqual([])
    expect(legal('sprzedaż powyżej 200 mln zł')).toEqual([])
    expect(legal('terminal bywa za 0 zł')).toEqual([])
    // An allowed amount does not hide a price next to it.
    expect(legal('Ulga do 700 zł, kasa od 999 zł')).toEqual(['kwota w zł'])
    expect(legal('Przegląd 0 zł')).toEqual(['kwota w zł'])
    // Elsewhere (card badges) the relief is still a price-like promise.
    expect(forbiddenContent('Ulga do 700 zł')).toEqual(['kwota w zł'])
  })

  it('finds „zapisujemy w umowie” — the contract „ustala” (K4-FINAL §1)', () => {
    expect(forbiddenContent('Zakres i czas reakcji zapisujemy w umowie.')).toEqual([
      'zapisujemy w umowie',
    ])
    expect(forbiddenContent('Zapisujemy go w umowie razem z czasem reakcji.')).toEqual([
      'zapisujemy w umowie',
    ])
    expect(forbiddenContent('czas reakcji zapisany w umowie')).toEqual(['zapisujemy w umowie'])
    expect(forbiddenContent('Zakres i czas reakcji ustalamy w umowie.')).toEqual([])
    expect(forbiddenContent('Zapisujemy terminy przeglądów kas.')).toEqual([])
  })

  it('lets ordinary texts through', () => {
    expect(forbiddenContent('Kasa z 2 drukarkami, 5 lat gwarancji, PLU 10 000')).toEqual([])
    expect(forbiddenContent('Wiraty, ratunek i karaty — nie raty')).toEqual(['raty'])
    expect(forbiddenContent('Ceny na zapytanie. Złącza: USB, LAN')).toEqual([])
    expect(forbiddenContent('Drukarka bonów 80 mm, 4 złącza')).toEqual([])
    expect(forbiddenContent('Bezpłatny przegląd IT')).toEqual([])
  })
})
