'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

import { Icon } from '@/components/ui/Icon'
import { TextLink } from '@/components/ui/TextLink'
import type { Cart } from '@/lib/cart/cart'
import { cartActions } from '@/lib/cart/store'
import {
  CONSENT_CLAUSE,
  INQUIRY_ADMIN_NOTE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import {
  buildWizardInquiryBody,
  checkWizardRequired,
  WIZARD_FIELD_MESSAGES,
  type WizardContact,
  type WizardFieldName,
} from '@/lib/inquiry/wizardForm'
import { plural } from '@/lib/plural'

import { AreaField, ConsentField, IconField } from '../forms/fields'

const FIELD_ORDER: WizardFieldName[] = ['name', 'phone', 'email', 'message', 'consent']
const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const ITEMS: [string, string, string] = ['pozycja', 'pozycje', 'pozycji']

function readValues(form: HTMLFormElement): WizardContact {
  const data = new FormData(form)
  const text = (name: string) => String(data.get(name) ?? '')
  return {
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    message: text('message'),
    consent: data.get('consent') === 'on',
    website: text(HONEYPOT_FIELD),
  }
}

/**
 * „Wyślij zapytanie” on the result of Konfigurator 3.0 (board `Web-Kreator-wynik`, K4-FINAL §5):
 * the profile goes with it automatically (`kr`), the list only holds what the customer chose —
 * „Nie musisz nic wybierać”. A phone or an e-mail is enough.
 */
export function ConfiguratorForm({
  id: formId,
  formToken,
  kr,
  cart,
  callbackTime,
  onRestart,
}: {
  id: string
  formToken: string
  kr: string
  cart: Cart
  callbackTime: string | null
  onRestart: () => void
}) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const [errors, setErrors] = useState<Partial<Record<WizardFieldName, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  function showErrors(fields: Partial<Record<WizardFieldName, string>>, form: HTMLFormElement) {
    setErrors(fields)
    const field = FIELD_ORDER.find((name) => fields[name])
    if (field) form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(field))}`)?.focus()
    else requestAnimationFrame(() => statusRef.current?.focus())
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = readValues(form)
    const missing = checkWizardRequired(values)
    setFormError(null)
    if (Object.keys(missing).length > 0) {
      showErrors(missing, form)
      return
    }
    setErrors({})
    setSending(true)
    let outcome
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildWizardInquiryBody(values, { href: window.location.href, formToken, kr, cart }),
        ),
      })
      outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        WIZARD_FIELD_MESSAGES,
      )
    } catch {
      outcome = readOutcome(0, null, WIZARD_FIELD_MESSAGES)
    }
    setSending(false)
    if (outcome.kind === 'sent') {
      // The list went with the inquiry.
      cartActions.clear()
      setSent(true)
      requestAnimationFrame(() => doneRef.current?.focus())
      return
    }
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    const general =
      outcome.kind === 'error'
        ? outcome.message
        : (outcome.formError ?? fields.wizard ?? fields.items ?? null)
    setFormError(general)
    if (Object.keys(fields).some((name) => FIELD_ORDER.includes(name as WizardFieldName))) {
      showErrors(fields, form)
    } else {
      setErrors({})
      requestAnimationFrame(() => statusRef.current?.focus())
    }
  }

  if (sent) {
    return (
      <div ref={doneRef} tabIndex={-1} id={formId} className="flex flex-col gap-3 outline-none">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-ok-text text-white">
          <Icon name="check" strokeWidth={2.6} className="size-6" />
        </span>
        <h2 className="font-display text-[20px] font-extrabold text-ink">Zapytanie wysłane</h2>
        <p className="text-[14.5px] text-ink-2">
          Dziękujemy!{' '}
          {callbackTime ? `${callbackTime} w godzinach pracy` : 'Odezwiemy się w godzinach pracy'} i
          przygotujemy ofertę na piśmie.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 font-extrabold text-ink hover:bg-surface-2"
        >
          Zacznij od nowa
        </button>
      </div>
    )
  }

  return (
    <form
      id={formId}
      noValidate
      onSubmit={onSubmit}
      aria-busy={sending}
      aria-labelledby={`${id}-h`}
      className="relative flex flex-col gap-3.5"
    >
      <div>
        <h2 id={`${id}-h`} className="font-display text-[19px] font-extrabold text-ink">
          Wyślij zapytanie
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-2">
          Opis firmy i potrzeb dołączymy automatycznie. Wycena bez zobowiązań, na piśmie.
        </p>
      </div>
      <div className="rounded-xl bg-surface-2 px-3.5 py-3 text-[13.5px]">
        {cart.length > 0 ? (
          <p className="font-bold text-ink">
            W zapytaniu: {cart.length} {plural(cart.length, ITEMS)}
          </p>
        ) : (
          <>
            <p className="font-bold text-ink">Nic jeszcze nie wybrano</p>
            <p className="text-ink-2">
              Nie musisz nic wybierać — dobierzemy sami na podstawie opisu.
            </p>
          </>
        )}
      </div>
      {formError && (
        // Announced through the focus it receives; `role="alert"` would read it twice.
        <div ref={statusRef} tabIndex={-1}>
          <p className="rounded-xl border-[3px] border-border-input bg-card p-4 font-bold text-ink">
            {formError}
          </p>
        </div>
      )}
      <IconField
        id={fieldId('name')}
        name="name"
        label="Imię lub firma"
        placeholder="np. Anna Nowak"
        autoComplete="name"
        maxLength={120}
        required
        error={errors.name}
      />
      <IconField
        id={fieldId('phone')}
        name="phone"
        type="tel"
        label="Telefon"
        placeholder="np. 600 100 200"
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
        placeholder="np. anna@firma.pl"
        autoComplete="email"
        maxLength={254}
        error={errors.email}
      />
      <AreaField
        id={fieldId('message')}
        name="message"
        label="Dodatkowe informacje"
        placeholder="Np. termin otwarcia, liczba pomieszczeń"
        rows={3}
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
      <ConsentField id={fieldId('consent')} error={errors.consent}>
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
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-accent-text px-6 font-extrabold text-accent-ink hover:bg-ink hover:text-surface disabled:opacity-70"
      >
        {sending ? 'Wysyłanie…' : 'Wyślij zapytanie'}
        {!sending && <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />}
      </button>
      <p className="text-[12.5px] leading-[1.45] text-ink-2">
        {callbackTime ? `${callbackTime} w godzinach pracy. ` : ''}
        {INQUIRY_ADMIN_NOTE}
      </p>
    </form>
  )
}
