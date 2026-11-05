import { isServiceKey, serviceLabel } from '../instalacje/plan'
import {
  badge,
  button,
  callout,
  card,
  footer,
  header,
  heading,
  layout,
  paragraph,
  spacer,
  steps,
  strong,
} from '../mail/html/blocks'
import { esc, escLines } from '../mail/html/esc'
import type { MailContext } from '../mail/context'
import { lineCopy, senderName } from '../mail/lineCopy'
import type { MailAttachment, MailLogo } from '../mail/logo'
import { plural } from '../plural'
import { toTelHref } from '../site/link'
import { LINES, type Line } from '../tenant/lines'
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

export type Email = {
  to: string
  replyTo?: string
  subject: string
  text: string
  html?: string
  attachments?: MailAttachment[]
  /** Display name of the sender (the line's label, spec MAILE §6.4); the address is the line's. */
  fromName?: string
}

/** Whether the customer got a confirmation — the status line of our notification (§4.3). */
export type ConfirmationStatus = 'sent' | 'limited' | 'none'

const CONFIRMATION_STATUS: Record<ConfirmationStatus, string> = {
  sent: 'wysłane',
  limited: 'pominięte — limit 3 na dobę',
  none: 'brak e-maila',
}

/** Software topics and Instalacje services by their names; a phrase of „Zapytaj o X” as typed. */
function topicNames({ line, type, topics }: InquiryForEmail): string[] {
  const named = line === 'software' && type !== 'search'
  return topics.map((topic) => {
    if (named && isSoftwareTopic(topic)) return SOFTWARE_TOPIC_LABELS[topic]
    if (line === 'instalacje' && isServiceKey(topic)) return serviceLabel(topic)
    return topic
  })
}

