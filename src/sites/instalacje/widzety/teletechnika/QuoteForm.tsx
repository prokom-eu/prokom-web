'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'

import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { teletechnika } from '../../dane/teletechnika'
import { InstIcon } from '../../InstIcon'
import {
  INITIAL_QUOTE,
  QUOTE_LIMITS,
  quoteBody,
  type QuoteErrorKey,
  quoteErrors,
  quoteErrorText,
  type QuoteState,
  quoteSummary,
  unitsValue,
} from './teletechnikaModel'

const Q = teletechnika.quote
const consent = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const ERROR_ID = 'tq-error'
/** Fields the server can reject, with the form's own words (the others: a general error). */
const SERVER_FIELDS = {
  name: `${Q.errors.prefix} ${Q.errors.name}.`,
  phone: Q.errors.phoneFormat,
  email: Q.errors.emailFormat,
  city: Q.errors.placeLong,
  deadline: Q.errors.termLong,
  message: Q.errors.stageLong,
}
type ServerField = keyof typeof SERVER_FIELDS

/**
 * Quote form of the Teletechnika page (`#zapytanie`, ADR-I002 §4): investment type, scope,
 * units, place, stage and term, contact (name, phone — required on Instalacje — and e-mail) and consent; the summary on the
 * side follows the answers. No file upload in v1 — the bill of quantities goes by e-mail after the
 * inquiry. Sends a contact inquiry „Teletechnika — przedmiar” through the inquiry endpoint
 * (honeypot, form token, minimum time and limit on the server); the thanks show the number.
 */
