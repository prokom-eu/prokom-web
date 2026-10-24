'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { TextLink } from '@/components/ui/TextLink'
import { cartActions } from '@/lib/cart/store'
import type { BusinessTypeId, Wizard } from '@/lib/catalog/wizard'
import {
  buildKit,
  defaultAnswers,
  type KitProduct,
  type WizardAnswers,
} from '@/lib/catalog/wizardKit'
import {
  CONSENT_CLAUSE,
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
import { WizardIcon } from './WizardIcon'
import { TONE_GRADIENT, WizardSummary } from './WizardSummary'

type Props = {
  rules: Wizard
  /** Published products of this site the rules propose (catalog index). */
  products: KitProduct[]
  /** `?firma=` of an industry page, already checked against the rules. */
  initialType: BusinessTypeId | null
  formToken: string
  phone: { label: string; href: string } | null
  /** `SiteSettings.biznes.promises.callbackTime` — only from the panel [SZEF]. */
  callbackTime: string | null
}

const FIELD_ORDER: WizardFieldName[] = ['name', 'phone', 'city', 'message', 'consent']
const consentClause = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

const BUTTON =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 font-extrabold transition-colors'
const PRIMARY = `${BUTTON} bg-accent-text text-accent-ink shadow-[0_14px_30px_-14px_var(--accent-text)] hover:bg-ink hover:text-surface disabled:opacity-70`
const SECONDARY = `${BUTTON} bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]`
const TILE =
  'relative flex h-full w-full flex-col items-start gap-2 rounded-[22px] bg-card p-4 text-left shadow-[inset_0_0_0_1.5px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]'
const CHOSEN = 'shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_2px_var(--accent-text)]'

function readContact(form: HTMLFormElement): WizardContact {
  const data = new FormData(form)
  const text = (name: string) => String(data.get(name) ?? '')
  return {
    name: text('name'),
    phone: text('phone'),
    city: text('city'),
    message: text('message'),
    consent: data.get('consent') === 'on',
    website: text(HONEYPOT_FIELD),
  }
}

/** Chips of one answer (board: „Ile stanowisk sprzedaży?”): radio buttons in a fieldset. */
function Chips({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: { value: string; label: string; caption?: string }[]
  value: string | undefined
  onChange: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-extrabold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-12 flex-col justify-center rounded-2xl bg-surface-2 px-4 py-2 text-[15px] font-bold text-ink-2 transition-colors peer-checked:bg-card peer-checked:text-accent-text peer-checked:shadow-[inset_0_0_0_2px_var(--accent-text)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-text hover:text-ink">
              {option.label}
              {option.caption && (
                <span className="text-[13px] font-semibold text-ink-3">{option.caption}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/**
 * The offer wizard `/kreator` (spec. §6.8, board `Kreator`): business type → scale → needs →
 * contact, with the live kit beside. Rules are data (`BiznesSettings.wizard`); the server
 * computes the same kit again from the answers when they are sent (B10c).
 */
export function WizardFlow({
  rules,
  products,
  initialType,
  formToken,
  phone,
  callbackTime,
}: Props) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const lookup = useMemo(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]))
    return (slug: string) => bySlug.get(slug)
  }, [products])
  const [answers, setAnswers] = useState<WizardAnswers | null>(() =>
    initialType ? defaultAnswers(rules, initialType) : null,
  )
  const [step, setStep] = useState(initialType ? 1 : 0)
  const [sent, setSent] = useState<{ number: string | null } | null>(null)
  const [inList, setInList] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<WizardFieldName, string>>>({})
  // What was typed in the last step survives „Wstecz” (the step is unmounted meanwhile).
  const [contact, setContact] = useState<Partial<WizardContact>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const moved = useRef(false)

  const kit = answers ? buildKit(rules, answers, lookup) : null
  const type = answers ? rules.businessTypes.find((item) => item.id === answers.businessType) : null
  const typeName = type?.name ?? ''

  // A new step (or the success screen) moves the focus to its heading, as a new page would.
  useEffect(() => {
    if (!moved.current) return
    headingRef.current?.focus()
  }, [step, sent])

  const go = (next: number) => {
    moved.current = true
    setStep(next)
  }
  const change = (patch: Partial<WizardAnswers>) =>
    setAnswers((current) => (current ? { ...current, ...patch } : current))

  function pickType(typeId: BusinessTypeId) {
    setAnswers((current) =>
      current?.businessType === typeId
        ? current
        : { ...defaultAnswers(rules, typeId), when: current?.when },
    )
    go(1)
  }

  function toggleNeed(needId: string) {
    setAnswers((current) => {
      if (!current) return current
      const needs = current.needs.includes(needId)
        ? current.needs.filter((item) => item !== needId)
        : [...current.needs, needId]
      return { ...current, needs }
    })
  }

  function restart() {
    moved.current = true
    setAnswers(null)
    setSent(null)
    setInList(false)
    setStep(0)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!answers) return
    const form = event.currentTarget
    const values = readContact(form)
    const missing = checkWizardRequired(values)
    setFormError(null)
    if (Object.keys(missing).length > 0) {
      setErrors(missing)
      const first = FIELD_ORDER.find((name) => missing[name])
      if (first) form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
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
          buildWizardInquiryBody(values, { href: window.location.href, formToken, answers }),
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
      moved.current = true
      setSent({ number: outcome.number })
      return
    }
    const fields = outcome.kind === 'invalid' ? outcome.fields : {}
    setFormError(
      outcome.kind === 'error' ? outcome.message : (outcome.formError ?? fields.wizard ?? null),
    )
    const first = FIELD_ORDER.find((name) => fields[name])
    setErrors(fields)
    if (first) form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
    else requestAnimationFrame(() => statusRef.current?.focus())
  }

  const kitSlugs = (kit?.items ?? []).flatMap((item) => (item.slug ? [item.slug] : []))
  const count = kit?.items.length ?? 0
  const callback = callbackTime?.trim() || 'Oddzwonimy'

  const heading = (eyebrow: ReactNode, children: ReactNode) => (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2.5 text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase">
        {eyebrow}
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-110% focus:outline-none"
      >
        {children}
      </h1>
    </div>
  )
  const stepBadge = (n: number) => (
    <span
      aria-hidden="true"
      className="flex size-6 items-center justify-center rounded-md bg-accent-text text-xs text-accent-ink"
    >
      {n}
    </span>
  )
  const nav = (back: number, next?: ReactNode) => (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <button type="button" onClick={() => go(back)} className={SECONDARY}>
        Wstecz
      </button>
      {next}
    </div>
  )

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12">
      <div className="flex flex-col gap-8">
        {!sent && (
          <ol aria-label="Kroki kreatora" className="flex flex-wrap items-center gap-2">
            {rules.steps.map((name, position) => {
              const state = position < step ? 'done' : position === step ? 'current' : 'next'
              return (
                <li
                  key={name}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={cx(
                    'inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold',
                    state === 'current'
                      ? 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)]'
                      : 'text-ink-2',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'flex size-6 items-center justify-center rounded-full text-xs',
                      state === 'next'
                        ? 'bg-surface-2 text-ink-2'
                        : 'bg-accent-text text-accent-ink',
                    )}
                  >
                    {state === 'done' ? (
                      <Icon name="check" strokeWidth={3} className="size-3.5" />
                    ) : (
                      position + 1
                    )}
                  </span>
                  {name}
                  {state === 'done' && <span className="sr-only"> (gotowe)</span>}
                </li>
              )
            })}
          </ol>
        )}

        {sent ? (
          <section className="flex flex-col gap-6">
            {heading(
              <Icon name="check" strokeWidth={3} className="size-5 text-ok-text" />,
              <>Zestaw wysłany. Dziękujemy!</>,
            )}
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
              {callback} w godzinach pracy z propozycją dla: {typeName} — {count}{' '}
              {plural(count, ['element zestawu', 'elementy zestawu', 'elementów zestawu'])}.
              {phone && (
                <>
                  {' '}
                  Jeśli sprawa jest pilna, zadzwoń od razu:{' '}
                  <a href={phone.href} className="font-extrabold text-accent-text hover:underline">
                    {phone.label}
                  </a>
                  .
                </>
              )}
            </p>
            {sent.number && (
              <p className="font-bold text-ink">
                Numer zgłoszenia: <span className="font-display text-xl">{sent.number}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {kitSlugs.length > 0 && (
                <button
                  type="button"
                  disabled={inList}
                  onClick={() => {
                    cartActions.addMany(
                      kitSlugs,
                      (added) =>
                        `Zestaw: ${added} ${plural(added, ['pozycja', 'pozycje', 'pozycji'])}`,
                    )
                    setInList(true)
                  }}
                  className={PRIMARY}
                >
                  {inList ? 'Zestaw jest na liście zapytania' : 'Dodaj zestaw do listy zapytania'}
                  <Icon name={inList ? 'check' : 'arrow'} strokeWidth={2.4} className="size-4" />
                </button>
              )}
              <Link href="/" className={SECONDARY}>
                Wróć na stronę
              </Link>
              <button type="button" onClick={restart} className={SECONDARY}>
                Zacznij od nowa
              </button>
            </div>
          </section>
        ) : step === 0 || !answers ? (
          <section className="flex flex-col gap-6">
            {heading(
              <>{stepBadge(1)} Dobierz zestaw w 60 sekund</>,
              <>
                Jaka to <span className="text-h1-accent">firma?</span>
              </>,
            )}
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
              Wybierz najbliższą branżę. Po prawej od razu zobaczysz, co zwykle ustawiamy w takiej
              firmie — wszystko zmienisz w kolejnych krokach.
            </p>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
              {rules.businessTypes.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pickType(item.id)}
                    className={cx(TILE, answers?.businessType === item.id && CHOSEN)}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        'flex size-12 items-center justify-center rounded-2xl bg-linear-135 text-white',
                        TONE_GRADIENT[item.tone],
                      )}
                    >
                      <WizardIcon name={item.icon} className="size-6" />
                    </span>
                    <span className="mt-1 font-extrabold leading-tight text-ink">
                      {item.name}
                      {answers?.businessType === item.id && (
                        <span className="sr-only"> (wybrane)</span>
                      )}
                    </span>
                    {item.caption && (
                      <span className="text-[13px] leading-snug text-ink-2">{item.caption}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {phone && (
              <p className="flex items-center gap-3 rounded-2xl bg-surface-2 px-5 py-4 text-ink-2">
                <Icon name="phone" className="size-5 shrink-0 text-accent-text" />
                <span>
                  Wolisz po prostu porozmawiać?{' '}
                  <a href={phone.href} className="font-extrabold text-accent-text hover:underline">
                    {phone.label}
                  </a>{' '}
                  — doradzimy przez telefon.
                </span>
              </p>
            )}
          </section>
        ) : step === 1 ? (
          <section className="flex flex-col gap-6">
            {heading(
              <>
                {stepBadge(2)} {typeName}
              </>,
              <>Jak duża jest firma?</>,
            )}
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
              Wystarczy z grubsza — na tej podstawie dobierzemy liczbę stanowisk i sprzętu.
            </p>
            <Chips
              legend="Ile stanowisk sprzedaży (kas)?"
              name="salesPoints"
              options={rules.scale.salesPoints.options.map((value) => ({ value, label: value }))}
              value={answers.salesPoints}
              onChange={(salesPoints) => change({ salesPoints })}
            />
            <Chips
              legend="Ile komputerów i laptopów?"
              name="computers"
              options={rules.scale.computers.options.map((value) => ({ value, label: value }))}
              value={answers.computers}
              onChange={(computers) => change({ computers })}
            />
            <Chips
              legend="Lokal"
              name="premises"
              options={rules.scale.premises.options.map((option) => ({
                value: option.id,
                label: option.name,
                caption: option.caption,
              }))}
              value={answers.premises}
              onChange={(premises) => change({ premises })}
            />
            {nav(
              0,
              <button type="button" onClick={() => go(2)} className={PRIMARY}>
                Dalej <Icon name="arrow" strokeWidth={2.4} className="size-4" />
              </button>,
            )}
          </section>
        ) : step === 2 ? (
          <section className="flex flex-col gap-6">
            {heading(
              <>
                {stepBadge(3)} {typeName}
              </>,
              <>Co ma działać?</>,
            )}
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
              Zaznaczyliśmy to, czego zwykle potrzebuje {typeName.toLowerCase()}. Odznacz albo dodaj
              — zestaw po prawej zmienia się na żywo.
            </p>
            <ul role="group" aria-label="Potrzeby" className="grid gap-2.5 sm:grid-cols-2">
              {rules.needs.map((need) => (
                <li key={need.id}>
                  <button
                    type="button"
                    aria-pressed={answers.needs.includes(need.id)}
                    onClick={() => toggleNeed(need.id)}
                    className={cx(
                      TILE,
                      'flex-row items-center gap-3 p-3',
                      answers.needs.includes(need.id) && CHOSEN,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text"
                    >
                      <WizardIcon name={need.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold leading-tight text-ink">
                        {need.name}
                      </span>
                      {need.caption && (
                        <span className="block text-[13px] leading-snug text-ink-2">
                          {need.caption}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cx(
                        'flex size-6 shrink-0 items-center justify-center rounded-full',
                        answers.needs.includes(need.id)
                          ? 'bg-accent-text text-accent-ink'
                          : 'shadow-[inset_0_0_0_1.5px_var(--border)]',
                      )}
                    >
                      {answers.needs.includes(need.id) && (
                        <Icon name="check" strokeWidth={3} className="size-3.5" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {nav(
              1,
              <button type="button" onClick={() => go(3)} className={PRIMARY}>
                Dalej <Icon name="arrow" strokeWidth={2.4} className="size-4" />
              </button>,
            )}
          </section>
        ) : (
          <section className="flex flex-col gap-6">
            {heading(<>{stepBadge(4)} Ostatni krok</>, <>Na kiedy i gdzie zadzwonić?</>)}
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
              Wyślij zestaw, a oddzwonimy w godzinach pracy — z propozycją pod Twoją firmę, bez
              zobowiązań.
            </p>
            <form
              noValidate
              onSubmit={onSubmit}
              onChange={(event) => setContact(readContact(event.currentTarget))}
              aria-busy={sending}
              className="relative flex flex-col gap-5"
            >
              {formError && (
                <div ref={statusRef} tabIndex={-1}>
                  <p className="rounded-xl border-[3px] border-border-input bg-card p-4 font-bold text-ink">
                    {formError}
                  </p>
                </div>
              )}
              <Chips
                legend="Na kiedy?"
                name="when"
                options={rules.scale.when.map((option) => ({
                  value: option.name,
                  label: option.name,
                  caption: option.caption,
                }))}
                value={answers.when}
                onChange={(when) => change({ when })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <IconField
                  id={fieldId('name')}
                  name="name"
                  label="Imię"
                  autoComplete="given-name"
                  maxLength={120}
                  defaultValue={contact.name}
                  required
                  error={errors.name}
                />
                <IconField
                  id={fieldId('phone')}
                  name="phone"
                  type="tel"
                  label="Telefon"
                  autoComplete="tel"
                  maxLength={30}
                  defaultValue={contact.phone}
                  required
                  error={errors.phone}
                />
                <IconField
                  id={fieldId('city')}
                  name="city"
                  label="Miejscowość"
                  autoComplete="address-level2"
                  maxLength={100}
                  defaultValue={contact.city}
                  error={errors.city}
                  className="sm:col-span-2"
                />
              </div>
              <AreaField
                id={fieldId('message')}
                name="message"
                label={
                  answers.businessType === 'inna'
                    ? 'Jaka to firma? (opcjonalnie)'
                    : 'Coś jeszcze? (opcjonalnie)'
                }
                placeholder="Np. ile miejsc, co już masz, termin otwarcia…"
                maxLength={5000}
                defaultValue={contact.message}
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
              {nav(
                2,
                <button type="submit" disabled={sending} className={PRIMARY}>
                  {sending ? 'Wysyłanie…' : 'Wyślij zestaw — oddzwonimy'}
                  {!sending && <Icon name="arrow" strokeWidth={2.4} className="size-4" />}
                </button>,
              )}
            </form>
          </section>
        )}
      </div>
      <WizardSummary rules={rules} answers={answers} kit={kit} phone={phone} />
    </div>
  )
}
