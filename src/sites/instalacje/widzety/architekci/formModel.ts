import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { sourceFromHref } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import { ARCH_INQUIRY } from '@/lib/instalacje/architects'

import { architekci as A } from '../../dane/architekci'
import type { ChecklistState } from './architektModel'

/*
 * The three forms of the page for architects (ADR-I005 §3) as pure functions: the first
 * missing answer and the body of `POST /api/inquiry`. All are contact inquiries of the line
 * with their category; choices without their own column go into the message (like Serwis, I11).
 */

type Send = { href: string; formToken: string; website: string }
const digits = (phone: string) => phone.replace(/\D/g, '').length
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── „Wyślij rzuty” (`#wyslij`) ──────────────────────────────────────────────────────────

export type ProjectState = {
  role: number
  stage: number
  object: number
  name: string
  firm: string
  phone: string
  town: string
  link: string
  message: string
  consent: boolean
}

/** The prototype's start: architect, „Projekt budowlany”, house (`role: 0, stage: 1, fo: 0`). */
export const INITIAL_PROJECT: ProjectState = {
  role: 0,
  stage: 1,
  object: 0,
  name: '',
  firm: '',
  phone: '',
  town: '',
  link: '',
  message: '',
  consent: false,
}

export type ProjectError = 'name' | 'phone' | 'consent'

/** Name, a phone of 9 digits (the line's rule), consent. */
export function projectError(s: ProjectState): ProjectError | null {
  if (!s.name.trim()) return 'name'
  if (digits(s.phone) < 9) return 'phone'
  if (!s.consent) return 'consent'
  return null
}

/** „Architekt · Projekt budowlany · Dom” — the summary after sending (`ar.fm.sum`). */
export const projectSummary = (s: ProjectState) =>
  [A.form.roles[s.role], A.form.stages[s.stage], A.form.objects[s.object]]
    .filter(Boolean)
    .join(' · ')

export function projectBody(s: ProjectState, { href, formToken, website }: Send) {
  const link = s.link.trim()
  const text = s.message.trim()
  const lines = [
    `Kim jestem: ${A.form.roles[s.role] ?? ''}`,
    `Etap projektu: ${A.form.stages[s.stage] ?? ''}`,
    `Obiekt: ${A.form.objects[s.object] ?? ''}`,
    link ? `Link do rzutów: ${link}` : '',
    text ? `\n${text}` : '',
  ]
  return {
    type: 'contact' as const,
    category: ARCH_INQUIRY.project,
    source: sourceFromHref(href),
    name: s.name.trim(),
    company: s.firm.trim() || undefined,
    phone: s.phone.trim(),
    city: s.town.trim() || undefined,
    message: lines.filter(Boolean).join('\n').slice(0, 5000),
    consent: { accepted: s.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}

// ── Checklist PDF and news by e-mail ────────────────────────────────────────────────────

export type EmailState = { name: string; email: string; consent: boolean; marketing: boolean }
export const INITIAL_EMAIL: EmailState = { name: '', email: '', consent: false, marketing: false }
export type EmailError = 'name' | 'email' | 'consent' | 'marketing'

/** Name, an e-mail, consent; the news also the separate commercial consent (spec §2.7). */
export function emailError(s: EmailState, kind: 'checklist' | 'news'): EmailError | null {
  if (!s.name.trim()) return 'name'
  if (!EMAIL.test(s.email.trim())) return 'email'
  if (!s.consent) return 'consent'
  if (kind === 'news' && !s.marketing) return 'marketing'
  return null
}

/** The checklist PDF request: the chosen object and systems go with it. */
export function checklistBody(s: EmailState, list: ChecklistState, send: Send) {
  const object = A.checklist.objects.find((o) => o.key === list.obj)?.name ?? list.obj
  const systems = A.checklist.systems
    .filter((x) => list.sys.includes(x.key))
    .map((x) => x.name)
    .join(', ')
  return emailBody(
    s,
    ARCH_INQUIRY.checklist,
    `Prośba o checklistę projektanta w PDF.\nObiekt: ${object}\nInstalacje: ${systems || '—'}`,
    false,
    send,
  )
}

/** Signing up the studio for the monthly news (with the commercial consent). */
export const newsBody = (s: EmailState, send: Send) =>
  emailBody(
    s,
    ARCH_INQUIRY.news,
    'Zapis pracowni na „Nowe rozwiązania” raz w miesiącu.',
    true,
    send,
  )

function emailBody(
  s: EmailState,
  category: string,
  message: string,
  marketing: boolean,
  { href, formToken, website }: Send,
) {
  return {
    type: 'contact' as const,
    category,
    source: sourceFromHref(href),
    name: s.name.trim(),
    email: s.email.trim(),
    message,
    consent: { accepted: s.consent, clauseVersion: CONSENT_CLAUSE.version },
    marketingConsent: marketing && s.marketing,
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}
