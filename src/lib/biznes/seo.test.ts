import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX } from '../seo/description'
import { biznesDescription, META_DESCRIPTION_MIN } from './seo'

describe('biznesDescription (audit 01.11: 50–160 characters)', () => {
  it('completes a short panel text with who and where', () => {
    expect(biznesDescription('Drukarki etykiet.')).toBe(
      'Drukarki etykiet. Dobór, wdrożenie i serwis — PRO-KOM Biznes, Rabka-Zdrój.',
    )
    expect(biznesDescription('Zasilacze awaryjne').length).toBeGreaterThanOrEqual(
      META_DESCRIPTION_MIN,
    )
  })

  it('cuts a long text and keeps a fitting one as it is', () => {
    expect(biznesDescription('Słowo '.repeat(60)).length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    const fitting =
      'Kasy fiskalne online z doborem, fiskalizacją i serwisem w Rabce-Zdroju — wycena na piśmie.'
    expect(biznesDescription(fitting)).toBe(fitting)
  })
})
