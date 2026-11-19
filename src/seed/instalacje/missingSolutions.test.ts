import { describe, expect, it } from 'vitest'

import { solutionsToImport } from './map'
import { missingSolutions } from './missingSolutions'

describe('missingSolutions', () => {
  const items = solutionsToImport()

  it('on a panel with the 76 older solutions creates only the streaming ones (77–79)', () => {
    const stored = new Set(Array.from({ length: 76 }, (_, i) => i + 1))
    const missing = missingSolutions(items, stored)
    expect(missing.map((item) => item.legacyId)).toEqual([77, 78, 79])
    expect(new Set(missing.map((item) => item.serviceKey))).toEqual(new Set(['snd']))
  })

  it('never brings back an older solution deleted in the panel', () => {
    const stored = new Set(Array.from({ length: 79 }, (_, i) => i + 1).filter((id) => id !== 12))
    expect(missingSolutions(items, stored)).toEqual([])
  })

  it('creates nothing when every solution is there (a second run)', () => {
    const stored = new Set(items.map((item) => item.legacyId))
    expect(missingSolutions(items, stored)).toEqual([])
  })
})
