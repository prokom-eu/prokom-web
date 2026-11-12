import type { SharedData } from '../shared/project'
import { hoursSummary } from '../site/hoursSummary'

/**
 * What a line's e-mail needs from the panel (spec MAILE §2): phones and e-mail of the line, the
 * company with address, NIP and hours, the site and its privacy policy. Built from
 * `getSharedData` (D1-1, wariant A) — no phone, address or NIP literals in the templates.
 */
export type MailContext = {
  /** Domain shown in the mail, e.g. `prokombiznes.pl`. */
  siteName: string
  /** `https://prokombiznes.pl`, or `null` when the host is unknown. */
  origin: string | null
  phone: string | null
  phone2: string | null
  email: string | null
  company: { name: string; nip: string; address: string | null; hours: string | null }
  privacyUrl: string | null
}

export function toMailContext(
  shared: SharedData | null,
  origin: string | null,
  fallbackName: string,
): MailContext | null {
  if (!shared) return null
  const { company, line } = shared
  const address = company.address
    ? `${company.address.street}, ${company.address.postalCode} ${company.address.city}`
    : null
  const hours = line.hours ?? (company.hours.length > 0 ? hoursSummary(company.hours) : null)
  return {
    siteName: origin ? new URL(origin).host : fallbackName,
    origin,
    phone: line.phone,
    phone2: line.phone2,
    email: line.email,
    company: { name: company.name, nip: company.nip, address, hours },
    privacyUrl: origin ? `${origin}${company.legal.privacy}` : null,
  }
}
