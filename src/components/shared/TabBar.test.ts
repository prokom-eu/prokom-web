import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TabBar, type TabBarProps } from './TabBar'

const html = (extra: Partial<TabBarProps> = {}) =>
  renderToStaticMarkup(
    createElement(TabBar, {
      second: { label: 'Oferta', href: '/linie' },
      center: { label: 'Dobierz', href: '/#dobierz', icon: 'spark' },
      ...extra,
    }),
  )

// H1 (hub): Główna · Oferta · Dobierz · Załatw · Menu — the fourth slot replaces Kontakt.
describe('TabBar — fourth slot', () => {
  it('without `fourth` keeps Kontakt, as in every line today', () => {
    const markup = html()
    expect(markup).toContain('href="/kontakt"')
    expect(markup).toContain('Kontakt')
  })

  it('an empty `fourth` from the panel keeps Kontakt', () => {
    expect(html({ fourth: { label: '', href: null, icon: null } })).toContain('href="/kontakt"')
  })

  it('a label without an address keeps Kontakt', () => {
    expect(html({ fourth: { label: 'Załatw', href: null, icon: 'bolt' } })).toContain(
      'href="/kontakt"',
    )
  })

  it('a filled `fourth` replaces Kontakt', () => {
    const markup = html({ fourth: { label: 'Załatw', href: '/zalatw-online', icon: 'bolt' } })
    expect(markup).toContain('href="/zalatw-online"')
    expect(markup).toContain('Załatw')
    expect(markup).not.toContain('href="/kontakt"')
  })
})
