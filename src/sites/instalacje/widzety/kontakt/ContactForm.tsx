'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useRef, useState } from 'react'

import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { kontakt as K } from '../../dane/kontakt'
import { InstIcon } from '../../InstIcon'
import {
  contactBody,
  contactError,
  INITIAL_CONTACT,
  type ContactError,
  type ContactState,
} from './kontaktModel'

const consent = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const F = K.form

/**
 * The contact form (`#napisz`, `Kontakt.body.html`): topic, name, phone, message, consent.
 * Sends a contact inquiry „Instalacje — kontakt” through the inquiry endpoint (honeypot, form
 * token, minimum time and limit on the server) and goes to `/wyslane` with the number.
 */
export function ContactForm({ formToken }: { formToken: string }) {
  const router = useRouter()
  const [state, setState] = useState<ContactState>(INITIAL_CONTACT)
  const [error, setError] = useState<{ key: ContactError | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const phoneField = useRef<HTMLInputElement>(null)
  const consentField = useRef<HTMLInputElement>(null)

  const change = (part: Partial<ContactState>) => {
    setError(null)
    setState((s) => ({ ...s, ...part }))
  }
  const focusField = (key: string) => {
    if (key === 'name') nameField.current?.focus()
    else if (key === 'phone') phoneField.current?.focus()
    else if (key === 'consent') consentField.current?.focus()
  }
  const invalid = (key: ContactError) =>
    error?.key === key ? { 'aria-invalid': true as const, 'aria-describedby': 'kt-err' } : {}

  async function submit(event: FormEvent) {
    event.preventDefault()
    const missing = contactError(state)
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
          contactBody(state, {
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
      if (outcome.kind === 'sent') {
        const query = new URLSearchParams({ kontakt: 'phone' })
        if (outcome.number) query.set('nr', outcome.number)
        router.push(`/wyslane?${query.toString()}`)
        return
      }
      if (outcome.kind === 'invalid') {
        const [key, text] = outcome.formError ? [] : (Object.entries(outcome.fields)[0] ?? [])
        if (key && text) {
          setError({ key: key as ContactError, text })
          focusField(key)
        } else setError({ key: 'form', text: outcome.formError ?? F.errors.failed })
      } else {
        setError({ key: 'form', text: response.status === 429 ? F.errors.limit : outcome.message })
      }
    } catch {
      setError({ key: 'form', text: F.errors.failed })
    }
    setBusy(false)
  }

  return (
    <form className="card zp ri" aria-label={F.region} noValidate onSubmit={submit}>
      <div className="zpq" role="group" aria-labelledby="kt-topic">
        <h3 id="kt-topic">
          <em aria-hidden="true">1</em>
          {F.topicTitle}
        </h3>
        <div className="zpc">
          {F.topics.map((topic, i) => (
            <button
              key={topic}
              type="button"
              className={'chip' + (state.topic === i ? ' on' : '')}
              aria-pressed={state.topic === i}
              onClick={() => change({ topic: i })}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <div className="g2" style={{ gap: 12 }}>
        <label className="fl">
          {F.name}
          <input
            ref={nameField}
            className="zin"
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
      </div>
      <label className="fl">
        {F.message}
        <textarea
          className="zin"
          placeholder={F.messagePlaceholder}
          maxLength={4900}
          value={state.message}
          onChange={(e) => change({ message: e.target.value })}
        />
      </label>
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
        <div className="zkerr" role="alert" id="kt-err">
          <InstIcon name="chat" size={16} />
          {error.text}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-p"
        style={{ alignSelf: 'flex-start' }}
        disabled={busy}
      >
        {busy ? F.sending : F.send}
      </button>
    </form>
  )
}