// Header values come partly from the form: one line, no CR/LF.
function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function lineLabel(line: Line): string {
  return line === 'prokom' ? 'PRO-KOM' : (LINES.find((item) => item.value === line)?.label ?? line)
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

/** „Lista zapytania” — on Software the list is „Twój projekt” (ADR-014 §3). */
function formName({ line, type }: InquiryForEmail): string {
  return line === 'software' && type === 'list' ? 'Twój projekt' : INQUIRY_TYPE_LABELS[type]
}

const positions = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`

/** „Lista zapytania · 3 pozycje” */
function formWithCount(inquiry: InquiryForEmail): string {
  const count = inquiry.items.length
  return count > 0 ? `${formName(inquiry)} · ${positions(count)}` : formName(inquiry)
}

/** `HH:MM` in Poland. */
const warsawTime = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

const warsawDateTime = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

type MailOptions = {
  /** `getSharedData` of the tenant, or `null` (then no phone box and no company footer). */
  context: MailContext | null
  logo: MailLogo | null
  sentAt: Date
}

/**
 * The card of the confirmation (spec MAILE §4.1 pkt 4): ONLY values chosen from lists — the form,
 * product names, Instalacje services, Software topics. Never the name, company, NIP, phone,
 * town, message, site address, item notes or free wizard answers: anyone can type a stranger's
 * address, so the mail must not carry what a person wrote to someone else.
 */
function confirmationCard(inquiry: InquiryForEmail): [string, string][] {
  const named = topicNames(inquiry)
  const picked: [string, string][] = [['Formularz', formWithCount(inquiry)]]
  if (inquiry.line === 'instalacje' && named.length > 0) picked.push(['Usługi', named.join(', ')])
  if (inquiry.line === 'software' && inquiry.type !== 'search' && named.length > 0) {
    picked.push(['Tematy', named.join(', ')])
  }
  return picked
}

/** Confirmation for the customer (spec MAILE §4.1–4.2, §5): HTML in the line's brand + full text. */
export function confirmationEmail(
  inquiry: InquiryForEmail,
  { context, logo, sentAt }: MailOptions,
): Email | null {
  if (!inquiry.email) return null
  const copy = lineCopy(inquiry.line, inquiry.type)
  const { theme } = copy
  const number = reference(inquiry)
  const picked = confirmationCard(inquiry)
  const items = inquiry.items.map(({ quantity, name }) => ({ quantity, name }))
  const sent = `Wysłane dziś, ${warsawTime(sentAt)}`
  const domain = context?.siteName ?? inquiry.tenantName
  const tel = context?.phone ? toTelHref(context.phone) : null
  const hours = context?.company.hours
  const company = context?.company
  const companyLine = company
    ? [company.name, company.address, `NIP ${company.nip}`].filter(Boolean).join(' · ')
    : null
  const footerLines = [
    ...(companyLine ? [companyLine] : []),
    `Wiadomość wysłana automatycznie po wysłaniu formularza na ${domain}. Nie zapisujemy Cię na żaden newsletter.`,
    'Jeśli to nie Ty wysłałeś(-aś) formularz, zignoruj tę wiadomość.',
  ]
  const links = [
    ...(context?.privacyUrl ? [{ href: context.privacyUrl, label: 'Polityka prywatności' }] : []),
    ...(context?.origin ? [{ href: context.origin, label: `Strona ${domain}` }] : []),
  ]

  const html = layout({
    title: copy.subject(number),
    preheader: copy.preheader,
    theme,
    rows: [
      header({ logo: logo?.image ?? null, name: copy.label, label: 'Zgłoszenie', number }),
      badge(sent),
      heading(copy.h1, copy.lead),
      card({ title: 'Twoje zgłoszenie', rows: picked, items, theme }),
      steps({ title: 'Co dalej', list: copy.steps, theme }),
      tel && context?.phone
        ? callout({
            title: 'Sprawa pilna?',
            text: hours ? `Zadzwoń — ${hours}` : 'Zadzwoń do nas',
            action: button({ href: tel, label: context.phone, theme }),
            theme,
          })
        : '',
      context?.email
        ? paragraph(
            `Chcesz coś dopisać? Odpowiedz na tę wiadomość — trafi prosto do nas, na ${strong(context.email)}.`,
          )
        : '',
      footer({
        logo: logo?.image ?? null,
        name: copy.label,
        domain,
        lines: footerLines,
        links,
        theme,
      }),
    ],
  })

  // The text part is the same mail, in the same order — not a shortened version (§5).
  const text = [
    'Dzień dobry,',
    '',
    `${copy.h1} Numer zgłoszenia: ${number}.`,
    copy.lead,
    '',
    'Twoje zgłoszenie:',
    ...picked.map(([label, value]) => `- ${label}: ${value}`),
    ...itemLines(inquiry.items, false),
    '',
    'Co dalej:',
    ...copy.steps.map((step, i) => `${i + 1}. ${step.title}${step.text ? ` — ${step.text}` : ''}`),
    ...(context?.phone
      ? ['', `Sprawa pilna? Zadzwoń: ${context.phone}${hours ? ` (${hours})` : ''}`]
      : []),
    ...(context?.email
      ? ['', `Chcesz coś dopisać? Odpowiedz na tę wiadomość — trafi na ${context.email}.`]
      : []),
    '',
    'Pozdrawiamy',
    copy.label,
    '',
    '--',
    ...footerLines,
    ...links.map((link) => `${link.label}: ${link.href}`),
  ].join('\n')

  return {
    to: inquiry.email,
    subject: oneLine(copy.subject(number)),
    text,
    html,
    ...(logo?.attachments.length ? { attachments: logo.attachments } : {}),
    fromName: senderName(inquiry.line, 'confirmation'),
  }
}

/**
 * Notification for the line inbox (ADR-003, spec MAILE §4.3): everything the customer typed,
 * Reply-To = the customer, the record one click away. Text as before plus the confirmation status.
 */
export function notificationEmail(
  inquiry: InquiryForEmail,
  {
    to,
    panelUrl,
    confirmation,
    context,
    sentAt,
  }: {
    to: string
    panelUrl: string
    confirmation: ConfirmationStatus
    context: MailContext | null
    sentAt: Date
  },
): Email {
  const { theme } = lineCopy(inquiry.line)
  const number = reference(inquiry)
  const label = lineLabel(inquiry.line)
  const count = inquiry.items.length
  const who = inquiry.company || inquiry.name
  const subject = oneLine(
    `[${label}] ${number} · ${formName(inquiry)}${count > 0 ? ` (${count} poz.)` : ''} · ${who}`,
  ).slice(0, 140)
  const topics = topicNames(inquiry).join(', ')
  const preferred = inquiry.preferredContact && PREFERRED_CONTACT_LABELS[inquiry.preferredContact]
  const meta = [
    `Wysłane ${warsawDateTime(sentAt)}`,
    `zgoda RODO ✓ wersja ${inquiry.consent.clauseVersion}`,
    `zgoda marketingowa ${inquiry.marketingConsent ? 'tak' : 'nie'}`,
    `potwierdzenie do klienta: ${CONFIRMATION_STATUS[confirmation]}`,
    ...[inquiry.source.utmSource, inquiry.source.utmMedium, inquiry.source.utmCampaign]
      .filter(Boolean)
      .map((utm) => `utm ${utm}`),
  ]

  const text = [
    `Nowe zapytanie ze strony ${context?.siteName ?? inquiry.tenantName}.`,
    '',
    rows([
      ['Numer', number],
      ['Formularz', formWithCount(inquiry)],
      ['Kategoria', inquiry.category],
      ['Imię i nazwisko', inquiry.name],
      ['Firma', inquiry.company],
      ['NIP', inquiry.nip],
      ['E-mail', inquiry.email],
      ['Telefon', inquiry.phone],
      ['Miejscowość', inquiry.city],
      ['Preferowany kontakt', preferred],
      ['Adres strony', inquiry.auditUrl],
      ['Termin', inquiry.deadline],
      ['Tematy', topics],
    ]),
    ...(count > 0 ? ['', `Pozycje (${count}):`, ...itemLines(inquiry.items, true)] : []),
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
      ['Potwierdzenie do klienta', CONFIRMATION_STATUS[confirmation]],
    ]),
    '',
    `Zapytanie w panelu: ${panelUrl}`,
  ].join('\n')

  const tel = inquiry.phone ? toTelHref(inquiry.phone) : null
  const field = (name: string, value: string | null | undefined, href?: string | null) =>
    value
      ? `<td width="50%" valign="top" style="padding:0 18px 10px 0;font-family:Arial, Helvetica, sans-serif;font-size:13.5px;color:#121613"><span style="color:#4F5650">${esc(name)}</span><br><b>${
          href
            ? `<a href="${esc(href)}" style="color:${theme.accentText}">${esc(value)}</a>`
            : esc(value)
        }</b></td>`
      : ''
  const fields = [
    field('E-mail', inquiry.email, inquiry.email ? `mailto:${inquiry.email}` : null),
    field('Telefon', inquiry.phone, tel),
    field('Preferuje', [preferred, inquiry.deadline].filter(Boolean).join(', ') || null),
    field('Miejscowość', inquiry.city),
    field('NIP', inquiry.nip),
    field('Adres strony', inquiry.auditUrl),
    field('Tematy', topics || null),
    field('Źródło', inquiry.source.url),
  ].filter(Boolean)
  const grid = fields
    .reduce<string[][]>((pairs, cell, i) => {
      if (i % 2 === 0) pairs.push([cell])
      else pairs[pairs.length - 1]!.push(cell)
      return pairs
    }, [])
    .map((pair) => `<tr>${pair.join('')}</tr>`)
    .join('')
  const message = inquiry.message
    ? `<tr><td style="padding:18px 30px 0"><div style="padding:16px 18px;border-radius:12px;background:${theme.surface};font-family:Arial, Helvetica, sans-serif;font-size:13.5px;line-height:1.55;color:#121613"><div style="font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:${theme.accentText};margin-bottom:8px">Wiadomość klienta</div>${escLines(inquiry.message)}</div></td></tr>`
    : ''
  const list = [
    ...inquiry.items.map(
      (item) =>
        `${esc(item.quantity)} &times; ${esc(item.name)}${item.note ? ` — <span style="color:#4F5650">${esc(item.note)}</span>` : ''}`,
    ),
    ...(inquiry.wizard ? wizardLines(inquiry.wizard).map((line) => esc(line.slice(2))) : []),
  ]
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-top:1px solid ${theme.border};font-family:Arial, Helvetica, sans-serif;font-size:13.5px;color:#121613">${line}</td></tr>`,
    )
    .join('')

  const html = layout({
    title: subject,
    theme,
    rows: [
      `<tr><td style="padding:20px 30px;border-bottom:1px solid ${theme.border}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
        `<td style="font-family:Arial, Helvetica, sans-serif;font-size:12.5px;color:#4F5650"><span style="display:inline-block;padding:5px 10px;border-radius:8px;background:${theme.surface};color:${theme.accentText};font-weight:bold">NOWE · ${esc(label)}</span> ${esc(formWithCount(inquiry))}</td>` +
        `<td align="right" style="font-family:Arial, Helvetica, sans-serif;font-size:12.5px;font-weight:bold;color:#121613">${esc(number)}</td></tr></table></td></tr>`,
      heading([inquiry.company, inquiry.name].filter(Boolean).join(' · '), null, {
        size: 26,
        padding: '6px 30px 0',
      }),
      `<tr><td style="padding:14px 30px 0">${tel && inquiry.phone ? `${button({ href: tel, label: `Zadzwoń ${inquiry.phone}`, theme })} ` : ''}${button({ href: panelUrl, label: 'Otwórz w panelu →', theme, outline: true })}</td></tr>`,
      grid
        ? `<tr><td style="padding:18px 30px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${grid}</table></td></tr>`
        : '',
      message,
      list
        ? `<tr><td style="padding:14px 30px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${list}</table></td></tr>`
        : '',
      spacer(18) +
        `<tr><td style="padding:14px 30px;background:${theme.surface};font-family:Arial, Helvetica, sans-serif;font-size:11.5px;color:#4F5650">${meta.map(esc).join(' · ')}</td></tr>`,
    ],
  })

  return {
    to,
    ...(inquiry.email ? { replyTo: inquiry.email } : {}),
    subject,
    text,
    html,
    fromName: senderName(inquiry.line, 'notification'),
  }
}
