'use client'

import { useRef, useState, type FormEvent } from 'react'

import { TextLink } from '@/components/ui/TextLink'
import {
  COMPANY_MAX,
  LIST_MAX,
  buildProcurementBody,
  checkProcurementForm,
  nipHint,
  procurementErrors,
  type ProcurementField,
  type ProcurementFormValues,
} from '@/lib/biznes/procurement/form'
import type { ProcurementPageData } from '@/lib/biznes/procurement/schema'
import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { AreaField, ConsentField, IconField } from '../forms/fields'
import { ProcIcon } from './icons'
import { NextSteps } from './parts'
import { useProcurement } from './ProcurementConfigurator'

type Form = ProcurementPageData['form']
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; company: string }
  | { kind: 'failed'; message: string }

const ORDER: ProcurementField[] = ['company', 'nip', 'phone', 'email', 'message', 'consent']
const FIELD_ID: Record<ProcurementField, string> = {
  company: 'f-firm',
  nip: 'f-nip',
  phone: 'f-tel',
  email: 'f-mail',
  message: 'f-msg',
  consent: 'f-consent',
}
const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const focusOnMount = (node: HTMLElement | null) => node?.focus()

/**
 * The procurement inquiry (ZAOPATRZENIE §7, ADR-003): company, NIP with a live checksum hint,
 * „Kim jesteś”, the count and the list (filled by „Wyślij do wyceny”), a phone or an e-mail,
 * consent. Sends a `contact` inquiry with the page's topic; the server checks the same.
 */
