import { describe, expect, it } from 'vitest'

import { publishedUntil, withPublishedAt } from './publishedAt'

const NOW = new Date('2026-10-25T09:00:00.000Z')

describe('withPublishedAt', () => {
  it('sets the publication date to now when a post is published without one', () => {
    expect(withPublishedAt({ _status: 'published', title: 'A' }, NOW)).toEqual({
      _status: 'published',
      title: 'A',
      publishedAt: '2026-10-25T09:00:00.000Z',
    })
  })

  it('keeps a date set in the panel', () => {
    const data = { _status: 'published', publishedAt: '2026-10-14T12:00:00.000Z' }
    expect(withPublishedAt(data, NOW).publishedAt).toBe('2026-10-14T12:00:00.000Z')
  })

  it('never leaves a published post without a date when the date was cleared', () => {
    expect(withPublishedAt({ _status: 'published', publishedAt: null }, NOW).publishedAt).toBe(
      '2026-10-25T09:00:00.000Z',
    )
  })

  it('leaves drafts alone', () => {
    expect(withPublishedAt({ _status: 'draft' }, NOW)).toEqual({ _status: 'draft' })
    expect(withPublishedAt({}, NOW)).toEqual({})
  })
})

describe('publishedUntil', () => {
  it('is the end of the Polish date, so a post dated today (12:00 UTC) shows in the morning', () => {
    const until = publishedUntil(new Date('2026-10-25T05:00:00.000Z'))
    expect(until).toBe('2026-10-25T23:59:59.999Z')
    expect('2026-10-25T12:00:00.000Z' <= until).toBe(true)
    expect('2026-10-26T12:00:00.000Z' <= until).toBe(false)
  })

  it('follows the Polish date after midnight in Poland', () => {
    // 23:30 UTC on 25.10 (winter time) is 00:30 on 26.10 in Poland.
    expect(publishedUntil(new Date('2026-10-25T23:30:00.000Z'))).toBe('2026-10-26T23:59:59.999Z')
  })
})
