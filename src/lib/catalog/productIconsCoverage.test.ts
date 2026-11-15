import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import { paramIcon } from './productIcons'

type Card = { status: string; parametry: { k: string }[] }

describe('„W skrócie” icons by the kind of parameter (PRODUKCJA-BIZNES-1211 §1)', () => {
  it('gives a real icon to almost every parameter of the catalog — the star is the exception', () => {
    const labels = (catalog as unknown as { produkty: Card[] }).produkty
      .filter((card) => card.status === 'gotowe')
      .flatMap((card) => card.parametry.map((param) => param.k))
    const stars = labels.filter((label) => paramIcon(label) === 'star')
    expect(stars.length / labels.length, [...new Set(stars)].slice(0, 30).join(', ')).toBeLessThan(
      0.12,
    )
  })

  it('maps the usual tiles of an MFP and a register', () => {
    expect(paramIcon('Prędkość druku')).toBe('speed')
    expect(paramIcon('Wymiary / waga')).toBe('weight')
    expect(paramIcon('Format')).toBe('size')
    expect(paramIcon('Zasilanie / akumulator')).toBe('battery')
    expect(paramIcon('Gwarancja producenta')).toBe('warranty')
    expect(paramIcon('Montaż VESA')).toBe('mount')
  })
})
