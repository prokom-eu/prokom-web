import { describe, expect, it } from 'vitest'

import { GUIDE_POSTS } from '../../sites/instalacje/dane/wpisy'
import { formerSlugOf, guidePostSeed, inlinePieces } from './guide'

describe('guide posts of the seed (INST-6 PR5)', () => {
  it('reads links and bold in a paragraph', () => {
    expect(
      inlinePieces('Zobacz [Monitoring](/monitoring#rodo) i **tabliczkę** przy wejściu.'),
    ).toEqual([
      'Zobacz ',
      { text: 'Monitoring', href: '/monitoring#rodo' },
      ' i ',
      { bold: 'tabliczkę' },
      ' przy wejściu.',
    ])
  })

  it('writes each section as an h2 with its paragraphs and lists', () => {
    for (const post of GUIDE_POSTS) {
      const seed = guidePostSeed(post)
      const nodes = (seed.content as unknown as { root: { children: { type: string }[] } }).root
        .children
      expect(nodes.filter((n) => n.type === 'heading')).toHaveLength(post.sections.length)
      expect(seed.seo).toEqual(post.seo)
    }
  })

  it('knows the former slug of the camera post (D1)', () => {
    expect(formerSlugOf('kamery-w-pensjonacie')).toBe('monitoring-a-rodo')
    expect(formerSlugOf('ile-kamer-do-domu')).toBeUndefined()
  })
})
