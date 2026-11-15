import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import gaps from './requiredSpecs.gaps.json'
import { missingSpecs, PLACEHOLDER_DIFFERENCE, REQUIRED_SPECS } from './requiredSpecs'

type Card = {
  slug_seed: string
  status: string
  kategoria: string
  parametry: { k: string; v: string }[]
  warianty_opis?: { model: string; roznica: string }[]
}

const ready = (catalog as unknown as { produkty: Card[] }).produkty.filter(
  (card) => card.status === 'gotowe',
)
const known = gaps as Record<string, string[]>

describe('required parameters of a category (PRODUKCJA-BIZNES-1211 §1)', () => {
  it('meets a slot by any key of its words; an empty value does not count', () => {
    expect(
      missingSpecs('laptopy', [{ k: 'Wymiary / waga', v: '320 × 220 × 18 mm, 1,4 kg' }]),
    ).not.toContain('Waga')
    expect(missingSpecs('laptopy', [{ k: 'Waga', v: ' ' }])).toContain('Waga')
    expect(missingSpecs('nieznana', [])).toBeNull()
  })

  it('has required parameters for every category of a ready card', () => {
    const categories = new Set(ready.map((card) => card.kategoria))
    expect([...categories].filter((category) => !REQUIRED_SPECS[category])).toEqual([])
  })

  it('every ready card has its category’s parameters or is on the list of gaps (only shrinks)', () => {
    const unlisted: string[] = []
    const filled: string[] = []
    for (const card of ready) {
      const missing = missingSpecs(card.kategoria, card.parametry) ?? []
      const listed = known[card.slug_seed] ?? []
      for (const label of missing)
        if (!listed.includes(label)) unlisted.push(`${card.slug_seed}: ${label}`)
      for (const label of listed)
        if (!missing.includes(label)) filled.push(`${card.slug_seed}: ${label}`)
    }
    // A new gap: fill it from the producer's page, or (when the producer does not say)
    // run `node scripts/parametry-braki.ts` to list it with the others.
    expect(unlisted, 'braki spoza listy').toEqual([])
    // A gap filled: run `node scripts/parametry-braki.ts` so the list shrinks.
    expect(filled, 'uzupełnione, a wciąż na liście').toEqual([])
  })

  it('says what differs between versions — no placeholders of the sheet', () => {
    const placeholders = ready.flatMap((card) =>
      (card.warianty_opis ?? [])
        .filter((variant) => PLACEHOLDER_DIFFERENCE.test(variant.roznica))
        .map((variant) => `${card.slug_seed}: ${variant.model}`),
    )
    expect(placeholders).toEqual([])
    expect(PLACEHOLDER_DIFFERENCE.test('Jak wyżej, angielska wersja')).toBe(true)
    expect(PLACEHOLDER_DIFFERENCE.test('20 str./min A4')).toBe(false)
  })
})
