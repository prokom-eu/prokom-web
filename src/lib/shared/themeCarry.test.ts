import { describe, expect, it } from 'vitest'

import { cleanThemeParam, isOurHost, withThemeParam } from './themeCarry'

const HERE = 'https://prokombiznes.pl/oferta'

describe('isOurHost (spec §3.2)', () => {
  it.each([
    'prokombiznes.pl',
    'www.prokominstalacje.pl',
    'staging.prokomsoftware.pl',
    'pro-kom.eu',
    'prokomserwis.pl',
    'prokomgaming.pl',
    'software.localhost',
  ])('%s is ours', (host) => expect(isOurHost(host)).toBe(true))

  it.each([
    'google.com',
    'prokombiznes.pl.evil.com',
    'evilprokombiznes.pl',
    'alsen.pl',
    'localhost',
  ])('%s is not', (host) => expect(isOurHost(host)).toBe(false))
})

describe('withThemeParam', () => {
  it('adds motyw to a link to another line', () => {
    expect(withThemeParam('https://prokomsoftware.pl/', 'dark', HERE)).toBe(
      'https://prokomsoftware.pl/?motyw=ciemny',
    )
    expect(withThemeParam('https://pro-kom.eu/', 'auto', HERE)).toBe(
      'https://pro-kom.eu/?motyw=auto',
    )
  })

  it('keeps the query and the fragment', () => {
    expect(withThemeParam('https://www.prokomserwis.pl/a?b=1#c', 'light', HERE)).toBe(
      'https://www.prokomserwis.pl/a?b=1&motyw=jasny#c',
    )
  })

  it('replaces a motyw already in the link', () => {
    expect(withThemeParam('https://pro-kom.eu/?motyw=jasny', 'dark', HERE)).toBe(
      'https://pro-kom.eu/?motyw=ciemny',
    )
  })

  it('works for local hosts with a port (e2e)', () => {
    expect(
      withThemeParam('http://software.localhost:3000/', 'dark', 'http://biznes.localhost:3000/'),
    ).toBe('http://software.localhost:3000/?motyw=ciemny')
  })

  it.each([
    ['/kontakt', 'same site (own storage)'],
    ['https://prokombiznes.pl/kontakt', 'same host'],
    ['https://google.com/', 'not ours'],
    ['mailto:kontakt@prokombiznes.pl', 'mailto'],
    ['tel:+48889003889', 'tel'],
    ['javascript:void(0)', 'script'],
    ['not a url ::', 'broken'],
  ])('leaves %s alone (%s)', (href) => {
    expect(withThemeParam(href, 'dark', HERE)).toBeNull()
  })
})

describe('cleanThemeParam (spec §3.3)', () => {
  it('removes motyw and keeps the rest of the address', () => {
    expect(cleanThemeParam('https://prokomsoftware.pl/?motyw=ciemny')).toBe('/')
    expect(cleanThemeParam('https://prokomsoftware.pl/a?b=1&motyw=jasny&c=2#d')).toBe(
      '/a?b=1&c=2#d',
    )
  })

  it('removes an unknown value too', () => {
    expect(cleanThemeParam('https://pro-kom.eu/?motyw=zielony')).toBe('/')
  })

  it('is null when there is nothing to clean', () => {
    expect(cleanThemeParam('https://pro-kom.eu/?b=1')).toBeNull()
  })
})
