import { describe, expect, it } from 'vitest'

import { chooseLinePosts } from './newsPicks'

const post = (slug: string, day: number) => ({
  slug,
  title: slug,
  publishedAt: `2026-11-${String(day).padStart(2, '0')}T10:00:00.000Z`,
  lead: null,
  category: null,
})
const tenant = (id: number, line: string) => ({ id, line, domains: [] })

describe('chooseLinePosts — one post of each line on the hub (Krystian 16.11)', () => {
  const groups = [
    { tenant: tenant(3, 'software'), posts: [post('s-new', 15), post('s-pick', 10)] },
    { tenant: tenant(1, 'biznes'), posts: [post('b-new', 15), post('b-old', 1)] },
    { tenant: tenant(2, 'instalacje'), posts: [post('i-new', 8)] },
  ]

  it('takes the chosen post of a line, otherwise its newest', () => {
    const chosen = chooseLinePosts(groups, { software: 's-pick', biznes: 'gone' })
    expect(chosen.map((group) => group.posts.map((p) => p.slug))).toEqual([
      ['b-new'],
      ['i-new'],
      ['s-pick'],
    ])
  })

  it('keeps the hub order Biznes, Instalacje, Software', () => {
    expect(chooseLinePosts(groups, {}).map((group) => group.tenant.line)).toEqual([
      'biznes',
      'instalacje',
      'software',
    ])
  })

  it('leaves out a line without posts', () => {
    const chosen = chooseLinePosts(
      [...groups.slice(0, 2), { tenant: tenant(2, 'instalacje'), posts: [] }],
      {},
    )
    expect(chosen.map((group) => group.tenant.line)).toEqual(['biznes', 'software'])
  })

  it('skips a post that could not be a card (no title or date) for the next good one', () => {
    const broken = [
      { ...post('b-untitled', 16), title: '  ' },
      { ...post('b-undated', 15), publishedAt: null },
      post('b-good', 14),
    ]
    const chosen = chooseLinePosts([{ tenant: tenant(1, 'biznes'), posts: broken }], {
      biznes: 'b-untitled',
    })
    expect(chosen.map((group) => group.posts.map((p) => p.slug))).toEqual([['b-good']])
  })
})
