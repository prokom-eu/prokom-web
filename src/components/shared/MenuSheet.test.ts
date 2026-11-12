import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MenuSheet, type MenuSheetProps } from './MenuSheet'

const props: MenuSheetProps = {
  lines: [],
  current: 'instalacje',
  phone: null,
  hours: [],
  holidays: [],
  now: '2026-11-09T10:00:00+01:00',
}

const html = (extra: Partial<MenuSheetProps> = {}) =>
  renderToStaticMarkup(createElement(MenuSheet, { ...props, ...extra }))

// FUND-W PR1: up to 1080 px the capsule hides its loupe, so the sheet carries „Szukaj”.
describe('MenuSheet — „Szukaj” on top of the sheet', () => {
  it('a line with a search window gets the button before its own list', () => {
    const markup = html({
      search: 'Szukaj na stronie',
      children: createElement('nav', { 'data-line-list': '' }),
    })
    expect(markup).toContain('data-menu-search')
    expect(markup).toContain('Szukaj na stronie')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup.indexOf('data-menu-search')).toBeLessThan(markup.indexOf('data-line-list'))
  })

  it('without `search` there is no button', () => {
    expect(html()).not.toContain('data-menu-search')
  })
})
