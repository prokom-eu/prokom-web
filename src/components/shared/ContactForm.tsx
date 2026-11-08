'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react'

import { cx } from '@/components/ui/cx'
import { TextAreaField, TextField } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { buildInquiryBody, readOutcome } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import {
  checkContactForm,
  listPart,
  serverMessages,
  sharedRulesFor,
  toFormFields,
  toInquiryValues,
  type SharedField,
  type SharedFormValues,
  type SharedRules,
} from '@/lib/shared/contactForm'
import type { Line } from '@/lib/tenant/lines'
import { topicFromSearch } from '@/lib/shared/contactTopic'
import { MESSAGE_MAX } from '@/lib/inquiry/limits'
import {
  collectAttachments,
  subscribeFormAttachments,
  withAttachments,
} from '@/lib/shared/formAttachment'
import { PHRASE_PARAM } from '@/lib/shared/search/provider'
import { findZone, zoneLabel, type ServiceZone } from '@/lib/shared/zones'

import { ConsentField, type ConsentMode } from './ConsentField'
import { SuccessPanel, type NextStep } from './SuccessPanel'

export type ContactFormProps = {
  /** Signed form time from the page (`issueFormToken`, ADR-003). */
  formToken: string
  /** Topic chips of the line (`shared.contact.topics`); the pick becomes the inquiry's subject. */
  topics?: readonly string[]
  /** Message placeholder of the line (`shared.contact.placeholder`). */
  placeholder?: string | null
  /** Button text (`shared.contact.sendLabel`). */
  sendLabel?: string | null
  /** Under the button with a tick (`shared.responsePromise`). */
  responsePromise?: string | null
  consent: { mode: ConsentMode; text: string; privacyHref: string }
  /** Zones for the town hint (`CompanyData.serviceZones`). */
  zones: readonly ServiceZone[]
  nextSteps?: readonly NextStep[]
  /** The site's line: its rules are the server's (`sharedRulesFor`) — Instalacje a phone, Biznes no message. */
  line: Line
  /** Slot above the fields, e.g. Software „Twój projekt” (spec §6.0 `formPrefill`). */
  prefill?: ReactNode
}

const EMPTY: SharedFormValues = {
  topic: null,
  name: '',
  contact: '',
  city: '',
  message: '',
  consent: false,
  website: '',
}

const FIELD_ORDER: SharedField[] = ['name', 'contact', 'message', 'consent']
const FIELD_LABEL: Record<SharedField, string> = {
  name: 'Imię i firma',
  contact: 'Telefon lub e-mail',
  message: 'Wiadomość',
  consent: 'Zgoda',
}

/**
 * The contact form of every line (spec §5 `ContactForm`, ADR-003): topic chips → name and company
 * → phone or e-mail (one field, recognised) → town with the zone hint → message → consent → send.
 * Errors: a list on top (`role="alert"`, links to the fields), the message under each field and
 * `aria-invalid`. Success: the number, the e-mail confirmation, next steps, „Wyślij kolejne”.
 * Saved through `POST /api/inquiry` (type `contact`, the tenant from the domain, the topic as the
 * subject); honeypot, signed time and the rate limit as in every form. `?fraza=` fills the message,
 * `?temat=` picks the topic; parts a line registers (`registerFormAttachment`) join the message.
 */
