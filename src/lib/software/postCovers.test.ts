import { describe, expect, it } from 'vitest'

import wpisy from '../../../seed/prokomsoftware/wpisy.json'
import { guidePosts } from '../../seed/software/posts'
import { COVER_MOTIFS, coverMotif, POST_COVER_MOTIFS } from './postCovers'

describe('post covers (Software)', () => {
  const posts = guidePosts()

  it('gives every guide post and the package post its own motif', () => {
    const slugs = [...posts.map((post) => post.slug), ...wpisy.items.map((item) => item.slug)]
    const motifs = slugs.map((slug) => POST_COVER_MOTIFS[slug])
    for (const [index, motif] of motifs.entries()) expect(motif, slugs[index]).toBeDefined()
    expect(new Set(motifs).size).toBe(slugs.length)
  })

  it('maps only motifs that have a scene, and only slugs that exist', () => {
    const known = new Set([...posts.map((post) => post.slug), ...wpisy.items.map((i) => i.slug)])
    for (const [slug, motif] of Object.entries(POST_COVER_MOTIFS)) {
      expect(known.has(slug), slug).toBe(true)
      expect(COVER_MOTIFS, slug).toContain(motif)
    }
  })

  it('falls back to a motif of the category for a post added later, never to nothing', () => {
    expect(coverMotif('ile-kosztuje-strona-internetowa-dla-firmy', 'poradnik')).toBe('price')
    for (const category of ['poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo'])
      expect(COVER_MOTIFS).toContain(coverMotif('nowy-wpis', category))
    expect(COVER_MOTIFS).toContain(coverMotif('nowy-wpis', 'nieznana'))
  })
})
