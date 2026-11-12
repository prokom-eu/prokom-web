import { describe, expect, it } from 'vitest'

import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
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
    expect(richDescription(lead, { priced: true })).toBe(lead)
  })

  it('adds the price, term and place to a short lead, within the limit', () => {
    const out = richDescription('Arkusze zamieniamy w panel, dane przenosimy, duplikaty usuwamy.', {
      priced: true,
    })
    expect(out.length).toBeGreaterThanOrEqual(120)
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    expect(out).toMatch(/^Arkusze zamieniamy w panel/)
    expect(out).toContain('Cena „od”')
    expect(out).toContain('Rabka-Zdrój')
  })

  it('never promises a price where there is none („Zapytaj o wycenę”)', () => {
    const out = richDescription('Zlecenia, zdjęcia i podpis klienta w telefonie ekipy.', {
      priced: false,
    })
    expect(out).not.toContain('Cena')
    expect(out).toContain('po krótkiej rozmowie')
  })

  it('adds only whole sentences that fit — never cuts the addition with „…”', () => {
    const lead = `${'Słowo '.repeat(16).trim()}.` // ~100 characters
    for (const priced of [true, false]) {
      const out = richDescription(lead, { priced })
      expect(out.endsWith('…')).toBe(false)
      expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
      expect(out.startsWith(lead)).toBe(true)
    }
  })
})

describe('richDescription on the package solutions (review of SWV8 B)', () => {
  it('no description of the 29 is cut, none without a price promises one', () => {
    for (const item of rozwiazania.items) {
      const priced = item.priceFrom !== null
      const out = richDescription(item.lead, { priced })
      expect(out.length, item.slug).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
      if (item.lead.length <= META_DESCRIPTION_MAX) expect(out.endsWith('…'), item.slug).toBe(false)
      if (!priced) expect(out, item.slug).not.toContain('Cena')
    }
  })
})
