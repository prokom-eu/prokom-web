import { describe, expect, it } from 'vitest'

import {
  HERO_VARIANTS,
  parseSectionData,
  SECTION_SCHEMAS,
  SECTION_VARIANTS,
  validateSectionData,
} from './sections'

describe('K4 section kinds', () => {
  it('every kind has a panel label, and only those', () => {
    expect(SECTION_VARIANTS.map((v) => v.value).sort()).toEqual(Object.keys(SECTION_SCHEMAS).sort())
  })

  it('hero kinds are known kinds', () => {
    for (const variant of HERO_VARIANTS) expect(SECTION_SCHEMAS).toHaveProperty(variant)
  })

  it('kinds without widget data accept an empty field', () => {
    expect(parseSectionData('stats', null)).toEqual({})
    expect(validateSectionData(undefined, 'cards')).toBe(true)
  })

  it('rejects data that does not fit the kind, with the path', () => {
    expect(parseSectionData('products', { slugs: [] })).toBeNull()
    expect(validateSectionData({ slugs: [] }, 'products')).toMatch(/^Dane sekcji: slugs/)
    expect(validateSectionData({}, 'nope')).toBe('Wybierz rodzaj sekcji.')
  })

  it('a band takes links and inquiry buttons', () => {
    expect(
      parseSectionData('band', {
        actions: [
          { label: 'Umów prezentację', add: 'gopos', note: 'Prezentacja', primary: true },
          { label: '889 003 889', href: 'tel:+48889003889' },
        ],
      })?.actions,
    ).toHaveLength(2)
  })
})
