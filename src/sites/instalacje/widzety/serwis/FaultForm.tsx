'use client'

import Link from 'next/link'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { serwis as S } from '../../dane/serwis'
import { InstIcon } from '../../InstIcon'
import {
  faultBody,
  faultError,
  faultSummary,
  INITIAL_FAULT,
  isUrgent,
  pickSystem,
  trackSteps,
  type FaultError,
  type FaultState,
} from './serwisModel'

type Props = { formToken: string; phone: { label: string; href: string } | null }

const consent = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const F = S.form
const T = S.track

/**
 * The fault form in the hero of `/serwis` (`#zglos`, `Serwis.body.html`): who installed it, what
 * does not work, the symptom, urgency, name, phone, town, consent. Sends a contact inquiry
 * „Instalacje — serwis” (urgency → `deadline`) through the inquiry endpoint; then the card shows
 * what was reported, the number and the usual steps, like the prototype's tracker.
 */
export function FaultForm({ formToken, phone }: Props) {
  const [state, setState] = useState<FaultState>(INITIAL_FAULT)
  const [error, setError] = useState<{ key: FaultError | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<{ number: string | null; state: FaultState } | null>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const phoneField = useRef<HTMLInputElement>(null)
  const consentField = useRef<HTMLInputElement>(null)
  const doneTitle = useRef<HTMLElement>(null)

  // The form is replaced by the confirmation: the focus goes to its title.
  useEffect(() => {
    if (sent) doneTitle.current?.focus()
  }, [sent])

  const change = (part: Partial<FaultState>) => {
    setError(null)
    setState((s) => ({ ...s, ...part }))
  }
  const focusField = (key: string) => {
    if (key === 'name') nameField.current?.focus()
    else if (key === 'phone') phoneField.current?.focus()
    else if (key === 'consent') consentField.current?.focus()
  }
  const invalid = (key: FaultError) =>
    error?.key === key ? { 'aria-invalid': true as const, 'aria-describedby': 'sv-err' } : {}

  async function submit(event: FormEvent) {
    event.preventDefault()
    const missing = faultError(state)
    if (missing) {
      setError({ key: missing, text: F.errors[missing] })
      focusField(missing)
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          faultBody(state, {
            href: window.location.href,
            formToken,
            website: honeypot.current?.value ?? '',
          }),
        ),
      })
      const outcome = readOutcome(response.status, await response.json().catch(() => null), {
        name: F.errors.name,
        phone: F.errors.phone,
        consent: F.errors.consent,
      })
      if (outcome.kind === 'sent') setSent({ number: outcome.number, state })
      else if (outcome.kind === 'invalid') {
        const [key, text] = outcome.formError ? [] : (Object.entries(outcome.fields)[0] ?? [])
        if (key && text) {
          setError({ key: key as FaultError, text })
          focusField(key)
        } else setError({ key: 'form', text: outcome.formError ?? F.errors.failed })
      } else {
        setError({ key: 'form', text: response.status === 429 ? F.errors.limit : outcome.message })
      }
    } catch {
      setError({ key: 'form', text: F.errors.failed })
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setSent(null)
    setState((s) => ({ ...s, phone: '', town: '', consent: false }))
  }

  const box = {
    boxShadow: 'inset 0 0 0 1px var(--border), var(--shadow)',
    borderRadius: 30,
    scrollMarginTop: 90,
  }

  if (sent) {
    const summary = faultSummary(sent.state)
    return (
      <div id="zglos" className="card zp" style={box} role="region" aria-label={F.region}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <b ref={doneTitle} tabIndex={-1} className="h3" role="status" style={{ outline: 'none' }}>
            {T.title}
          </b>
          <button type="button" className="btn btn-g btn-s" onClick={reset}>
            {T.again}
          </button>
        </div>
        <p className="mut" style={{ margin: 0, fontSize: 15 }}>
          {T.text}
        </p>
        {sent.number && (
          <p style={{ margin: 0 }}>
            {T.number} <b data-testid="inquiry-number">{sent.number}</b>
          </p>
        )}
        <div className="zsl">
          <div>
            <span>{T.system}</span>
            <b>{summary.system}</b>
          </div>
          <div>
            <span>{T.symptom}</span>
            <b>{summary.symptom}</b>
          </div>
          <div>
            <span>{T.urgency}</span>
            <b>{summary.urgency}</b>
          </div>
        </div>
        <ol className="trk" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {trackSteps().map((step) => (
            <li
              key={step.title}
              className={'trs' + (step.state ? ` ${step.state}` : '')}
              aria-current={step.state === 'on' ? 'step' : undefined}
            >
              <em aria-hidden="true">
                <InstIcon name={step.icon} size={16} strokeWidth={2.4} />
              </em>
              <span>
                <b>{step.title}</b>
                <span>{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <span className="mut" style={{ fontSize: 12.5 }}>
          {T.note}
        </span>
      </div>
    )
  }

  const chosen = state.sys
  const symptoms = S.form.systems[chosen]!.symptoms
  return (
    <form
      id="zglos"
      className="card zp"
      style={box}
      aria-label={F.region}
      noValidate
      onSubmit={submit}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <b className="h3">{F.title}</b>
        <div className="seg">
          {F.who.map((who, i) => (
            <button
              key={who}
              type="button"
              className={state.who === i ? 'on' : ''}
              aria-pressed={state.who === i}
              onClick={() => change({ who: i })}
            >
              {who}
            </button>
          ))}
        </div>
      </div>
      <div className="zpq" role="group" aria-labelledby="sv-sys">
        <h3 id="sv-sys">
          <em aria-hidden="true">1</em>
          {F.systemTitle}
        </h3>
        <div className="zpc">
          {F.systems.map((system, i) => (
            <button
              key={system.label}
              type="button"
              className={'chip' + (chosen === i ? ' on' : '')}
              aria-pressed={chosen === i}
              onClick={() => {
                setError(null)
                setState((s) => pickSystem(s, i))
              }}
            >
              <InstIcon name={system.icon} size={15} />
              {system.label}
            </button>
          ))}
        </div>
      </div>
      <div className="zpq" role="group" aria-labelledby="sv-sym">
        <h3 id="sv-sym">
          <em aria-hidden="true">2</em>
          {F.symptomTitle}
        </h3>
        <div className="zpc">
          {symptoms.map((symptom, i) => (
            <button
              key={symptom}
              type="button"
              className={'chip' + (state.sym === i ? ' on' : '')}
              aria-pressed={state.sym === i}
              onClick={() => change({ sym: i })}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>
      <div className="zpq" role="group" aria-labelledby="sv-urg">
        <h3 id="sv-urg">
          <em aria-hidden="true">3</em>
          {F.urgencyTitle}
        </h3>
        <div className="zpc">
          {F.urgency.map((urgency, i) => (
            <button
              key={urgency}
              type="button"
              className={'chip' + (state.urg === i ? ' on' : '')}
              aria-pressed={state.urg === i}
              onClick={() => change({ urg: i })}
            >
              {urgency}
            </button>
          ))}
        </div>
      </div>
      {isUrgent(state) && phone && (
        <div className="note xa-urg" role="status">
          <InstIcon name="phone" />
          <span>
            <b>
              {F.urgentNote.lead} <a href={phone.href}>{phone.label}</a>
            </b>{' '}
            {F.urgentNote.text}
          </span>
        </div>
      )}
      <label className="fl">
        {F.name}
        <input
          ref={nameField}
          className={'zin' + (error?.key === 'name' ? ' xa-bad' : '')}
          type="text"
          placeholder={F.namePlaceholder}
          autoComplete="given-name"
          maxLength={120}
          required
          value={state.name}
          onChange={(e) => change({ name: e.target.value })}
          {...invalid('name')}
        />
      </label>
      <div className="g2" style={{ gap: 10 }}>
        <label className="fl">
          {F.phone}
          <input
            ref={phoneField}
            className={'zin' + (error?.key === 'phone' ? ' xa-bad' : '')}
            type="tel"
            placeholder={F.phonePlaceholder}
            autoComplete="tel"
            maxLength={30}
            required
            value={state.phone}
            onChange={(e) => change({ phone: e.target.value })}
            {...invalid('phone')}
          />
        </label>
        <label className="fl">
          {F.town}
          <input
            className="zin"
            type="text"
            placeholder={F.townPlaceholder}
            autoComplete="address-level2"
            maxLength={100}
            value={state.town}
            onChange={(e) => change({ town: e.target.value })}
          />
        </label>
      </div>
      <label className="consent">
        <input
          ref={consentField}
          type="checkbox"
          checked={state.consent}
          onChange={(e) => change({ consent: e.target.checked })}
          {...invalid('consent')}
        />
        <span>
          {consent ? (
            <>
              {consent.before}
              <Link href={PRIVACY_POLICY_PATH} style={{ textDecoration: 'underline' }}>
                {consent.link}
              </Link>
              {consent.after}
            </>
          ) : (
            CONSENT_CLAUSE.text
          )}
        </span>
      </label>
      <input
        ref={honeypot}
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />
      {error && (
        <div className="zkerr" role="alert" id="sv-err">
          <InstIcon name="chat" size={16} />
          {error.text}
        </div>
      )}
      <button type="submit" className="btn btn-p" disabled={busy}>
        {busy ? F.sending : F.send}
      </button>
      {phone && (
        <span className="mut" style={{ fontSize: 13 }}>
          {F.footer} <a href={phone.href}>{phone.label}</a>.
        </span>
      )}
    </form>
  )
}
