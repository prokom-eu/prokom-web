import { createHmac } from 'node:crypto'

import { createRateLimiter } from '../inquiry/spam'

/**
 * At most 3 confirmations to one address in 24 h, all lines together (spec MAILE §6.3): anyone
 * can type a stranger's address into a form, so the confirmation must not become a mail cannon.
 * The key is an HMAC of the normalized address — the raw address is never kept in memory
 * (ADR-003). In process memory like the IP limiter: a restart clears it (one container).
 */
export function createConfirmationLimiter({
  secret,
  max = 3,
  windowMs = 24 * 60 * 60_000,
  now = Date.now,
}: {
  secret: string
  max?: number
  windowMs?: number
  now?: () => number
}) {
  const limiter = createRateLimiter({ limit: max, windowMs, now })
  return {
    /** Counts a confirmation to `email`; `false` when this one must not be sent. */
    allow(email: string): boolean {
      const key = createHmac('sha256', secret)
        .update(`confirmation:${email.trim().toLowerCase()}`)
        .digest('hex')
      return limiter.hit(key)
    },
  }
}

export type ConfirmationLimiter = ReturnType<typeof createConfirmationLimiter>
