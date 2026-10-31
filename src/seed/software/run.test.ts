import { describe, expect, it } from 'vitest'

import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from './pages'
import { isPreSw11bPages } from './run'

describe('isPreSw11bPages', () => {
  it('recognises the thanks and 404 texts of the seed before SW11b', () => {
    expect(isPreSw11bPages({ more: { cards: [{ text: 'jak przygotować się do KSeF.' }] } })).toBe(
      true,
    )
    expect(isPreSw11bPages({ wizard: { text: 'w 60 sekund: 5 krótkich kroków' } })).toBe(true)
  })

  it('leaves the current seed and texts edited in the panel alone', () => {
    expect(isPreSw11bPages(SOFTWARE_THANKS)).toBe(false)
    expect(isPreSw11bPages(SOFTWARE_NOT_FOUND)).toBe(false)
    expect(isPreSw11bPages({ ...SOFTWARE_THANKS, titleAccent: undefined })).toBe(false)
  })
})
