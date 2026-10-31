import { describe, expect, it } from 'vitest'

import { analyticsRequestHeaders, umamiScriptAttributes, umamiWebsiteId } from './config'

const ID = '7f3c2a1e-0b4d-4c6e-9a8f-1d2e3f4a5b6c'

describe('umamiWebsiteId (ADR-020)', () => {
  it('returns the id of a counted line', () => {
    expect(
      umamiWebsiteId(
        { UMAMI_URL: 'http://umami:3000', UMAMI_WEBSITES: { software: ID } },
        'software',
      ),
    ).toBe(ID)
  })

  it('returns null for a line without an id or without the container address', () => {
    expect(
      umamiWebsiteId(
        { UMAMI_URL: 'http://umami:3000', UMAMI_WEBSITES: { software: ID } },
        'biznes',
      ),
    ).toBeNull()
    expect(
      umamiWebsiteId({ UMAMI_URL: undefined, UMAMI_WEBSITES: { software: ID } }, 'software'),
    ).toBeNull()
  })
})

describe('umamiScriptAttributes', () => {
  it('loads and sends on the site domain and leaves the query out of page views', () => {
    expect(umamiScriptAttributes(ID)).toEqual({
      src: '/_s/script.js',
      'data-website-id': ID,
      'data-host-url': '/_s',
      'data-do-not-track': 'true',
      'data-exclude-search': 'true',
    })
  })
})

describe('analyticsRequestHeaders', () => {
  it('passes the device and address headers, never cookies or credentials', () => {
    const headers = analyticsRequestHeaders(
      new Headers({
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'pl-PL',
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.7',
        Cookie: 'payload-token=secret',
        Authorization: 'Basic c3RhZ2luZzpoYXNsbw==',
        'X-Request-Id': 'abc',
      }),
    )
    expect(Object.fromEntries(headers)).toEqual({
      'user-agent': 'Mozilla/5.0',
      'accept-language': 'pl-PL',
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.7',
    })
  })
})
