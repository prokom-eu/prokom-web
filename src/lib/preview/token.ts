import { createHmac, timingSafeEqual } from 'node:crypto'

/** Minimum lifetime of a live-preview link. */
export const PREVIEW_TTL_MS = 60 * 60 * 1000

/**
 * The expiry is rounded up to this step, so the token — and the preview URL — stays the same
 * for up to 10 minutes. The panel recomputes the URL after every (auto)save and reloads the
 * iframe whenever it changes; with a stable URL it only refreshes it (`RefreshRouteOnSave`).
 */
export const PREVIEW_BUCKET_MS = 10 * 60 * 1000

type Target = { pageId: number; tenantId: number; secret: string }

function sign({ pageId, tenantId, secret }: Target, expiresAt: number): string {
  return createHmac('sha256', secret)
    .update(`page-preview:${pageId}:${tenantId}:${expiresAt}`)
    .digest('base64url')
}

/**
 * Signed, short-lived token for previewing one page of one tenant. It replaces Next.js draft
 * mode cookies: the panel and the sites live on different domains, so a cookie inside the
 * preview iframe would be a third-party cookie, which browsers block.
 */
export function createPreviewToken(target: Target & { now?: Date }): string {
  const now = (target.now ?? new Date()).getTime()
  const expiresAt = (Math.floor(now / PREVIEW_BUCKET_MS) + 1) * PREVIEW_BUCKET_MS + PREVIEW_TTL_MS
  return `${expiresAt}.${sign(target, expiresAt)}`
}

export function verifyPreviewToken(
  token: string | null | undefined,
  target: Target & { now?: Date },
): boolean {
  const match = /^(\d{1,15})\.([\w-]{43})$/.exec(token ?? '')
  if (!match) return false
  const expiresAt = Number(match[1])
  if (expiresAt < (target.now ?? new Date()).getTime()) return false
  const expected = Buffer.from(sign(target, expiresAt))
  const given = Buffer.from(match[2] ?? '')
  return expected.length === given.length && timingSafeEqual(expected, given)
}
