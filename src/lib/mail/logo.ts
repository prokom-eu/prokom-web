import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { errorFields, log } from '../log'
import type { LogoImage } from './html/blocks'

export type MailAttachment = { filename: string; content: Buffer; cid: string; contentType: string }

export type MailLogo = { image: LogoImage; attachments: MailAttachment[] }

/** Folder of the mail logos (564×132 PNG, white background) — copied into the image with `public/`. */
const LOGO_DIR = join(process.cwd(), 'public', 'brand', 'mail')

// Read once per process: the file never changes while the server runs.
const cache = new Map<string, Buffer | null>()

function readLogo(file: string, read: (path: string) => Buffer): Buffer | null {
  if (!cache.has(file)) {
    try {
      cache.set(file, read(join(LOGO_DIR, file)))
    } catch (error) {
      // No logo is not a reason to lose the mail: it goes without the image.
      log.error({ logo: file, ...errorFields(error) }, 'Mail logo not readable')
      cache.set(file, null)
    }
  }
  return cache.get(file) ?? null
}

/**
 * The line's logo for a mail (ADR-024 pkt 3): an inline attachment `cid:logo` — works without
 * „show images” and on the password-protected staging. With `MAIL_LOGO_FROM_SITE` (production) an
 * `<img>` from the line's own site (`baseUrl` = its origin) instead: a lighter mail, no paperclip in some apps.
 */
export function mailLogo(
  file: string | null,
  alt: string,
  baseUrl?: string,
  read: (path: string) => Buffer = readFileSync,
): MailLogo | null {
  if (!file) return null
  if (baseUrl) {
    return {
      image: { src: `${baseUrl.replace(/\/+$/, '')}/brand/mail/${file}`, alt },
      attachments: [],
    }
  }
  const content = readLogo(file, read)
  if (!content) return null
  return {
    image: { src: 'cid:logo', alt },
    attachments: [{ filename: file, content, cid: 'logo', contentType: 'image/png' }],
  }
}

/** For tests: forget the files read so far. */
export function clearLogoCache(): void {
  cache.clear()
}
