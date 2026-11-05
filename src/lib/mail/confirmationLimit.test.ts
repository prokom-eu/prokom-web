import { describe, expect, it } from 'vitest'

import { createConfirmationLimiter } from './confirmationLimit'

const DAY = 24 * 60 * 60_000

describe('createConfirmationLimiter (spec MAILE §6.3)', () => {
  it('lets 3 confirmations through, skips the 4th, and works again after 24 h', () => {
    let now = 0
    const limiter = createConfirmationLimiter({ secret: 's'.repeat(32), now: () => now })
    expect([1, 2, 3, 4].map(() => limiter.allow('jan@klient.test'))).toEqual([
      true,
      true,
      true,
      false,
    ])
    now = DAY + 1
    expect(limiter.allow('jan@klient.test')).toBe(true)
  })

  it('is not fooled by letter case or spaces', () => {
    const limiter = createConfirmationLimiter({ secret: 's'.repeat(32), now: () => 0 })
    for (const email of ['jan@klient.test', 'JAN@klient.test', ' Jan@Klient.Test ']) {
      expect(limiter.allow(email)).toBe(true)
    }
    expect(limiter.allow('jan@KLIENT.test')).toBe(false)
  })

  it('counts each address separately', () => {
    const limiter = createConfirmationLimiter({ secret: 's'.repeat(32), max: 1, now: () => 0 })
    expect(limiter.allow('a@klient.test')).toBe(true)
    expect(limiter.allow('b@klient.test')).toBe(true)
  })
})