export function ProcurementForm({ form, formToken }: { form: Form; formToken: string }) {
  const { prefill, notify } = useProcurement()
  const [errors, setErrors] = useState<Partial<Record<ProcurementField, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [who, setWho] = useState<string[]>([])
  const [nip, setNip] = useState('')
  const statusRef = useRef<HTMLParagraphElement>(null)
  const hint = nipHint(nip)

  function show(fields: Partial<Record<ProcurementField, string>>) {
    setErrors(fields)
    const first = ORDER.find((name) => fields[name])
    if (first) document.getElementById(FIELD_ID[first])?.focus()
  }

  function pickWho(option: string) {
    setWho((list) =>
      list.includes(option)
        ? list.filter((item) => item !== option)
        : form.whoMulti
          ? [...list, option]
          : [option],
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '')
    const values: ProcurementFormValues = {
      company: text('company'),
      nip,
      who,
      count: text('count'),
      city: text('city'),
      phone: text('phone'),
      email: text('email'),
      when: text('when'),
      message: text('message'),
      consent: data.get('consent') === 'on',
      website: text(HONEYPOT_FIELD),
    }
    const missing = checkProcurementForm(values)
    if (Object.keys(missing).length > 0) {
      setStatus({ kind: 'idle' })
      show(missing)
      notify('Uzupełnij zaznaczone pola')
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
          buildProcurementBody(values, {
            href: window.location.href,
            formToken,
            topic: form.topic,
            whoLabel: form.whoLabel,
            countLabel: form.countLabel,
          }),
        ),
      })
      outcome = readOutcome(response.status, await response.json().catch(() => null))
    } catch {
      outcome = readOutcome(0, null)
    }
    if (outcome.kind === 'sent') {
      setStatus({ kind: 'sent', company: values.company.trim() })
      return
    }
    const fields = outcome.kind === 'invalid' ? procurementErrors(outcome.fields) : {}
    const message = outcome.kind === 'error' ? outcome.message : outcome.formError
    setStatus(message ? { kind: 'failed', message } : { kind: 'idle' })
    if (Object.keys(fields).length > 0) show(fields)
    else requestAnimationFrame(() => statusRef.current?.focus())
  }

  if (status.kind === 'sent') {
    return (
      <div ref={focusOnMount} tabIndex={-1} role="status" className="zp-done">
        <span className="zp-done-ok" aria-hidden="true">
          <ProcIcon name="check" />
        </span>
        <h3>Dziękujemy, {status.company}!</h3>
        <p>Zapytanie jest u nas.{form.next?.length ? ' Co dalej:' : ''}</p>
        <NextSteps next={form.next} className="zp-done-next" />
      </div>
    )
  }

  const sending = status.kind === 'sending'
  return (
    <form noValidate onSubmit={onSubmit} aria-busy={sending} className="zp-form">
      <noscript>
        <p className="zp-fld-w">
          Formularz wymaga włączonego JavaScriptu. Zadzwoń albo napisz do nas — dane są obok.
        </p>
      </noscript>
      <IconField
        id="f-firm"
        name="company"
        label="Nazwa firmy"
        autoComplete="organization"
        maxLength={COMPANY_MAX}
        required
        error={errors.company}
      />
      <IconField
        id="f-nip"
        name="nip"
        label="NIP"
        inputMode="numeric"
        maxLength={13}
        required
        value={nip}
        onChange={(event) => setNip(event.target.value)}
        hint={hint.text}
        error={errors.nip}
        className={`zp-nip is-${hint.tone}`}
      />
      <fieldset className="zp-fld-w">
        <legend className="zp-legend-who">{form.whoLabel}</legend>
        <div className="zp-chips">
          {form.who.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={who.includes(option)}
              onClick={() => pickWho(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
      <IconField
        key={`cnt-${prefill?.key ?? 0}`}
        id="f-cnt"
        name="count"
        label={form.countLabel}
        inputMode="numeric"
        maxLength={6}
        defaultValue={prefill ? String(prefill.count) : ''}
      />
      <IconField
        id="f-city"
        name="city"
        label="Miejscowość dostawy"
        autoComplete="address-level2"
        maxLength={100}
      />
      <IconField
        id="f-tel"
        name="phone"
        type="tel"
        label="Telefon"
        autoComplete="tel"
        maxLength={30}
        starred
        hint="Wystarczy telefon albo e-mail."
        error={errors.phone}
      />
      <IconField
        id="f-mail"
        name="email"
        type="email"
        label="lub e-mail"
        autoComplete="email"
        maxLength={254}
        error={errors.email}
      />
      {form.deadlines && form.deadlines.length > 0 && (
        <div className="zp-fld-w">
          <label htmlFor="f-when" className="zp-flabel">
            {form.deadlineLabel ?? 'Planowany termin'}
          </label>
          <select id="f-when" name="when" className="zp-select" defaultValue="">
            <option value="">Wybierz (opcjonalnie)</option>
            {form.deadlines.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      )}
      <AreaField
        key={`msg-${prefill?.key ?? 0}`}
        id="f-msg"
        name="message"
        label={form.messageLabel}
        maxLength={LIST_MAX}
        defaultValue={prefill?.message ?? ''}
        error={errors.message}
        className="zp-fld-w"
      />
      <div aria-hidden="true" className="zp-hp">
        <label htmlFor="f-website">Strona internetowa</label>
        <input id="f-website" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      <ConsentField id="f-consent" error={errors.consent} className="zp-fld-w">
        {consentClause ? (
          <>
            {consentClause.before}
            <TextLink href={PRIVACY_POLICY_PATH}>{consentClause.link}</TextLink>
            {consentClause.after}
          </>
        ) : (
          CONSENT_CLAUSE.text
        )}
      </ConsentField>
      {status.kind === 'failed' && (
        <p ref={statusRef} tabIndex={-1} className="zp-form-error zp-fld-w">
          {status.message}
        </p>
      )}
      <div className="zp-send zp-fld-w">
        <small>Temat: {form.topic} · tylko dla firm z NIP</small>
        <button type="submit" className="zp-btn zp-btn-blue" disabled={sending}>
          {sending ? 'Wysyłanie…' : 'Wyślij zapytanie'}
          {!sending && <ProcIcon name="arrow" />}
        </button>
      </div>
    </form>
  )
}
