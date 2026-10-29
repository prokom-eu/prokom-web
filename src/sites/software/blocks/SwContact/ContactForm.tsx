'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'

import { FieldError } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import type { IconName } from '@/lib/catalog/options'
import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import {
  buildSoftwareContactBody,
  checkSoftwareContactRequired,
  type SoftwareContactField,
} from '@/lib/inquiry/contactForm'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import type { SoftwareTopic } from '@/lib/inquiry/types'

export type ContactFormTexts = {
  topicsLabel: string
  messageLabel: string
  messagePlaceholder: string | null
  nameLabel: string
  namePlaceholder: string | null
  contactLabel: string
  contactPlaceholder: string | null
  submit: string
  alternative: string | null
  alternativeLink: { label: string; href: string } | null
}

type Props = {
  texts: ContactFormTexts
  topics: { value: SoftwareTopic; label: string; icon: IconName }[]
  /** Picked at the start (board: „System lub panel”). */
  initialTopic: SoftwareTopic | null
  errors: Record<SoftwareContactField, string>
  formToken: string
}

const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

type ErrorKey = SoftwareContactField | 'form'

const labelClass = 'text-sm font-extrabold text-ink'
const inputClass =
  'block w-full rounded-[14px] border-[1.5px] border-border-input bg-surface px-4 text-base text-ink placeholder:text-ink-3 focus:border-accent-text aria-invalid:border-[3px] aria-invalid:border-ink'

/**
 * Contact form of the Software line (spec. §7, §7.2; board `Main`, stan 77): topic, description,
 * name and firm, one field „E-mail albo telefon”, consent. Labels above the fields; errors under
 * them and in a box above the button, focus on the first wrong field. Sent → `/dziekujemy?nr=…`
 * (ADR-014 v20 12). Kept apart from the start page block, so `/kontakt` (SW11) can reuse it.
 */