export function QuoteForm({ formToken }: { formToken: string }) {
  const [state, setState] = useState<QuoteState>(INITIAL_QUOTE)
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [done, setDone] = useState<{ number: string | null } | null>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const doneTitle = useRef<HTMLElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const phoneField = useRef<HTMLInputElement>(null)
  const emailField = useRef<HTMLInputElement>(null)
  const placeField = useRef<HTMLInputElement>(null)
  const termField = useRef<HTMLInputElement>(null)
  const stageField = useRef<HTMLInputElement>(null)
  const consentField = useRef<HTMLInputElement>(null)
  const [serverField, setServerField] = useState<ServerField | null>(null)

  useEffect(() => {
    if (done) doneTitle.current?.focus()
  }, [done])

  const set = (change: Partial<QuoteState>) => {
    setFailure(null)
    setServerField(null)
    setState((s) => ({ ...s, ...change }))
  }
  const errors = quoteErrors(state)
  const errorText = tried ? quoteErrorText(errors) : ''
  const summary = quoteSummary(state)
  const nameBad = (tried && errors.includes('name')) || serverField === 'name'
  const phoneBad = (tried && errors.includes('phone')) || serverField === 'phone'
  const emailBad = serverField === 'email'
  const shownError = failure ?? errorText
  // A field with an error points at the message, so a screen reader reads why.
  const invalid = (bad: boolean) =>
    bad && shownError ? { 'aria-invalid': true as const, 'aria-describedby': ERROR_ID } : {}

  /** Focus the first missing answer (the order of the form). */
  const focusFirst = (keys: QuoteErrorKey[]) => {
    if (keys[0] === 'name') nameField.current?.focus()
    else if (keys[0] === 'phone') phoneField.current?.focus()
    else if (keys[0] === 'consent') consentField.current?.focus()
  }
  const focusServer = (field: ServerField) =>
    ({
      name: nameField,
      phone: phoneField,
      email: emailField,
      city: placeField,
      deadline: termField,
      message: stageField,
    })[field].current?.focus()

  async function submit(event: FormEvent) {
    event.preventDefault()
    setTried(true)
    if (errors.length > 0) {
      focusFirst(errors)
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          quoteBody(state, {
            href: window.location.href,
            formToken,
            website: honeypot.current?.value ?? '',
          }),
        ),
      })
      const outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        SERVER_FIELDS,
      )
      if (outcome.kind === 'sent') setDone({ number: outcome.number })
      else if (outcome.kind === 'invalid') {
        // A stale form ("refresh the page") goes first: fixing a field would not help.
        const field = outcome.formError
          ? undefined
          : (Object.keys(outcome.fields)[0] as ServerField | undefined)
        setFailure(outcome.formError ?? (field ? SERVER_FIELDS[field] : Q.errors.failed))
        if (field) {
          setServerField(field)
          focusServer(field)
        }
      } else setFailure(response.status === 429 ? Q.errors.limit : outcome.message)
    } catch {
      setFailure(Q.errors.failed)
    } finally {
      setBusy(false)
    }
  }

  if (done)
    return (
      <div className="card zp ri tqdone">
        <b ref={doneTitle} tabIndex={-1} className="h3">
          {Q.thanks.title}
        </b>
        <p>{Q.thanks.text}</p>
        {done.number && (
          <p>
            {Q.thanks.number} <b>{done.number}</b>
          </p>
        )}
      </div>
    )

  return (
    <form className="zpw" onSubmit={submit} noValidate>
      <div className="card zp ri">
        <div className="zpq">
          <h3>
            <em>1</em>
            {Q.typeTitle}
          </h3>
          <div className="zpc">
            {Q.types.map((t, i) => (
              <button
                key={t}
                type="button"
                className={state.type === i ? 'chip on' : 'chip'}
                aria-pressed={state.type === i}
                onClick={() => set({ type: i })}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="zpq">
          <h3>
            <em>2</em>
            {Q.scopeTitle}
          </h3>
          <div className="zpc">
            {Q.scopes.map((z) => {
              const on = state.scopes.includes(z.key)
              return (
                <button
                  key={z.key}
                  type="button"
                  className={on ? 'chip on' : 'chip'}
                  aria-pressed={on}
                  onClick={() =>
                    set({
                      scopes: on
                        ? state.scopes.filter((x) => x !== z.key)
                        : [...state.scopes, z.key],
                    })
                  }
                >
                  <em aria-hidden="true">{on ? '✓' : '+'}</em>
                  {z.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="g2" style={{ gap: 12 }}>
          <label className="fl">
            {Q.fields.units.label}
            <input
              className="zin"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder={Q.fields.units.placeholder}
              value={state.units}
              onChange={(e) => set({ units: unitsValue(e.target.value) })}
            />
          </label>
          <label className="fl">
            {Q.fields.place.label}
            <input
              className="zin"
              type="text"
              ref={placeField}
              maxLength={QUOTE_LIMITS.place}
              {...invalid(serverField === 'city')}
              placeholder={Q.fields.place.placeholder}
              value={state.place}
              onChange={(e) => set({ place: e.target.value })}
            />
          </label>
          <label className="fl">
            {Q.fields.stage.label}
            <input
              className="zin"
              type="text"
              ref={stageField}
              maxLength={QUOTE_LIMITS.stage}
              {...invalid(serverField === 'message')}
              placeholder={Q.fields.stage.placeholder}
              value={state.stage}
              onChange={(e) => set({ stage: e.target.value })}
            />
          </label>
          <label className="fl">
            {Q.fields.term.label}
            <input
              className="zin"
              type="text"
              ref={termField}
              maxLength={QUOTE_LIMITS.term}
              {...invalid(serverField === 'deadline')}
              placeholder={Q.fields.term.placeholder}
              value={state.term}
              onChange={(e) => set({ term: e.target.value })}
            />
          </label>
        </div>
        <div className="drop xc-drop tqfiles">
          <span className="ico">
            <InstIcon name="mail" size={22} />
          </span>
          <b>{Q.files.title}</b>
          <span className="mut" style={{ fontSize: 13.5 }}>
            {Q.files.text}
          </span>
        </div>
        <div className="zpq">
          <h3>
            <em>3</em>
            {Q.contactTitle}
          </h3>
        </div>
        <div className="g2" style={{ gap: 12 }}>
          <label className="fl">
            {Q.fields.name.label}
            <input
              className={nameBad ? 'zin xc-bad' : 'zin'}
              type="text"
              name="name"
              autoComplete="organization"
              placeholder={Q.fields.name.placeholder}
              value={state.name}
              ref={nameField}
              maxLength={QUOTE_LIMITS.name}
              {...invalid(nameBad)}
              onChange={(e) => set({ name: e.target.value })}
            />
          </label>
          <label className="fl">
            {Q.fields.phone.label}
            <input
              className={phoneBad ? 'zin xc-bad' : 'zin'}
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder={Q.fields.phone.placeholder}
              value={state.phone}
              ref={phoneField}
              maxLength={QUOTE_LIMITS.phone}
              {...invalid(phoneBad)}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </label>
          <label className="fl">
            {Q.fields.email.label}
            <input
              className={emailBad ? 'zin xc-bad' : 'zin'}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={Q.fields.email.placeholder}
              value={state.email}
              ref={emailField}
              maxLength={QUOTE_LIMITS.email}
              {...invalid(emailBad)}
              onChange={(e) => set({ email: e.target.value })}
            />
          </label>
        </div>
        <label
          className={`xc-chk${state.consent ? ' on' : ''}${tried && !state.consent ? ' bad' : ''}`}
        >
          <input
            type="checkbox"
            className="sr-only"
            ref={consentField}
            checked={state.consent}
            {...invalid(tried && !state.consent)}
            onChange={(e) => set({ consent: e.target.checked })}
          />
          <i aria-hidden="true" />
          <span>
            {consent ? (
              <>
                {consent.before}
                <a href={PRIVACY_POLICY_PATH}>{consent.link}</a>
                {consent.after}
              </>
            ) : (
              CONSENT_CLAUSE.text
            )}
          </span>
        </label>
        {/* Bots fill every field; people never see this one. */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <input ref={honeypot} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <div className="card zsum ri sticky">
        <span className="eye">{Q.summary.eyebrow}</span>
        <div className="zsl">
          <div>
            <span>{Q.summary.type}</span>
            <b>{summary.type}</b>
          </div>
          <div>
            <span>{Q.summary.scope}</span>
            <b style={{ textAlign: 'right' }}>{summary.scope}</b>
          </div>
          <div>
            <span>{Q.summary.units}</span>
            <b>{summary.units}</b>
          </div>
        </div>
        <button type="submit" className="btn btn-p" disabled={busy}>
          {busy ? Q.sending : Q.send}
        </button>
        {shownError && (
          <span id={ERROR_ID} className="xc-err" role="alert">
            {shownError}
          </span>
        )}
      </div>
    </form>
  )
}
