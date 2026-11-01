import { describe, expect, it } from 'vitest'

import {
  displayName,
  productTitle,
  uniqueVersions,
  variantKey,
  variantSlug,
  withoutBrackets,
} from './productName'

describe('withoutBrackets', () => {
  it('drops bracketed parts, nested ones too', () => {
    expect(withoutBrackets('QNAP TS-464U(-RP) (4 dyski (hot-swap))')).toBe('QNAP TS-464U')
    expect(withoutBrackets('bez nawiasów')).toBe('bez nawiasów')
  })

  it('survives an unbalanced closing bracket', () => {
    expect(withoutBrackets('model) X')).toBe('model X')
  })
})

describe('displayName', () => {
  const long = 'Lenovo ThinkBook 14 G8 IRL / G8 IAL / G9 IRL / G9 IPL / G9 AHP (Intel i AMD)'

  it('keeps a name of up to 62 characters', () => {
    expect(displayName('Lenovo ThinkBook 14 G8 / G9', 'ThinkBook 14')).toBe(
      'Lenovo ThinkBook 14 G8 / G9',
    )
  })

  it('uses the short name for a longer one', () => {
    expect(displayName(long, 'Lenovo ThinkBook 14 G8 / G9')).toBe('Lenovo ThinkBook 14 G8 / G9')
  })

  it('without a short name drops the brackets of a long name', () => {
    expect(displayName(long, null)).toBe(
      'Lenovo ThinkBook 14 G8 IRL / G8 IAL / G9 IRL / G9 IPL / G9 AHP',
    )
    expect(displayName(long, '  ')).toBe(displayName(long, null))
  })
})

describe('variants', () => {
  it('key and slug of a version', () => {
    expect(variantKey('G8 IRL (Intel)')).toBe('G8 IRL')
    expect(variantSlug('G8 IRL (Intel)')).toBe('g8-irl')
    expect(variantSlug('Jota ONLINE BT/WiFi')).toBe('jota-online-bt-wifi')
    expect(variantSlug('Wersja źródłowa')).toBe('wersja-zrodlowa')
  })

  it('keeps one version per ?wersja= value', () => {
    expect(uniqueVersions(['G8 IRL (Intel)', 'G8 IRL (AMD)', 'G9 AHP (AMD)', ' '])).toEqual([
      'G8 IRL (Intel)',
      'G9 AHP (AMD)',
    ])
  })

  it('title lists 2–3 models of a card with many of them', () => {
    const models = ['G8 IRL (Intel)', 'G8 IAL (Intel Core Ultra)', 'G9 IRL (Intel)', 'G9 AHP (AMD)']
    expect(productTitle('Lenovo ThinkBook 14 G8 / G9', models)).toBe(
      'Lenovo ThinkBook 14 G8 / G9 — G8 IRL, G8 IAL, G9 IRL',
    )
    expect(productTitle('Posnet Ergo', ['Ergo Online'])).toBe('Posnet Ergo')
    // Models only while the title fits before „ | PRO-KOM Biznes” (audit 01.11).
    expect(
      productTitle('Dell Pro 14 / Dell Pro 16 dla firm i biur', [
        'PC14250 (i5)',
        'PC16250',
        'PC14255',
      ]),
    ).toBe('Dell Pro 14 / Dell Pro 16 dla firm i biur — PC14250')
    expect(productTitle('A'.repeat(60), ['X1', 'X2'])).toBe('A'.repeat(60))
    expect(productTitle('Model A i B', ['A', 'B'])).toBe('Model A i B')
  })
})
