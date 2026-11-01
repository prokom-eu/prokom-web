import { describe, expect, it } from 'vitest'

import { mailSenders, senderFor } from './senders'

const env = (senders: string) => ({
  MAIL_SENDERS: mailSenders.parse(senders),
  MAIL_FROM_ADDRESS: 'kontakt@prokombiznes.pl',
})

describe('mailSenders', () => {
  it('reads <line>=<address> pairs', () => {
    expect(
      mailSenders.parse(
        ' biznes=kontakt@prokombiznes.pl , instalacje=kontakt@prokominstalacje.pl,software=kontakt@prokomsoftware.pl',
      ),
    ).toEqual({
      biznes: 'kontakt@prokombiznes.pl',
      instalacje: 'kontakt@prokominstalacje.pl',
      software: 'kontakt@prokomsoftware.pl',
    })
    expect(mailSenders.parse(undefined)).toEqual({})
    expect(mailSenders.parse('')).toEqual({})
  })

  it('rejects unknown lines, bad addresses and repeats', () => {
    expect(mailSenders.safeParse('gaming=a@b.pl').success).toBe(false)
    expect(mailSenders.safeParse('biznes=not-an-email').success).toBe(false)
    expect(mailSenders.safeParse('biznes=a@b.pl=x').success).toBe(false)
    expect(mailSenders.safeParse('biznes=a@b.pl,biznes=c@d.pl').success).toBe(false)
  })
})

describe('senderFor', () => {
  it('uses the line sender, with its own login when SMTP_PASS_<LINE> is set', () => {
    const e = env('instalacje=kontakt@prokominstalacje.pl,software=kontakt@prokomsoftware.pl')
    expect(senderFor('instalacje', e, { SMTP_PASS_INSTALACJE: 'secret' })).toEqual({
      address: 'kontakt@prokominstalacje.pl',
      auth: { user: 'kontakt@prokominstalacje.pl', pass: 'secret' },
    })
    expect(senderFor('software', e, {})).toEqual({ address: 'kontakt@prokomsoftware.pl' })
  })

  it('falls back to MAIL_FROM_ADDRESS for a line without a sender', () => {
    expect(senderFor('prokom', env('software=kontakt@prokomsoftware.pl'), {})).toEqual({
      address: 'kontakt@prokombiznes.pl',
    })
  })

  it('never gives a line another line’s password', () => {
    const e = env('software=kontakt@prokomsoftware.pl')
    expect(senderFor('software', e, { SMTP_PASS_BIZNES: 'x' })).toEqual({
      address: 'kontakt@prokomsoftware.pl',
    })
  })
})
