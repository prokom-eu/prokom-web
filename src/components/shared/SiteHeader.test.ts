import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CAPSULE } from './capsule'
import { SiteHeader, type SiteHeaderProps } from './SiteHeader'

const props: SiteHeaderProps = {
  line: 'instalacje',
  homeLabel: 'PRO-KOM Instalacje — strona główna',
  nav: [
    { key: 'uslugi', label: 'Usługi' },
    { key: 'realizacje', label: 'Realizacje', href: '/realizacje', current: true },
    { key: 'kontakt', label: 'Kontakt', href: '/kontakt' },
  ],
  megaFor: (key) =>
    createElement('button', { type: 'button', className: CAPSULE.link, 'data-mega': key }, key),
  actions: createElement('button', { type: 'button', className: CAPSULE.iconButton }, 'motyw'),
  cta: { label: 'Zaplanuj instalację', shortLabel: 'Zaplanuj', href: '/zaplanuj' },
  menuButton: createElement('button', { type: 'button' }, 'Menu'),
}

const render = (overrides: Partial<SiteHeaderProps> = {}) =>
  renderToStaticMarkup(createElement(SiteHeader, { ...props, ...overrides }))

describe('SiteHeader — capsule (NAGLOWEK-KAPSULA §2, §6)', () => {
  it('is a <header> with a labelled main menu and a logo link home', () => {
    const html = render()
    expect(html).toContain('<header class="cap">')
    expect(html).toContain('<nav aria-label="Menu główne"')
    expect(html).toMatch(
      /<a class="cap__logo" aria-label="PRO-KOM Instalacje — strona główna" href="\/"/,
    )
  })

  it('keeps the Tab order: mark → menu → right-hand buttons → action → menu button', () => {
    const html = render()
    const at = (needle: string) => html.indexOf(needle)
    expect(at('cap__logo')).toBeLessThan(at('Menu główne'))
    expect(at('Menu główne')).toBeLessThan(at('motyw'))
    expect(at('motyw')).toBeLessThan(at('cap-cta'))
    expect(at('cap-cta')).toBeLessThan(at('>Menu<'))
  })

  it('leaves out a mega entry the line gives no menu for (no empty list item)', () => {
    const html = render({ megaFor: undefined })
    expect(html).not.toMatch(/<li[^>]*><\/li>/)
    expect(html.match(/<li[\s>]/g)).toHaveLength(2)
  })

  it('renders links from the data and the line mega menu in its slot', () => {
    const html = render()
    expect(html).toContain('data-mega="uslugi"')
    expect(html).toContain('href="/kontakt"')
  })

  it('marks only the current page with aria-current', () => {
    const html = render()
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(
      /aria-current="page" href="\/realizacje"|href="\/realizacje"[^>]*aria-current="page"/,
    )
  })

  it('has the long and the short action label (CSS picks one per width)', () => {
    const html = render()
    expect(html).toContain('<span class="cap-cta__long">Zaplanuj instalację</span>')
    expect(html).toContain('<span class="cap-cta__short">Zaplanuj</span>')
  })

  it('the scroll-spy pill only with home page stops; every entry carries its key', () => {
    expect(render()).not.toContain('cap-pill')
    expect(render({ spyStops: [] })).not.toContain('cap-pill')
    const html = render({ spyStops: ['start', 'realizacje', 'kontakt'] })
    expect(html).toContain('<span class="cap-pill" aria-hidden="true"></span>')
    // The pill comes before the list: it slides under the links, not over them.
    expect(html.indexOf('cap-pill')).toBeLessThan(html.indexOf('<ul>'))
    expect(html).toContain('data-cap-key="realizacje"')
  })

  it('a fixed preview state sets data-scrolled and drops the sentinel', () => {
    expect(render({ state: 'scrolled' })).toMatch(/class="cap-wrap" data-scrolled=""/)
    expect(render({ state: 'scrolled' })).not.toContain('cap-sentinel')
    expect(render()).toContain('cap-sentinel')
    expect(render()).not.toContain('data-scrolled')
  })
})
