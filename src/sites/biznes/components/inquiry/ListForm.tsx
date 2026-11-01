'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

import { Icon } from '@/components/ui/Icon'
import { TextLink } from '@/components/ui/TextLink'
import { cx } from '@/components/ui/cx'
import type { Cart } from '@/lib/cart/cart'
import {
  CONSENT_CLAUSE,
  INQUIRY_ADMIN_NOTE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import {
  buildListInquiryBody,
  checkListRequired,
  LIST_DEADLINES,
  LIST_FIELD_MESSAGES,
  listInquiryType,
  type ListFieldName,
  type ListFormValues,
} from '@/lib/inquiry/listForm'
import {
  PREFERRED_CONTACT_LABELS,
  PREFERRED_CONTACTS,
  type PreferredContact,
} from '@/lib/inquiry/types'

import { plural } from '@/lib/plural'

import { AreaField, ChoiceField, ConsentField, IconField } from '../forms/fields'
import { STICKY_ACTION_BUTTON, StickyAction } from '../mobile/StickyAction'

type Props = {
  formToken: string
  cart: Cart
  /** „Zapytaj o X” from the search, or `null`. */
  phrase: string | null
  /** Short promises under the button [SZEF from the panel where they hold a promise]. */
  promises?: string[]
  /** `phoned`: a phone was given, so the answer is a call (else an e-mail). */
  onSent: (sent: { number: string | null; emailed: boolean; phoned: boolean }) => void
  /**
   * The drawer (K4-FINAL §5): only „Imię lub firma”, phone or e-mail, message and consent;
   * `/zapytanie` adds company, city, the preferred contact and the deadline.
   */
  compact?: boolean
}

const FIELD_ORDER: ListFieldName[] = [
  'name',
  'phone',
  'email',
  'company',
  'city',
  'message',
  'consent',
]
const CONTACT_HINT = 'Wystarczy telefon albo e-mail.'
const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)
const CONTACT_OPTIONS = PREFERRED_CONTACTS.map((value) => ({
  value,
  label: PREFERRED_CONTACT_LABELS[value],
}))
const DEADLINE_OPTIONS = LIST_DEADLINES.map((value) => ({ value, label: value }))

function readValues(form: HTMLFormElement): ListFormValues {
  const data = new FormData(form)
  const text = (name: string) => String(data.get(name) ?? '')
  return {
    name: text('name'),
    phone: text('phone'),
    company: text('company'),
    city: text('city'),
    email: text('email'),
    // The drawer has no choice: phone by default, e-mail when only an e-mail is given
    // (`buildListInquiryBody`).
    preferredContact: (text('preferredContact') || 'phone') as PreferredContact,
    deadline: text('deadline'),
    message: text('message'),
    consent: data.get('consent') === 'on',
    website: text(HONEYPOT_FIELD),
  }
}

/** „Wyślij zapytanie (3 pozycje)” — the count of the board, without it for an empty list. */
function buttonLabel(count: number): string {
  if (count === 0) return 'Wyślij zapytanie'
  return `Wyślij zapytanie (${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])})`
}

/** The phone's sticky button (K4-FINAL §7): „Wyślij zapytanie · 2 poz.”. */
function barLabel(count: number): string {
  return count === 0 ? 'Wyślij zapytanie' : `Wyślij zapytanie · ${count} poz.`
}

/**
 * Inquiry form of the drawer and of `/zapytanie` (K4-FINAL §5, spec. §6.3): sends the list,
 * a „Zapytaj o X” phrase or — with nothing else — a plain contact (`lib/inquiry/listForm`).
 * A phone or an e-mail is enough.
 */
