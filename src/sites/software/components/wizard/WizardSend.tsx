'use client'

import Link from 'next/link'
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

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
import { keepTogether } from '@/lib/software/price'
import type { SoftwareWizard } from '@/lib/software/wizard'
import {
  contactFieldOf,
  contactPrefOf,
  type ResultView,
  type WizardAnswers,
} from '@/lib/software/wizardFlow'

import { PathIcon } from './WizardPreview'

type Props = {
  rules: SoftwareWizard
  answers: WizardAnswers
  view: ResultView
  onContactPref: (id: string) => void
  formToken: string
  /** Level of the block's heading (one under the wizard's title). */
  heading: 'h2' | 'h3'
  phone: { label: string; href: string } | null
  /** Sent: the inquiry number (`null` when the server gave none) and the name typed. */
  sent: { number: string | null; name: string } | null
  onSent: (sent: { number: string | null; name: string }) => void
  /** Number of the step badge („4 · Ostatni krok”). */
  stepNumber: number
}

const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

type ErrorKey = 'contact' | 'consent' | 'form'

const fieldLabel = 'mb-1.5 block text-sm font-extrabold'
const input =
  'block h-[54px] w-full rounded-[14px] border-[1.5px] border-border-input bg-card px-4 text-[15.5px] text-ink placeholder:text-ink-3 focus:border-accent-text aria-invalid:border-[3px] aria-invalid:border-ink'
const small = 'text-[11px] font-extrabold uppercase tracking-[0.12em]'

/**
 * „Twoja wycena” — the ticket (ADR-015 v22 pkt 5: the footer button's gradient, white text in
 * both themes): name, „od” price and term, what goes to the quote and the add-ons.
 */
