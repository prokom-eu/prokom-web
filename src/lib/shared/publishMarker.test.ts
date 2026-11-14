import { describe, expect, it } from 'vitest'

import { blockedByMarker } from './publishMarker'

const FIELDS = ['title', 'steps'] as const

describe('blockedByMarker', () => {
  it('lets a draft with a marker be saved', () => {
    expect(blockedByMarker(FIELDS, { _status: 'draft', title: '[SZEF: tytuł?]' })).toBeNull()
  })

  it('stops publishing a marked visible field, also deep in a list', () => {
    expect(blockedByMarker(FIELDS, { _status: 'published', title: '[SZEF: tytuł?]' })).toBe('title')
    expect(
      blockedByMarker(FIELDS, { _status: 'published', steps: [{ id: 'a', text: 'x [CENA]' }] }),
    ).toBe('steps')
  })

  it('ignores fields that are not shown', () => {
    expect(blockedByMarker(FIELDS, { _status: 'published', note: '[SZEF]' })).toBeNull()
  })

  it('checks a partial update together with the stored record', () => {
    expect(
      blockedByMarker(FIELDS, { steps: ['ok'] }, { _status: 'published', title: '[szef]' }),
    ).toBe('title')
    expect(
      blockedByMarker(FIELDS, { title: 'Gotowe' }, { _status: 'published', title: '[SZEF]' }),
    ).toBeNull()
  })
})
