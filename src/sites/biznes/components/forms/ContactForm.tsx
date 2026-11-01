'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

import { Icon } from '@/components/ui/Icon'
import { TextLink } from '@/components/ui/TextLink'
import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import {
  BIZNES_FIELD_MESSAGES,
  buildInquiryBody,
  checkRequired,
  linkInText,
  readOutcome,
  type FieldName,
  type FormValues,
} from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import { plural } from '@/lib/plural'

import { AreaField, ConsentField, IconField } from './fields'

type Props = {
  /** Signed "form shown at" token, issued by the server on render (`lib/inquiry/spam`). */
  formToken: string
  heading?: string | null
  note?: string | null
  /** Short promises under the button [SZEF], e.g. „Wycena na piśmie”. */
  promises?: string[]
  /** Under „Dziękujemy, zapytanie wysłane.” — the response time [SZEF]. */
  successText?: string | null
  /** „Czego potrzebujesz?” chips (K4-FINAL §5, plansza Kontakt); sent as the inquiry's topics. */
  topics?: readonly string[]
}

type Status =
  { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'failed'; message?: string }

// K4-FINAL §5: name or company, a phone (or an e-mail), the town and the message are optional.
const RULES = { phoneFirst: true, messageOptional: true, messages: BIZNES_FIELD_MESSAGES }
const FIELD_ORDER: FieldName[] = ['name', 'phone', 'email', 'message', 'consent']
const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
// A stable function: an inline ref would run again on every render and steal the focus.
const focusOnMount = (node: HTMLElement | null) => node?.focus()
const FALLBACK_SUCCESS = 'Odezwiemy się najszybciej, jak to możliwe.'

/** „Wyślij · 2 tematy” once chips are picked (plansza Kontakt). */
const sendLabel = (picked: number) =>
  picked === 0
    ? 'Wyślij zapytanie'
    : `Wyślij · ${picked} ${plural(picked, ['temat', 'tematy', 'tematów'])}`

function readValues(form: HTMLFormElement, topics: readonly string[]): FormValues {
  const data = new FormData(form)
  const text = (name: string) => String(data.get(name) ?? '')
  return {
    name: text('name'),
    company: '',
    nip: '',
    email: text('email'),
    phone: text('phone'),
    city: text('city'),
    topics,
    message: text('message'),
    consent: data.get('consent') === 'on',
    marketingConsent: false,
    website: text(HONEYPOT_FIELD),
  }
}

/**
 * Contact form of the Biznes line (K4-FINAL §5): „Imię lub firma *”, „Telefon *” (or an e-mail),
 * „Miejscowość” and „Wiadomość” optional, the topic chips where given (`/kontakt`). Home page
 * `#kontakt`, `/kontakt` and under the catalog. Sends a `contact` inquiry to
 * `POST /api/inquiry`; the server checks the same required fields.
 */
