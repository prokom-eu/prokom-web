import { describe, expect, it } from 'vitest'

import { postGroups, splitFeatured } from './groups'

const post = (slug: string, categoryValue: string | null) => ({ slug, categoryValue })

describe('postGroups', () => {
  it('groups posts by category in the panel order, newest first inside a group', () => {
    const posts = [
      post('a', 'it-w-firmie'),
      post('b', 'ksef'),
      post('c', 'kasy'),
      post('d', 'ksef'),
    ]
    expect(postGroups(posts)).toEqual([
      { value: 'ksef', label: 'KSeF', posts: [posts[1], posts[3]] },
      { value: 'kasy', label: 'Kasy', posts: [posts[2]] },
      { value: 'it-w-firmie', label: 'IT w firmie', posts: [posts[0]] },
    ])
  })

  it('drops posts without a known category and empty categories', () => {
    expect(postGroups([post('a', null), post('b', 'nie-ma')])).toEqual([])
  })
})

describe('splitFeatured', () => {
  it('takes the newest posts as featured and leaves the rest in order', () => {
    const posts = ['a', 'b', 'c', 'd', 'e'].map((slug) => post(slug, 'ksef'))
    const { featured, rest } = splitFeatured(posts, 3)
    expect(featured.map((p) => p.slug)).toEqual(['a', 'b', 'c'])
    expect(rest.map((p) => p.slug)).toEqual(['d', 'e'])
  })

  it('features nothing when there are too few posts to fill the row', () => {
    const posts = ['a', 'b'].map((slug) => post(slug, 'ksef'))
    expect(splitFeatured(posts, 3)).toEqual({ featured: [], rest: posts })
  })
})
