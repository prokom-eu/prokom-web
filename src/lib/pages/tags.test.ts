import { describe, expect, it } from 'vitest'

import { pageTag, pagesTag, tagsToRevalidate } from './tags'

describe('cache tags', () => {
  it('scope every tag to one tenant', () => {
    expect(pagesTag(1)).toBe('tenant:1:pages')
    expect(pageTag(1, 'kontakt')).toBe('tenant:1:page:kontakt')
  })
})

describe('tagsToRevalidate', () => {
  const published = { tenant: 1, slug: 'kontakt', _status: 'published' as const }

  it('revalidates the page and the tenant list on publish', () => {
    expect(tagsToRevalidate(published, undefined)).toEqual([
      'tenant:1:pages',
      'tenant:1:page:kontakt',
    ])
  })

  it('also revalidates the old slug when it changes', () => {
    expect(tagsToRevalidate(published, { ...published, slug: 'o-nas' })).toEqual([
      'tenant:1:pages',
      'tenant:1:page:kontakt',
      'tenant:1:page:o-nas',
    ])
  })

  it('revalidates on unpublish', () => {
    expect(tagsToRevalidate({ ...published, _status: 'draft' }, published)).toEqual([
      'tenant:1:pages',
      'tenant:1:page:kontakt',
    ])
  })

  it('skips drafts that were never public', () => {
    const draft = { ...published, _status: 'draft' as const }
    expect(tagsToRevalidate(draft, draft)).toEqual([])
    expect(tagsToRevalidate(draft, undefined)).toEqual([])
  })

  it('revalidates both tenants when a page moves to another tenant', () => {
    expect(tagsToRevalidate(published, { ...published, tenant: { id: 2 } })).toEqual([
      'tenant:1:pages',
      'tenant:1:page:kontakt',
      'tenant:2:pages',
      'tenant:2:page:kontakt',
    ])
  })
})
