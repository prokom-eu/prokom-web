import { CONSENT_CLAUSE } from './consent'
import { sourceFromHref, splitEmailOrPhone } from './form'
import { HONEYPOT_FIELD } from './honeypot'

// Browser side of the audit form on `/audyt` (spec. §6.5, §7; ADR-014 rozstrz. SW0 6): what it
// sends to `POST /api/inquiry`. The server validates and writes the message (ADR-003).

export type AuditValues = {
  /** „Adres strony”, as typed: `twojafirma.pl` is fine. */
  url: string
  name: string
  /** „E-mail albo telefon”. */
  contact: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type AuditField = 'url' | 'name' | 'contact' | 'consent'

/** Error of the address (board `Audyt`); the others are the contact form's. */
export const AUDIT_URL_MESSAGE = 'Wpisz adres strony, np. twojafirma.pl.'

/**
 * The address to audit as `http(s)://host/…`, or `null`: `https://` is added when missing, the
 * host needs a dot and a letter domain, no spaces. The server checks it again (http/https only).
 */
export function normalizeAuditUrl(raw: string): string | null {
  const text = raw.trim().replace(/\.$/, '')
  if (!text || /\s/.test(text)) return null
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.username || url.password || !/\.[a-z]{2,}$/i.test(url.hostname)) return null
  const path = url.pathname === '/' && !url.search && !url.hash ? '' : url.pathname
  return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${path}${url.search}${url.hash}`
}

/** Required: the address, the name, a usable contact, consent — in the order of the fields. */
export function checkAuditRequired(values: AuditValues): Partial<Record<AuditField, true>> {
  const errors: Partial<Record<AuditField, true>> = {}
  if (!normalizeAuditUrl(values.url)) errors.url = true
  if (!values.name.trim()) errors.name = true
  if (!splitEmailOrPhone(values.contact)) errors.contact = true
  if (!values.consent) errors.consent = true
  return errors
}

export function buildAuditBody(
  values: AuditValues,
  { href, formToken }: { href: string; formToken: string },
) {
  return {
    type: 'audit',
    source: sourceFromHref(href),
    auditUrl: normalizeAuditUrl(values.url) ?? values.url.trim(),
    name: values.name,
    ...splitEmailOrPhone(values.contact),
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}