function Ticket({
  title,
  tag,
  view,
  rules,
  addOns,
}: {
  title: string
  tag: string
  view: ResultView
  rules: SoftwareWizard
  addOns: string[]
}) {
  return (
    <div
      data-wizard-ticket
      aria-label={title}
      className="relative rounded-[22px] bg-(image:--grad-say-no) p-5 text-white shadow-raised"
    >
      {/* The ticket's punched edges. */}
      <span aria-hidden="true" className="absolute top-10 -left-2 size-4 rounded-full bg-card" />
      <span aria-hidden="true" className="absolute top-10 -right-2 size-4 rounded-full bg-card" />
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-white/40 pb-3">
        <span className={small}>{title}</span>
        <em className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-extrabold uppercase not-italic tracking-[0.1em]">
          {tag}
        </em>
      </div>
      <b className="mt-3 block font-display text-xl leading-tight">{view.result.n}</b>
      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        <span>
          <small className={cx(small, 'block opacity-80')}>{rules.ui.priceLabel}</small>
          <b>{keepTogether(view.price)}</b>
        </span>
        <span>
          <small className={cx(small, 'block opacity-80')}>{rules.ui.termLabel}</small>
          <b>{keepTogether(view.term)}</b>
        </span>
      </div>
      {(view.toQuote.length > 0 || addOns.length > 0) && (
        <ul className="mt-3 flex flex-wrap gap-1.5 text-sm font-bold">
          {view.toQuote.length > 0 && (
            <li className="rounded-full bg-white/20 px-3 py-1">
              + {rules.ui.moreTag}: {view.toQuote.join(', ')}
            </li>
          )}
          {addOns.map((name) => (
            <li key={name} className="rounded-full bg-white/20 px-3 py-1">
              + {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Trust({ rules }: { rules: SoftwareWizard }) {
  return (
    <ul className="space-y-2 border-t border-dashed border-border pt-4 text-sm font-bold">
      {rules.send.trust.map((item) => (
        <li key={item.text} className="flex items-center gap-2.5">
          <PathIcon d={rules.icons[item.icon] ?? ''} className="size-[18px] text-ok-text" />
          {keepTogether(item.text)}
        </li>
      ))}
    </ul>
  )
}

function Block({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-card p-5 shadow-raised sm:p-6">
      {children}
    </div>
  )
}

/**
 * The quote block of the result (ZMIANY-v21 §10.3, stany kreator-d-a-3…4, m-a-3c): „Ostatni krok ·
 * Dokąd wysłać wycenę?”, the ticket, the contact preference as a segment, name and the contact
 * field of that preference, consent; the button is always active — errors appear at the fields
 * after a click (focus on the first wrong one). The success replaces the form in place.
 */
export function WizardSend({
  rules,
  answers,
  view,
  onContactPref,
  formToken,
  heading: Heading,
  phone,
  sent,
  onSent,
  stepNumber,
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
  const field = contactFieldOf(rules, answers)
  const addOns = view.addOns.filter((addOn) => addOn.on).map((addOn) => addOn.name)

  if (sent) {
    return (
      <Block>
        <div role="status" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-ok-text text-surface ring-4 ring-ok/25">
              <PathIcon d="M5 12l5 5 9-10" className="size-6" />
            </span>
            <span className="text-sm font-extrabold uppercase tracking-[0.12em] text-ok-text">
              {send.sentLabel.replace('{nr}', sent.number ?? '—')}
            </span>
          </div>
          <Heading className="font-display text-2xl font-extrabold leading-tight sm:text-[28px]">
            {sent.name ? send.success.title.replace('{imie}', sent.name) : send.success.titleNoName}
          </Heading>
          <p className="text-ink-2">
            {keepTogether(send.success.lead.replace('{kontakt}', pref?.verb ?? ''))}
          </p>
        </div>
        <Ticket
          title={send.ticket.title}
          tag={send.ticket.accepted}
          view={view}
          rules={rules}
          addOns={addOns}
        />
        <ol className="space-y-3">
          {send.success.timeline.map((step, index) => (
            <li key={step.when} className="flex gap-3">
              <span
                className={cx(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-extrabold',
                  index === 0 ? 'bg-ok-text text-surface' : 'bg-chip text-ink',
                )}
              >
                {index + 1}
              </span>
              <span>
                <b className="block">{keepTogether(step.when)}</b>
                <span className="text-sm text-ink-2">{keepTogether(step.what)}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-2">
          {send.success.note}
          {phone && (
            <>
              {' '}
              <a href={phone.href} className="font-bold text-accent-text underline">
                {phone.label}
              </a>
            </>
          )}
        </p>
      </Block>
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    const values = { name, contact, consent, website: String(data.get(HONEYPOT_FIELD) ?? '') }
    const missing = checkSoftwareWizardRequired(values, field.field)
    setErrors({
      ...(missing.contact && { contact: field.error }),
      ...(missing.consent && { consent: send.errors.consent }),
    })
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
        email: field.error,
        phone: field.error,
        consent: send.errors.consent,
      })
    } catch {
      outcome = readOutcome(0, null)
    }
    setBusy(false)
    if (outcome.kind === 'sent') return onSent({ number: outcome.number, name: name.trim() })
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

  return (
    <Block>
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink">
              {stepNumber}
            </span>
            {send.eyebrow}
          </p>
          <Heading className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-[28px]">
            {send.title}
          </Heading>
          <p className="mt-1.5 text-ink-2">{keepTogether(send.lead)}</p>
        </div>
        <Ticket
          title={send.ticket.title}
          tag={send.ticket.draft}
          view={view}
          rules={rules}
          addOns={addOns}
        />
        <fieldset>
          <legend className={fieldLabel}>{send.prefQ}</legend>
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-chip p-1">
            {rules.contactPrefs.map((option) => {
              const on = option.id === pref?.id
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    onContactPref(option.id)
                    setErrors(({ contact: _other, ...rest }) => rest)
                  }}
                  className={cx(
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[13px] font-extrabold transition-colors',
                    on
                      ? 'border-[1.5px] border-accent-line bg-card text-accent-text shadow-raised'
                      : 'text-ink-2 hover:text-ink',
                  )}
                >
                  <PathIcon d={option.ic} className="size-5" />
                  {option.n}
                </button>
              )
            })}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[1081px]:grid-cols-1 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <label htmlFor={`${id}-name`} className={fieldLabel}>
              {send.name.label}
            </label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={send.name.placeholder}
              autoComplete="given-name"
              maxLength={120}
              className={input}
            />
          </div>
          <div>
            <label htmlFor={`${id}-contact`} className={fieldLabel}>
              {field.label}
            </label>
            <input
              id={`${id}-contact`}
              ref={contactRef}
              value={contact}
              onChange={(event) => {
                setContact(event.target.value)
                setErrors(({ contact: _fixing, ...rest }) => rest)
              }}
              placeholder={field.placeholder}
              type={field.field === 'email' ? 'email' : field.field === 'phone' ? 'tel' : 'text'}
              inputMode={
                field.field === 'email' ? 'email' : field.field === 'phone' ? 'tel' : 'text'
              }
              autoComplete={
                field.field === 'email' ? 'email' : field.field === 'phone' ? 'tel' : 'on'
              }
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
        {errors.form && (
          <div
            ref={boxRef}
            tabIndex={-1}
            className="rounded-[14px] border-[3px] border-ink bg-surface-2 px-4 py-3 text-sm font-bold"
          >
            {errors.form}
          </div>
        )}
        {/* Always active (ZMIANY-v21 §10.3): a click shows what is missing at the fields. */}
        <button
          type="submit"
          aria-disabled={busy || undefined}
          className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-button px-5 py-3 text-left text-accent-ink shadow-raised active:scale-[0.99]"
        >
          <span className="flex-1">
            <b className="block font-display text-lg font-extrabold">{send.button.title}</b>
            <span className="text-sm font-bold opacity-90">{keepTogether(send.button.sub)}</span>
          </span>
          <span
            aria-hidden="true"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20"
          >
            →
          </span>
        </button>
        <Trust rules={rules} />
      </form>
    </Block>
  )
}
