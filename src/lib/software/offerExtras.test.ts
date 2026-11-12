import { describe, expect, it } from 'vitest'

import { askHref, extrasLabel } from './offerExtras'

describe('chips of „Potrzebujesz więcej?” → the inquiry (OKNO-OFERTY-PREMIUM §2.3)', () => {
  it('without chips the link stays the project link', () => {
    expect(askHref('Strona wizytówka', [])).toBe('/kontakt?projekt=1#formularz')
    expect(extrasLabel([])).toBeNull()
  })

  it('the chosen chips start the message of the form, in their order', () => {
    const href = askHref('Strona wizytówka', ['galeria i opinie klientów', 'więcej sekcji'])
    expect(href.startsWith('/kontakt?projekt=1&fraza=')).toBe(true)
    expect(href.endsWith('#formularz')).toBe(true)
    const phrase = new URL(href, 'https://x.pl').searchParams.get('fraza')
    expect(phrase).toBe('Strona wizytówka — dodatkowo: galeria i opinie klientów, więcej sekcji')
    expect(extrasLabel(['galeria', 'opinie'])).toBe('W zapytaniu: galeria, opinie')
  })
})
