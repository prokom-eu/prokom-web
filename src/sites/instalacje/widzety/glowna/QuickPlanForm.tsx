'use client'

import { track } from '@/lib/analytics/track'
import Link from 'next/link'
import { travelZone } from '@/lib/instalacje/plan'
import { type CSSProperties, type FormEvent, useEffect, useRef, useState } from 'react'

import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { glownaSekcje, PLAN_OBJECTS, type PlanObject } from '../../dane/glownaSekcje'
import type { ServiceKey } from '../../dane/types'
import { InstIcon } from '../../InstIcon'
import {
  type PlanErrorKey,
  type PlanState,
  phoneReady,
  planBody,
  planError,
  planProgress,
  plannerHref,
} from './quickPlan'

export type PlanService = {
  key: ServiceKey
  label: string
  icon: string | null
  color: string | null
}

type Props = { services: PlanService[]; formToken: string }

const t = glownaSekcje.plan
const START: PlanState = {
  services: [],
  object: null,
  town: '',
  name: '',
  phone: '',
  consent: false,
}
const consent = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const hue = (color: string | null) => ({ '--h': color ?? undefined }) as CSSProperties

/**
 * Quick plan form of the home page (`#zaplanuj`, KOMPONENTY §3, spec §6): services, object,
 * town with the travel zone, name and phone, consent; the ticket on the side follows the answers.
 * Sends a contact inquiry „Instalacje — strona główna” (`planBody`) through the inquiry endpoint
 * (honeypot, form token, minimum time and limit on the server); the thanks show the number.
 */