export function ContactForm({
  formToken,
  topics = [],
  placeholder,
  sendLabel,
  responsePromise,
  consent,
  zones,
  nextSteps,
  line,
  prefill,
}: ContactFormProps) {
  const id = useId()
  const fid = (name: string) => `${id}-${name}`
  // The rules at sending: a list attached by the line makes the message optional (as the server).
  const rulesFor = (itemCount: number): SharedRules => ({
    ...sharedRulesFor(line, itemCount),
    consentMode: consent.mode,
  })
  // Items the line attaches now (Software „Twój projekt”): the label says „(opcjonalnie)” with
  // them, as the check at sending and the server do. None on the server render.
  const attachedItems = useSyncExternalStore(
    subscribeFormAttachments,
    () => collectAttachments().items.length,
    () => 0,
  )
  const sharedRules = rulesFor(attachedItems)
  const [values, setValues] = useState<SharedFormValues>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<SharedField, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<{ number: string | null; email: boolean } | null>(null)
  // One request at a time: a double click in the same frame must not send twice.
  const lock = useRef(false)
  const summary = useRef<HTMLDivElement>(null)
  const nameField = useRef<HTMLInputElement>(null)

  // „Zapytaj o …” of the search (`?fraza=`, ADR-022 D2-2b): the phrase starts the message;
  // „Z czym dzwonisz?” (`?temat=`, plan 0611 §8.2) picks the topic chip, when the line has it.
  // Read once on mount: the topics are props of the page (`shared.contact.topics`).
  const topicList = useRef(topics)
  useEffect(() => {
    const search = window.location.search
    const phrase = new URLSearchParams(search).get(PHRASE_PARAM)?.trim()
    const topic = topicFromSearch(search, topicList.current)
    if (!phrase && !topic) return
    const timer = window.setTimeout(
      () =>
        setValues((current) => ({
          ...current,
          ...(phrase && !current.message && { message: phrase }),
          ...(topic && !current.topic && { topic }),
        })),
      0,
    )
    return () => window.clearTimeout(timer)
  }, [])

  const set = <K extends keyof SharedFormValues>(key: K, value: SharedFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const showErrors = (
    next: Partial<Record<SharedField, string>>,
    message: string | null = null,
  ) => {
    setErrors(next)
    setFormError(message)
    // Focus the summary, so the list is read out and its links lead to the fields.
    window.setTimeout(() => summary.current?.focus(), 0)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (lock.current) return
    const attached = collectAttachments()
    const rules = rulesFor(attached.items.length)
    const found = checkContactForm(values, rules)
    if (Object.keys(found).length) return showErrors(found)
    lock.current = true
    setSending(true)
    const message = withAttachments(values.message, attached.texts)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The line's attachments (Biznes: the inquiry list) go under the message; its items
          // (Software „Twój projekt”) make the inquiry a list.
          ...buildInquiryBody(toInquiryValues({ ...values, message }), {
            href: window.location.href,
            formToken,
            category: values.topic,
          }),
          ...listPart(attached.items),
        }),
      })
      const outcome = readOutcome(
        response.status,
        await response.json().catch(() => null),
        serverMessages(rules),
      )
      if (outcome.kind === 'sent') {
        // The line's parts that went out whole (Biznes then empties its list).
        attached.sent(message)
        setSent({ number: outcome.number, email: values.contact.includes('@') })
        setErrors({})
        setFormError(null)
      } else if (outcome.kind === 'invalid') {
        showErrors(toFormFields(outcome.fields), outcome.formError ?? null)
      } else {
        showErrors({}, outcome.message)
      }
    } catch {
      showErrors({}, 'Nie udało się wysłać wiadomości. Sprawdź połączenie i spróbuj ponownie.')
    } finally {
      lock.current = false
      setSending(false)
    }
  }

  if (sent) {
    return (
      <SuccessPanel
        number={sent.number}
        emailSent={sent.email}
        nextSteps={nextSteps}
        onAgain={() => {
          setValues(EMPTY)
          setSent(null)
          window.setTimeout(() => nameField.current?.focus(), 0)
        }}
      />
    )
  }

  const zone = values.city.trim() ? findZone(zones, values.city) : null
  const listed = FIELD_ORDER.filter((field) => errors[field])
  const hasSummary = listed.length > 0 || formError

  return (
    <form noValidate onSubmit={submit} className="cform flex flex-col gap-5" data-contact-form>
      <div ref={summary} tabIndex={-1} className="outline-none">
        {hasSummary && (
          <div
            role="alert"
            className="rounded-2xl border-[3px] border-ink bg-card p-4"
            data-error-summary
          >
            <p className="font-bold">
              {listed.length ? 'Popraw, proszę, zaznaczone pola:' : formError}
            </p>
            {listed.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {listed.map((field) => (
                  <li key={field}>
                    <a href={`#${fid(field)}`} className="underline underline-offset-2">
                      {FIELD_LABEL[field]}: {errors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {listed.length > 0 && formError && <p className="mt-2">{formError}</p>}
          </div>
        )}
      </div>

      {prefill}

      {topics.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">
            Temat <span className="font-normal text-ink-2">(opcjonalnie)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => {
              const on = values.topic === topic
              return (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set('topic', on ? null : topic)}
                  className={cx(
                    'min-h-11 rounded-full border-[1.5px] px-4 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                    on
                      ? 'border-accent-text bg-accent-soft text-accent-text'
                      : 'border-border-input bg-card text-ink',
                  )}
                >
                  {topic}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <TextField
        ref={nameField}
        id={fid('name')}
        label="Imię i firma"
        autoComplete="name"
        value={values.name}
        onChange={(event) => set('name', event.target.value)}
        error={errors.name}
        required
      />
      <TextField
        id={fid('contact')}
        label="Telefon lub e-mail"
        hint={
          sharedRules.phoneRequired
            ? 'Oddzwonimy, żeby umówić wizytę.'
            : 'Wystarczy jedno — oddzwonimy albo odpiszemy.'
        }
        autoComplete={values.contact.includes('@') ? 'email' : 'tel'}
        inputMode={values.contact.includes('@') || /[a-z]/i.test(values.contact) ? 'email' : 'tel'}
        value={values.contact}
        onChange={(event) => set('contact', event.target.value)}
        error={errors.contact}
        maxLength={254}
        required
      />
      <div>
        <TextField
          id={fid('city')}
          label="Miejscowość"
          note="(opcjonalnie)"
          autoComplete="address-level2"
          value={values.city}
          onChange={(event) => set('city', event.target.value)}
          // The zone hint is this field's only description (no hint or error of its own).
          aria-describedby={zone ? `${fid('city')}-zone` : undefined}
        />
        <p
          id={`${fid('city')}-zone`}
          aria-live="polite"
          className="mt-1.5 min-h-5 text-sm font-semibold text-accent-text"
        >
          {zone ? zoneLabel(zone) : ''}
        </p>
      </div>
      <TextAreaField
        id={fid('message')}
        label="Wiadomość"
        note={sharedRules.messageOptional ? '(opcjonalnie)' : undefined}
        placeholder={placeholder ?? undefined}
        value={values.message}
        onChange={(event) => set('message', event.target.value)}
        error={errors.message}
        maxLength={MESSAGE_MAX}
      />
      <ConsentField
        id={fid('consent')}
        mode={consent.mode}
        text={consent.text}
        privacyHref={consent.privacyHref}
        checked={values.consent}
        onChange={(checked) => set('consent', checked)}
        error={errors.consent}
      />
      {/* Honeypot: off-screen for people, filled in by bots (ADR-003). */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={fid(HONEYPOT_FIELD)}>Strona internetowa</label>
        <input
          id={fid(HONEYPOT_FIELD)}
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => set('website', event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-button px-6 text-base font-extrabold text-accent-ink disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          {sending ? 'Wysyłamy…' : sendLabel || 'Wyślij wiadomość'}
          <Icon name="arrow" strokeWidth={2.2} className="size-5" />
        </button>
        {responsePromise && (
          <p className="flex items-center gap-2 text-sm text-ink-2">
            <Icon name="check" strokeWidth={2.4} className="size-4 text-ok-text" />
            {responsePromise}
          </p>
        )}
      </div>
    </form>
  )
}