export function ContactForm({
  formToken,
  heading,
  note,
  promises = [],
  successText,
  topics = [],
}: Props) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [picked, setPicked] = useState<string[]>([])
  // A new key gives an empty form after „Wyślij kolejne”.
  const [round, setRound] = useState(0)
  const statusRef = useRef<HTMLDivElement>(null)

  function focusStatus() {
    // After React renders the message, move the focus there so screen readers announce it.
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  function showErrors(fields: Partial<Record<FieldName, string>>, form: HTMLFormElement) {
    setErrors(fields)
    const first = FIELD_ORDER.find((name) => fields[name])
    if (first) form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = readValues(form, picked)
    const missing = checkRequired(values, RULES)
    if (Object.keys(missing).length > 0) {
      setStatus({ kind: 'idle' })
      showErrors(missing, form)
      return
    }

    setErrors({})
    setStatus({ kind: 'sending' })
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildInquiryBody(values, { href: window.location.href, formToken, type: 'contact' }),
        ),
      })
      outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        RULES.messages,
      )
    } catch {
      outcome = readOutcome(0, null)
    }

    if (outcome.kind === 'sent') {
      // The success screen focuses itself when it mounts (ref below), not on a timer.
      setStatus({ kind: 'sent' })
    } else if (outcome.kind === 'invalid') {
      const failed: Status = outcome.formError
        ? { kind: 'failed', message: outcome.formError }
        : { kind: 'idle' }
      setStatus(failed)
      if (Object.keys(outcome.fields).length > 0) {
        showErrors(outcome.fields, form)
      } else {
        setErrors({})
        focusStatus()
      }
    } else {
      setStatus({ kind: 'failed', message: outcome.message })
      focusStatus()
    }
  }

  if (status.kind === 'sent') {
    return (
      <div
        ref={focusOnMount}
        tabIndex={-1}
        role="status"
        className="flex min-h-[420px] flex-col items-start justify-center gap-3.5"
      >
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-[20px] bg-ok/15 text-ok-text"
        >
          <Icon name="check" strokeWidth={2.6} className="size-8" />
        </span>
        <p className="font-display text-[28px] leading-tight font-extrabold text-ink">
          Dziękujemy, zapytanie wysłane.
        </p>
        <p className="max-w-[46ch] leading-relaxed text-ink-2">{successText || FALLBACK_SUCCESS}</p>
        <button
          type="button"
          onClick={() => {
            setStatus({ kind: 'idle' })
            setPicked([])
            setRound((value) => value + 1)
            // The button disappears with the success screen: keep the focus in the form.
            requestAnimationFrame(() => document.getElementById(fieldId('name'))?.focus())
          }}
          className="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-border-input px-5 font-bold text-ink hover:border-ink"
        >
          Wyślij kolejne
        </button>
      </div>
    )
  }

  const sending = status.kind === 'sending'
  return (
    <div className="flex flex-col gap-[18px]">
      {(heading || note) && (
        <div className="border-b border-border pb-4">
          {heading && (
            <h3 className="font-display text-[clamp(1.4rem,2vw,1.6rem)] leading-tight font-extrabold">
              {heading}
            </h3>
          )}
          {note && <p className="mt-1.5 text-sm text-ink-2">{note}</p>}
        </div>
      )}
      <form
        key={round}
        noValidate
        onSubmit={onSubmit}
        aria-busy={sending}
        className="relative flex flex-col gap-[18px]"
      >
        <noscript>
          <p className="font-bold text-ink">
            Formularz wymaga włączonego JavaScriptu. Zadzwoń albo napisz do nas. Dane są obok.
          </p>
        </noscript>
        {status.kind === 'failed' && status.message && (
          // Announced through the focus it receives; `role="alert"` would read it twice.
          <div ref={statusRef} tabIndex={-1}>
            <p className="rounded-xl border-[3px] border-border-input bg-card p-4 font-bold text-ink">
              {status.message}
            </p>
          </div>
        )}
        {topics.length > 0 && (
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2 font-bold text-ink">Czego potrzebujesz?</legend>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const on = picked.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setPicked((list) =>
                        on ? list.filter((item) => item !== topic) : [...list, topic],
                      )
                    }
                    className={
                      on
                        ? 'min-h-11 rounded-full bg-ink px-4 text-[15px] font-bold text-surface'
                        : 'min-h-11 rounded-full bg-card px-4 text-[15px] font-bold text-ink shadow-[inset_0_0_0_1.5px_var(--border-input)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]'
                    }
                  >
                    {topic}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}
        <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <IconField
            id={fieldId('name')}
            name="name"
            label="Imię lub firma"
            icon="users"
            placeholder="np. Anna Nowak"
            autoComplete="name"
            maxLength={120}
            required
            error={errors.name}
            className="sm:col-span-2"
          />
          <IconField
            id={fieldId('phone')}
            name="phone"
            type="tel"
            label="Telefon"
            icon="phone"
            placeholder="600 100 200"
            autoComplete="tel"
            maxLength={30}
            starred
            hint="Wystarczy telefon albo e-mail."
            error={errors.phone}
          />
          <IconField
            id={fieldId('email')}
            name="email"
            type="email"
            label="lub e-mail"
            icon="mail"
            placeholder="adres@firma.pl"
            autoComplete="email"
            maxLength={254}
            error={errors.email}
          />
          <IconField
            id={fieldId('city')}
            name="city"
            label="Miejscowość (opcjonalnie)"
            icon="pin"
            placeholder="np. Nowy Targ"
            autoComplete="address-level2"
            maxLength={100}
            className="sm:col-span-2"
          />
        </div>
        <AreaField
          id={fieldId('message')}
          name="message"
          label="Wiadomość (opcjonalnie)"
          placeholder="Opisz krótko firmę albo problem. Np. „Otwieramy kawiarnię w grudniu, potrzebujemy kasy i terminala”."
          maxLength={5000}
          error={errors.message}
        />
        {/* Honeypot: off-screen and out of the tab order, so only bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
          <label htmlFor={fieldId(HONEYPOT_FIELD)}>Strona internetowa</label>
          <input
            id={fieldId(HONEYPOT_FIELD)}
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ConsentField id={fieldId('consent')} error={errors.consent} className="sm:max-w-[40ch]">
            {consentClause ? (
              <>
                {consentClause.before}
                <TextLink href={PRIVACY_POLICY_PATH}>{consentClause.link}</TextLink>
                {consentClause.after}
              </>
            ) : (
              <>
                {CONSENT_CLAUSE.text}{' '}
                <TextLink href={PRIVACY_POLICY_PATH}>Polityka prywatności</TextLink>
              </>
            )}
          </ConsentField>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-text px-[26px] text-base font-bold text-accent-ink shadow-[0_18px_30px_-16px_var(--glow)] hover:bg-ink hover:text-surface disabled:opacity-70"
          >
            {sending ? 'Wysyłanie…' : sendLabel(picked.length)}
            {!sending && <Icon name="arrow" strokeWidth={2.4} className="size-4" />}
          </button>
        </div>
        {promises.length > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-ink">
            {promises.map((promise) => (
              <li key={promise} className="inline-flex items-center gap-1.5">
                <Icon name="check" strokeWidth={2.4} className="size-4 text-ok-text" />
                {promise}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  )
}
