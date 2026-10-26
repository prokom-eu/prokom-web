import { describe, expect, it } from 'vitest'

import { validateSubcategories } from './subcategories'

describe('validateSubcategories (CatalogCategories.subcategories)', () => {
  it('accepts no rows and rows with distinct names and addresses', () => {
    expect(validateSubcategories(undefined)).toBe(true)
    expect(validateSubcategories([])).toBe(true)
    expect(
      validateSubcategories([
        { name: 'Laptopy', slug: 'laptopy' },
        { name: 'Monitory', slug: 'monitory' },
        { name: 'Szuflady kasowe', slug: null },
        { name: 'Drukarki bonowe', slug: '' },
      ]),
    ).toBe(true)
  })

  it('rejects a repeated name — the chips would mix (case and spaces ignored)', () => {
    expect(validateSubcategories([{ name: 'Laptopy' }, { name: ' laptopy ' }])).toContain(
      '„laptopy”',
    )
  })

  it('rejects a repeated address — two subcategories under one /oferta/<kategoria>/<adres>', () => {
    expect(
      validateSubcategories([
        { name: 'Laptopy', slug: 'laptopy' },
        { name: 'Notebooki', slug: 'laptopy' },
      ]),
    ).toContain('„laptopy”')
  })
})
