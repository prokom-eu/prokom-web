import nodemailer, { type Transporter } from 'nodemailer'
import type { Payload } from 'payload'

import { getEnv } from '../env'
import type { Email } from '../inquiry/emails'
import type { Line } from '../tenant/lines'

import { senderFor } from './senders'

// One SMTP connection setup per mailbox and process (like the adapter's single transport).
const transports = new Map<string, Transporter>()

function transportFor(user: string, pass: string): Transporter {
  let transport = transports.get(user)
  if (!transport) {
    const env = getEnv()
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      // Same timeouts as the default transport (payload.config.ts): the form waits for the mail.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: { user, pass },
    })
    transports.set(user, transport)
  }
  return transport
}

/**
 * Sends a site's e-mail from that site's sender (`lib/mail/senders`). With its own SMTP login
 * the mail goes through that mailbox; otherwise through Payload's default transport with only
 * the sender changed.
 */
export async function sendLineEmail(payload: Payload, line: Line, email: Email): Promise<unknown> {
  const env = getEnv()
  const sender = senderFor(line, env, process.env)
  const from = { name: env.MAIL_FROM_NAME, address: sender.address }
  if (sender.auth) {
    return transportFor(sender.auth.user, sender.auth.pass).sendMail({ ...email, from })
  }
  return payload.sendEmail({ ...email, from })
}
