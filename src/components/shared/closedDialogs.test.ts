import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CERTIFICATES } from '@/lib/partners/certificates'

import { BottomSheet } from '../BottomSheet'
import { CertZoom } from './CertZoom'
import { MenuSheet } from './MenuSheet'
import { SearchDialog } from './SearchDialog'

// Audit 0611 P0.4: a closed window stays in the page, so it must not add headings to the outline.
const HEADING = /<h[1-6][\s>]|role="heading"/

describe('closed windows have no headings', () => {
  it('the search window', () => {
    const markup = renderToStaticMarkup(
      createElement(SearchDialog, {
        provider: { empty: () => [], query: () => [], popular: ['kasa fiskalna'] },
        actions: [
          {
            kind: 'call',
            label: 'Zadzwoń',
            short: 'Zadzwoń',
            icon: 'phone',
            href: 'tel:1',
            words: [],
          },
        ],
        line: 'biznes',
        recentlyViewed: false,
        phone: null,
        label: 'Szukaj w ofercie',
      }),
    )
    expect(markup).toContain('Szukaj w ofercie')
    expect(markup).not.toMatch(HEADING)
  })

  it('the menu sheet (its „Linie PRO-KOM” too)', () => {
    const markup = renderToStaticMarkup(
      createElement(MenuSheet, {
        lines: [],
        current: 'biznes',
        phone: null,
        hours: [],
        holidays: [],
        now: '2026-11-09T10:00:00+01:00',
      }),
    )
    expect(markup).toContain('Linie PRO-KOM')
    expect(markup).not.toMatch(HEADING)
  })

  it('the bottom sheet, which names its title a heading once open', () => {
    const sheet = (open: boolean) =>
      renderToStaticMarkup(
        // eslint-disable-next-line react/no-children-prop -- a `.ts` test: no JSX, `children` is required
        createElement(BottomSheet, { open, onClose: () => {}, title: 'Menu', children: null }),
      )
    expect(sheet(false)).not.toMatch(HEADING)
    expect(sheet(true)).toContain('role="heading" aria-level="2"')
  })

  it('the enlarged certificate: the thumbnails only, no document until opened', () => {
    const markup = renderToStaticMarkup(
      // eslint-disable-next-line react/no-children-prop -- a `.ts` test: no JSX, `children` is required
      createElement(CertZoom, {
        items: CERTIFICATES,
        children: createElement('button', { type: 'button', 'data-cert': 'dell-2022' }, 'Dell'),
      }),
    )
    expect(markup).toContain('<dialog class="cdlg" aria-label="Certyfikat">')
    expect(markup).not.toContain('/certyfikaty/dell-2022.webp')
    expect(markup).not.toMatch(HEADING)
  })
})
