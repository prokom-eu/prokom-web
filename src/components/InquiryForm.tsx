'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { CheckboxField, TextAreaField, TextField } from '@/components/ui/Field'
import { TextLink } from '@/components/ui/TextLink'
import {
  CONSENT_CLAUSE,
  MARKETING_CONSENT_TEXT,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import {
  BIZNES_FIELD_MESSAGES,
  INSTALACJE_FIELD_MESSAGES,
  buildInquiryBody,
  checkRequired,
  FIELD_MESSAGES,
  linkInText,
  readOutcome,
  type FieldName,
  type FormRules,
  type FormValues,
} from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

type Props = {
  /** Signed "form shown at" token, issued by the server on render (`lib/inquiry/spam`). */
  formToken: string
  /** Inquiry category set by the editor on the block, e.g. „Kasy fiskalne”. */
  category?: string | null
  /**
   * The Biznes line leads with the phone: a missing contact is reported on it, as the server
   * does (`lib/inquiry/schema`).
   */
  phoneFirst?: boolean
  /** The Instalacje line requires the phone (`lib/inquiry/schema`); the e-mail is optional. */
  phoneRequired?: boolean
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; emailed: boolean }
  | { kind: 'failed'; message?: string }

const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

// Biznes: a phone or an e-mail, the missing one reported on the phone (K4-FINAL §5).
const PHONE_FIRST: FormRules = {
  phoneFirst: true,
  messages: {
    ...FIELD_MESSAGES,
    email: BIZNES_FIELD_MESSAGES.email,
    phone: BIZNES_FIELD_MESSAGES.phone,
  },
}

const PHONE_REQUIRED: FormRules = { phoneRequired: true, messages: INSTALACJE_FIELD_MESSAGES }

// Order of the fields on screen: the first invalid one gets the focus.
const FIELD_ORDER: FieldName[] = ['name', 'company', 'email', 'phone', 'nip', 'message', 'consent']

function readValues(form: HTMLFormElement): FormValues {
  const data = new FormData(form)
  const text = (name: string) => String(data.get(name) ?? '')
  return {
    name: text('name'),
    company: text('company'),
    nip: text('nip'),
    email: text('email'),
    phone: text('phone'),
    message: text('message'),
    consent: data.get('consent') === 'on',
    marketingConsent: data.get('marketingConsent') === 'on',
    website: text(HONEYPOT_FIELD),
  }
}

/**
 * Inquiry form of every site (ADR-003): sends JSON to `POST /api/inquiry` and shows the
 * server's verdict next to the fields. Required fields are checked here first, formats only
 * on the server — one set of rules.
 */
export function InquiryForm({
  formToken,
  category,
  phoneFirst = false,
  phoneRequired = false,
}: Props) {
  const rules: FormRules = phoneRequired ? PHONE_REQUIRED : phoneFirst ? PHONE_FIRST : {}
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const statusRef = useRef<HTMLDivElement>(null)

  function showErrors(fields: Partial<Record<FieldName, string>>, form: HTMLFormElement) {
    setErrors(fields)
    const first = FIELD_ORDER.find((name) => fields[name])
    if (first) form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
  }

  function showStatus(next: Status) {
    setStatus(next)
    // After React renders the message, move the focus there so screen readers announce it.
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = readValues(form)
    const missing = checkRequired(values, rules)
    if (Object.keys(missing).length > 0) {
      setStatus({ kind: 'idle' })
      showErrors(missing, form)
      return
    }

    setErrors({})
    setStatus({ kind: 'sending' })
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildInquiryBody(values, { href: window.location.href, formToken, category }),
        ),
      })
      outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        rules.messages,
      )
    } catch {
      outcome = readOutcome(0, null)
    }

    if (outcome.kind === 'sent') {
      showStatus({ kind: 'sent', emailed: values.email.trim() !== '' })
    } else if (outcome.kind === 'invalid') {
      const failed: Status = outcome.formError
        ? { kind: 'failed', message: outcome.formError }
        : { kind: 'idle' }
      // With field errors the focus goes to the first field; without, to the message —
      // the button was disabled while sending, so the focus would otherwise be lost.
      if (Object.keys(outcome.fields).length > 0) {
        setStatus(failed)
        showErrors(outcome.fields, form)
      } else {
        setErrors({})
        showStatus(failed)
      }
    } else {
      showStatus({ kind: 'failed', message: outcome.message })
    }
  }

  if (status.kind === 'sent') {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-border bg-card p-6"
      >
        <p className="text-xl font-bold text-ink">Dziękujemy, zapytanie zostało wysłane.</p>
        <p className="mt-2 text-ink-2">
          Odpowiemy najszybciej, jak to możliwe.
          {status.emailed && ' Na podany adres e-mail wyślemy potwierdzenie.'}
        </p>
      </div>
    )
  }

  const sending = status.kind === 'sending'
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={sending}
      className="relative grid gap-5 sm:grid-cols-2"
    >
      <noscript>
        <p className="font-bold text-ink sm:col-span-2">
          Formularz wymaga włączonego JavaScriptu. Zadzwoń albo napisz do nas — dane są w stopce
          strony.
        </p>
      </noscript>
      {status.kind === 'failed' && status.message && (
        // Announced through the focus it receives (`showStatus`); `role="alert"` on top
        // would make screen readers read it twice.
        <div ref={statusRef} tabIndex={-1} className="sm:col-span-2">
          <p className="rounded-xl border-[3px] border-border-input bg-card p-4 font-bold text-ink">
            {status.message}
          </p>
        </div>
      )}
      <TextField
        id={fieldId('name')}
        name="name"
        label="Imię i nazwisko"
        autoComplete="name"
        maxLength={120}
        required
        error={errors.name}
      />
      <TextField
        id={fieldId('company')}
        name="company"
        label="Firma"
        note="(opcjonalnie)"
        autoComplete="organization"
        maxLength={200}
        error={errors.company}
      />
      <TextField
        id={fieldId('email')}
        name="email"
        type="email"
        label="E-mail"
        note={phoneRequired ? '(opcjonalnie)' : '(albo telefon)'}
        autoComplete="email"
        maxLength={254}
        error={errors.email}
      />
      <TextField
        id={fieldId('phone')}
        name="phone"
        type="tel"
        label="Telefon"
        note={phoneRequired ? undefined : '(albo e-mail)'}
        required={phoneRequired}
        autoComplete="tel"
        maxLength={30}
        error={errors.phone}
      />
      <TextField
        id={fieldId('nip')}
        name="nip"
        label="NIP"
        note="(opcjonalnie)"
        inputMode="numeric"
        maxLength={20}
        error={errors.nip}
      />
      <TextAreaField
        id={fieldId('message')}
        name="message"
        label="W czym możemy pomóc?"
        maxLength={5000}
        required
        error={errors.message}
        className="sm:col-span-2"
      />
      <CheckboxField
        id={fieldId('consent')}
        name="consent"
        required
        error={errors.consent}
        className="sm:col-span-2"
      >
        {consentClause ? (
          <>
            {consentClause.before}
            <TextLink href={PRIVACY_POLICY_PATH}>{consentClause.link}</TextLink>
            {consentClause.after}
          </>
        ) : (
          <>
            {CONSENT_CLAUSE.text}{' '}
            <TextLink href={PRIVACY_POLICY_PATH}>Polityka prywatności</TextLink>
          </>
        )}
      </CheckboxField>
      <CheckboxField id={fieldId('marketing')} name="marketingConsent" className="sm:col-span-2">
        {MARKETING_CONSENT_TEXT}
      </CheckboxField>
      {/* Honeypot: off-screen and out of the tab order, so only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label htmlFor={fieldId(HONEYPOT_FIELD)}>Strona internetowa</label>
        <input
          id={fieldId(HONEYPOT_FIELD)}
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={sending}>
          {sending ? 'Wysyłanie…' : 'Wyślij zapytanie'}
        </Button>
      </div>
    </form>
  )
}
