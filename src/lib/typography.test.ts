import { describe, expect, it } from 'vitest'

import { bindShortWords } from './typography'

describe('bindShortWords', () => {
  it('binds one-letter words to the next one, also in a row and at the start', () => {
    expect(bindShortWords('Kasy i drukarki Posnet.')).toBe('Kasy i drukarki Posnet.')
    expect(bindShortWords('Serwis i w terenie')).toBe('Serwis i w terenie')
    expect(bindShortWords('W biurze, z serwisem')).toBe('W biurze, z serwisem')
    expect(bindShortWords('„A może u nas?”')).toBe('„A może u nas?”')
  })

  it('leaves longer words, letters inside words and a letter at the end alone', () => {
    expect(bindShortWords('Ekrany, telefony oraz Wi-Fi')).toBe('Ekrany, telefony oraz Wi-Fi')
    expect(bindShortWords('model A4 i')).toBe('model A4 i')
    expect(bindShortWords('raz a dwa')).toBe('raz a dwa')
  })
})
