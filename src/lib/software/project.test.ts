import { describe, expect, it } from 'vitest'

import { MAX_PROJECT_ITEMS, parseProject, remove, toggle } from './project'

describe('parseProject', () => {
  it('reads { id, name } entries', () => {
    const raw = JSON.stringify([{ id: 'strona-firmowa', name: 'Strona firmowa' }])
    expect(parseProject(raw)).toEqual([{ id: 'strona-firmowa', name: 'Strona firmowa' }])
  })

  it.each([null, '', 'nie json', '{}', '"tekst"'])('is empty for %j', (raw) => {
    expect(parseProject(raw)).toEqual([])
  })

  it('drops broken entries and duplicates, trims names', () => {
    const raw = JSON.stringify([
      { id: 'crm', name: '  CRM  ' },
      { id: 'crm', name: 'CRM 2' },
      { id: '', name: 'Bez id' },
      { id: 'bez-nazwy' },
      { id: 'pusta', name: '   ' },
      null,
      'crm',
      { id: 7, name: 'Liczba' },
    ])
    expect(parseProject(raw)).toEqual([{ id: 'crm', name: 'CRM' }])
  })

  it(`keeps at most ${MAX_PROJECT_ITEMS} items`, () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, name: `R${i}` }))
    expect(parseProject(JSON.stringify(many))).toHaveLength(MAX_PROJECT_ITEMS)
  })
})

describe('toggle', () => {
  it('adds a missing solution and removes a present one', () => {
    const added = toggle([], 'crm', 'CRM')
    expect(added).toEqual({ project: [{ id: 'crm', name: 'CRM' }], added: true })
    expect(toggle(added.project, 'crm', 'CRM')).toEqual({ project: [], added: false })
  })

  it('stores the name trimmed, as it is read back', () => {
    expect(toggle([], 'crm', '  CRM  ').project).toEqual([{ id: 'crm', name: 'CRM' }])
  })

  it('does not add past the limit', () => {
    const full = Array.from({ length: MAX_PROJECT_ITEMS }, (_, i) => ({ id: `r${i}`, name: 'R' }))
    const result = toggle(full, 'nowe', 'Nowe')
    expect(result.added).toBe(false)
    expect(result.project).toBe(full)
  })
})

describe('remove', () => {
  it('removes by id and keeps the order', () => {
    const project = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ]
    expect(remove(project, 'b')).toEqual([
      { id: 'a', name: 'A' },
      { id: 'c', name: 'C' },
    ])
  })
})
