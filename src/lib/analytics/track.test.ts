import { afterEach, describe, expect, it, vi } from 'vitest'

import { isSafeEventData, labelKey } from './events'
import { track, trackFormErrors } from './track'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubUmami() {
  const umamiTrack = vi.fn()
  vi.stubGlobal('window', { umami: { track: umamiTrack } })
  return umamiTrack
}

describe('track (ADR-020)', () => {
  it('sends the event and its data to Umami', () => {
    const umamiTrack = stubUmami()
    track('oferta_okno', { slug: 'strona-firmowa-z-panelem' })
    track('menu_otworz')
    expect(umamiTrack.mock.calls).toEqual([
      ['oferta_okno', { slug: 'strona-firmowa-z-panelem' }],
      ['menu_otworz', undefined],
    ])
  })

  it('does nothing without the script, on the server, or when Umami throws', () => {
    expect(() => track('menu_otworz')).not.toThrow()
    vi.stubGlobal('window', {})
    expect(() => track('menu_otworz')).not.toThrow()
    vi.stubGlobal('window', {
      umami: {
        track: () => {
          throw new Error('blocked')
        },
      },
    })
    expect(() => track('kreator_krok', { krok: 2 })).not.toThrow()
  })

  it('drops an event whose data could carry personal data', () => {
    const umamiTrack = stubUmami()
    // Typed callers cannot do this; the guard is for values that arrive at run time.
    track('formularz_blad', { formularz: 'kontakt', pole: 'jan@example.com' } as never)
    track('pasek_klik', { pozycja: '889003889' } as never)
    expect(umamiTrack).not.toHaveBeenCalled()
  })
})

describe('trackFormErrors', () => {
  it('sends one event per rejected field, without the messages or form failures', () => {
    const umamiTrack = stubUmami()
    trackFormErrors('audyt', {
      url: 'Wpisz adres strony.',
      name: undefined,
      consent: 'Zaznacz zgodę.',
      form: 'Coś poszło nie tak.',
    })
    expect(umamiTrack.mock.calls).toEqual([
      ['formularz_blad', { formularz: 'audyt', pole: 'url' }],
      ['formularz_blad', { formularz: 'audyt', pole: 'consent' }],
    ])
  })
})

describe('isSafeEventData', () => {
  it('accepts short identifiers and small whole numbers', () => {
    expect(isSafeEventData(undefined)).toBe(true)
    expect(isSafeEventData({ slug: 'z-excela-do-systemu', krok: 3 })).toBe(true)
    expect(isSafeEventData({ pole: 'email' })).toBe(true)
    expect(isSafeEventData({ id: 'opiekaSys' })).toBe(true)
  })

  it('rejects free text, addresses, phone numbers and large or fractional numbers', () => {
    expect(isSafeEventData({ pole: 'Jan Kowalski' })).toBe(false)
    expect(isSafeEventData({ pole: 'jan@example.com' })).toBe(false)
    expect(isSafeEventData({ pole: '+48 889 003 889' })).toBe(false)
    expect(isSafeEventData({ pole: '889003889' })).toBe(false)
    expect(isSafeEventData({ liczba: 889003889 })).toBe(false)
    expect(isSafeEventData({ liczba: 1.5 })).toBe(false)
    expect(isSafeEventData({ slug: 'a'.repeat(65) })).toBe(false)
    expect(isSafeEventData({ 'jan@example.com': 'email' })).toBe(false)
  })
})

describe('labelKey', () => {
  it('turns a panel label into an identifier', () => {
    expect(labelKey('Strona firmowa')).toBe('strona-firmowa')
    expect(labelKey('Aplikacja · ekipy w terenie')).toBe('aplikacja-ekipy-w-terenie')
    expect(labelKey('Łódź, żółć!')).toBe('lodz-zolc')
    expect(labelKey('24 h')).toBe('h')
    expect(labelKey('—')).toBe('bez-nazwy')
    expect(labelKey(`${'a'.repeat(63)} b`)).toBe('a'.repeat(63))
    expect(isSafeEventData({ podglad: labelKey('Sklep internetowy') })).toBe(true)
  })
})
