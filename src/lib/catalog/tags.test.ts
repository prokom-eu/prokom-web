import { describe, expect, it } from 'vitest'

import { catalogTag, catalogTagsToRevalidate } from './tags'

describe('catalogTagsToRevalidate', () => {
  it('refreshes the tenant of a category, group or industry', () => {
    expect(catalogTagsToRevalidate({ tenant: 3 }, { tenant: 3 })).toEqual([catalogTag(3)])
    expect(catalogTagsToRevalidate({ tenant: { id: 3 } }, undefined)).toEqual(['tenant:3:catalog'])
  })

  it('refreshes both tenants when a document moves', () => {
    expect(catalogTagsToRevalidate({ tenant: 3 }, { tenant: 4 })).toEqual([
      catalogTag(3),
      catalogTag(4),
    ])
  })

  it('refreshes every site a shared brand is (or was) shown on', () => {
    expect(catalogTagsToRevalidate({ tenants: [1, { id: 2 }] }, { tenants: [2, 5] })).toEqual([
      catalogTag(1),
      catalogTag(2),
      catalogTag(5),
    ])
  })

  it('ignores a product draft that was never public', () => {
    expect(catalogTagsToRevalidate({ tenant: 3, _status: 'draft' }, undefined)).toEqual([])
    expect(
      catalogTagsToRevalidate({ tenant: 3, _status: 'draft' }, { tenant: 3, _status: 'draft' }),
    ).toEqual([])
  })

  it('refreshes on publishing and on unpublishing a product', () => {
    expect(
      catalogTagsToRevalidate({ tenant: 3, _status: 'published' }, { tenant: 3, _status: 'draft' }),
    ).toEqual([catalogTag(3)])
    expect(
      catalogTagsToRevalidate({ tenant: 3, _status: 'draft' }, { tenant: 3, _status: 'published' }),
    ).toEqual([catalogTag(3)])
  })

  it('has nothing to refresh without a tenant', () => {
    expect(catalogTagsToRevalidate({}, undefined)).toEqual([])
  })
})
