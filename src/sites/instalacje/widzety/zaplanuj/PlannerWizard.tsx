'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import {
  PLAN_SIZES,
  PLAN_STAGES,
  PLAN_VIA,
  PLAN_WHEN,
  PLANNER_OBJECTS,
} from '@/lib/instalacje/plan'

import type { ServiceKey } from '../../dane/types'
import { PLANNER_OBJECT_ICONS, zaplanuj as Z } from '../../dane/zaplanuj'
import { InstIcon } from '../../InstIcon'
import {
  answer,
  chargerSummary,
  goToStep,
  INITIAL_PLANNER,
  phoneDigits,
  emailOk,
  pickPreset,
  plannerBody,
  plannerFromHash,
  plannerHints,
  plannerNavHint,
  plannerProgress,
  plannerSummary,
  plannerTips,
  plannerZone,
  questionCards,
  sentHref,
  stepError,
  toggleService,
  toggleUnsure,
  type PlannerError,
  type PlannerState,
  type PlannerStep,
} from './plannerModel'

export type PlannerService = {
  key: ServiceKey
  label: string
  caption: string | null
  icon: string | null
  color: string | null
}

type Props = {
  services: PlannerService[]
  formToken: string
  phone: { label: string; href: string } | null
  hours: string | null
}

const consent = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const tile = (on: boolean) => (on ? ' on' : '')

/**
 * The planner of `/zaplanuj` (`Zaplanuj.body.html`, spec §6, ADR-I002 §4): four steps — what,
 * where, details, contact — with the ticket and hints on the side. Choices from other pages come
 * in the address (`#obiekt=&uslugi=&konf=`, `?usluga=`). Sends a wizard inquiry through the
 * inquiry endpoint (honeypot, form token, minimum time and limit on the server) and goes to
 * `/wyslane`. On a phone one step fills the screen, Wstecz/Dalej stick above the tab bar.
 */
