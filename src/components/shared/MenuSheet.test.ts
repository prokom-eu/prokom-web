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

// Hub H1-2 (14.11): a long closed status pushed „Zadzwoń” past the right edge at 375–390 px.
describe('MenuSheet — the call card fits a 360 px phone', () => {
  const card = html({
    phone: '889 003 889',
    hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
    // Saturday evening: „Zamknięte · otwieramy w poniedziałek o 9:00”, the longest label.
    now: '2026-11-14T20:00:00+01:00',
  })
  // Only the call card's markup, so other spans and links of the sheet cannot match.
  const start = card.indexOf('data-menu-call-card')
  const cardMarkup = start < 0 ? '' : card.slice(start, card.indexOf('</a>', start))
  const classOf = (marker: RegExp) => cardMarkup.match(marker)?.[0] ?? ''

  it('renders the long status next to the number', () => {
    expect(card).toContain('otwieramy w poniedziałek o 9:00')
  })

  it('the text column may shrink and the status may wrap', () => {
    expect(cardMarkup).not.toBe('')
    expect(classOf(/class="[^"]*flex-col[^"]*"/)).toContain('min-w-0')
    expect(classOf(/class="[^"]*oh-status[^"]*"/)).toContain('whitespace-normal!')
  })

  it('„Zadzwoń” never shrinks and keeps a 44 px target', () => {
    const call = classOf(/<a [^>]*>/)
    expect(call).toContain('href="tel:')
    expect(call).toContain('shrink-0')
    expect(call).toContain('min-h-11')
  })
})
