'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
  type SoftwareTalkWay,
} from '@/lib/inquiry/contactForm'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import type { SoftwareTopic } from '@/lib/inquiry/types'
import { PROJECT_SENT_KEY } from '@/lib/software/project'
import { useProject, projectActions } from '@/lib/software/projectStore'
import {
  careLevelFromParam,
  type ProjectSolution,
  summarizeProject,
} from '@/lib/software/projectSummary'

import { ProjectBox } from '../SwContactPage/ProjectBox'

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

/**
 * What `/kontakt` adds (spec. §6.10): „Twój projekt”, hints under the description, the way to
 * talk, the hint under the contact field. Absent on the start page.
 */
export type ContactPageExtras = {
  /** Published solutions of the site: prices of „Twój projekt”, `?poziom=` levels. */
  solutions: ProjectSolution[]
  projectMessageLabel: string
  projectMessagePlaceholder: string | null
  hintsLabel: string | null
  /** `topic`: a topic value, `none` (no topic picked) or `all` (always shown last). */
  hints: { topic: string; text: string }[]
  contactHint: string | null
  talkLabel: string
  submitNote: string | null
}

/** „Jak wolisz rozmawiać?” (board `Kontakt`). */
const TALK_WAYS: { value: SoftwareTalkWay; label: string }[] = [
  { value: 'phone', label: 'Telefon' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Spotkanie w salonie' },
  { value: 'online', label: 'Online' },
]

/** The hint under „Telefon albo e-mail”: what was recognised (board `Kontakt`). */
function contactHintOf(value: string, empty: string | null): string | null {
  const text = value.trim()
  if (!text) return empty
  if (text.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
      ? 'Odpiszemy na ten adres.'
      : 'Sprawdź adres e-mail.'
  }
  return text.replace(/\D/g, '').length >= 9 ? 'Oddzwonimy na ten numer.' : 'Numer ma za mało cyfr.'
}

/** Appends a hint to the description as a new sentence. */
function withHint(message: string, hint: string): string {
  const text = message.trim()
  if (!text) return hint
  return `${text}${/[.!?]$/.test(text) ? ' ' : '. '}${hint}`
}

type Props = {
  texts: ContactFormTexts
  topics: { value: SoftwareTopic; label: string; icon: IconName }[]
  /** Picked at the start (board: „System lub panel”). */
  initialTopic: SoftwareTopic | null
  errors: Record<SoftwareContactField, string>
  formToken: string
  page?: ContactPageExtras
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
export function ContactForm({
  texts,
  topics,
  initialTopic,
  errors: messages,
  formToken,
  page,
}: Props) {
  const id = useId()
  const router = useRouter()
  // The address is read on the server too: both blocks render per request (`connection()`).
  const searchParams = useSearchParams()
  const solutions = page?.solutions
  // `?projekt=1` shows „Twój projekt” even when empty (spec. §6.10).
  const projectAsked = Boolean(solutions) && searchParams.get('projekt') === '1'
  // `?poziom=rozszerzona` from the price list: care, with the level in the description.
  const askedLevel = solutions
    ? careLevelFromParam(searchParams.get('poziom') ?? undefined, solutions)
    : null
  const [topic, setTopic] = useState<SoftwareTopic | null>(
    initialTopic ?? (askedLevel ? 'opieka' : null),
  )
  const [message, setMessage] = useState(
    askedLevel ? `Interesuje mnie opieka — poziom ${askedLevel}.` : '',
  )
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({})
  const [busy, setBusy] = useState(false)
  const [talk, setTalk] = useState<SoftwareTalkWay>('phone')
  const project = useProject()
  const summary = solutions ? summarizeProject(project, solutions) : null
  const hasItems = (summary?.slugs.length ?? 0) > 0
  const showProject = summary !== null && (summary.rows.length > 0 || projectAsked)
  // The topic follows the first item until the customer picks one (spec. §6.10).
  const currentTopic = topic ?? summary?.topic ?? null

  // The list renders only after hydration: the browser's own jump to `#formularz` came early.
  useEffect(() => {
    if (!projectAsked) return
    const frame = requestAnimationFrame(() =>
      document.getElementById('formularz')?.scrollIntoView({ block: 'start' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [projectAsked])
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
  const ready =
    (message.trim() !== '' || hasItems) && name.trim() !== '' && contact.trim() !== '' && consent

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
      topic: currentTopic,
      message,
      name,
      contact,
      consent,
      website: String(data.get(HONEYPOT_FIELD) ?? ''),
      items: summary?.slugs ?? [],
      preferredContact: page ? talk : null,
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
      if (summary) {
        const sent = summary.rows.filter((row) => summary.slugs.includes(row.id))
        try {
          if (sent.length > 0) {
            sessionStorage.setItem(PROJECT_SENT_KEY, JSON.stringify(sent.map((row) => row.label)))
          } else sessionStorage.removeItem(PROJECT_SENT_KEY)
        } catch {
          // Private mode: the thanks page just shows no list.
        }
        if (sent.length > 0) projectActions.clear()
      }
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
      {showProject && summary ? <ProjectBox summary={summary} /> : null}
      <fieldset>
        <legend className={labelClass}>{texts.topicsLabel}</legend>
        <div className="mt-2.5 grid grid-cols-2 gap-2 min-[641px]:grid-cols-3">
          {topics.map((option) => (
            <label
              key={option.value}
              className={cx(
                'flex min-h-12 cursor-pointer items-center gap-2 rounded-[14px] border-[1.5px] px-3 py-2 text-sm font-bold leading-tight has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text',
                currentTopic === option.value
                  ? 'border-accent bg-accent-soft text-accent-text'
                  : 'border-border bg-card text-ink hover:border-accent-line',
              )}
            >
              <input
                type="radio"
                name={`${id}-topic`}
                value={option.value}
                checked={currentTopic === option.value}
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
          {page && hasItems ? page.projectMessageLabel : texts.messageLabel}
        </label>
        <textarea
          id={`${id}-message`}
          ref={messageRef}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            fixing('message')
          }}
          placeholder={
            (page && hasItems ? page.projectMessagePlaceholder : texts.messagePlaceholder) ??
            undefined
          }
          maxLength={5000}
          rows={4}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe('message')}
          className={cx(inputClass, 'min-h-[110px] resize-y py-3')}
        />
        {errors.message && <FieldError id={`${id}-message-error`}>{errors.message}</FieldError>}
        {page ? (
          <Hints
            label={page.hintsLabel}
            hints={[
              ...page.hints.filter((hint) => hint.topic === (currentTopic ?? 'none')),
              ...page.hints.filter((hint) => hint.topic === 'all'),
            ].map((hint) => hint.text)}
            message={message}
            onPick={(hint) => {
              setMessage((current) => withHint(current, hint))
              fixing('message')
            }}
          />
        ) : null}
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
          {errors.contact ? (
            <FieldError id={`${id}-contact-error`}>{errors.contact}</FieldError>
          ) : page ? (
            <p aria-live="polite" className="text-[13px] font-bold text-accent-text">
              {contactHintOf(contact, page.contactHint)}
            </p>
          ) : null}
        </div>
      </div>

      {page ? (
        <fieldset>
          <legend className={labelClass}>{page.talkLabel}</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {TALK_WAYS.map((way) => (
              <label
                key={way.value}
                className={cx(
                  'inline-flex min-h-11 cursor-pointer items-center rounded-full border-[1.5px] px-4 text-[15px] font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text active:scale-[0.98] motion-reduce:transition-none',
                  talk === way.value
                    ? 'border-button bg-button text-accent-ink'
                    : 'border-border bg-card text-ink hover:border-accent-line',
                )}
              >
                <input
                  type="radio"
                  name={`${id}-talk`}
                  value={way.value}
                  checked={talk === way.value}
                  onChange={() => {
                    setTalk(way.value)
                    fixing('contact')
                  }}
                  className="sr-only"
                />
                {way.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

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
        {page?.submitNote ? (
          <p className="text-[13px] text-ink-2 min-[641px]:max-w-[36ch] min-[641px]:order-last">
            {page.submitNote}
          </p>
        ) : texts.alternativeLink ? (
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

/** Hints under the description (board `Kontakt`): a picked one is appended as a sentence. */
function Hints({
  label,
  hints,
  message,
  onPick,
}: {
  label: string | null
  hints: string[]
  message: string
  onPick: (hint: string) => void
}) {
  if (hints.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      {label ? <span className="text-[13px] font-extrabold text-ink-2">{label}</span> : null}
      {hints.map((hint) => {
        const used = message.includes(hint)
        return (
          <button
            key={hint}
            type="button"
            aria-pressed={used}
            onClick={() => (used ? undefined : onPick(hint))}
            className={cx(
              'inline-flex min-h-11 items-center rounded-full px-3.5 text-[13.5px] font-bold active:scale-[0.98] motion-reduce:transition-none min-[641px]:min-h-10',
              used ? 'bg-accent-soft text-accent-text' : 'bg-chip text-ink hover:bg-surface-3',
            )}
          >
            + {hint}
          </button>
        )
      })}
    </div>
  )
}
