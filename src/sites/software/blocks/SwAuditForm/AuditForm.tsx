'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'

import { FieldError } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import { type AuditField, buildAuditBody, checkAuditRequired } from '@/lib/inquiry/auditForm'
import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

export type AuditFormTexts = {
  label: string | null
  urlLabel: string
  urlPlaceholder: string | null
  nameLabel: string
  namePlaceholder: string | null
  contactLabel: string
  contactPlaceholder: string | null
  submit: string
  submitNote: string | null
}

type Props = {
  texts: AuditFormTexts
  errors: Record<AuditField, string>
  formToken: string
}

const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const FIELDS: AuditField[] = ['url', 'name', 'contact', 'consent']

type ErrorKey = AuditField | 'form'

const labelClass = 'text-sm font-extrabold text-ink'
const inputClass =
  'block h-[54px] w-full rounded-[14px] border-[1.5px] border-border-input bg-surface px-4 text-base text-ink placeholder:text-ink-3 focus:border-accent-text aria-invalid:border-[3px] aria-invalid:border-ink'

/**
 * The audit form of `/audyt` (spec. §6.5, §7.2; board `Audyt`): address, „Imię” and „E-mail albo
 * telefon” (both added to the board, ADR-014 rozstrz. SW0 6), consent. Labels above the fields;
 * errors under them and in a box above the button, focus on the first wrong field. Sent →
 * `/dziekujemy?nr=…`.
 */
export function AuditForm({ texts, errors: messages, formToken }: Props) {
  const id = useId()
  const router = useRouter()
  const [values, setValues] = useState({ url: '', name: '', contact: '', consent: false })
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({})
  const [busy, setBusy] = useState(false)
  const refs = {
    url: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    contact: useRef<HTMLInputElement>(null),
    consent: useRef<HTMLInputElement>(null),
  }
  const boxRef = useRef<HTMLDivElement>(null)
  const [focusBox, setFocusBox] = useState(0)
  useEffect(() => {
    if (focusBox > 0) boxRef.current?.focus()
  }, [focusBox])

  const set = <K extends keyof typeof values>(field: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors(({ [field]: _done, ...rest }) => rest)
  }

  const showErrors = (next: Partial<Record<ErrorKey, string>>) => {
    setErrors(next)
    const first = FIELDS.find((field) => next[field])
    if (first) refs[first].current?.focus()
    else if (next.form) setFocusBox((count) => count + 1)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const filled = { ...values, website: String(data.get(HONEYPOT_FIELD) ?? '') }
    const missing = checkAuditRequired(filled)
    const local = Object.fromEntries(
      (Object.keys(missing) as AuditField[]).map((field) => [field, messages[field]]),
    )
    if (Object.keys(local).length > 0) return showErrors(local)

    setBusy(true)
    // The server names its own fields: the address is `auditUrl`, the contact `email`/`phone`.
    const serverMessages = {
      auditUrl: messages.url,
      name: messages.name,
      email: messages.contact,
      phone: messages.contact,
      consent: messages.consent,
    }
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildAuditBody(filled, { href: window.location.href, formToken })),
      })
      outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        serverMessages,
      )
    } catch {
      outcome = readOutcome(0, null, serverMessages)
    }
    if (outcome.kind === 'sent') {
      const query = outcome.number ? `?nr=${encodeURIComponent(outcome.number)}` : ''
      router.push(`/dziekujemy${query}`)
      return
    }
    setBusy(false)
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    const contactError = fields.email ?? fields.phone
    showErrors({
      ...(fields.auditUrl && { url: fields.auditUrl }),
      ...(fields.name && { name: fields.name }),
      ...(contactError && { contact: contactError }),
      ...(fields.consent && { consent: fields.consent }),
      ...(outcome.kind === 'error'
        ? { form: outcome.message }
        : outcome.formError && { form: outcome.formError }),
    })
  }

  const errorList = [...FIELDS.map((field) => errors[field]), errors.form]
    .filter((error): error is string => Boolean(error))
    .filter((error, index, list) => list.indexOf(error) === index)
  const describe = (field: AuditField) => (errors[field] ? `${id}-${field}-error` : undefined)
  const ready =
    values.url.trim() !== '' &&
    values.name.trim() !== '' &&
    values.contact.trim() !== '' &&
    values.consent

  const input = (
    field: 'url' | 'name' | 'contact',
    label: string,
    placeholder: string | null,
    extra: { inputMode?: 'url'; autoComplete: string; maxLength: number },
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-${field}`} className={labelClass}>
        {label}
      </label>
      <input
        id={`${id}-${field}`}
        ref={refs[field]}
        value={values[field]}
        onChange={(event) => set(field, event.target.value)}
        placeholder={placeholder ?? undefined}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={describe(field)}
        className={inputClass}
        {...extra}
      />
      {errors[field] && <FieldError id={`${id}-${field}-error`}>{errors[field]}</FieldError>}
    </div>
  )

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-[26px] bg-card p-[18px] shadow-[inset_0_0_0_1.5px_var(--accent-line),var(--shadow)] min-[641px]:p-6"
    >
      {texts.label ? (
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
          {texts.label}
        </p>
      ) : null}
      {input('url', texts.urlLabel, texts.urlPlaceholder, {
        inputMode: 'url',
        autoComplete: 'url',
        maxLength: 2000,
      })}
      <div className="grid gap-4 min-[641px]:grid-cols-2 min-[641px]:gap-2.5">
        {input('name', texts.nameLabel, texts.namePlaceholder, {
          autoComplete: 'name',
          maxLength: 120,
        })}
        {input('contact', texts.contactLabel, texts.contactPlaceholder, {
          autoComplete: 'on',
          maxLength: 254,
        })}
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id={`${id}-consent`}
            ref={refs.consent}
            type="checkbox"
            checked={values.consent}
            onChange={(event) => set('consent', event.target.checked)}
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

      <button
        type="submit"
        // Looks inactive until ready (spec. §7.2), yet answers a click with the errors.
        aria-disabled={busy || undefined}
        className={cx(
          'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-6 font-display text-lg font-extrabold',
          ready && !busy ? 'bg-button text-accent-ink shadow-raised' : 'bg-chip text-ink-2',
        )}
      >
        {texts.submit}
        <Icon name="arrow" className="size-[18px]" />
      </button>
      {texts.submitNote ? <p className="text-[13px] text-ink-2">{texts.submitNote}</p> : null}
    </form>
  )
}