export function ListForm({
  formToken,
  cart,
  phrase,
  promises = [],
  onSent,
  compact = false,
}: Props) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const [errors, setErrors] = useState<Partial<Record<ListFieldName, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const type = listInquiryType(cart.length, phrase)

  function showErrors(fields: Partial<Record<ListFieldName, string>>, form: HTMLFormElement) {
    setErrors(fields)
    const first = FIELD_ORDER.find((name) => fields[name])
    if (first) {
      form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
    } else {
      // `items` (a stale list) has no field: the message above the form takes the focus.
      requestAnimationFrame(() => statusRef.current?.focus())
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = readValues(form)
    const missing = checkListRequired(values, type)
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
          buildListInquiryBody(values, { href: window.location.href, formToken, cart, phrase }),
        ),
      })
      outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        LIST_FIELD_MESSAGES,
      )
    } catch {
      outcome = readOutcome(0, null, LIST_FIELD_MESSAGES)
    }
    setSending(false)

    if (outcome.kind === 'sent') {
      onSent({
        number: outcome.number,
        emailed: values.email.trim() !== '',
        phoned: values.phone.trim() !== '',
      })
      return
    }
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    const general =
      outcome.kind === 'error'
        ? outcome.message
        : (outcome.formError ?? fields.items ?? fields.topics ?? null)
    setFormError(general)
    if (Object.keys(fields).some((name) => FIELD_ORDER.includes(name as ListFieldName))) {
      showErrors(fields, form)
    } else {
      setErrors({})
      requestAnimationFrame(() => statusRef.current?.focus())
    }
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={sending}
      className={cx('relative flex flex-col gap-3.5', !compact && 'px-6 py-[22px]')}
    >
      <noscript>
        <p className="font-bold text-ink">
          Formularz wymaga włączonego JavaScriptu. Zadzwoń do nas — numer jest w nagłówku strony.
        </p>
      </noscript>
      {formError && (
        // Announced through the focus it receives; `role="alert"` would read it twice.
        <div ref={statusRef} tabIndex={-1}>
          <p className="rounded-xl border-[3px] border-border-input bg-card p-4 font-bold text-ink">
            {formError}
          </p>
        </div>
      )}
      <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
        <IconField
          id={fieldId('name')}
          name="name"
          label="Imię lub firma"
          placeholder="np. Anna Nowak, Kawiarnia Pod Turbaczem"
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
          placeholder="np. 600 100 200"
          autoComplete="tel"
          maxLength={30}
          starred
          hint={CONTACT_HINT}
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
        {!compact && (
          <>
            <IconField
              id={fieldId('company')}
              name="company"
              label="Firma / NIP"
              autoComplete="organization"
              maxLength={200}
              error={errors.company}
            />
            <IconField
              id={fieldId('city')}
              name="city"
              label="Miejscowość"
              autoComplete="address-level2"
              maxLength={100}
              error={errors.city}
            />
          </>
        )}
      </div>
      {!compact && (
        <>
          <ChoiceField
            name="preferredContact"
            legend="Jak się skontaktować?"
            options={CONTACT_OPTIONS}
            defaultValue="phone"
          />
          <ChoiceField
            name="deadline"
            legend="Na kiedy?"
            options={DEADLINE_OPTIONS}
            defaultValue="W tym miesiącu"
          />
        </>
      )}
      <AreaField
        id={fieldId('message')}
        name="message"
        label={type === 'contact' ? 'Czego potrzebujesz?' : 'Wiadomość (opcjonalnie)'}
        placeholder="Np. liczba stanowisk, termin otwarcia, co już masz"
        rows={compact ? 3 : 5}
        maxLength={5000}
        required={type === 'contact'}
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
        className={cx(
          'inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-accent-text px-6 text-base font-bold text-accent-ink shadow-[0_18px_30px_-16px_var(--glow)] hover:bg-ink hover:text-surface disabled:opacity-70',
          // The page form sends from the sticky bar on a phone.
          !compact && 'max-md:hidden',
        )}
      >
        {sending ? 'Wysyłanie…' : buttonLabel(cart.length)}
        {!sending && <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />}
      </button>
      <p className="text-[13px] leading-[1.45] text-ink-2">{INQUIRY_ADMIN_NOTE}</p>
      {!compact && promises.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-border pt-3.5 text-sm text-ink-2">
          {promises.map((promise) => (
            <li key={promise} className="flex items-center gap-2.5">
              <Icon name="check" strokeWidth={2.6} className="size-[17px] text-ok-text" />
              {promise}
            </li>
          ))}
        </ul>
      )}
      {/* Phone, the page form only (MOBILE-APLIKACJA §1): the send button sticks to the bottom
          (inside the form, so it runs the same checks) and replaces the one above. */}
      {!compact && (
        <StickyAction>
          <button type="submit" disabled={sending} className={STICKY_ACTION_BUTTON}>
            {sending ? 'Wysyłanie…' : barLabel(cart.length)}
          </button>
        </StickyAction>
      )}
    </form>
  )
}
