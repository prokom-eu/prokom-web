import type { ReactNode } from 'react'

import { ContactForm } from '@/components/shared/ContactForm'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { formConsent } from '@/lib/shared/consent'
import type { SharedData } from '@/lib/shared/project'

/**
 * The hub's page forms (spec §7: Dla firm, Dla domu, Inwestycje i dostawy, Współpraca) on the
 * shared `ContactForm` (ADR-003: one form, one place for honeypot, signed time, rate limit,
 * consent and the e-mails). Saved for the `prokom` tenant; what the page knows (its name, the
 * request list, the segment or role) joins the message through `prefill` (`registerFormAttachment`).
 */
export function HubForm({
  shared,
  placeholder,
  sendLabel,
  prefill,
}: {
  shared: SharedData
  placeholder?: string | null
  sendLabel?: string | null
  /** A client part that registers the page's attachment (and may show it). */
  prefill: ReactNode
}) {
  const { company } = shared
  const contact = shared.line.contact ?? {}
  return (
    <ContactForm
      formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
      topics={[]}
      placeholder={placeholder ?? contact.placeholder}
      sendLabel={sendLabel ?? contact.sendLabel}
      responsePromise={shared.line.responsePromise}
      consent={{ ...formConsent(company.consent), privacyHref: company.legal.privacy }}
      zones={company.serviceZones}
      nextSteps={contact.nextSteps ?? []}
      line="prokom"
      prefill={prefill}
    />
  )
}