export function QuickPlanForm({ services, formToken }: Props) {
  const [state, setState] = useState<PlanState>(START)
  const [error, setError] = useState<{ key: PlanErrorKey | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ number: string | null } | null>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const phoneField = useRef<HTMLInputElement>(null)
  const servicesGroup = useRef<HTMLDivElement>(null)
  const consentField = useRef<HTMLInputElement>(null)
  const doneTitle = useRef<HTMLElement>(null)

  // The form is replaced by the thanks: focus goes to their title, so a screen reader hears it.
  useEffect(() => {
    if (done) doneTitle.current?.focus()
  }, [done])

  const set = (change: Partial<PlanState>) => {
    setError(null)
    setState((s) => ({ ...s, ...change }))
  }
  const toggleService = (key: ServiceKey) =>
    set({
      services: state.services.includes(key)
        ? state.services.filter((k) => k !== key)
        : [...state.services, key],
    })

  const zone = travelZone(state.town)
  const progress = planProgress(state)
  const href = plannerHref(state)
  const chosen = services.filter((s) => state.services.includes(s.key))
  const objectLabel = PLAN_OBJECTS.find((o) => o.key === state.object)?.label ?? '—'
  const ready = planError(state) === null
  const invalid = (key: PlanErrorKey) => error?.key === key || undefined
  // Focus goes to the first wrong field, so a keyboard or screen reader user lands on it.
  const focusField = (key: string | undefined) => {
    if (key === 'services') servicesGroup.current?.querySelector('button')?.focus()
    else if (key === 'name') nameField.current?.focus()
    else if (key === 'phone') phoneField.current?.focus()
    else if (key === 'consent') consentField.current?.focus()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const missing = planError(state)
    if (missing) {
      setError({ key: missing, text: t.errors[missing] })
      focusField(missing)
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          planBody(state, {
            href: window.location.href,
            formToken,
            website: honeypot.current?.value ?? '',
          }),
        ),
      })
      const outcome = readOutcome(response.status, await response.json().catch(() => null), {
        name: t.errors.name,
        phone: t.errors.phone,
      })
      if (outcome.kind === 'sent') {
        track('kontakt_wyslij')
        setDone({ number: outcome.number })
      } else if (outcome.kind === 'invalid') {
        // A stale form ("refresh the page") goes first: fixing a field would not help.
        const [key, text] = outcome.formError ? [] : (Object.entries(outcome.fields)[0] ?? [])
        setError(
          key && text
            ? { key: key as PlanErrorKey, text }
            : { key: 'form', text: outcome.formError ?? t.errors.failed },
        )
        focusField(key)
      } else {
        setError({ key: 'form', text: response.status === 429 ? t.errors.limit : outcome.message })
      }
    } catch {
      setError({ key: 'form', text: t.errors.failed })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hzkw ri">
      <div className="hzkc">
        {done ? (
          <div className="hzkdone">
            <span className="zkok">
              <svg viewBox="0 0 52 52" aria-hidden="true">
                <circle cx="26" cy="26" r="24" />
                <path d="M15 27 l7 7 l15 -16" />
              </svg>
            </span>
            <b
              ref={doneTitle}
              tabIndex={-1}
              className="h2"
              style={{ fontSize: 'clamp(26px, 2.6vw, 36px)', outline: 'none' }}
            >
              {t.done.title}
            </b>
            <p>{t.done.text}</p>
            {done.number && (
              <p>
                {t.done.number}: <b>{done.number}</b>
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href={href} className="btn hbtn-p">
                {t.done.more}
              </Link>
              <button
                type="button"
                className="btn hbtn-g"
                onClick={() => {
                  setDone(null)
                  setState((s) => ({ ...s, services: [], phone: '', consent: false }))
                }}
              >
                {t.done.again}
              </button>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={submit} style={{ display: 'contents' }}>
            <div className="hzkst">
              <div className="hzkn">
                <em className={state.services.length ? 'ok' : ''}>1</em>
                <span>{t.step1}</span>
                <i>{t.step1Note}</i>
              </div>
              <div ref={servicesGroup} className="hzksv" role="group" aria-label={t.step1}>
                {services.map((s) => {
                  const on = state.services.includes(s.key)
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={`hzkb${on ? ' on' : ''}`}
                      style={hue(s.color)}
                      aria-pressed={on}
                      onClick={() => toggleService(s.key)}
                    >
                      <span className="hzki">
                        <InstIcon name={s.icon} size={20} strokeWidth={2.1} />
                      </span>
                      <b>{s.label}</b>
                      <em>
                        <InstIcon name="check" size={12} strokeWidth={3.2} />
                      </em>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="hzkst">
              <div className="hzkn">
                <em className={state.object ? 'ok' : ''}>2</em>
                <span>{t.step2}</span>
              </div>
              <div className="hzkob" role="group" aria-label={t.step2}>
                {PLAN_OBJECTS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className={`hzko${state.object === o.key ? ' on' : ''}`}
                    aria-pressed={state.object === o.key}
                    onClick={() => set({ object: o.key as PlanObject })}
                  >
                    <InstIcon name={o.icon} size={16} strokeWidth={2.1} />
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hzkst">
              <div className="hzkn">
                <em className={state.town && phoneReady(state.phone) ? 'ok' : ''}>3</em>
                <span>{t.step3}</span>
              </div>
              <div className="hzkin">
                <label className="hzkf">
                  <span>{t.town}</span>
                  <input
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    placeholder={t.townPlaceholder}
                    maxLength={100}
                    value={state.town}
                    onChange={(e) => set({ town: e.target.value })}
                  />
                  <em className={`hzkz${zone ? ' on' : ''}`}>
                    {zone ? zone.split(' · ')[0] : t.zone}
                  </em>
                </label>
                <label className="hzkf">
                  <span>{t.name}</span>
                  <input
                    ref={nameField}
                    type="text"
                    name="name"
                    autoComplete="given-name"
                    placeholder={t.namePlaceholder}
                    maxLength={120}
                    value={state.name}
                    aria-invalid={invalid('name')}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </label>
                <label className="hzkf">
                  <span>{t.phone}</span>
                  <input
                    ref={phoneField}
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t.phonePlaceholder}
                    maxLength={30}
                    value={state.phone}
                    aria-invalid={invalid('phone')}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                  <em className={`hzkok${phoneReady(state.phone) ? ' on' : ''}`} aria-hidden="true">
                    <InstIcon name="check" size={12} strokeWidth={3.2} />
                  </em>
                </label>
                <button type="submit" className={`hzksend${ready ? ' ready' : ''}`} disabled={busy}>
                  {busy ? t.sending : t.send}
                  <InstIcon name="phone" size={17} strokeWidth={2.4} />
                </button>
              </div>
              <div className="hzkchips">
                {t.towns.map((town) => (
                  <button
                    key={town}
                    type="button"
                    className={`hzkt${state.town === town ? ' on' : ''}`}
                    aria-pressed={state.town === town}
                    onClick={() => set({ town })}
                  >
                    {town}
                  </button>
                ))}
              </div>
              <label className={`hzkcons${state.consent ? ' on' : ''}`}>
                <input
                  ref={consentField}
                  type="checkbox"
                  className="sr-only"
                  checked={state.consent}
                  aria-invalid={invalid('consent')}
                  onChange={(e) => set({ consent: e.target.checked })}
                />
                <em aria-hidden="true">
                  <InstIcon name="check" size={12} strokeWidth={3.2} />
                </em>
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
              {/* Bots fill every field; people never see this one. */}
              <div aria-hidden="true" className="absolute -left-[9999px]">
                <input ref={honeypot} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
              </div>
              <div>
                {error && (
                  <div className="hzkerr" role="alert">
                    {error.text}
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
      <aside className="hzks">
        <div className="zkticket">
          <div className="zktt">
            <span className="eye">{t.ticket.eyebrow}</span>
            <span className="zkring" style={{ '--p': progress } as CSSProperties}>
              <b>{progress}%</b>
            </span>
          </div>
          <div className="zktsv">
            {chosen.map((s) => (
              <span key={s.key} className="zktag" style={hue(s.color)}>
                {s.label}
              </span>
            ))}
            {chosen.length === 0 && (
              <span className="mut" style={{ fontSize: 13.5 }}>
                {t.ticket.none}
              </span>
            )}
          </div>
          <div className="zktl">
            <div>
              <span>{t.ticket.object}</span>
              <b>{objectLabel}</b>
            </div>
            <div>
              <span>{t.ticket.town}</span>
              <b>{state.town || '—'}</b>
            </div>
            <div>
              <span>{t.ticket.zone}</span>
              <b>{zone ?? '—'}</b>
            </div>
            <div>
              <span>{t.ticket.phone}</span>
              <b>{phoneReady(state.phone) ? state.phone : '—'}</b>
            </div>
          </div>
        </div>
        <div className="hzkalt">
          <span className="ico s">
            <InstIcon name="camera2" size={18} />
          </span>
          <div>
            <b>{t.alt.title}</b>
            <span>{t.alt.text}</span>
            <Link href={href}>{t.alt.link}</Link>
          </div>
        </div>
        <div className="hzksteps">
          {t.steps.map((step, i) => (
            <div key={step} style={{ display: 'contents' }}>
              {i > 0 && <i />}
              <div>
                <em>{i + 1}</em>
                <span>{step}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
