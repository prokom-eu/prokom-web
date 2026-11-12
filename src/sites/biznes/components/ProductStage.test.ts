import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ProductStage, STAGE_PLATE, StageFallback } from './ProductStage'

describe('ProductStage: the photo stands on a white plate (NAPRAWA-0911 §3)', () => {
  it('draws the plate from the token, under the photo, hidden from readers', () => {
    const html = renderToStaticMarkup(
      // eslint-disable-next-line react/no-children-prop -- a .ts test without JSX
      createElement(ProductStage, {
        className: 'aspect-square',
        children: createElement('img', { alt: 'Sunmi D3 PRO' }),
      }),
    )
    const plate = html.match(/<span[^>]*data-stage-plate[^>]*>/)?.[0] ?? ''
    expect(plate).toContain('bg-plate')
    expect(plate).toContain('aria-hidden="true"')
    expect(plate).toContain('-z-10')
    // The photo comes after the plate, so it is painted on top of it.
    expect(html.indexOf('data-stage-plate')).toBeLessThan(html.indexOf('<img'))
  })

  it('without a photo the plate is hidden (fallback text is theme-coloured)', () => {
    const html = renderToStaticMarkup(
      // eslint-disable-next-line react/no-children-prop -- a .ts test without JSX
      createElement(ProductStage, {
        children: createElement(StageFallback, { icon: 'store' }),
      }),
    )
    expect(html).toContain('data-stage-fallback')
    expect(html).toContain('[&amp;:has([data-stage-fallback])&gt;[data-stage-plate]]:hidden')
  })

  it('the plate class uses only tokens (no raw colours)', () => {
    expect(STAGE_PLATE).toMatch(/bg-plate/)
    expect(STAGE_PLATE).not.toMatch(/#[0-9a-f]{3,6}|rgb/i)
  })
})
