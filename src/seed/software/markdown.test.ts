import { describe, expect, it } from 'vitest'

import { plainText } from '../../lib/posts/content'
import { linksOf, parseMarkdownPost } from './markdown'

type Node = { type: string; tag?: string; listType?: string; children?: Node[]; format?: number }

const FILE = `---
slug: test
title: Tytuł: z dwukropkiem
source: A | https://a.example | 2026-11-15
source: B | https://b.example | 2026-11-15
---

Pierwszy akapit
w dwóch liniach z **pogrubieniem** i [linkiem](/rozwiazania/strona-wizytowka).

## Nagłówek
### Pytanie?
- jeden
- dwa
1. pierwszy
2. drugi
> Cytat
Akapit po cytacie.
`

describe('parseMarkdownPost', () => {
  const post = parseMarkdownPost(FILE)
  const nodes = post.nodes as Node[]

  it('reads the header, repeated sources and values with a colon', () => {
    expect(post.meta).toEqual({ slug: 'test', title: 'Tytuł: z dwukropkiem' })
    expect(post.sources).toHaveLength(2)
  })

  it('builds the blocks the post editor allows', () => {
    expect(nodes.map((n) => [n.type, n.listType ?? n.tag ?? ''])).toEqual([
      ['paragraph', ''],
      ['heading', 'h2'],
      ['heading', 'h3'],
      ['list', 'bullet'],
      ['list', 'number'],
      ['quote', ''],
      ['paragraph', ''],
    ])
    expect(plainText(nodes[0])).toBe('Pierwszy akapit w dwóch liniach z pogrubieniem i linkiem.')
    expect(nodes[0]?.children?.[1]).toMatchObject({ text: 'pogrubieniem', format: 1 })
    expect(nodes[3]?.children?.map(plainText)).toEqual(['jeden', 'dwa'])
  })

  it('lists the link addresses', () => {
    expect(linksOf(post.nodes)).toEqual(['/rozwiazania/strona-wizytowka'])
  })

  it('refuses a file without a header or with a field twice', () => {
    expect(() => parseMarkdownPost('Tekst', 'a.md')).toThrow('a.md')
    expect(() => parseMarkdownPost('---\nslug: a\nslug: b\n---\n')).toThrow('dwa razy')
  })
})
