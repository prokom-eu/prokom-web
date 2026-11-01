import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX } from '../seo/description'
import { fitTitle, richDescription, SOFTWARE_ROUTE_DESCRIPTIONS } from './meta'

describe('SOFTWARE_ROUTE_DESCRIPTIONS (spec. §9)', () => {
  it('fit in search results', () => {
    for (const [route, text] of Object.entries(SOFTWARE_ROUTE_DESCRIPTIONS)) {
      expect(text.length, route).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    }
  })
})

describe('fitTitle (audyt 01.11 P2)', () => {
  it('keeps the full title when it fits 65 characters with „ | PRO-KOM Software”', () => {
    expect(
      fitTitle('Strona firmowa z panelem. Treści zmieniasz sam', 'Strona firmowa z panelem'),
    ).toBe('Strona firmowa z panelem. Treści zmieniasz sam')
  })

  it('falls back to the short one when the full would be cut in results', () => {
    const full = 'Aplikacja dla ekip w terenie. Zlecenia i protokoły w telefonie'
    expect(fitTitle(full, 'Aplikacja dla ekip w terenie')).toBe('Aplikacja dla ekip w terenie')
  })
})

describe('richDescription (audyt 01.11 P2)', () => {
  it('leaves a long lead as it is', () => {
    const lead = 'x'.repeat(130)
    expect(richDescription(lead)).toBe(lead)
  })

  it('adds the price, term and place to a short lead, within the limit', () => {
    const out = richDescription('Arkusze zamieniamy w panel, dane przenosimy, duplikaty usuwamy.')
    expect(out.length).toBeGreaterThanOrEqual(120)
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    expect(out).toMatch(/^Arkusze zamieniamy w panel/)
    expect(out).toContain('Rabka-Zdrój')
  })
})
