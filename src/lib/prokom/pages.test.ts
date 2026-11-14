import { describe, expect, it } from 'vitest'

import { HUB_OPTIONAL_PAGES, isHubLinkLive, NO_OPTIONAL_PAGES } from './pages'

describe('hub pages of v1.1 (spec §2.2: no dead links)', () => {
  it('lists the eight pages of „if time allows” and starts with all of them off', () => {
    expect(HUB_OPTIONAL_PAGES.map((page) => page.path)).toEqual([
      '/dla-domu',
      '/zalatw-online',
      '/pomoc',
      '/wspolpraca',
      '/partnerzy',
      '/gdzie-dzialamy',
      '/aktualnosci',
      '/mapa-strony',
    ])
    expect(Object.values(NO_OPTIONAL_PAGES).every((on) => on === false)).toBe(true)
  })

  it('hides a link to a page that is off, its subpages and anchors too', () => {
    expect(isHubLinkLive('/pomoc', NO_OPTIONAL_PAGES)).toBe(false)
    expect(isHubLinkLive('/pomoc/kasa-fiskalna-nie-drukuje', NO_OPTIONAL_PAGES)).toBe(false)
    expect(isHubLinkLive('/zalatw-online?linia=tech', NO_OPTIONAL_PAGES)).toBe(false)
  })

  it('keeps v1 pages, the home anchors and external links', () => {
    expect(isHubLinkLive('/dla-firm', NO_OPTIONAL_PAGES)).toBe(true)
    expect(isHubLinkLive('/#dobierz', NO_OPTIONAL_PAGES)).toBe(true)
    expect(isHubLinkLive('https://prokomserwis.pl', NO_OPTIONAL_PAGES)).toBe(true)
  })

  it('shows a page once it is switched on', () => {
    expect(isHubLinkLive('/pomoc', { ...NO_OPTIONAL_PAGES, help: true })).toBe(true)
  })
})
