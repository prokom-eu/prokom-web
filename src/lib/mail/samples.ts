import { CONSENT_CLAUSE } from '../inquiry/consent'
import {
  confirmationEmail,
  notificationEmail,
  type Email,
  type InquiryForEmail,
} from '../inquiry/emails'
import type { MailContext } from './context'
import type { MailLogo } from './logo'

/*
 * Sample inquiries for checking the line e-mails (spec MAILE §7): the `/_maile` preview and
 * `pnpm mail:samples`. The customer is made up (a `.test` address, a sample number) — the only
 * file of `lib/mail` allowed such values; the line's own contact always comes from the panel.
 */

export const SAMPLE_LINES = ['biznes', 'instalacje', 'software'] as const
export type SampleLine = (typeof SAMPLE_LINES)[number]

const base = {
  id: 87,
  name: 'Anna Przykładowa',
  email: 'anna@przyklad.test',
  phone: '600 000 000',
  city: 'Mszana Dolna',
  source: { url: '/kontakt', utmSource: null },
  consent: { clauseVersion: CONSENT_CLAUSE.version, acceptedAt: '2026-11-05T09:41:00.000Z' },
  marketingConsent: false,
  topics: [],
  items: [],
} satisfies Partial<InquiryForEmail>

const INQUIRIES: Record<SampleLine, InquiryForEmail> = {
  // Biznes: the inquiry list with 3 positions.
  biznes: {
    ...base,
    number: 'PKB-2026-0142',
    type: 'list',
    line: 'biznes',
    tenantName: 'PRO-KOM Biznes',
    company: 'Hotel pod Luboniem',
    message: 'Potrzebujemy kasy i terminala na recepcję. Start sezonu 15 grudnia.',
    preferredContact: 'phone',
    items: [
      { name: 'Posnet Ergo · wersja Online', quantity: 2, note: 'Na recepcję i do restauracji' },
      { name: 'Terminal płatniczy', quantity: 1 },
      { name: 'Fiskalizacja i szkolenie', quantity: 1 },
    ],
    source: { url: '/zapytanie', utmSource: null },
  },
  // Instalacje: the „Zaplanuj” planner with 2 services.
  instalacje: {
    ...base,
    number: 'PKI-2026-0087',
    type: 'wizard',
    line: 'instalacje',
    tenantName: 'PRO-KOM Instalacje',
    company: 'Pensjonat Pod Lasem',
    topics: ['kam', 'wifi'],
    wizard: { Obiekt: 'Pensjonat', Wielkość: '12 pokoi', Etap: 'Budynek istnieje' },
    message: 'Kamery na parkingu i Wi-Fi w pokojach.',
    source: { url: '/zaplanuj', utmSource: null },
  },
  // Software: „Twój projekt” with 2 positions.
  software: {
    ...base,
    number: 'PKS-2026-0031',
    type: 'list',
    line: 'software',
    tenantName: 'PRO-KOM Software',
    company: 'Ekipy Remontowe Nowak',
    topics: ['system'],
    items: [
      { name: 'Grafik ekip w aplikacji', quantity: 1 },
      { name: 'Strona firmowa z panelem', quantity: 1 },
    ],
    message: 'Grafik ekip mamy w Excelu, chcemy aplikację na telefon.',
    source: { url: '/rozwiazania', utmSource: null },
  },
}

/** The confirmation and the notification of one line, on sample data. */
export function sampleMails(
  line: SampleLine,
  {
    context,
    logo,
    to,
    panelUrl,
    sentAt = new Date(),
  }: {
    context: MailContext | null
    logo: MailLogo | null
    /** Recipient of both mails (`mail:samples`); the preview shows the line inbox. */
    to?: string
    panelUrl: string
    sentAt?: Date
  },
): { confirmation: Email; notification: Email } {
  const inquiry = INQUIRIES[line]
  const confirmation = confirmationEmail(inquiry, { context, logo, sentAt })
  if (!confirmation) throw new Error('The sample inquiry has an e-mail.')
  const notification = notificationEmail(inquiry, {
    to: to ?? context?.email ?? '',
    panelUrl,
    confirmation: 'sent',
    context,
    sentAt,
  })
  return { confirmation: to ? { ...confirmation, to } : confirmation, notification }
}
