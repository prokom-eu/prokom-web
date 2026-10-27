import { LINES, type Line } from '../tenant/lines'
import { RESPONSE_TIME } from './consent'
import {
  INQUIRY_TYPE_LABELS,
  isSoftwareTopic,
  PREFERRED_CONTACT_LABELS,
  SOFTWARE_TOPIC_LABELS,
  type InquiryType,
  type PreferredContact,
} from './types'

/** One position of the inquiry list, with the product name from the database. */
export type ItemForEmail = { name: string; quantity: number; note?: string | null }

/** What the e-mails need from a saved inquiry. */
export type InquiryForEmail = {
  id: number
  /** E.g. `PKB-2026-0042`; set by the collection hook right after the insert. */
  number?: string | null
  type: InquiryType
  line: Line
  tenantName: string
  category?: string | null
  name: string
  company?: string | null
  nip?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  message?: string | null
  /** The site to audit, or the current site from the wizard (Software). */
  auditUrl?: string | null
  preferredContact?: PreferredContact | null
  deadline?: string | null
  topics: string[]
  items: ItemForEmail[]
  /** Answers of the wizard (B10) as sent, already size-checked by the schema. */
  wizard?: Record<string, unknown> | null
  source: {
    url: string
    utmSource?: string | null
    utmMedium?: string | null
    utmCampaign?: string | null
  }
  consent: { clauseVersion: string; acceptedAt: string }
  marketingConsent: boolean
}

/** Software topics by their names; a phrase of „Zapytaj o X” stays as typed. */
function topicsText({ line, type, topics }: InquiryForEmail): string {
  const named = line === 'software' && type !== 'search'
  return topics
    .map((topic) => (named && isSoftwareTopic(topic) ? SOFTWARE_TOPIC_LABELS[topic] : topic))
    .join(', ')
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

function answerText(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.map(answerText).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Wizard answers one per line (`klucz: wartość`), so the office reads them without the panel. */
function wizardLines(wizard: Record<string, unknown>): string[] {
  return Object.entries(wizard).map(([key, value]) => `- ${key}: ${answerText(value)}`)
}

const reference = (inquiry: InquiryForEmail) => inquiry.number ?? `#${inquiry.id}`

function itemLines(items: ItemForEmail[], withNotes: boolean): string[] {
  return items.map((item) => {
    const note = withNotes && item.note ? ` — uwaga: ${item.note}` : ''
    return `- ${item.quantity} × ${item.name}${note}`
  })
}

/**
 * Notification for the line inbox (ADR-003): plain text, made for answering straight from
 * Thunderbird — Reply-To is the customer, every field is in the body, the record is one click away.
 */
export function notificationEmail(
  inquiry: InquiryForEmail,
  { to, panelUrl }: { to: string; panelUrl: string },
): Email {
  // The contact form is the default; any other form names itself (list, wizard, phrase).
  const type = inquiry.type === 'contact' ? null : INQUIRY_TYPE_LABELS[inquiry.type]
  const subject = [
    `Zapytanie ${reference(inquiry)}`,
    lineLabel(inquiry.line),
    type,
    inquiry.category,
  ]
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
      ['Miejscowość', inquiry.city],
      [
        'Preferowany kontakt',
        inquiry.preferredContact && PREFERRED_CONTACT_LABELS[inquiry.preferredContact],
      ],
      ['Adres strony', inquiry.auditUrl],
      ['Termin', inquiry.deadline],
      ['Tematy', topicsText(inquiry)],
    ]),
    ...(inquiry.items.length > 0
      ? ['', `Pozycje (${inquiry.items.length}):`, ...itemLines(inquiry.items, true)]
      : []),
    ...(inquiry.wizard && Object.keys(inquiry.wizard).length > 0
      ? ['', 'Odpowiedzi z kreatora:', ...wizardLines(inquiry.wizard)]
      : []),
    ...(inquiry.message ? ['', 'Wiadomość:', inquiry.message] : []),
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
 * Confirmation for the customer. It does not repeat the message or the item notes: anyone
 * can type someone else's address into a form, so the mail must not carry what a person
 * wrote to a stranger. The number and the product names are not personal.
 */
export function confirmationEmail(inquiry: InquiryForEmail): Email | null {
  if (!inquiry.email) return null
  return {
    to: inquiry.email,
    subject: oneLine(`Otrzymaliśmy Twoje zapytanie ${reference(inquiry)} — ${inquiry.tenantName}`),
    text: [
      'Dzień dobry,',
      '',
      `dziękujemy za zapytanie ${reference(inquiry)} wysłane przez stronę ` +
        `${inquiry.tenantName}. Odpowiemy ${RESPONSE_TIME}.`,
      ...(inquiry.items.length > 0
        ? ['', 'Pozycje na liście:', ...itemLines(inquiry.items, false)]
        : []),
      '',
      'Jeśli to nie Ty wysłałeś(-aś) ten formularz, zignoruj tę wiadomość.',
      '',
      'Pozdrawiamy',
      'PRO-KOM',
    ].join('\n'),
  }
}
