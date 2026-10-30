import { describe, expect, it, vi } from 'vitest'

import fakty from '../../../seed/prokomsoftware/fakty.json'
import { FACT_KEY, factsMap, fillText, resolveText, type TextContext } from './facts'

const NBSP = String.fromCharCode(0xa0) // non-breaking space

const context = (overrides: Partial<TextContext> = {}): TextContext => ({
  tenantId: 7,
  facts: { 'CZAS ODPOWIEDZI': '1 dzień roboczy', 'OPIEKA OD': '149 zł / mies.' },
  prices: {
    'system-zlecen-i-grafik-ekip': 4990,
    'aplikacja-na-telefon': null,
    'szybki-audyt': 0,
  },
  term: '2 tygodnie',
  strict: true,
  ...overrides,
})

describe('resolveText', () => {
  it('puts the fact values in place of [KEY]', () => {
    expect(resolveText('Odpowiadamy w [CZAS ODPOWIEDZI].', context())).toEqual({
      text: 'Odpowiadamy w 1 dzień roboczy.',
      missing: [],
    })
  })

  it('puts the solution term in place of {termin}', () => {
    expect(resolveText('Gotowa w {termin}', context()).text).toBe('Gotowa w 2 tygodnie')
  })

  it('puts the „od” price of a solution in place of {cena:<slug>}', () => {
    expect(
      resolveText('Zaczyna się od {cena:system-zlecen-i-grafik-ekip} netto.', context()).text,
    ).toBe(`Zaczyna się od 4${NBSP}990 zł netto.`)
    expect(resolveText('Audyt od {cena:szybki-audyt}.', context()).text).toBe('Audyt od 0 zł.')
  })

  it('reports every token it cannot fill and keeps it visible', () => {
    const result = resolveText(
      '[NIEZNANY] · {cena:aplikacja-na-telefon} · {cena:nie-ma-takiego} · {termin}',
      context({ term: null }),
    )
    expect(result.missing).toEqual([
      '[NIEZNANY]',
      '{cena:aplikacja-na-telefon}',
      '{cena:nie-ma-takiego}',
      '{termin}',
    ])
    expect(result.text).toBe(
      '[NIEZNANY] · {cena:aplikacja-na-telefon} · {cena:nie-ma-takiego} · {termin}',
    )
  })

  it('treats an empty fact or term as missing', () => {
    const result = resolveText('[CZAS] {termin}', context({ facts: { CZAS: '  ' }, term: ' ' }))
    expect(result.missing).toEqual(['[CZAS]', '{termin}'])
  })

  it('leaves other templates and lowercase brackets alone', () => {
    const text = 'od {cena} zł / mies. · {kontakt} · {n} · [link] · [ok]'
    expect(resolveText(text, context())).toEqual({ text, missing: [] })
  })
})

describe('fillText', () => {
  it('returns the filled text', () => {
    expect(fillText('W [CZAS ODPOWIEDZI].', context())).toBe('W 1 dzień roboczy.')
  })

  it('on production drops a text with a missing value and logs only the tokens, once', () => {
    const warn = vi.fn()
    expect(fillText('Telefon do Ciebie w [CZAS].', context(), { warn })).toBeNull()
    expect(fillText('Znowu [CZAS].', context(), { warn })).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith({ tenant: 7, missing: ['[CZAS]'] }, expect.any(String))
    // Another site with the same gap gets its own line.
    fillText('W [CZAS].', context({ tenantId: 8 }), { warn })
    expect(warn).toHaveBeenLastCalledWith({ tenant: 8, missing: ['[CZAS]'] }, expect.any(String))
  })

  it('elsewhere shows the token, so the gap is visible on staging', () => {
    const warn = vi.fn()
    expect(fillText('W [CZAS].', context({ strict: false }), { warn })).toBe('W [CZAS].')
    expect(warn).not.toHaveBeenCalled()
  })

  it('keeps an empty text empty', () => {
    expect(fillText('', context())).toBe('')
    expect(fillText(null, context())).toBeNull()
  })
})

describe('FACT_KEY', () => {
  it('accepts the keys of the seed package and rejects other shapes', () => {
    for (const key of Object.keys(fakty.facts)) expect(FACT_KEY.test(key), key).toBe(true)
    for (const key of ['[CZAS]', 'czas', ' CZAS', '']) expect(FACT_KEY.test(key), key).toBe(false)
  })
})

describe('factsMap', () => {
  it('turns the panel list into a lookup, the last row of a key winning', () => {
    expect(
      factsMap([
        { key: 'A', value: '1' },
        { key: ' B ', value: '2' },
        { key: 'A', value: '3' },
        { key: 'C', value: null },
      ]),
    ).toEqual({ A: '3', B: '2' })
  })

  it('fills every fact of the seed package (v20)', () => {
    const facts = factsMap(Object.entries(fakty.facts).map(([key, value]) => ({ key, value })))
    for (const key of Object.keys(fakty.facts)) {
      expect(resolveText(`[${key}]`, context({ facts })).missing, key).toEqual(
        fakty.facts[key as keyof typeof fakty.facts] ? [] : [`[${key}]`],
      )
    }
  })
})
