import { describe, expect, it } from 'vitest'

import { createPreviewToken, PREVIEW_BUCKET_MS, PREVIEW_TTL_MS, verifyPreviewToken } from './token'

const secret = 'x'.repeat(32)
const now = new Date('2026-10-17T10:00:00Z')
const target = { pageId: 7, tenantId: 1 }

describe('preview token', () => {
  const token = createPreviewToken({ ...target, secret, now })

  it('verifies for the same page and tenant', () => {
    expect(verifyPreviewToken(token, { ...target, secret, now })).toBe(true)
  })

  it('is bound to the page and the tenant', () => {
    expect(verifyPreviewToken(token, { ...target, pageId: 8, secret, now })).toBe(false)
    expect(verifyPreviewToken(token, { ...target, tenantId: 2, secret, now })).toBe(false)
  })

  it('stays the same within one time bucket, so the panel does not reload the iframe', () => {
    const soon = new Date(now.getTime() + PREVIEW_BUCKET_MS - 1)
    expect(createPreviewToken({ ...target, secret, now: soon })).toBe(token)
    const next = new Date(now.getTime() + PREVIEW_BUCKET_MS)
    expect(createPreviewToken({ ...target, secret, now: next })).not.toBe(token)
  })

  it('is valid for at least the TTL, then expires', () => {
    const atTtl = new Date(now.getTime() + PREVIEW_TTL_MS)
    expect(verifyPreviewToken(token, { ...target, secret, now: atTtl })).toBe(true)
    const later = new Date(now.getTime() + PREVIEW_TTL_MS + PREVIEW_BUCKET_MS + 1)
    expect(verifyPreviewToken(token, { ...target, secret, now: later })).toBe(false)
  })

  it('rejects another secret, a tampered expiry and garbage', () => {
    expect(verifyPreviewToken(token, { ...target, secret: 'y'.repeat(32), now })).toBe(false)
    const [, signature] = token.split('.')
    const forged = `${now.getTime() + 10 * PREVIEW_TTL_MS}.${signature}`
    expect(verifyPreviewToken(forged, { ...target, secret, now })).toBe(false)
    for (const bad of ['', 'abc', '1.2.3', `${now.getTime() + 1000}.`, undefined]) {
      expect(verifyPreviewToken(bad, { ...target, secret, now })).toBe(false)
    }
  })
})
