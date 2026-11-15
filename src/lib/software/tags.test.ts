import { describe, expect, it } from 'vitest'

import { solutionsTag, solutionsTagsToRevalidate } from './tags'

describe('solutionsTagsToRevalidate', () => {
  it('refreshes the tenant of the Software settings, both tenants on a move', () => {
    expect(solutionsTagsToRevalidate({ tenant: 7 }, { tenant: 7 })).toEqual(['tenant:7:solutions'])
    expect(solutionsTagsToRevalidate({ tenant: 7 }, { tenant: { id: 8 } })).toEqual([
      solutionsTag(7),
      solutionsTag(8),
    ])
  })

  it('ignores a solution draft that was never public, refreshes a published or unpublished one', () => {
    expect(solutionsTagsToRevalidate({ tenant: 7, _status: 'draft' }, undefined)).toEqual([])
    expect(
      solutionsTagsToRevalidate(
        { tenant: 7, _status: 'published' },
        { tenant: 7, _status: 'draft' },
      ),
    ).toEqual([solutionsTag(7)])
    expect(
      solutionsTagsToRevalidate(
        { tenant: 7, _status: 'draft' },
        { tenant: 7, _status: 'published' },
      ),
    ).toEqual([solutionsTag(7)])
  })
})
