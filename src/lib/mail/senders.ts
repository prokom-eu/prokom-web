import { z } from 'zod'

import { isLine, type Line } from '../tenant/lines'

/**
 * Sender of a line's e-mails (S10d): customers of each site get mail from that site's domain,
 * e.g. kontakt@prokominstalacje.pl. `MAIL_SENDERS` = `<line>=<address>,…`; a line without an
 * entry uses `MAIL_FROM_ADDRESS`. Optional `SMTP_PASS_<LINE>` = that mailbox's own SMTP login
 * (user = the address) — for a mail host that sends only as the logged-in mailbox.
 */
export type Sender = {
  address: string
  /** SMTP login of this mailbox; absent = the default SMTP login (or none, e.g. Mailpit). */
  auth?: { user: string; pass: string }
}

export type Senders = Partial<Record<Line, string>>

export const mailSenders = z
  .string()
  .default('')
  .transform((value, ctx) => {
    const senders: Senders = {}
    for (const entry of value.split(',').map((part) => part.trim())) {
      if (!entry) continue
      const [line, address, ...rest] = entry.split('=').map((part) => part.trim())
      if (
        !line ||
        !isLine(line) ||
        !address ||
        rest.length > 0 ||
        !z.email().safeParse(address).success
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'expected <line>=<e-mail>, e.g. software=kontakt@prokomsoftware.pl',
        })
        return z.NEVER
      }
      if (senders[line]) {
        ctx.addIssue({ code: 'custom', message: `line ${line} is listed twice` })
        return z.NEVER
      }
      senders[line] = address
    }
    return senders
  })

/** Who sends a line's mail, and with which SMTP login. */
export function senderFor(
  line: Line,
  env: { MAIL_SENDERS: Senders; MAIL_FROM_ADDRESS: string },
  source: Record<string, string | undefined>,
): Sender {
  const address = env.MAIL_SENDERS[line]
  if (!address) return { address: env.MAIL_FROM_ADDRESS }
  const pass = source[`SMTP_PASS_${line.toUpperCase()}`]
  return pass ? { address, auth: { user: address, pass } } : { address }
}
