import { describe, expect, it } from 'vitest'

import { withGamingLast } from './lines'

describe('withGamingLast (spec §2.4)', () => {
  it('moves Gaming to the end and keeps the panel order of the rest', () => {
    const lines = [
      { key: 'gaming' },
      { key: 'prokom' },
      { key: 'tech' },
      { key: 'biznes' },
    ] as const
    expect(withGamingLast(lines).map((line) => line.key)).toEqual([
      'prokom',
      'tech',
      'biznes',
      'gaming',
    ])
  })

  it('leaves a list without Gaming as it is', () => {
    const lines = [{ key: 'biznes' }, { key: 'software' }] as const
    expect(withGamingLast(lines)).toEqual(lines)
  })
})
