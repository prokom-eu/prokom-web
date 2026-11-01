'use client'

import { track } from '@/lib/analytics/track'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'

import { readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { architekci as A } from '../../dane/architekci'
import { useChecklist } from './checklistStore'
import { ConsentText } from './ConsentText'
import {
  checklistBody,
  emailError,
  type EmailError,
  type EmailState,
  INITIAL_EMAIL,
  newsBody,
} from './formModel'

const T = A.emailForms
const E = A.formTexts.errors

type Props = {
  /** `checklist`: „Checklista w PDF” (the checklist's choice goes with it); `news`: monthly news. */
  kind: 'checklist' | 'news'
  formToken: string
}

/**
 * The small e-mail forms of the page (ADR-I005 §3): name, e-mail, consent — the news also the
 * separate commercial consent, never pre-ticked (spec §2.7). No phone (decided 01.11.2026).
 * Saved as an inquiry; the PDF is sent by the contact person in v1.
 */
export function EmailForm({ kind, formToken }: Props) {
  const id = useId()
  const list = useChecklist()
  const [state, setState] = useState<EmailState>(INITIAL_EMAIL)
  const [error, setError] = useState<{ key: EmailError | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const fields = useRef<Partial<Record<EmailError, HTMLInputElement | null>>>({})

  const change = (part: Partial<EmailState>) => {
    setError(null)
    setState((s) => ({ ...s, ...part }))
  }
  const fail = (key: EmailError | 'form', text: string) => {
    setError({ key, text })
    if (key !== 'form') fields.current[key]?.focus()
  }
  const done = useRef<HTMLElement>(null)
  // The form is replaced by the confirmation: move the focus there (review I16c).
  useEffect(() => {
    if (sent) done.current?.focus()
  }, [sent])
  const invalid = (key: EmailError) =>
    error?.key === key ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-err` } : {}

  async function submit(event: FormEvent) {
    event.preventDefault()
    const missing = emailError(state, kind)
    if (missing) return fail(missing, E[missing])
    setBusy(true)
    const send = { href: window.location.href, formToken, website: honeypot.current?.value ?? '' }
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          kind === 'checklist' ? checklistBody(state, list, send) : newsBody(state, send),
        ),
      })
      const outcome = readOutcome(response.status, await response.json().catch(() => null), {
        name: E.name,
        email: E.email,
        consent: E.consent,
      })
      if (outcome.kind === 'sent') {
        track('kontakt_wyslij')
        setSent(true)
      } else if (outcome.kind === 'invalid') {
        const [key, text] = outcome.formError ? [] : (Object.entries(outcome.fields)[0] ?? [])
        if (key && text) fail(key as EmailError, text)
        else fail('form', outcome.formError ?? E.failed)
      } else fail('form', response.status === 429 ? E.limit : outcome.message)
    } catch {
      fail('form', E.failed)
    }
    setBusy(false)
  }

  if (sent) {
    return (
      <b role="status" tabIndex={-1} ref={done} style={{ color: 'var(--ok)' }}>
        {kind === 'checklist' ? T.pdfSent : T.newsSent}
      </b>
    )
  }

  return (
    <form
      className="arform"
      noValidate
      onSubmit={submit}
      aria-label={
        kind === 'checklist' ? A.checklistSection.pdfTitle : A.newsSection.newsletterTitle
      }
    >
      <div className="arpdff">
        <label className="arfg armail">
          <span className="arfl">{T.name}</span>
          <input
            ref={(el) => {
              fields.current.name = el
            }}
            className="zin"
            type="text"
            autoComplete="given-name"
            placeholder={T.namePlaceholder}
            required
            maxLength={120}
            value={state.name}
            onChange={(e) => change({ name: e.target.value })}
            {...invalid('name')}
          />
        </label>
        <label className="arfg armail">
          <span className="arfl">{T.email}</span>
          <input
            ref={(el) => {
              fields.current.email = el
            }}
            className="zin"
            type="email"
            autoComplete="email"
            placeholder={T.emailPlaceholder}
            required
            maxLength={254}
            value={state.email}
            onChange={(e) => change({ email: e.target.value })}
            {...invalid('email')}
          />
        </label>
        <button type="submit" className="btn btn-p btn-s" disabled={busy}>
          {kind === 'checklist' ? T.pdfSend : T.newsSend}
        </button>
      </div>
      <label className="consent">
        <input
          ref={(el) => {
            fields.current.consent = el
          }}
          type="checkbox"
          checked={state.consent}
          onChange={(e) => change({ consent: e.target.checked })}
          {...invalid('consent')}
        />
        <span>
          <ConsentText />
        </span>
      </label>
      {kind === 'news' && (
        <label className="consent">
          <input
            ref={(el) => {
              fields.current.marketing = el
            }}
            type="checkbox"
            checked={state.marketing}
            onChange={(e) => change({ marketing: e.target.checked })}
            {...invalid('marketing')}
          />
          <span>{T.marketing}</span>
        </label>
      )}
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
        <p className="arerr" role="alert" id={`${id}-err`}>
          {error.text}
        </p>
      )}
    </form>
  )
}
