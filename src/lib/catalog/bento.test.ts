import { describe, expect, it } from 'vitest'

import { bentoTiles, shortenValue } from './bento'
import { featureIcon, paramIcon } from './productIcons'

// Values of the ThinkBook 14 G8 / G9 card, as in `k31/screens/Web-Produkt-1440`.
const SCREEN =
  '14" IPS matowy 16:10, WUXGA 1920×1200 (G8: 300 nitów, G9: 400 nitów); opcjonalnie dotykowy; w G9 IPL/AHP także 2.8K 2880×1800 120 Hz 500 nitów'
const CPU =
  'do wyboru: Intel Core 5 210H, Intel Core 7 240H, Intel Core i5-13420H, Intel Core Ultra 5 225U, Intel Core Ultra 7 255H'
const PORTS =
  '2× USB-A 5 Gb/s (jedno zawsze zasilane), 2× USB-C (USB-C 10 Gb/s + Thunderbolt 4 w G8 i G9 IRL), HDMI 2.1, RJ-45'

describe('shortenValue', () => {
  it('keeps the first part up to „;”', () => {
    expect(shortenValue(SCREEN, 70)).toBe(
      '14" IPS matowy 16:10, WUXGA 1920×1200 (G8: 300 nitów, G9: 400 nitów)',
    )
    expect(shortenValue('SSD M.2 PCIe 4.0 NVMe; 2 gniazda M.2')).toBe('SSD M.2 PCIe 4.0 NVMe')
  })

  it('cuts a long value at the last break, without an ellipsis', () => {
    expect(shortenValue(CPU)).toBe('do wyboru: Intel Core 5 210H, Intel Core 7 240H')
    expect(shortenValue(PORTS)).toBe('2× USB-A 5 Gb/s (jedno zawsze zasilane), 2× USB-C')
  })

  it('adds „…” only when the cut falls inside a phrase', () => {
    const phrase = 'bardzo długa wartość bez żadnego przecinka ani nawiasu która ciągnie się dalej'
    const short = shortenValue(phrase)
    expect(short.endsWith('…')).toBe(true)
    expect(short.length).toBeLessThanOrEqual(61)
  })

  it('removes an unclosed bracket', () => {
    expect(shortenValue('Intel Core Ultra 5 (seria 1; i 2)')).toBe('Intel Core Ultra 5')
  })
})

describe('bentoTiles', () => {
  const specs = [
    { label: 'Waga', value: 'od 1,36 kg' },
    { label: 'Porty', value: PORTS },
    { label: 'Dysk', value: 'SSD M.2 PCIe 4.0 NVMe; drugie gniazdo' },
    { label: 'Pamięć RAM (stan/max)', value: 'DDR5, maks. 64 GB' },
    { label: 'Procesor', value: CPU },
    { label: 'Ekran', value: SCREEN },
    { label: 'Kamera', value: 'Full HD' },
  ]

  it('takes the priority parameters first, 5 tiles', () => {
    const tiles = bentoTiles(specs)
    expect(tiles.map((tile) => tile.label)).toEqual([
      'Ekran',
      'Procesor',
      'Pamięć RAM (stan/max)',
      'Dysk',
      'Porty',
    ])
    expect(tiles.map((tile) => tile.icon)).toEqual(['screen', 'cpu', 'ram', 'disk', 'ports'])
    // The first tile is longer (70): the whole first part fits.
    expect(tiles[0]!.value).toContain('400 nitów)')
  })

  it('fills up with other parameters, 3 tiles for 3–4 and none below 3', () => {
    const service = [
      { label: 'Zakres', value: 'przegląd' },
      { label: 'Czas', value: '2 h' },
      { label: 'Raport', value: 'PDF' },
      { label: 'Miejsce', value: 'u klienta' },
    ]
    expect(bentoTiles(service).map((tile) => tile.label)).toEqual(['Zakres', 'Czas', 'Raport'])
    expect(bentoTiles(service.slice(0, 2))).toEqual([])
    expect(bentoTiles([...specs, { label: 'Ekran', value: '' }])).toHaveLength(5)
  })
})

describe('icons', () => {
  it('picks the highlight icon by keywords', () => {
    expect(featureIcon('RAM do 64 GB')).toBe('ram')
    expect(featureIcon('RJ-45 i HDMI')).toBe('ports')
    expect(featureIcon('od 1,36 kg')).toBe('weight')
    expect(featureIcon('papier 80 mm, obcinacz')).toBe('paper')
    expect(featureIcon('Wi-Fi 7')).toBe('wireless')
    expect(featureIcon('NVIDIA RTX PRO')).toBe('star')
  })

  it('picks the tile icon by the parameter name', () => {
    expect(paramIcon('Łączność z CRK')).toBe('wireless')
    expect(paramIcon('Karta graficzna')).toBe('cpu')
    expect(paramIcon('Szerokość druku')).toBe('printer')
  })
})
