'use client'

import Link from 'next/link'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'

import { FieldError } from '@/components/ui/Field'
import { cx } from '@/components/ui/cx'
import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import { buildSoftwareWizardBody, checkSoftwareWizardRequired } from '@/lib/inquiry/wizardForm'
import type { SoftwareWizard } from '@/lib/software/wizard'
import { contactPrefOf, type WizardAnswers } from '@/lib/software/wizardFlow'

type Props = {
  rules: SoftwareWizard
  answers: WizardAnswers
  onContactPref: (id: string) => void
  formToken: string
  /** Level of the form's heading (one under the wizard's title). */
  heading: 'h2' | 'h3'
  phone: { label: string; href: string } | null
  /** Sent: the inquiry number (`null` when the server gave none). */
  sent: { number: string | null } | null
  onSent: (number: string | null) => void
}

const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

type ErrorKey = 'contact' | 'consent' | 'form'

const label = 'text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2'
const input =
  'block h-[54px] w-full rounded-[14px] border-[1.5px] border-border-input bg-card px-4 text-[15.5px] text-ink placeholder:text-ink-3 focus:border-accent-text aria-invalid:border-[3px] aria-invalid:border-ink'

/**
 * „Chcesz wycenę na piśmie?” of the wizard's result (spec. §6.3, §7.2): contact preference,
 * name, one field „Telefon albo e-mail”, consent; errors under the fields and in a box above
 * the button (focus on the first wrong field); the success card in place, with the number.
 */
export function WizardSend({
  rules,
  answers,
  onContactPref,
  formToken,
  heading: Heading,
  phone,
  sent,
  onSent,
}: Props) {
  const id = useId()
  const { send } = rules
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({})
  const [busy, setBusy] = useState(false)
  const contactRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // A form error (server, network) focuses its box once rendered — the first time it is not in
  // the DOM yet when the answer comes. The focus announces it; no `role="alert"` on top.
  const [focusBox, setFocusBox] = useState(0)
  useEffect(() => {
    if (focusBox > 0) boxRef.current?.focus()
  }, [focusBox])
  const pref = contactPrefOf(rules, answers)
  const ready = contact.trim().length > 0 && consent

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-[22px] border border-accent-line bg-accent-soft p-5 sm:p-7"
      >
        <span className="self-start rounded-lg bg-ok-text px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-surface">
          {send.sentLabel.replace('{nr}', sent.number ?? '—')}
        </span>
        <Heading className="font-display text-2xl font-extrabold">{send.success.title}</Heading>
        <ol className="space-y-3">
          {send.success.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-ink">
                {i + 1}
              </span>
              <span className="pt-0.5">{step.replace('{kontakt}', pref?.verb ?? '')}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-2">
          {send.copyNote}
          {phone && (
            <>
              {' '}
              <a href={phone.href} className="font-bold text-accent-text underline">
                {phone.label}
              </a>
            </>
          )}
        </p>
      </div>
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const values = { name, contact, consent, website: String(data.get(HONEYPOT_FIELD) ?? '') }
    const missing = checkSoftwareWizardRequired(values)
    const next: Partial<Record<ErrorKey, string>> = {
      ...(missing.contact && { contact: send.errors.contact }),
      ...(missing.consent && { consent: send.errors.consent }),
    }
    setErrors(next)
    if (missing.contact) return contactRef.current?.focus()
    if (missing.consent) return consentRef.current?.focus()

    setBusy(true)
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildSoftwareWizardBody(values, { href: window.location.href, formToken, answers }),
        ),
      })
      outcome = readOutcome(response.status, await response.json().catch(() => null), {
        email: send.errors.contact,
        phone: send.errors.contact,
        consent: send.errors.consent,
      })
    } catch {
      outcome = readOutcome(0, null)
    }
    setBusy(false)
    if (outcome.kind === 'sent') return onSent(outcome.number)
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    const contactError = fields.email ?? fields.phone
    setErrors({
      ...(contactError && { contact: contactError }),
      ...(fields.consent && { consent: fields.consent }),
      ...(outcome.kind === 'error'
        ? { form: outcome.message }
        : outcome.formError && { form: outcome.formError }),
    })
    if (contactError) contactRef.current?.focus()
    else setFocusBox((count) => count + 1)
  }

  const errorList = [errors.contact, errors.consent, errors.form].filter(Boolean)
  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-[22px] border border-accent-line bg-card-2 p-5 sm:p-6"
    >
      <Heading className="font-display text-2xl font-extrabold">{send.title}</Heading>
      <fieldset>
        <legend className={label}>{send.prefQ}</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {rules.contactPrefs.map((option) => {
            const on = option.id === pref?.id
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={() => onContactPref(option.id)}
                className={cx(
                  'min-h-11 rounded-full border px-4 text-sm font-bold',
                  on ? 'border-accent bg-accent text-accent-ink' : 'border-border bg-card',
                )}
              >
                {option.n}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <label htmlFor={`${id}-name`} className="sr-only">
            {send.fields[0]}
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={send.fields[0]}
            autoComplete="given-name"
            maxLength={120}
            className={input}
          />
        </div>
        <div>
          <label htmlFor={`${id}-contact`} className="sr-only">
            {send.fields[1] ?? send.fields[0]}
          </label>
          <input
            id={`${id}-contact`}
            ref={contactRef}
            value={contact}
            onChange={(event) => {
              setContact(event.target.value)
              setErrors(({ contact: _fixing, ...rest }) => rest)
            }}
            placeholder={send.fields[1] ?? send.fields[0]}
            autoComplete="on"
            maxLength={254}
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? `${id}-contact-error` : undefined}
            className={input}
          />
          {errors.contact && <FieldError id={`${id}-contact-error`}>{errors.contact}</FieldError>}
        </div>
      </div>
      <div>
        <div className="flex items-start gap-3">
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
            className="mt-0.5 size-[22px] shrink-0 accent-accent-text"
          />
          <label htmlFor={`${id}-consent`} className="text-sm leading-normal text-ink-2">
            {consentClause ? (
              <>
                {consentClause.before}
                <Link href={PRIVACY_POLICY_PATH} className="font-bold text-accent-text underline">
                  {consentClause.link}
                </Link>
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
      {errorList.length > 0 && (
        <div
          ref={boxRef}
          tabIndex={-1}
          className="rounded-[14px] border-[3px] border-ink bg-surface-2 px-4 py-3 text-sm font-bold"
        >
          <ul className="space-y-1">
            {errorList.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="submit"
        // Looks inactive until ready (board), yet answers a click with the errors (spec. §7.2).
        aria-disabled={busy || undefined}
        className={cx(
          'min-h-14 w-full rounded-2xl px-5 font-display text-lg font-extrabold',
          ready && !busy ? 'bg-button text-accent-ink shadow-raised' : 'bg-chip text-ink-2',
        )}
      >
        {send.button}
      </button>
      {send.note && <p className="text-xs text-ink-2">{send.note}</p>}
    </form>
  )
}
