import { beforeEach, describe, expect, it, vi } from 'vitest'

const error = vi.fn()
vi.mock('../log', async (original) => ({
  ...(await original<typeof import('../log')>()),
  log: { error, warn: vi.fn(), info: vi.fn() },
}))

const { clearLogoCache, mailLogo } = await import('./logo')

describe('mailLogo (ADR-024 pkt 3)', () => {
  beforeEach(() => {
    clearLogoCache()
    error.mockClear()
  })

  it('attaches the PNG inline as cid:logo and reads it once', () => {
    const read = vi.fn(() => Buffer.from('png'))
    const logo = mailLogo('prokom-biznes_mail.png', 'PRO-KOM Biznes', undefined, read)
    mailLogo('prokom-biznes_mail.png', 'PRO-KOM Biznes', undefined, read)
    expect(logo?.image).toEqual({ src: 'cid:logo', alt: 'PRO-KOM Biznes' })
    expect(logo?.attachments[0]).toMatchObject({ cid: 'logo', contentType: 'image/png' })
    expect(read).toHaveBeenCalledTimes(1)
  })

  it('links the image from the site when MAIL_LOGO_BASE_URL is set', () => {
    const logo = mailLogo(
      'prokom-software_mail.png',
      'PRO-KOM Software',
      'https://prokomsoftware.pl/',
    )
    expect(logo).toEqual({
      image: {
        src: 'https://prokomsoftware.pl/brand/mail/prokom-software_mail.png',
        alt: 'PRO-KOM Software',
      },
      attachments: [],
    })
  })

  it('sends the mail without a logo and logs when the file is missing', () => {
    const read = vi.fn(() => {
      throw Object.assign(new Error('missing'), { code: 'ENOENT' })
    })
    expect(mailLogo('brak.png', 'PRO-KOM', undefined, read)).toBeNull()
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ logo: 'brak.png' }),
      'Mail logo not readable',
    )
  })

  it('has the real files for the three lines, each at most 20 KB (spec MAILE §6.5)', async () => {
    const { statSync } = await import('node:fs')
    for (const line of ['biznes', 'instalacje', 'software']) {
      const size = statSync(`public/brand/mail/prokom-${line}_mail.png`).size
      expect(size).toBeLessThanOrEqual(20 * 1024)
    }
  })
})