export function ContactForm({ texts, topics, initialTopic, errors: messages, formToken }: Props) {
  const id = useId()
  const router = useRouter()
  const [topic, setTopic] = useState<SoftwareTopic | null>(initialTopic)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({})
  const [busy, setBusy] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // A form error (server, network) focuses its box once rendered; the focus announces it.
  const [focusBox, setFocusBox] = useState(0)
  useEffect(() => {
    if (focusBox > 0) boxRef.current?.focus()
  }, [focusBox])
  const ready = message.trim() !== '' && name.trim() !== '' && contact.trim() !== '' && consent

  const fixing = (field: SoftwareContactField) => setErrors(({ [field]: _done, ...rest }) => rest)

  const showErrors = (next: Partial<Record<ErrorKey, string>>) => {
    setErrors(next)
    const first = (['message', 'name', 'contact', 'consent'] as const).find((field) => next[field])
    if (first === 'message') messageRef.current?.focus()
    else if (first === 'name') nameRef.current?.focus()
    else if (first === 'contact') contactRef.current?.focus()
    else if (first === 'consent') consentRef.current?.focus()
    else if (next.form) setFocusBox((count) => count + 1)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const values = {
      topic,
      message,
      name,
      contact,
      consent,
      website: String(data.get(HONEYPOT_FIELD) ?? ''),
    }
    const missing = checkSoftwareContactRequired(values)
    const local = Object.fromEntries(
      (Object.keys(missing) as SoftwareContactField[]).map((field) => [field, messages[field]]),
    )
    if (Object.keys(local).length > 0) return showErrors(local)

    setBusy(true)
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildSoftwareContactBody(values, { href: window.location.href, formToken }),
        ),
      })
      outcome = readOutcome(response.status, await response.json().catch(() => null), {
        message: messages.message,
        name: messages.name,
        company: messages.name,
        email: messages.contact,
        phone: messages.contact,
        consent: messages.consent,
      })
    } catch {
      outcome = readOutcome(0, null)
    }
    if (outcome.kind === 'sent') {
      const query = outcome.number ? `?nr=${encodeURIComponent(outcome.number)}` : ''
      router.push(`/dziekujemy${query}`)
      return
    }
    setBusy(false)
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    const contactError = fields.email ?? fields.phone
    const nameError = fields.name ?? fields.company
    showErrors({
      ...(fields.message && { message: fields.message }),
      ...(nameError && { name: nameError }),
      ...(contactError && { contact: contactError }),
      ...(fields.consent && { consent: fields.consent }),
      ...(outcome.kind === 'error'
        ? { form: outcome.message }
        : outcome.formError && { form: outcome.formError }),
    })
  }

  const errorList = [errors.message, errors.name, errors.contact, errors.consent, errors.form]
    .filter((error): error is string => Boolean(error))
    .filter((error, index, list) => list.indexOf(error) === index)
  const describe = (field: SoftwareContactField) =>
    errors[field] ? `${id}-${field}-error` : undefined

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-[18px]">
      <fieldset>
        <legend className={labelClass}>{texts.topicsLabel}</legend>
        <div className="mt-2.5 grid grid-cols-2 gap-2 min-[641px]:grid-cols-3">
          {topics.map((option) => (
            <label
              key={option.value}
              className={cx(
                'flex min-h-12 cursor-pointer items-center gap-2 rounded-[14px] border-[1.5px] px-3 py-2 text-sm font-bold leading-tight has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text',
                topic === option.value
                  ? 'border-accent bg-accent-soft text-accent-text'
                  : 'border-border bg-card text-ink hover:border-accent-line',
              )}
            >
              <input
                type="radio"
                name={`${id}-topic`}
                value={option.value}
                checked={topic === option.value}
                onChange={() => setTopic(option.value)}
                className="sr-only"
              />
              <Icon name={option.icon} className="size-[18px] shrink-0" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-message`} className={labelClass}>
          {texts.messageLabel}
        </label>
        <textarea
          id={`${id}-message`}
          ref={messageRef}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            fixing('message')
          }}
          placeholder={texts.messagePlaceholder ?? undefined}
          maxLength={5000}
          rows={4}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe('message')}
          className={cx(inputClass, 'min-h-[110px] resize-y py-3')}
        />
        {errors.message && <FieldError id={`${id}-message-error`}>{errors.message}</FieldError>}
      </div>

      <div className="grid gap-[18px] min-[641px]:grid-cols-2 min-[641px]:gap-2.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className={labelClass}>
            {texts.nameLabel}
          </label>
          <input
            id={`${id}-name`}
            ref={nameRef}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              fixing('name')
            }}
            placeholder={texts.namePlaceholder ?? undefined}
            autoComplete="name"
            maxLength={120}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe('name')}
            className={cx(inputClass, 'h-[54px]')}
          />
          {errors.name && <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-contact`} className={labelClass}>
            {texts.contactLabel}
          </label>
          <input
            id={`${id}-contact`}
            ref={contactRef}
            value={contact}
            onChange={(event) => {
              setContact(event.target.value)
              fixing('contact')
            }}
            placeholder={texts.contactPlaceholder ?? undefined}
            autoComplete="on"
            maxLength={254}
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={describe('contact')}
            className={cx(inputClass, 'h-[54px]')}
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
              fixing('consent')
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describe('consent')}
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

      <div className="flex flex-col-reverse gap-3 min-[641px]:flex-row min-[641px]:flex-wrap min-[641px]:items-center min-[641px]:justify-between">
        {texts.alternativeLink ? (
          <p className="text-[13px] text-ink-2">
            {texts.alternative ? `${texts.alternative} ` : null}
            <Link
              href={texts.alternativeLink.href}
              className="font-bold text-accent-text underline-offset-2 hover:underline"
            >
              {texts.alternativeLink.label}
            </Link>
          </p>
        ) : null}
        <button
          type="submit"
          // Looks inactive until ready (spec. §7.2), yet answers a click with the errors.
          aria-disabled={busy || undefined}
          className={cx(
            'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-6 font-display text-lg font-extrabold min-[641px]:w-auto',
            ready && !busy ? 'bg-button text-accent-ink shadow-raised' : 'bg-chip text-ink-2',
          )}
        >
          {texts.submit}
          <Icon name="arrow" className="size-[18px]" />
        </button>
      </div>
    </form>
  )
}
