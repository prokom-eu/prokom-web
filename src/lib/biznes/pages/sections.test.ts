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

describe('section data added by PRODUKCJA-BIZNES-1211 §3 (no migration — older data still fits)', () => {
  it('cards: old `{}` and pictures by position, with gaps', () => {
    expect(parseSectionData('cards', {})).not.toBeNull()
    expect(parseSectionData('cards', undefined)).not.toBeNull()
    const data = parseSectionData('cards', {
      shots: [{ frame: 'doc' }, null, { frame: 'phone', image: 7 }],
    })
    expect(data?.shots?.map((shot) => shot?.frame ?? null)).toEqual(['doc', null, 'phone'])
    expect(parseSectionData('cards', { shots: [{ frame: 'poster' }] })).toBeNull()
  })

  it('steps: old `{}` and `axis`', () => {
    expect(parseSectionData('steps', {})?.axis).toBeUndefined()
    expect(parseSectionData('steps', { axis: true })?.axis).toBe(true)
  })

  it('chips: an icon of the set only', () => {
    const group = { t: 'Dowozy', items: ['Glovo'] }
    expect(parseSectionData('chips', { groups: [group] })).not.toBeNull()
    expect(parseSectionData('chips', { groups: [{ ...group, ic: 'car' }] })).not.toBeNull()
    expect(parseSectionData('chips', { groups: [{ ...group, ic: 'rakieta' }] })).toBeNull()
  })
})
