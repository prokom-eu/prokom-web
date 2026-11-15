import { describe, expect, it } from 'vitest'

import { fillHours } from './hours'

describe('fillHours (opening hours from the panel, not from the package)', () => {
  const text = 'Oddzwaniamy w godzinach pracy ({hours}) i doprecyzowujemy listę.'

  it('puts the panel hours in place of {hours}', () => {
    expect(fillHours(text, 'pn–pt 9:00–17:00')).toBe(
      'Oddzwaniamy w godzinach pracy (pn–pt 9:00–17:00) i doprecyzowujemy listę.',
    )
  })

  it('drops the parenthesis when the panel has no hours', () => {
    expect(fillHours(text, '')).toBe('Oddzwaniamy w godzinach pracy i doprecyzowujemy listę.')
    expect(fillHours(text, null)).toBe('Oddzwaniamy w godzinach pracy i doprecyzowujemy listę.')
  })

  it('drops a bare placeholder without leaving double spaces', () => {
    expect(fillHours('Dzwoń {hours} do nas.', undefined)).toBe('Dzwoń do nas.')
  })

  it('leaves a text without the placeholder as it is', () => {
    expect(fillHours('Bez godzin.', 'pn–pt 9:00–17:00')).toBe('Bez godzin.')
  })
})
