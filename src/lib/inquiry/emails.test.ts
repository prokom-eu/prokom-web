import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE, RESPONSE_TIME } from './consent'
import { confirmationEmail, notificationEmail, type InquiryForEmail } from './emails'

const inquiry: InquiryForEmail = {
  id: 42,
  line: 'biznes',
  tenantName: 'PRO-KOM Biznes',
  category: 'Kasy fiskalne',
  name: 'Jan Kowalski',
  company: 'Sklep Jan',
  nip: '5260001246',
  email: 'jan@example.test',
  phone: '+48 600 100 200',
  message: 'Proszę o ofertę.\nDwie kasy.',
  source: { url: 'https://prokombiznes.pl/kasy', utmSource: 'google', utmCampaign: 'jesien' },
  consent: { clauseVersion: CONSENT_CLAUSE.version, acceptedAt: '2026-10-17T12:00:00.000Z' },
  marketingConsent: false,
}

const panelUrl = 'https://panel.pro-kom.eu/admin/collections/inquiries/42'

describe('notificationEmail (ADR-003)', () => {
  const mail = notificationEmail(inquiry, { to: 'biznes@pro-kom.eu', panelUrl })

  it('goes to the line inbox with the customer as Reply-To', () => {
    expect(mail.to).toBe('biznes@pro-kom.eu')
    expect(mail.replyTo).toBe('jan@example.test')
  })

  it('names the line and the category in the subject', () => {
    expect(mail.subject).toBe('Zapytanie #42 — Biznes — Kasy fiskalne')
  })

  it('lists every field and links to the record in the panel', () => {
    for (const value of [
      'Jan Kowalski',
      'Sklep Jan',
      '5260001246',
      'jan@example.test',
      '+48 600 100 200',
      'Dwie kasy.',
      'https://prokombiznes.pl/kasy',
      'google',
      'jesien',
      CONSENT_CLAUSE.version,
      panelUrl,
    ]) {
      expect(mail.text).toContain(value)
    }
  })

  it('has no Reply-To without the customer e-mail', () => {
    const mail = notificationEmail({ ...inquiry, email: undefined }, { to: 'a@b.pl', panelUrl })
    expect(mail.replyTo).toBeUndefined()
  })

  it('keeps the subject on one line (no header injection)', () => {
    const mail = notificationEmail(
      { ...inquiry, category: 'Kasy\r\nBcc: x@evil.test' },
      { to: 'a@b.pl', panelUrl },
    )
    expect(mail.subject).not.toMatch(/[\r\n]/)
  })

  it('works without a category', () => {
    const mail = notificationEmail({ ...inquiry, category: undefined }, { to: 'a@b.pl', panelUrl })
    expect(mail.subject).toBe('Zapytanie #42 — Biznes')
  })
})

describe('confirmationEmail', () => {
  it('thanks the customer and promises the response time', () => {
    const mail = confirmationEmail(inquiry)
    expect(mail?.to).toBe('jan@example.test')
    expect(mail?.subject).toContain('PRO-KOM Biznes')
    expect(mail?.text).toContain(RESPONSE_TIME)
  })

  it('does not echo the message (the address may not be the sender’s)', () => {
    expect(confirmationEmail(inquiry)?.text).not.toContain('Dwie kasy')
  })

  it('is skipped without the customer e-mail', () => {
    expect(confirmationEmail({ ...inquiry, email: undefined })).toBeNull()
  })
})
