import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE, RESPONSE_TIME } from './consent'
import { confirmationEmail, notificationEmail, type InquiryForEmail } from './emails'

const inquiry: InquiryForEmail = {
  id: 42,
  number: 'PKB-2026-0042',
  type: 'contact',
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
  items: [],
  topics: [],
}

const panelUrl = 'https://panel.pro-kom.eu/admin/collections/inquiries/42'

describe('notificationEmail (ADR-003)', () => {
  const mail = notificationEmail(inquiry, { to: 'biznes@pro-kom.eu', panelUrl })

  it('goes to the line inbox with the customer as Reply-To', () => {
    expect(mail.to).toBe('biznes@pro-kom.eu')
    expect(mail.replyTo).toBe('jan@example.test')
  })

  it('names the line and the category in the subject', () => {
    expect(mail.subject).toBe('Zapytanie PKB-2026-0042 — Biznes — Kasy fiskalne')
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
    expect(mail.subject).toBe('Zapytanie PKB-2026-0042 — Biznes')
  })

  it('falls back to the id when the number is missing', () => {
    const mail = notificationEmail({ ...inquiry, number: null }, { to: 'a@b.pl', panelUrl })
    expect(mail.subject).toBe('Zapytanie #42 — Biznes — Kasy fiskalne')
  })
})

describe('notificationEmail — inquiry list (B8)', () => {
  const list: InquiryForEmail = {
    ...inquiry,
    type: 'list',
    category: undefined,
    message: undefined,
    city: 'Nowy Targ',
    deadline: 'Przed sezonem',
    preferredContact: 'whatsapp',
    items: [
      { name: 'Posnet Ergo Online', quantity: 2, note: 'Czarna, na otwarcie' },
      { name: 'Szuflada Posnet SKL', quantity: 1 },
    ],
  }
  const mail = notificationEmail(list, { to: 'biznes@pro-kom.eu', panelUrl })

  it('names the type in the subject', () => {
    expect(mail.subject).toBe('Zapytanie PKB-2026-0042 — Biznes — Lista zapytania')
  })

  it('lists every item with quantity and note, and the list fields', () => {
    expect(mail.text).toContain('Pozycje (2):')
    expect(mail.text).toContain('- 2 × Posnet Ergo Online — uwaga: Czarna, na otwarcie')
    expect(mail.text).toContain('- 1 × Szuflada Posnet SKL')
    for (const value of ['Nowy Targ', 'Przed sezonem', 'WhatsApp']) {
      expect(mail.text).toContain(value)
    }
    expect(mail.text).not.toContain('Wiadomość:')
  })

  it('lists the wizard answers one per line', () => {
    const wizard = notificationEmail(
      {
        ...inquiry,
        type: 'wizard',
        message: undefined,
        wizard: { firma: 'gastro', stanowiska: 2, potrzeby: ['kasa', 'terminal'], ksef: true },
      },
      { to: 'a@b.pl', panelUrl },
    )
    expect(wizard.subject).toContain('Kreator')
    expect(wizard.text).toContain('Odpowiedzi z kreatora:')
    expect(wizard.text).toContain('- firma: gastro')
    expect(wizard.text).toContain('- stanowiska: 2')
    expect(wizard.text).toContain('- potrzeby: kasa, terminal')
    expect(wizard.text).toContain('- ksef: true')
  })

  it('shows the phrase of „Zapytaj o X”', () => {
    const search = notificationEmail(
      { ...inquiry, type: 'search', topics: ['drukarka etykiet'] },
      { to: 'a@b.pl', panelUrl },
    )
    expect(search.text).toContain('Tematy: drukarka etykiet')
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

  it('gives the number and the item names, but not the notes', () => {
    const mail = confirmationEmail({
      ...inquiry,
      type: 'list',
      items: [{ name: 'Posnet Ergo Online', quantity: 2, note: 'Tajna uwaga' }],
    })
    expect(mail?.subject).toContain('PKB-2026-0042')
    expect(mail?.text).toContain('PKB-2026-0042')
    expect(mail?.text).toContain('2 × Posnet Ergo Online')
    expect(mail?.text).not.toContain('Tajna uwaga')
  })

  it('is skipped without the customer e-mail', () => {
    expect(confirmationEmail({ ...inquiry, email: undefined })).toBeNull()
  })
})

describe('notificationEmail — Software (SW2b)', () => {
  it('names the Software topics and gives the site of an audit (SW2b)', () => {
    const audit = notificationEmail(
      {
        ...inquiry,
        line: 'software',
        type: 'audit',
        topics: ['laczenie', 'audyt'],
        auditUrl: 'https://firma.pl',
      },
      { to: 's@p.pl', panelUrl: 'http://panel.localhost/admin' },
    )
    expect(audit.text).toContain('Tematy: Rozbudowa, Audyt')
    expect(audit.text).toContain('Adres strony: https://firma.pl')
    expect(audit.subject).toContain('Audyt')
  })
})