export function PlannerWizard({ services, formToken, phone, hours }: Props) {
  const router = useRouter()
  const [state, setState] = useState<PlannerState>(INITIAL_PLANNER)
  const [error, setError] = useState<{ key: PlannerError | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const card = useRef<HTMLFormElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const phoneField = useRef<HTMLInputElement>(null)
  const emailField = useRef<HTMLInputElement>(null)
  const consentField = useRef<HTMLInputElement>(null)
  const moved = useRef(false)

  // The choices of the page that linked here (`mountPage()`), read once in the browser.
  useEffect(() => {
    const found = plannerFromHash(window.location.hash, window.location.search)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the address exists only in the browser
    setState((s) => ({ ...s, ...found, step: s.step }))
  }, [])

  // After a step change: the card's top in view and the focus on the step's heading
  // (`focusStep()`), so a screen reader hears where it is.
  useEffect(() => {
    if (!moved.current) return
    const box = card.current
    if (box) {
      const header = document.querySelector('.hdr')
      const offset = (header ? header.getBoundingClientRect().height : 0) + 12
      const top = box.getBoundingClientRect().top
      if (top < offset || top > window.innerHeight * 0.4) {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({
          top: window.scrollY + top - offset,
          behavior: smooth ? 'smooth' : 'auto',
        })
      }
    }
    heading.current?.focus({ preventScroll: true })
  }, [state.step])

  const set = (next: PlannerState) => {
    setError(null)
    setState(next)
  }
  const change = (part: Partial<PlannerState>) => set({ ...state, ...part })
  const goStep = (step: PlannerStep) => {
    moved.current = true
    set({ ...state, step })
  }
  const focusField = (key: string) => {
    if (key === 'name') nameField.current?.focus()
    else if (key === 'phone') phoneField.current?.focus()
    else if (key === 'email') emailField.current?.focus()
    else if (key === 'consent') consentField.current?.focus()
  }
  const showError = (key: PlannerError) => {
    setError({ key, text: Z.errors[key] })
    focusField(key)
  }

  const step = state.step
  const zone = plannerZone(state.town)
  const progress = plannerProgress(state)
  const hints = plannerHints(state)
  const summary = plannerSummary(state)
  const cards = questionCards(state)
  const answeredCount = cards.filter((c) => c.chosen !== undefined).length
  const blocked = stepError(state, step) !== null
  const byKey = new Map(services.map((s) => [s.key, s]))
  const hue = (key: ServiceKey) =>
    ({ '--h': byKey.get(key)?.color || 'var(--accent)' }) as CSSProperties
  const invalid = (key: PlannerError) =>
    error?.key === key ? { 'aria-invalid': true as const, 'aria-describedby': 'zk-err' } : {}

  async function next() {
    const missing = stepError(state, step)
    if (missing) return showError(missing)
    if (step < 4) return goStep((step + 1) as PlannerStep)
    setBusy(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          plannerBody(state, {
            href: window.location.href,
            formToken,
            website: honeypot.current?.value ?? '',
          }),
        ),
      })
      const outcome = readOutcome(response.status, await response.json().catch(() => null), {
        name: Z.errors.name,
        phone: Z.errors.phone,
        email: Z.errors.email,
        consent: Z.errors.consent,
      })
      if (outcome.kind === 'sent') {
        router.push(sentHref(outcome.number, state.via))
        return
      }
      if (outcome.kind === 'invalid') {
        const [key, text] = outcome.formError ? [] : (Object.entries(outcome.fields)[0] ?? [])
        if (key && text) {
          setError({ key: key as PlannerError, text })
          focusField(key)
        } else setError({ key: 'form', text: outcome.formError ?? Z.errors.failed })
      } else {
        setError({ key: 'form', text: response.status === 429 ? Z.errors.limit : outcome.message })
      }
    } catch {
      setError({ key: 'form', text: Z.errors.failed })
    }
    setBusy(false)
  }

  const goFromBar = (target: PlannerStep) => {
    if (target <= step) return goStep(target)
    const result = goToStep(state, target)
    moved.current = true
    setState({ ...state, step: result.step })
    if (result.error) setError({ key: result.error, text: Z.errors[result.error] })
    else setError(null)
  }

  const navHint = plannerNavHint(state)

  return (
    <div className="zkw">
      {/* A form: Enter in a field goes to the next step and sends on the last one. The checks
          are ours (`stepError`), not the browser's. */}
      <form
        className="zkcard"
        ref={card}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void next()
        }}
      >
        <div className="zkprog">
          <div className="zkbar">
            <i style={{ width: `${Math.round(((step - 1) / 4) * 100)}%` }} />
          </div>
          <div className="zksteps">
            {Z.steps.map((title, i) => {
              const n = (i + 1) as PlannerStep
              return (
                <button
                  key={title}
                  type="button"
                  className={'zkst' + (n === step ? ' on' : n < step ? ' done' : '')}
                  aria-current={n === step ? 'step' : undefined}
                  onClick={() => goFromBar(n)}
                >
                  <em aria-hidden="true">{n < step ? '✓' : n}</em>
                  <span>{title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* `key`: a new step mounts again, like the prototype's card (slide-in animation). */}
        <div className="zkbody" key={`zk${step}`}>
          {step === 1 && (
            <>
              <div className="zkq">
                <h2 ref={heading} data-zkh="" tabIndex={-1}>
                  {Z.step1.heading}
                </h2>
                <p>{Z.step1.text}</p>
              </div>
              <div className="zkpre">
                <span className="zklab">{Z.step1.presetsLabel}</span>
                <div className="zkprel">
                  {Z.step1.presets.map((p, i) => (
                    <button
                      key={p.label}
                      type="button"
                      className={'zkpb' + tile(state.preset === i)}
                      aria-pressed={state.preset === i}
                      onClick={() => set(pickPreset(state, i))}
                    >
                      <span className="zkpi">
                        <InstIcon name={p.icon} />
                      </span>
                      <span>
                        <b>{p.label}</b>
                        <span>{p.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="zksvc">
                {services.map((s) => {
                  const on = state.services.includes(s.key)
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={'zksb' + tile(on)}
                      style={hue(s.key)}
                      aria-pressed={on}
                      onClick={() => set(toggleService(state, s.key))}
                    >
                      <span className="zksi">
                        <InstIcon name={s.icon} size={22} />
                      </span>
                      <b>{s.label}</b>
                      {s.caption && <span>{s.caption}</span>}
                      <em>
                        <InstIcon name="check" size={13} strokeWidth={3} />
                      </em>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className={'zkuns' + tile(state.unsure)}
                aria-pressed={state.unsure}
                onClick={() => set(toggleUnsure(state))}
              >
                <span className="zksi">
                  <InstIcon name="chat" size={20} />
                </span>
                <span>
                  <b>{Z.step1.unsure.title}</b>
                  <span>{Z.step1.unsure.text}</span>
                </span>
                <em>
                  <InstIcon name="check" size={13} strokeWidth={3} />
                </em>
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="zkq">
                <h2 ref={heading} data-zkh="" tabIndex={-1}>
                  {Z.step2.heading}
                </h2>
                <p>{Z.step2.text}</p>
              </div>
              <div className="zkobj">
                {PLANNER_OBJECTS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className={'zkob' + tile(state.object === o.key)}
                    aria-pressed={state.object === o.key}
                    onClick={() => change({ object: o.key })}
                  >
                    <span className="zksi">
                      <InstIcon name={PLANNER_OBJECT_ICONS[o.key]} size={22} />
                    </span>
                    <b>{o.label}</b>
                  </button>
                ))}
              </div>
              <div className="zkrow">
                <div className="zkgrp" role="group" aria-labelledby="zk-size">
                  <span className="zklab" id="zk-size">
                    {Z.step2.size}
                  </span>
                  <div className="zkseg">
                    {PLAN_SIZES.map((o, i) => (
                      <button
                        key={o.label}
                        type="button"
                        className={'zksg' + tile(state.size === i)}
                        aria-pressed={state.size === i}
                        onClick={() => change({ size: i })}
                      >
                        <b>{o.label}</b>
                        <span>{o.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="zkgrp" role="group" aria-labelledby="zk-stage">
                  <span className="zklab" id="zk-stage">
                    {Z.step2.stage}
                  </span>
                  <div className="zkseg">
                    {PLAN_STAGES.map((o, i) => (
                      <button
                        key={o.label}
                        type="button"
                        className={'zksg' + tile(state.stage === i)}
                        aria-pressed={state.stage === i}
                        onClick={() => change({ stage: i })}
                      >
                        <b>{o.label}</b>
                        <span>{o.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="zkgrp">
                <span className="zklab" id="zk-town">
                  {Z.step2.town}
                </span>
                <div className="zktown">
                  <span className="ico s">
                    <InstIcon name="pin" />
                  </span>
                  <input
                    className="zkin"
                    type="text"
                    placeholder={Z.step2.townPlaceholder}
                    value={state.town}
                    maxLength={100}
                    autoComplete="address-level2"
                    aria-labelledby="zk-town"
                    onChange={(e) => change({ town: e.target.value })}
                  />
                  <span className={'zkzone' + (zone ? ' on' : '')}>
                    {zone || Z.step2.zoneEmpty}
                  </span>
                  {/* Read out when the zone changes, not on every letter of the town. */}
                  <span className="sr-only" aria-live="polite">
                    {zone}
                  </span>
                </div>
                <div className="zkchips">
                  {Z.step2.towns.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={'zkc' + tile(state.town === t)}
                      onClick={() => change({ town: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="zkq">
                <h2 ref={heading} data-zkh="" tabIndex={-1}>
                  {Z.step3.heading}
                </h2>
                <p>{Z.step3.text}</p>
              </div>
              {state.services.length === 0 && (
                <div className="note">
                  <InstIcon name="chat" size={20} />
                  <span>{Z.step3.noServices}</span>
                </div>
              )}
              <div className="zkqs">
                {cards.map((c) => (
                  <div
                    key={c.key}
                    className={'zkqc' + (c.chosen !== undefined ? ' ok' : '')}
                    style={hue(c.service)}
                    role="group"
                    aria-labelledby={`zk-q-${c.key}`}
                  >
                    <div className="zkqh">
                      <span className="zksi">
                        <InstIcon name={byKey.get(c.service)?.icon} />
                      </span>
                      <span id={`zk-q-${c.key}`}>
                        <em>{byKey.get(c.service)?.label ?? c.service}</em>
                        <b>{c.question}</b>
                      </span>
                    </div>
                    <div className="zkchips">
                      {c.answers.map((a, i) => (
                        <button
                          key={a}
                          type="button"
                          className={'zkc' + tile(c.chosen === i)}
                          aria-pressed={c.chosen === i}
                          onClick={() => set(answer(state, c.key, i))}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {state.charger && state.services.includes('ev') && (
                <div className="note">
                  <InstIcon name="plug" size={20} />
                  <span>
                    <b>{Z.step3.charger}</b>
                    <br />
                    {chargerSummary(state.charger).join(' · ')}
                  </span>
                </div>
              )}
              <label className="zkgrp">
                <span className="zklab">
                  {Z.step3.more}{' '}
                  <span className="mut" style={{ textTransform: 'none', letterSpacing: 0 }}>
                    {Z.step3.optional}
                  </span>
                </span>
                <textarea
                  className="zkin zkta"
                  placeholder={Z.step3.morePlaceholder}
                  value={state.message}
                  maxLength={5000}
                  onChange={(e) => change({ message: e.target.value })}
                />
              </label>
              <div className="zkph">
                <div className="zkdrop">
                  <span className="ico">
                    <InstIcon name="camera2" size={22} />
                  </span>
                  <span>
                    <b>{Z.step3.photos.title}</b>
                    <span>{Z.step3.photos.text}</span>
                  </span>
                </div>
                <div className="zktips">
                  <b>{Z.step3.tipsTitle}</b>
                  {plannerTips(state).map((t) => (
                    <span key={t}>
                      <InstIcon name="check" size={13} strokeWidth={3} />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="zkq">
                <h2 ref={heading} data-zkh="" tabIndex={-1}>
                  {Z.step4.heading}
                </h2>
                <p>{Z.step4.text}</p>
              </div>
              <div className="zkform">
                <label className="zkfl">
                  <span>{Z.step4.name}</span>
                  <input
                    ref={nameField}
                    className="zkin"
                    type="text"
                    placeholder={Z.step4.namePlaceholder}
                    autoComplete="given-name"
                    maxLength={120}
                    required
                    value={state.name}
                    onChange={(e) => change({ name: e.target.value })}
                    {...invalid('name')}
                  />
                </label>
                <label className="zkfl">
                  <span>{Z.step4.phone}</span>
                  <input
                    ref={phoneField}
                    className="zkin"
                    type="tel"
                    placeholder={Z.step4.phonePlaceholder}
                    autoComplete="tel"
                    maxLength={30}
                    required
                    value={state.phone}
                    onChange={(e) => change({ phone: e.target.value })}
                    {...invalid('phone')}
                  />
                  <em className={'zkok2' + (phoneDigits(state.phone) >= 9 ? ' on' : '')}>
                    <InstIcon name="check" size={13} strokeWidth={3} />
                  </em>
                </label>
                <label className="zkfl full">
                  <span>
                    {Z.step4.email}{' '}
                    <i>{state.via === 2 ? Z.step4.emailRequired : Z.step4.emailOptional}</i>
                  </span>
                  <input
                    ref={emailField}
                    className={
                      'zkin' +
                      (state.via === 2 && state.email && !emailOk(state.email) ? ' xa-bad' : '')
                    }
                    type="email"
                    placeholder={Z.step4.emailPlaceholder}
                    autoComplete="email"
                    maxLength={254}
                    required={state.via === 2}
                    value={state.email}
                    onChange={(e) => change({ email: e.target.value })}
                    {...invalid('email')}
                  />
                </label>
              </div>
              <div className="zkrow">
                <div className="zkgrp" role="group" aria-labelledby="zk-via">
                  <span className="zklab" id="zk-via">
                    {Z.step4.via}
                  </span>
                  <div className="zkseg">
                    {PLAN_VIA.map((v, i) => (
                      <button
                        key={v.label}
                        type="button"
                        className={'zksg' + tile(state.via === i)}
                        aria-pressed={state.via === i}
                        onClick={() => change({ via: i })}
                      >
                        <InstIcon name={Z.step4.viaIcons[i]} size={16} />
                        <b>{v.label}</b>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="zkgrp" role="group" aria-labelledby="zk-when">
                  <span className="zklab" id="zk-when">
                    {Z.step4.when}
                  </span>
                  <div className="zkseg">
                    {PLAN_WHEN.map((w, i) => (
                      <button
                        key={w}
                        type="button"
                        className={'zksg' + tile(state.when === i)}
                        aria-pressed={state.when === i}
                        onClick={() => change({ when: i })}
                      >
                        <b>{w}</b>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* A real checkbox in the prototype's look (I8: the prototype's button-checkbox). */}
              <label className={'zkcons' + tile(state.consent)}>
                <input
                  ref={consentField}
                  type="checkbox"
                  className="sr-only"
                  checked={state.consent}
                  onChange={(e) => change({ consent: e.target.checked })}
                  {...invalid('consent')}
                />
                <em aria-hidden="true">
                  <InstIcon name="check" size={13} strokeWidth={3} />
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
            </>
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
        </div>

        {error && (
          <div className="zkerr" role="alert" id="zk-err">
            <InstIcon name="chat" size={16} />
            {error.text}
          </div>
        )}
        <div className="zknav">
          <button
            type="button"
            className="btn btn-g"
            onClick={() => goStep(Math.max(1, step - 1) as PlannerStep)}
            style={step === 1 ? { visibility: 'hidden' } : undefined}
            tabIndex={step === 1 ? -1 : undefined}
          >
            {Z.nav.back}
          </button>
          <span className="zknc">{navHint}</span>
          <span className="xa-zkno" aria-hidden="true">
            Krok {step} z 4
          </span>
          <button
            type="submit"
            className={'btn btn-p zknext' + (blocked ? ' dim' : '')}
            disabled={busy}
          >
            {step === 4 ? (busy ? Z.nav.sending : Z.nav.send) : Z.nav.next}
          </button>
        </div>
      </form>

      <aside className="zkside" aria-label={Z.side.eyebrow}>
        <div className="zkticket">
          <div className="zktt">
            <span className="eye">{Z.side.eyebrow}</span>
            <span className="zkring" style={{ '--p': progress } as CSSProperties}>
              <b>{progress}%</b>
            </span>
          </div>
          <div className="zktsv">
            {state.services.map((k) => (
              <span key={k} className="zktag" style={hue(k)}>
                <InstIcon name={byKey.get(k)?.icon} size={13} />
                {byKey.get(k)?.label ?? k}
              </span>
            ))}
            {state.services.length === 0 && (
              <span className="mut" style={{ fontSize: 13.5 }}>
                {summary.none}
              </span>
            )}
          </div>
          <div className="zktl">
            <div>
              <span>{Z.side.object}</span>
              <b>{summary.object}</b>
            </div>
            <div>
              <span>{Z.side.stage}</span>
              <b>{summary.stage}</b>
            </div>
            <div>
              <span>{Z.side.details}</span>
              <b>{state.services.length ? `${answeredCount} z ${cards.length}` : '—'}</b>
            </div>
            <div>
              <span>{Z.side.photos}</span>
              <b>{Z.side.photosValue}</b>
            </div>
            <div>
              <span>{Z.side.town}</span>
              <b>{summary.town}</b>
            </div>
          </div>
        </div>
        <div
          className="zkhint"
          key={`h${step}${state.services.join('')}${state.object}${state.stage}`}
        >
          <span className="zkhi">
            <InstIcon name="star" size={16} />
          </span>
          <div>
            <b>{Z.side.hint}</b>
            {hints.map((h) => (
              <p key={h}>{h}</p>
            ))}
          </div>
        </div>
        <div className="zkafter">
          <b>{Z.side.after}</b>
          {Z.after.map((a, i) => (
            <div key={a.title}>
              <em>{i + 1}</em>
              <span>
                <b>{a.title}</b>
                <span>{a.text}</span>
              </span>
            </div>
          ))}
          {phone && (
            <span className="mut" style={{ fontSize: 13 }}>
              {Z.side.call} <a href={phone.href}>{phone.label}</a>
              {hours ? ` · ${hours}` : ''}
            </span>
          )}
        </div>
      </aside>
    </div>
  )
}
