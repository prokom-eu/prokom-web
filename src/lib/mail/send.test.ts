import type { Payload } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendMail = vi.fn(async () => ({ messageId: 'x' }))
const createTransport = vi.fn((_options: unknown) => ({ sendMail }))
vi.mock('nodemailer', () => ({ default: { createTransport } }))

const env = {
  SMTP_HOST: 'srv.example.test',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  MAIL_FROM_NAME: 'PRO-KOM',
  MAIL_FROM_ADDRESS: 'kontakt@prokombiznes.pl',
  MAIL_SENDERS: {
    software: 'kontakt@prokomsoftware.pl',
    instalacje: 'kontakt@prokominstalacje.pl',
  },
  SMTP_PASS_INSTALACJE: 'secret',
}
vi.mock('../env', () => ({ getEnv: () => env }))

const { sendLineEmail } = await import('./send')

const email = { to: 'jan@example.test', subject: 'Zapytanie', text: 'Treść' }
const payload = () => ({ sendEmail: vi.fn(async () => undefined) })

describe('sendLineEmail (S10d)', () => {
  beforeEach(() => {
    sendMail.mockClear()
    createTransport.mockClear()
  })

  it("sends through the line's own mailbox when it has a password", async () => {
    const p = payload()
    await sendLineEmail(p as unknown as Payload, 'instalacje', email)
    expect(p.sendEmail).not.toHaveBeenCalled()
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'srv.example.test',
        port: 465,
        secure: true,
        auth: { user: 'kontakt@prokominstalacje.pl', pass: 'secret' },
      }),
    )
    expect(sendMail).toHaveBeenCalledWith({
      ...email,
      from: { name: 'PRO-KOM', address: 'kontakt@prokominstalacje.pl' },
    })
  })

  it('reuses the transport of a mailbox', async () => {
    const p = payload()
    await sendLineEmail(p as unknown as Payload, 'instalacje', email)
    await sendLineEmail(p as unknown as Payload, 'instalacje', email)
    expect(createTransport).toHaveBeenCalledTimes(0) // created in the first test, cached
    expect(sendMail).toHaveBeenCalledTimes(2)
  })

  it("uses Payload's transport with the line sender when the line has no password", async () => {
    const p = payload()
    await sendLineEmail(p as unknown as Payload, 'software', email)
    expect(createTransport).not.toHaveBeenCalled()
    expect(p.sendEmail).toHaveBeenCalledWith({
      ...email,
      from: { name: 'PRO-KOM', address: 'kontakt@prokomsoftware.pl' },
    })
  })

  it('falls back to MAIL_FROM_ADDRESS for a line without a sender', async () => {
    const p = payload()
    await sendLineEmail(p as unknown as Payload, 'biznes', email)
    expect(p.sendEmail).toHaveBeenCalledWith({
      ...email,
      from: { name: 'PRO-KOM', address: 'kontakt@prokombiznes.pl' },
    })
  })

  it('names the line as the sender and passes HTML and the logo on both paths', async () => {
    const attachments = [
      { filename: 'l.png', content: Buffer.from('x'), cid: 'logo', contentType: 'image/png' },
    ]
    const rich = { ...email, html: '<p>x</p>', attachments, fromName: 'PRO-KOM Software' }
    const p = payload()
    await sendLineEmail(p as unknown as Payload, 'software', rich)
    expect(p.sendEmail).toHaveBeenCalledWith({
      ...email,
      html: '<p>x</p>',
      attachments,
      from: { name: 'PRO-KOM Software', address: 'kontakt@prokomsoftware.pl' },
    })
    await sendLineEmail(p as unknown as Payload, 'instalacje', {
      ...rich,
      fromName: 'PRO-KOM Instalacje · formularz',
    })
    expect(sendMail).toHaveBeenLastCalledWith({
      ...email,
      html: '<p>x</p>',
      attachments,
      from: { name: 'PRO-KOM Instalacje · formularz', address: 'kontakt@prokominstalacje.pl' },
    })
  })
})
