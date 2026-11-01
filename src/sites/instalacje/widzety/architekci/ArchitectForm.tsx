'use client'

import { track } from '@/lib/analytics/track'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import type { Phone } from '../../sekcje/types'
import { ConsentText } from './ConsentText'
import { useChosenRole } from './roleStore'
import {
  INITIAL_PROJECT,
  projectBody,
  projectError,
  type ProjectError,
  type ProjectState,
  projectSummary,
} from './formModel'

const T = A.formTexts

type Props = {
  formToken: string
  phone: Phone | null
  /** Where the plans may be mailed after the confirmation (the contact person's or the site's). */
  email: string | null
}

type Choice = 'role' | 'stage' | 'object'
const CHOICES: { key: Choice; title: string; options: readonly string[] }[] = [
  { key: 'role', title: T.role, options: A.form.roles },
  { key: 'stage', title: T.stage, options: A.form.stages },
  { key: 'object', title: T.object, options: A.form.objects },
]

/**
 * „Wyślij rzuty” (`#wyslij`, `ar.fm`): role, stage and object as chips, name, studio, phone
 * (the line's rule), town, a link to the plans instead of a file (spec §2.6), message, consent.
 * A contact inquiry „Architekci · projekt”; after sending the summary and the number in place,
 * like the service desk form (I11).
 */
export function ArchitectForm({ formToken, phone, email }: Props) {
  const [own, setState] = useState<ProjectState>(INITIAL_PROJECT)
  const [roleTouched, setRoleTouched] = useState(false)
  const chosenRole = useChosenRole()
  // „Kim jesteś” follows the role chosen in `#dla-ciebie` until the visitor picks one here.
  const state = roleTouched ? own : { ...own, role: chosenRole }
  const done = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<{ key: ProjectError | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<{ number: string | null } | null>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const fields = useRef<Partial<Record<ProjectError, HTMLInputElement | null>>>({})

  const change = (part: Partial<ProjectState>) => {
    setError(null)
    setState((s) => ({ ...s, ...part }))
  }
  const fail = (key: ProjectError | 'form', text: string) => {
    setError({ key, text })
    if (key !== 'form') fields.current[key]?.focus()
  }
  // The form is replaced by the confirmation: move the focus there (review I16c).
  useEffect(() => {
    if (sent) done.current?.focus()
  }, [sent])
  const invalid = (key: ProjectError) =>
    error?.key === key ? { 'aria-invalid': true as const, 'aria-describedby': 'ar-fm-err' } : {}

  async function submit(event: FormEvent) {
    event.preventDefault()
    const missing = projectError(state)
    if (missing) return fail(missing, T.errors[missing])
    setBusy(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          projectBody(state, {
            href: window.location.href,
            formToken,
            website: honeypot.current?.value ?? '',
          }),
        ),
      })
      const outcome = readOutcome(response.status, await response.json().catch(() => null), {
        name: T.errors.name,
        phone: T.errors.phone,
        consent: T.errors.consent,
      })
      if (outcome.kind === 'sent') {
        track('kontakt_wyslij')
        setSent({ number: outcome.number })
      } else if (outcome.kind === 'invalid') {
        const [key, text] = outcome.formError ? [] : (Object.entries(outcome.fields)[0] ?? [])
        if (key && text) fail(key as ProjectError, text)
        else fail('form', outcome.formError ?? T.errors.failed)
      } else fail('form', response.status === 429 ? T.errors.limit : outcome.message)
    } catch {
      fail('form', T.errors.failed)
    }
    setBusy(false)
  }

  if (sent) {
    return (
      <div className="arsent" role="status" tabIndex={-1} ref={done}>
        <span className="arokb">
          <InstIcon name="check" size={30} strokeWidth={3} />
        </span>
        <b className="h3">{T.sentTitle}</b>
        <span className="mut">{projectSummary(state)}</span>
        {sent.number && (
          <span>
            {T.sentNumber} <b>{sent.number}</b>
          </span>
        )}
        <p>
          {T.sentText} {phone ? <a href={phone.href}>{phone.label}</a> : null}
          {email && (
            <>
              {' '}
              {T.sentMail} <a href={`mailto:${email}`}>{email}</a>.
            </>
          )}
        </p>
        <button
          type="button"
          className="btn btn-g btn-s"
          onClick={() => {
            setSent(null)
            setState(INITIAL_PROJECT)
            setRoleTouched(false)
          }}
        >
          {T.again}
        </button>
      </div>
    )
  }

  return (
    <form aria-label={T.region} noValidate onSubmit={submit} className="arform">
      {CHOICES.map((c) => (
        <div key={c.key} className="arfg" role="group" aria-label={c.title}>
          <span className="arfl" aria-hidden="true">
            {c.title}
          </span>
          <div className="archips">
            {c.options.map((o, i) => {
              const on = state[c.key] === i
              return (
                <button
                  key={o}
                  type="button"
                  className={on ? 'chip on' : 'chip'}
                  aria-pressed={on}
                  onClick={() => {
                    if (c.key === 'role') setRoleTouched(true)
                    change({ ...state, [c.key]: i })
                  }}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <div className="arf2">
        <label className="arfg">
          <span className="arfl">{T.name}</span>
          <input
            ref={(el) => {
              fields.current.name = el
            }}
            className="zin"
            type="text"
            autoComplete="name"
            placeholder={T.namePlaceholder}
            maxLength={120}
            required
            value={state.name}
            onChange={(e) => change({ name: e.target.value })}
            {...invalid('name')}
          />
        </label>
        <label className="arfg">
          <span className="arfl">{T.firm}</span>
          <input
            className="zin"
            type="text"
            autoComplete="organization"
            placeholder={T.firmPlaceholder}
            maxLength={200}
            value={state.firm}
            onChange={(e) => change({ firm: e.target.value })}
          />
        </label>
      </div>
      <div className="arf2">
        <label className="arfg">
          <span className="arfl">{T.phone}</span>
          <input
            ref={(el) => {
              fields.current.phone = el
            }}
            className={'zin' + (error?.key === 'phone' ? ' xa-bad' : '')}
            type="tel"
            autoComplete="tel"
            placeholder={T.phonePlaceholder}
            maxLength={30}
            required
            value={state.phone}
            onChange={(e) => change({ phone: e.target.value })}
            {...invalid('phone')}
          />
        </label>
        <label className="arfg">
          <span className="arfl">{T.town}</span>
          <input
            className="zin"
            type="text"
            autoComplete="address-level2"
            placeholder={T.townPlaceholder}
            maxLength={100}
            value={state.town}
            onChange={(e) => change({ town: e.target.value })}
          />
        </label>
      </div>
      <label className="arfg">
        <span className="arfl">{T.link}</span>
        <input
          className="zin"
          type="url"
          inputMode="url"
          placeholder={T.linkPlaceholder}
          maxLength={500}
          value={state.link}
          onChange={(e) => change({ link: e.target.value })}
        />
        <span className="mut" style={{ fontSize: 13 }}>
          {T.linkNote}
        </span>
      </label>
      <label className="arfg">
        <span className="arfl">{T.message}</span>
        <textarea
          className="zin"
          placeholder={T.messagePlaceholder}
          maxLength={4000}
          value={state.message}
          onChange={(e) => change({ message: e.target.value })}
        />
      </label>
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
        <p className="arerr" role="alert" id="ar-fm-err">
          {error.text}
        </p>
      )}
      <button type="submit" className="btn btn-p" style={{ width: '100%' }} disabled={busy}>
        <InstIcon name="send" />
        {busy ? T.sending : T.send}
      </button>
    </form>
  )
}
