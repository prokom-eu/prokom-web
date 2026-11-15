import { describe, expect, it } from 'vitest'

import { splitLastSentence } from './Hero'

describe('splitLastSentence (H9)', () => {
  it('takes the last sentence apart', () => {
    expect(
      splitLastSentence('Sprzęt, instalacje, oprogramowanie i serwis. W jednej firmie.'),
    ).toEqual(['Sprzęt, instalacje, oprogramowanie i serwis.', 'W jednej firmie.'])
  })

  it('leaves one sentence whole', () => {
    expect(splitLastSentence('Jedna firma od techniki.')).toEqual([
      'Jedna firma od techniki.',
      null,
    ])
  })
})
