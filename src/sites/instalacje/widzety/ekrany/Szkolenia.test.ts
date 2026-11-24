import { describe, expect, it } from 'vitest'

import { SCREEN_TRAININGS } from './Szkolenia'

describe('Ekrany: Samsung trainings (23.11.2026)', () => {
  it('shows only the two 2018 screen trainings — no mobile or Dell partner status', () => {
    expect(SCREEN_TRAININGS.map((item) => item.id)).toEqual([
      'samsung-vd-2018',
      'samsung-signage-2018',
    ])
    expect(SCREEN_TRAININGS.every((item) => item.kind === 'szkolenie')).toBe(true)
  })
})
