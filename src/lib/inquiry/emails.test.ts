import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { MailContext } from '../mail/context'
import { lineCopy } from '../mail/lineCopy'
import type { MailLogo } from '../mail/logo'
import type { Line } from '../tenant/lines'
import { CONSENT_CLAUSE } from './consent'
import {
  confirmationEmail,
  notificationEmail,
  type ConfirmationStatus,
  type InquiryForEmail,
} from './emails'

// Unique markers: whatever the customer typed must never reach the confirmation.
const inquiry: InquiryForEmail = {
  id: 42,
  number: 'PKB-2026-0042',
  type: 'contact',
  line: 'biznes',
  tenantName: 'PRO-KOM Biznes',
  category: 'Kasy fiskalne',
  name: 'IMIE_ZNACZNIK',
  company: 'FIRMA_ZNACZNIK',
  nip: '5260001246',
  email: 'jan@klient.test',
  phone: '+48 600 100 200',
  city: 'MIASTO_ZNACZNIK',
  message: 'WIADOMOSC_ZNACZNIK\nDwie kasy.',
  source: { url: 'https://prokombiznes.pl/kasy', utmSource: 'google', utmCampaign: 'jesien' },
  consent: { clauseVersion: CONSENT_CLAUSE.version, acceptedAt: '2026-10-17T12:00:00.000Z' },
  marketingConsent: false,
  items: [],
  topics: [],
}

const context: MailContext = {
  siteName: 'linia.test',
  origin: 'https://linia.test',
  phone: '111 222 333',
  phone2: '444 555 666',
  email: 'kontakt@linia.test',
  company: {
    name: 'Firma Panelowa',
    nip: '9999999999',
    address: 'ul. Panelowa 1, 00-001 Panelowo',
    hours: 'pn–pt 9:00–17:00',
  },
  privacyUrl: 'https://linia.test/polityka-prywatnosci',
}

const logo: MailLogo = {
  image: { src: 'cid:logo', alt: 'PRO-KOM Biznes' },
  attachments: [
    { filename: 'logo.png', content: Buffer.from('png'), cid: 'logo', contentType: 'image/png' },
  ],
}

const sentAt = new Date('2026-11-05T09:41:00Z') // 10:41 in Poland
const panelUrl = 'https://panel.test/admin/collections/inquiries/42'

const confirm = (data: Partial<InquiryForEmail> = {}, ctx: MailContext | null = context) =>
  confirmationEmail({ ...inquiry, ...data }, { context: ctx, logo, sentAt })

const notify = (data: Partial<InquiryForEmail> = {}, confirmation: ConfirmationStatus = 'sent') =>
  notificationEmail(
    { ...inquiry, ...data },
    { to: 'kontakt@linia.test', panelUrl, confirmation, context, sentAt },
  )

describe('confirmationEmail — each line (spec MAILE §4.2, §8)', () => {
  it.each<Line>(['biznes', 'instalacje', 'software'])(
    '%s: subject, preheader, lead and steps of the line, contact from the panel',
    (line) => {
      const copy = lineCopy(line)
      const mail = confirm({ line })!
      expect(mail.subject).toBe(copy.subject('PKB-2026-0042'))
      expect(mail.html).toContain(copy.preheader)
      expect(mail.html).toContain(copy.lead)
      for (const step of copy.steps) expect(mail.html).toContain(step.title)
      for (const value of ['111 222 333', 'tel:+48111222333', '9999999999', 'ul. Panelowa 1']) {
        expect(mail.html).toContain(value)
      }
      expect(mail.fromName).toBe(copy.label)
    },
  )

  it('Biznes promises 60 minutes, Instalacje 24 h, Software 1 working day', () => {
    expect(confirm({ line: 'biznes' })?.text).toContain('60 minut')
    expect(confirm({ line: 'instalacje' })?.text).toContain('24 godzin')
    expect(confirm({ line: 'software' })?.text).toContain('1 dnia roboczego')
  })

  it('Software audit has its own lead and steps', () => {
    const mail = confirm({ line: 'software', type: 'audit' })!
    expect(mail.text).toContain('Raport z bezpłatnego audytu')
    expect(mail.text).toContain('Raport w 2 dni robocze')
  })

  it('never carries what the customer typed (§6.1)', () => {
    const mail = confirm({
      type: 'list',
      items: [{ name: 'Posnet Ergo', quantity: 2, note: 'NOTATKA_ZNACZNIK' }],
    })!
    for (const part of [mail.html!, mail.text, mail.subject]) {
      for (const marker of [
        'IMIE_ZNACZNIK',
        'FIRMA_ZNACZNIK',
        'MIASTO_ZNACZNIK',
        'WIADOMOSC_ZNACZNIK',
        'NOTATKA_ZNACZNIK',
        '5260001246',
        '600 100 200',
      ]) {
        expect(part).not.toContain(marker)
      }
    }
  })

  it('shows only values from lists: the form with positions, items, services, topics', () => {
    const list = confirm({ type: 'list', items: [{ name: 'Posnet Ergo', quantity: 2 }] })!
    expect(list.text).toContain('Lista zapytania · 1 pozycja')
    expect(list.html).toContain('Posnet Ergo')
    const project = confirm({ line: 'software', type: 'list', topics: ['strona'], items: [] })!
    expect(project.text).toContain('Twój projekt')
    const plan = confirm({ line: 'instalacje', topics: ['kam'] })!
    expect(plan.text).toMatch(/Usługi: \S/)
  })

  it('is valid, light, small HTML with the logo inline', () => {
    const html = confirm()!.html!
    expect(html).toContain('<html lang="pl">')
    expect(html).toContain('src="cid:logo"')
    expect(html).toContain('name="color-scheme" content="light"')
    expect(html).not.toContain('http://')
    expect(Buffer.byteLength(html)).toBeLessThan(30_000)
    expect(confirm()?.attachments?.[0]?.cid).toBe('logo')
  })

  it('the text part has the promise, steps, phone, NIP and the policy link', () => {
    const { text } = confirm()!
    for (const value of [
      lineCopy('biznes').lead,
      lineCopy('biznes').steps[2].title,
      '111 222 333',
      'NIP 9999999999',
      'Polityka prywatności: https://linia.test/polityka-prywatnosci',
    ]) {
      expect(text).toContain(value)
    }
  })

  it('says when it was sent, in Polish time', () => {
    expect(confirm()?.html).toContain('Wysłane dziś, 10:41')
  })

  it('has no Reply-To (answers go to the line inbox) and is skipped without an e-mail', () => {
    expect(confirm()?.replyTo).toBeUndefined()
    expect(confirm({ email: undefined })).toBeNull()
  })

  it('goes without the phone box and company footer when shared data is missing', () => {
    const mail = confirm({}, null)!
    expect(mail.html).not.toContain('Sprawa pilna?')
    expect(mail.text).toContain(lineCopy('biznes').lead)
  })
})

