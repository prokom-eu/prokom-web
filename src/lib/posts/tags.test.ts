import { describe, expect, it } from 'vitest'

import { postsTag, postsTagsOf } from './tags'

describe('posts cache tags', () => {
  it('has one tag per tenant', () => {
    expect(postsTag(3)).toBe('tenant:3:posts')
  })

  it('marks the tenant of the post, and the old one when the post moved', () => {
    expect(postsTagsOf({ tenant: 1 }, { tenant: 1 })).toEqual(['tenant:1:posts'])
    expect(postsTagsOf({ tenant: { id: 2 } }, { tenant: 1 })).toEqual([
      'tenant:2:posts',
      'tenant:1:posts',
    ])
    expect(postsTagsOf({ tenant: null })).toEqual([])
  })
})
