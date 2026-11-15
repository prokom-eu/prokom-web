import { describe, expect, it } from 'vitest'

import { splitCommitment } from './commitment'

describe('splitCommitment', () => {
  it('splits the title from the note at the first dash', () => {
    expect(splitCommitment('Jeden numer — 889 003 889 — oferty i serwis')).toEqual({
      title: 'Jeden numer',
      note: '889 003 889 — oferty i serwis',
    })
  })

  it('keeps a text without a dash as the title', () => {
    expect(splitCommitment('Oferta na piśmie')).toEqual({ title: 'Oferta na piśmie', note: null })
  })
})