describe('notificationEmail (ADR-003, spec MAILE §4.3)', () => {
  it('goes to the line inbox from „… · formularz” with the customer as Reply-To', () => {
    const mail = notify()
    expect(mail.to).toBe('kontakt@linia.test')
    expect(mail.replyTo).toBe('jan@klient.test')
    expect(mail.fromName).toBe('PRO-KOM Biznes · formularz')
  })

  it('has the line, number, form, positions and company in the subject', () => {
    const mail = notify({
      type: 'list',
      items: [
        { name: 'A', quantity: 1 },
        { name: 'B', quantity: 2 },
        { name: 'C', quantity: 1 },
      ],
    })
    expect(mail.subject).toBe('[Biznes] PKB-2026-0042 · Lista zapytania (3 poz.) · FIRMA_ZNACZNIK')
    expect(notify({ company: null }).subject).toBe(
      '[Biznes] PKB-2026-0042 · Kontakt · IMIE_ZNACZNIK',
    )
  })

  it('keeps the subject on one line, at most 140 characters', () => {
    const mail = notify({ company: `Firma\r\nBcc: x@evil.test ${'x'.repeat(200)}` })
    expect(mail.subject).not.toMatch(/[\r\n]/)
    expect(mail.subject.length).toBeLessThanOrEqual(140)
  })

  it('lists every field in the text and links to the record', () => {
    const { text } = notify()
    for (const value of [
      'IMIE_ZNACZNIK',
      'FIRMA_ZNACZNIK',
      '5260001246',
      'jan@klient.test',
      '+48 600 100 200',
      'Dwie kasy.',
      'https://prokombiznes.pl/kasy',
      'google',
      'jesien',
      CONSENT_CLAUSE.version,
      panelUrl,
    ]) {
      expect(text).toContain(value)
    }
  })

  it('escapes form data in HTML, also in attributes', () => {
    const mail = notify({ company: '<script>alert(1)</script>', message: 'a"b<i>' })
    expect(mail.html).not.toContain('<script>')
    expect(mail.html).toContain('&lt;script&gt;')
    expect(mail.html).toContain('a&quot;b&lt;i&gt;')
  })

  it.each<[ConfirmationStatus, string]>([
    ['sent', 'wysłane'],
    ['limited', 'pominięte — limit 3 na dobę'],
    ['none', 'brak e-maila'],
  ])('reports the confirmation status %s', (status, label) => {
    const mail = notify({}, status)
    expect(mail.text).toContain(`Potwierdzenie do klienta: ${label}`)
    expect(mail.html).toContain(`potwierdzenie do klienta: ${label}`)
  })

  it('lists items with notes and wizard answers', () => {
    const list = notify({
      type: 'list',
      items: [{ name: 'Posnet Ergo Online', quantity: 2, note: 'Czarna' }],
    })
    expect(list.text).toContain('- 2 × Posnet Ergo Online — uwaga: Czarna')
    expect(list.html).toContain('Czarna')
    const wizard = notify({ type: 'wizard', wizard: { firma: 'gastro', potrzeby: ['kasa'] } })
    expect(wizard.text).toContain('- firma: gastro')
    expect(wizard.text).toContain('- potrzeby: kasa')
  })

  it('names the Software topics and the site of an audit', () => {
    const audit = notify({
      line: 'software',
      type: 'audit',
      topics: ['laczenie', 'audyt'],
      auditUrl: 'https://firma.pl',
    })
    expect(audit.text).toContain('Tematy: Rozbudowa, Audyt')
    expect(audit.text).toContain('Adres strony: https://firma.pl')
    expect(audit.subject).toContain('Audyt')
  })

  it('has no Reply-To without the customer e-mail', () => {
    expect(notify({ email: undefined }).replyTo).toBeUndefined()
  })
})

describe('mail code has no contact literals (spec MAILE §2, §8)', () => {
  const files = [
    ...readdirSync(join(__dirname, '../mail'), { recursive: true })
      .map(String)
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map((file) => join(__dirname, '../mail', file)),
    join(__dirname, 'emails.ts'),
  ]

  it.each(files)('%s', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/\b\d{3}[ -]?\d{3}[ -]?\d{3}\b/) // phone numbers
    expect(source).not.toMatch(/\b\d{10}\b/) // NIP
    expect(source).not.toMatch(/Orkana|Rabka|34-700|Tadeusz/)
  })
})
