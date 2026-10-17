import { LINES, type Line } from '../tenant/lines'
import { RESPONSE_TIME } from './consent'

/** What the e-mails need from a saved inquiry. */
export type InquiryForEmail = {
  id: number
  line: Line
  tenantName: string
  category?: string | null
  name: string
  company?: string | null
  nip?: string | null
  email?: string | null
  phone?: string | null
  message: string
  source: {
    url: string
    utmSource?: string | null
    utmMedium?: string | null
    utmCampaign?: string | null
  }
  consent: { clauseVersion: string; acceptedAt: string }
  marketingConsent: boolean
}

export type Email = { to: string; replyTo?: string; subject: string; text: string }

// Header values come partly from the form: one line, no CR/LF.
function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function lineLabel(line: Line): string {
  return LINES.find((item) => item.value === line)?.label ?? line
}

function rows(pairs: [string, string | null | undefined][]): string {
  return pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1]))
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')
}

/**
 * Notification for the line inbox (ADR-003): plain text, made for answering straight from
 * Thunderbird — Reply-To is the customer, every field is in the body, the record is one click away.
 */
export function notificationEmail(
  inquiry: InquiryForEmail,
  { to, panelUrl }: { to: string; panelUrl: string },
): Email {
  const subject = ['Zapytanie #' + inquiry.id, lineLabel(inquiry.line), inquiry.category]
    .filter(Boolean)
    .map((part) => oneLine(part as string))
    .join(' — ')

  const text = [
    `Nowe zapytanie ze strony ${inquiry.tenantName}.`,
    '',
    rows([
      ['Kategoria', inquiry.category],
      ['Imię i nazwisko', inquiry.name],
      ['Firma', inquiry.company],
      ['NIP', inquiry.nip],
      ['E-mail', inquiry.email],
      ['Telefon', inquiry.phone],
    ]),
    '',
    'Wiadomość:',
    inquiry.message,
    '',
    rows([
      ['Strona', inquiry.source.url],
      ['utm_source', inquiry.source.utmSource],
      ['utm_medium', inquiry.source.utmMedium],
      ['utm_campaign', inquiry.source.utmCampaign],
      ['Zgoda RODO', `wersja ${inquiry.consent.clauseVersion}, ${inquiry.consent.acceptedAt}`],
      ['Zgoda marketingowa', inquiry.marketingConsent ? 'tak' : 'nie'],
    ]),
    '',
    `Zapytanie w panelu: ${panelUrl}`,
  ].join('\n')

  return {
    to,
    ...(inquiry.email ? { replyTo: inquiry.email } : {}),
    subject,
    text,
  }
}

/**
 * Confirmation for the customer. It does not repeat the message: anyone can type someone
 * else's address into a form, so the mail must not carry content to a stranger.
 */
export function confirmationEmail(inquiry: InquiryForEmail): Email | null {
  if (!inquiry.email) return null
  return {
    to: inquiry.email,
    subject: oneLine(`Otrzymaliśmy Twoje zapytanie — ${inquiry.tenantName}`),
    text: [
      'Dzień dobry,',
      '',
      `dziękujemy za zapytanie wysłane przez stronę ${inquiry.tenantName}. ` +
        `Odpowiemy ${RESPONSE_TIME}.`,
      '',
      'Jeśli to nie Ty wysłałeś(-aś) ten formularz, zignoruj tę wiadomość.',
      '',
      'Pozdrawiamy',
      'PRO-KOM',
    ].join('\n'),
  }
}
