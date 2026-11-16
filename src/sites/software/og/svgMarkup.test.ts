import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { COVER_MOTIFS } from '@/lib/software/postCovers'

import { CoverScene } from '../components/news/PostCover'
import { svgMarkup } from './svgMarkup'

/** Same document whether elements close as `<x/>` or `<x></x>`. */
const expand = (markup: string) => markup.replace(/<(\w+)([^<>]*?)\/>/g, '<$1$2></$1>')

describe('svgMarkup', () => {
  it('serialises every cover scene as React does', () => {
    for (const motif of COVER_MOTIFS) {
      const scene = createElement(CoverScene, { motif, className: 'sw-cover', width: 520 })
      expect(svgMarkup(scene), motif).toBe(expand(renderToStaticMarkup(scene)))
    }
  })

  it('escapes attribute values', () => {
    expect(svgMarkup(createElement('text', { className: 'a"<' }, 'x & y'))).toBe(
      '<text class="a&quot;&lt;">x &amp; y</text>',
    )
  })
})
