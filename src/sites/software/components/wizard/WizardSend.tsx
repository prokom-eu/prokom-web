'use client'

import { IntentLink as Link } from '@/components/shared/IntentLink'
import { useRouter } from 'next/navigation'
import { type FormEvent, useId, useRef, useState } from 'react'

import { FieldError } from '@/components/ui/Field'
import { track, trackFormErrors } from '@/lib/analytics/track'
import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import { buildSoftwareWizardBody, checkSoftwareWizardRequired } from '@/lib/inquiry/wizardForm'
import type { WizardAnswers } from '@/lib/software/wizard/flow'
import type { SoftwareWizard } from '@/lib/software/wizard/schema'

type Props = {
  send: SoftwareWizard['send']
  answers: WizardAnswers
  onNote: (note: string) => void
  /** Name and contact, kept by the wizard while the visitor steps back. */
  who: { name: string; contact: string }
  onWho: (who: { name: string; contact: string }) => void
  formToken: string
}

type ErrorKey = 'contact' | 'consent' | 'form'

const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

/**
 * The form of the result (board `AU-kreator` „Gotowe. Wyślij…”): „Coś jeszcze? Napisz po swojemu”,
 * name and company, e-mail or phone, the consent of `consent.ts`. The browser sends the answers
 * only; the server checks them against its rules. Sent → `/dziekujemy?nr=PKS-…`.
 */
export function WizardSend({ send, answers, onNote, who, onWho, formToken }: Props) {
  const id = useId()
  const router = useRouter()
  const { name, contact } = who
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({})
  const contactRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const values = { name, contact, consent, website: String(data.get(HONEYPOT_FIELD) ?? '') }
    const missing = checkSoftwareWizardRequired(values)
    const local = {
      ...(missing.contact && { contact: send.contact.error }),
      ...(missing.consent && { consent: send.errors.consent }),
    }
    setErrors(local)
    trackFormErrors('kreator', local)
    if (missing.contact) return contactRef.current?.focus()
    if (missing.consent) return consentRef.current?.focus()

    setBusy(true)
    const messages = {
      email: send.contact.error,
      phone: send.contact.error,
      consent: send.errors.consent,
    }
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildSoftwareWizardBody(values, { href: window.location.href, formToken, answers }),
        ),
      })
      outcome = readOutcome(response.status, await response.json().catch(() => null), messages)
    } catch {
      outcome = readOutcome(0, null, messages)
    }
    if (outcome.kind === 'sent') {
      track('kreator_wyslij')
      const query = outcome.number ? `?nr=${encodeURIComponent(outcome.number)}` : ''
      router.push(`/dziekujemy${query}`)
      return
    }
    setBusy(false)
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    const contactError = fields.email ?? fields.phone
    const rejected = {
      ...(contactError && { contact: contactError }),
      ...(fields.consent && { consent: fields.consent }),
      ...(outcome.kind === 'error'
        ? { form: outcome.message }
        : outcome.formError && { form: outcome.formError }),
    }
    setErrors(rejected)
    trackFormErrors('kreator', rejected)
    if (contactError) contactRef.current?.focus()
    else requestAnimationFrame(() => boxRef.current?.focus())
  }

  return (
    <form noValidate onSubmit={submit} className="wz-form" data-wizard-form>
      <div className="wz-field">
        <label htmlFor={`${id}-note`}>{send.noteLabel}</label>
        <textarea
          id={`${id}-note`}
          value={answers.note}
          onChange={(event) => onNote(event.target.value)}
          placeholder={send.notePlaceholder}
          maxLength={1500}
          rows={3}
        />
      </div>
      <div className="wz-row">
        <div className="wz-field">
          <label htmlFor={`${id}-name`}>{send.name.label}</label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(event) => onWho({ ...who, name: event.target.value })}
            placeholder={send.name.placeholder}
            autoComplete="name"
            maxLength={120}
          />
        </div>
        <div className="wz-field">
          <label htmlFor={`${id}-contact`}>{send.contact.label}</label>
          <input
            id={`${id}-contact`}
            ref={contactRef}
            value={contact}
            onChange={(event) => {
              onWho({ ...who, contact: event.target.value })
              setErrors(({ contact: _fixing, ...rest }) => rest)
            }}
            placeholder={send.contact.placeholder}
            autoComplete="on"
            maxLength={254}
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? `${id}-contact-error` : undefined}
          />
          {errors.contact && <FieldError id={`${id}-contact-error`}>{errors.contact}</FieldError>}
        </div>
      </div>
      <div>
        <div className="wz-consent">
          <input
            id={`${id}-consent`}
            ref={consentRef}
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked)
              setErrors(({ consent: _done, ...rest }) => rest)
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
          />
          <label htmlFor={`${id}-consent`}>
            {consentClause ? (
              <>
                {consentClause.before}
                <Link href={PRIVACY_POLICY_PATH}>{consentClause.link}</Link>
                {consentClause.after}
              </>
            ) : (
              CONSENT_CLAUSE.text
            )}
          </label>
        </div>
        {errors.consent && <FieldError id={`${id}-consent-error`}>{errors.consent}</FieldError>}
      </div>
      {/* Bots fill every field; people never see this one. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      {errors.form && (
        <div ref={boxRef} tabIndex={-1} className="wz-error" role="alert">
          {errors.form}
        </div>
      )}
      {/* Always active: a click shows what is missing at the fields. */}
      <button type="submit" aria-disabled={busy || undefined} className="wz-submit">
        {send.button}
      </button>
    </form>
  )
}
