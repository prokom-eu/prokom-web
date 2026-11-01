'use client'

import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics/track'
import { keepTogether } from '@/lib/software/price'
import type { SoftwareWizard } from '@/lib/software/wizard'
import {
  choiceOf,
  EMPTY_ANSWERS,
  needOf,
  optionNamesOf,
  orderedNeeds,
  phrasesOf,
  previewOf,
  pruneAnswers,
  resultView,
  shopHintApplies,
  stepsOf,
  tileHintOf,
  type ResultView,
  type WizardAnswers,
  type WizardSolution,
  type WizardStep,
} from '@/lib/software/wizardFlow'

import { WizardBar } from './WizardBar'
import { PathIcon, WizardPreview } from './WizardPreview'
import { type SentQuote, WizardSend } from './WizardSend'

export type WizardProps = {
  /** Rules of `SoftwareSettings.wizard` with facts already filled in (an empty text = hidden). */
  rules: SoftwareWizard
  /** Solutions that price the results and add-ons, by slug (published ones of this site). */
  solutions: Record<string, WizardSolution>
  /** From `parseWizardParams` (`?potrzeba=`, `?firma=`, `?tryb=opis`). */
  initial: { step: WizardStep; answers: WizardAnswers }
  formToken: string
  phone: { label: string; href: string } | null
  /** `h1` on `/dobierz`, `h2` as a section of the start page (SW5). */
  headingLevel: 'h1' | 'h2'
}

const small = 'text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2'
const chip = (on: boolean) =>
  cx(
    'min-h-11 rounded-full border-[1.5px] px-4 text-sm font-bold transition-colors active:scale-[0.98]',
    on ? 'border-accent bg-accent text-accent-ink' : 'border-border bg-card hover:border-ink-2',
  )
const primary =
  'inline-flex min-h-12 items-center justify-center rounded-2xl bg-button px-6 font-display text-base font-extrabold text-accent-ink shadow-raised active:scale-[0.98]'
const stepTitle =
  'scroll-mt-44 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold leading-tight outline-none'
const card = 'rounded-[20px] border border-border bg-card p-4 sm:p-5'
const tick = 'M5 12l5 5 9-10'
const clock = 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'
const sparkle =
  'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z'

/** The next step on the desktop; on the phone the price bar carries it (≤ 1080 px). */
function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-6 hidden justify-end gap-4 min-[1081px]:flex">{children}</div>
}

function Choice({ title, chips, empty }: { title: string; chips: string[]; empty: string }) {
  return (
    <div>
      <p className={small}>{title}</p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {chips.length === 0 && (
          <li className="rounded-full bg-chip px-3 py-1.5 text-sm font-bold text-ink-2">{empty}</li>
        )}
        {chips.map((item) => (
          <li
            key={item}
            className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-extrabold text-accent-text"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Ticks({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-[15px] font-bold">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <PathIcon d={tick} className="mt-0.5 size-[18px] text-ok-text" />
          {item}
        </li>
      ))}
    </ul>
  )
}

/** „W cenie od X zł netto · od N tygodni” of step „Zakres” (ZMIANY-v21 §11.2). */
function ScopeCard({ rules, view }: { rules: SoftwareWizard; view: ResultView }) {
  return (
    <div className="grid gap-4 rounded-[22px] border border-accent-line bg-accent-soft p-5 shadow-raised sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:p-6">
      <div className="border-b border-dashed border-accent-line pb-4 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
          {rules.ui.included}
        </p>
        <p
          data-wizard-scope-price
          className="mt-1 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold"
        >
          {keepTogether(view.priceShort)}
        </p>
        <p className="text-sm text-ink-2">{keepTogether(view.priceSub)}</p>
        <p className="mt-1 flex items-center gap-1.5 font-bold">
          <PathIcon d={clock} className="size-4" />
          {keepTogether(view.term)}
        </p>
      </div>
      <Ticks items={view.included} />
    </div>
  )
}

/** A sentence with the wizard's sparkle (recommendation, honest note). */
function Note({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'plain' }) {
  return (
    <p
      className={cx(
        'flex items-start gap-3 rounded-2xl border p-4 font-bold',
        tone === 'accent' ? 'border-accent-line bg-accent-soft' : 'border-border bg-card',
      )}
    >
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink">
        <PathIcon d={sparkle} className="size-[18px]" />
      </span>
      <span className="pt-1">{children}</span>
    </p>
  )
}

function Phrases({ phrases, onPick }: { phrases: string[]; onPick: (phrase: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {phrases.map((phrase) => (
        <button
          key={phrase}
          type="button"
          onClick={() => onPick(phrase)}
          className="min-h-11 rounded-full border border-dashed border-accent-line px-3.5 text-sm font-bold text-accent-text"
        >
          + {phrase}
        </button>
      ))}
    </div>
  )
}

/**
 * The Software wizard v22 (spec. §6.3, ZMIANY-v21 §3, §10.3, §11.2, board `Kreator`, stany
 * kreator-d-*, kreator-m-*): four short steps (three for „opisz po swojemu”) on the left; the
 * live quote on the right (desktop) or in a bar at the bottom edge (≤ 1080 px); the result with
 * „W cenie”, „Do wyceny na piśmie”, the add-ons and the quote block. One component for
 * `/dobierz` and the start page section (SW5). Everything it shows comes from `rules` through
 * `lib/software/wizardFlow` — no need ids here.
 */
export function Wizard({ rules, solutions, initial, formToken, phone, headingLevel }: WizardProps) {
  const id = useId()
  const [answers, setAnswers] = useState<WizardAnswers>(initial.answers)
  const [step, setStep] = useState<WizardStep>(initial.step)
  const [maxStep, setMaxStep] = useState(() => stepsOf(initial.answers).indexOf(initial.step))
  const [previewOpen, setPreviewOpen] = useState(false)
  const [wordsOpen, setWordsOpen] = useState(false)
  const [sent, setSent] = useState<SentQuote | null>(null)
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  // Analytics (ADR-020): `kreator_start` once, the last counted step and result.
  const started = useRef(false)
  const trackedStep = useRef<WizardStep | null>(null)
  const trackedResult = useRef<string | null>(null)

  // After a step change the new heading takes the focus (and the view); not on the first render.
  useEffect(() => {
    if (moved.current) titleRef.current?.focus()
  }, [step])

  // The phone bar lives while the wizard is on the screen (on the start page it is one section).
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const need = needOf(rules, answers)
  const steps = stepsOf(answers)
  const stepNames = answers.own ? rules.stepsOwn : rules.steps
  const stepIndex = Math.max(0, steps.indexOf(step))
  const isResult = step === 'result'
  // Changing an answer after sending keeps the „Wysłane” card: no second inquiry by accident.
  // Only a new path (another need, „opisz po swojemu”, „Zacznij od nowa”) starts a new quote.
  const update = (patch: Partial<WizardAnswers>) =>
    setAnswers((current) => pruneAnswers(rules, { ...current, ...patch }))
  const go = (next: WizardStep) => {
    moved.current = true
    setStep(next)
    setMaxStep((current) => Math.max(current, steps.indexOf(next)))
  }
  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((each) => each !== value) : [...list, value]

  const startPath = (patch: Partial<WizardAnswers>, next: WizardStep) => {
    setSent(null)
    setAnswers((current) => ({
      ...EMPTY_ANSWERS,
      contactPref: current.contactPref,
      // A new path clears the description of the previous one (spec. §6.3).
      description:
        (patch.own && current.own) || (patch.need && current.need === patch.need)
          ? current.description
          : '',
      ...patch,
    }))
    moved.current = true
    trackedResult.current = null
    setStep(next)
    setMaxStep(1)
  }
  const pickOption = (optionId: string) => {
    if (!need) return
    if (need.multi) {
      update({ options: toggle(answers.options, optionId), more: [], addOns: [] })
    } else {
      // Another answer may mean another result: its „więcej”, add-ons and checklist start over.
      update({ options: [optionId], checklist: [], more: [], addOns: [], shop: false })
      go('scope')
    }
  }
  const addPhrase = (phrase: string) => {
    const current = answers.description.trim()
    update({
      description: current
        ? `${current.replace(/[.,]$/, '')}, ${phrase}`
        : phrase.charAt(0).toUpperCase() + phrase.slice(1),
    })
  }
  const restart = () => {
    setSent(null)
    setAnswers((current) => ({ ...EMPTY_ANSWERS, contactPref: current.contactPref }))
    setWordsOpen(false)
    moved.current = true
    trackedResult.current = null
    setStep('need')
    setMaxStep(0)
  }
  const jumpToSend = () => {
    const form = document.getElementById(`${id}-send`)
    form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    form?.querySelector<HTMLElement>('input:not([tabindex="-1"])')?.focus({ preventScroll: true })
  }

  const Heading = headingLevel
  // One level under the wizard's title: h2 on /dobierz, h3 as a section of the start page.
  const StepHeading = headingLevel === 'h1' ? 'h2' : 'h3'
  const view = resultView(rules, answers, solutions)
  const resultId = view.resultId

  // Analytics (ADR-020): only steps the visitor took — not the step a link opened (`?firma=`).
  // A step once per visit (not again when its number shifts), a result once per path — going
  // back and forth does not repeat it; a new path (`startPath`, `restart`) counts again.
  useEffect(() => {
    if (!moved.current || trackedStep.current === step) return
    trackedStep.current = step
    if (!started.current) {
      started.current = true
      track('kreator_start')
    }
    track('kreator_krok', { krok: stepIndex + 1 })
  }, [step, stepIndex])
  useEffect(() => {
    if (!moved.current || !isResult || trackedResult.current === resultId) return
    trackedResult.current = resultId
    track('kreator_wynik', { wynik: resultId })
  }, [isResult, resultId])
  const preview = previewOf(rules, answers)
  const haveSet = need?.have ? rules.haves[need.have] : undefined
  const rows = [...new Set(Object.values(rules.needs).map((each) => each.row))].sort()
  const multiEmpty = step === 'detail' && !!need?.multi && answers.options.length === 0
  const shopHint = shopHintApplies(rules, answers) ? rules.shopHint : null
  const live = answers.own || answers.need !== null
  const checkedCount = answers.checklist.length
  const chosen = optionNamesOf(rules, answers)
  const termSub = view.result.free ? rules.ui.termSub.free : rules.ui.termSub.priced

  // The next step of the phone bar: the same as the desktop buttons.
  const barAction =
    step === 'detail' && need?.multi
      ? multiEmpty
        ? null
        : { label: rules.ui.next, onClick: () => go('scope') }
      : step === 'scope' || step === 'describe'
        ? { label: rules.ui.showResult, onClick: () => go('result') }
        : isResult && !sent
          ? { label: rules.ui.sendJump, onClick: jumpToSend }
          : null

  return (
    <div ref={rootRef} className={cx(live && 'max-[1080px]:pb-28')}>
      <div className="max-w-[46rem]">
        <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-accent-text">
          {rules.ui.eyebrow}
        </p>
        <Heading className="mt-3 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.05]">
          {rules.ui.title}
        </Heading>
        <p className="mt-4 hidden max-w-[34rem] text-lg text-ink-2 sm:block">{rules.ui.lead}</p>
        <ul className="mt-4 hidden flex-wrap gap-2 text-sm font-bold sm:flex">
          {rules.badges.map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-2 rounded-full bg-chip py-1 pl-1 pr-3.5"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-xs text-accent-ink"
              >
                ✓
              </span>
              {badge}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid gap-6 min-[1081px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] min-[1081px]:gap-8">
        {/* Left column: steps. */}
        <div data-wizard-column="left" className="min-w-0">
          <nav aria-label={rules.ui.eyebrow}>
            <div className="flex items-center gap-2">
              <ol className="hidden min-w-0 flex-1 gap-1.5 min-[1081px]:flex">
                {stepNames.map((name, index) => {
                  const current = index === stepIndex
                  const done = index <= maxStep && !current
                  const target = steps[index]
                  return (
                    <li key={name}>
                      <button
                        type="button"
                        aria-current={current ? 'step' : undefined}
                        disabled={index > maxStep || !target}
                        onClick={() => target && go(target)}
                        className={cx(
                          'inline-flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm font-extrabold',
                          current ? 'bg-accent text-accent-ink' : 'bg-chip text-ink',
                        )}
                      >
                        <span
                          className={cx(
                            'inline-flex size-7 items-center justify-center rounded-full text-xs',
                            current ? 'bg-white/25' : done ? 'bg-ok-text text-surface' : 'bg-card',
                          )}
                        >
                          {index + 1}
                        </span>
                        {name}
                      </button>
                    </li>
                  )
                })}
              </ol>
              {/* Phone and tablet: „Krok 2 z 4 Szczegóły” (stany kreator-m-a-0b). */}
              <p className="flex-1 font-bold text-ink-2 min-[1081px]:hidden">
                {rules.ui.stepOf
                  .replace('{n}', String(stepIndex + 1))
                  .replace('{z}', String(stepNames.length))}
                <span className="ml-2 text-ink">{stepNames[stepIndex]}</span>
              </p>
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={() => go(steps[stepIndex - 1] ?? 'need')}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-sm font-extrabold"
                >
                  <Icon name="arrow" className="size-4 rotate-180" />
                  {rules.ui.back}
                </button>
              )}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-chip" aria-hidden="true">
              <div
                className="h-full rounded-full bg-linear-to-r from-accent to-accent-2 transition-[width] duration-300"
                style={{ width: `${Math.round(((stepIndex + 1) / stepNames.length) * 100)}%` }}
              />
            </div>
          </nav>

          {step === 'need' && (
            <section aria-labelledby={`${id}-title`} className="mt-6">
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {rules.ui.needTitle}
              </StepHeading>
              <p className="mt-1.5 text-ink-2">{rules.ui.needLead}</p>
              {rows.map((row) => {
                const entries = orderedNeeds(rules).filter(([, each]) => each.row === row)
                return (
                  <div key={row} className="mt-6">
                    <p className={small}>{rules.ui.rows[row]}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {entries.map(([needId, each]) => (
                        <button
                          key={needId}
                          type="button"
                          aria-pressed={answers.need === needId}
                          onClick={() => startPath({ need: needId }, 'detail')}
                          className={cx(
                            'flex flex-col items-start gap-2 rounded-[20px] border-[1.5px] bg-card p-4 text-left shadow-raised transition-colors active:scale-[0.98]',
                            answers.need === needId
                              ? 'border-accent'
                              : 'border-border hover:border-ink-2',
                          )}
                        >
                          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-2 text-white">
                            <PathIcon d={each.ic} className="size-6" />
                          </span>
                          <b className="mt-1 font-display text-[17px] leading-tight">{each.n}</b>
                          <span className="hidden text-sm text-ink-2 sm:block">{each.d}</span>
                          <span className="mt-auto flex w-full items-center justify-between gap-2 pt-1">
                            <span
                              data-wizard-tile-price
                              className="text-sm font-extrabold text-accent-text"
                            >
                              {keepTogether(tileHintOf(rules, needId, solutions))}
                            </span>
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-chip">
                              <Icon name="arrow" className="size-4" />
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              <button
                type="button"
                onClick={() => startPath({ own: true }, 'describe')}
                className="mt-4 flex w-full items-center gap-4 rounded-[20px] border-[1.5px] border-dashed border-accent-line bg-card p-4 text-left active:scale-[0.99]"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                  <PathIcon d={rules.icons.chat ?? rules.icons.doc ?? ''} />
                </span>
                <span className="flex-1">
                  <b className="block font-display text-[17px]">{rules.ui.own.title}</b>
                  <span className="text-sm text-ink-2">{rules.ui.own.text}</span>
                </span>
                <Icon name="arrow" className="text-accent-text" />
              </button>
            </section>
          )}

          {step === 'detail' && need && (
            <section aria-labelledby={`${id}-title`} className="mt-6">
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {need.q}
              </StepHeading>
              <p id={`${id}-hint`} className="mt-1.5 text-ink-2">
                {need.h}
              </p>
              <div
                className={cx(
                  'mt-5 grid gap-3',
                  need.o.length > 6
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                )}
              >
                {need.o.map((option) => {
                  const on = answers.options.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickOption(option.id)}
                      className={cx(
                        'flex min-h-14 items-center gap-3 rounded-2xl border-[1.5px] bg-card px-4 py-3 text-left font-bold transition-colors active:scale-[0.99]',
                        on ? 'border-accent bg-accent-soft' : 'border-border hover:border-ink-2',
                      )}
                    >
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                        <PathIcon d={option.ic} className="size-[18px]" />
                      </span>
                      <span className="flex-1">{option.n}</span>
                      {need.multi && (
                        <span
                          aria-hidden="true"
                          className={cx(
                            'inline-flex size-6 items-center justify-center rounded-md border',
                            on ? 'border-accent bg-accent text-accent-ink' : 'border-border-input',
                          )}
                        >
                          {on && <Icon name="check" strokeWidth={3} className="size-4" />}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {need.multi && (
                <Actions>
                  <button
                    type="button"
                    aria-disabled={multiEmpty}
                    aria-describedby={multiEmpty ? `${id}-hint` : undefined}
                    onClick={() => !multiEmpty && go('scope')}
                    className={cx(primary, multiEmpty && 'bg-chip text-ink-2 shadow-none')}
                  >
                    {rules.ui.next}
                  </button>
                </Actions>
              )}
            </section>
          )}

          {step === 'scope' && need && (
            <section aria-labelledby={`${id}-title`} className="mt-6 flex flex-col gap-5">
              <div>
                <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                  {rules.ui.scopeTitle}
                </StepHeading>
                <p className="mt-1.5 text-ink-2">
                  {keepTogether(
                    view.ask ? rules.priceDisplay.noPrice.termSub : rules.priceDisplay.scopeIntro,
                  )}
                </p>
              </div>
              {view.included.length > 0 && <ScopeCard rules={rules} view={view} />}
              {view.recommend && <Note>{view.recommend}</Note>}
              {shopHint && (
                <button
                  type="button"
                  onClick={() => update({ shop: !answers.shop, more: [], addOns: [] })}
                  className="flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-accent-line bg-card p-4 text-left active:scale-[0.99]"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                    <PathIcon d={rules.icons.bag ?? rules.icons.site ?? ''} />
                  </span>
                  <span className="flex-1">
                    <b className="block">
                      {answers.shop ? shopHint.back.title : shopHint.toShop.title}
                    </b>
                    <span className="text-sm text-ink-2">
                      {keepTogether(answers.shop ? shopHint.back.sub : shopHint.toShop.sub)}
                    </span>
                  </span>
                  <Icon name="arrow" className="text-accent-text" />
                </button>
              )}
              {view.more.length > 0 && (
                <fieldset>
                  <legend className={small}>{rules.ui.moreTitle}</legend>
                  <p className="mt-1 text-sm text-ink-2">
                    {keepTogether(rules.priceDisplay.moreHint)}
                  </p>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {view.more.map((each) => (
                      <label
                        key={each.id}
                        className={cx(
                          'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] bg-card px-4 py-3 font-bold',
                          each.on ? 'border-accent bg-accent-soft' : 'border-border',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={each.on}
                          onChange={() => {
                            if (!each.on) track('kreator_dodatek', { id: each.id })
                            update({ more: toggle(answers.more, each.id) })
                          }}
                          className="size-[22px] shrink-0 accent-accent-text"
                        />
                        <span className="flex-1">{each.name}</span>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                          {rules.ui.moreTag}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              {need.url && (
                <div>
                  <label htmlFor={`${id}-url`} className={small}>
                    {need.url.q}
                  </label>
                  <input
                    id={`${id}-url`}
                    value={answers.url}
                    onChange={(event) => update({ url: event.target.value })}
                    placeholder={need.url.placeholder}
                    inputMode="url"
                    maxLength={200}
                    className="mt-2.5 block h-[54px] w-full rounded-[14px] border-[1.5px] border-border-input bg-card px-4 text-ink placeholder:text-ink-3 focus:border-accent-text"
                  />
                </div>
              )}
              {haveSet && (
                <fieldset>
                  <legend className={small}>{haveSet.q}</legend>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {haveSet.o.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={answers.have === option.id}
                        onClick={() =>
                          update({ have: answers.have === option.id ? null : option.id })
                        }
                        className={chip(answers.have === option.id)}
                      >
                        {option.n}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {need.fileNote && <p className="text-sm text-ink-2">{need.fileNote}</p>}
              <fieldset>
                <legend className={small}>{rules.ui.whenQ}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {rules.whens.map((when) => (
                    <button
                      key={when.id}
                      type="button"
                      aria-pressed={answers.when === when.id}
                      onClick={() => update({ when: answers.when === when.id ? null : when.id })}
                      className={chip(answers.when === when.id)}
                    >
                      {when.n}
                    </button>
                  ))}
                </div>
                {answers.when && (
                  <p className="mt-3 flex items-start gap-2 text-sm font-bold">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-ok"
                    />
                    {keepTogether(view.whenNote)}
                  </p>
                )}
              </fieldset>
              {wordsOpen || answers.description ? (
                <div>
                  <label htmlFor={`${id}-words`} className={small}>
                    {rules.ui.words.title}
                  </label>
                  <textarea
                    id={`${id}-words`}
                    rows={3}
                    maxLength={2000}
                    value={answers.description}
                    onChange={(event) => update({ description: event.target.value })}
                    placeholder={rules.ui.words.placeholder}
                    className="mt-2.5 block w-full rounded-[18px] border-[1.5px] border-border-input bg-card p-4 text-ink placeholder:text-ink-3 focus:border-accent-text"
                  />
                  <Phrases phrases={phrasesOf(rules, answers)} onPick={addPhrase} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWordsOpen(true)}
                  className="min-h-11 self-start rounded-full border border-dashed border-accent-line px-4 text-sm font-extrabold text-accent-text"
                >
                  {rules.ui.words.open}{' '}
                  <small className="font-bold text-ink-2">{rules.ui.words.optional}</small>
                </button>
              )}
              <Actions>
                <button type="button" onClick={() => go('result')} className={primary}>
                  {rules.ui.showResult}
                </button>
              </Actions>
            </section>
          )}

          {step === 'describe' && (
            <section aria-labelledby={`${id}-title`} className="mt-6">
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {rules.ui.describe.title}{' '}
                <span className="text-base font-bold text-ink-2">{rules.ui.describe.optional}</span>
              </StepHeading>
              <ul className="mt-3 flex flex-wrap gap-2">
                {rules.ui.describe.prompts.map((prompt) => (
                  <li
                    key={prompt}
                    className="rounded-[10px] bg-accent-soft px-2.5 py-1.5 text-sm font-bold text-accent-text"
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
              <label htmlFor={`${id}-description`} className="sr-only">
                {rules.ui.describe.title}
              </label>
              <textarea
                id={`${id}-description`}
                rows={5}
                maxLength={2000}
                value={answers.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder={rules.ui.describe.placeholder}
                className="mt-4 block w-full rounded-[18px] border-[1.5px] border-border-input bg-card p-4 text-ink placeholder:text-ink-3 focus:border-accent-text"
              />
              <Phrases phrases={phrasesOf(rules, answers)} onPick={addPhrase} />
              <Actions>
                <button type="button" onClick={() => go('result')} className={primary}>
                  {rules.ui.showResult}
                </button>
              </Actions>
            </section>
          )}

          {isResult && (
            <section aria-labelledby={`${id}-title`} className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-text px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-surface">
                  <PathIcon d={tick} className="size-3.5" />
                  {rules.ui.recommend}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
                  {view.result.kind}
                </span>
              </div>
              <div>
                <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                  {view.result.n}
                </StepHeading>
                {chosen.length > 0 && <p className="mt-1.5 text-ink-2">{chosen.join(' · ')}</p>}
              </div>
              {view.resultNote && (
                <p className="self-start rounded-xl bg-accent-soft px-3 py-2 text-sm font-extrabold text-accent-text">
                  {view.resultNote}
                </p>
              )}
              {view.included.length > 0 && (
                <div className="rounded-[20px] border border-border bg-surface-2 p-4 sm:p-5">
                  <p className={cx(small, 'mb-2.5')}>{rules.ui.included}</p>
                  <Ticks items={view.included} />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-[20px] border border-accent-line bg-accent-soft p-4 sm:p-5">
                  <dt className={small}>{rules.ui.priceLabel}</dt>
                  <dd
                    data-wizard-price
                    className={cx(
                      'mt-1 font-display font-extrabold text-accent-text',
                      view.ask ? 'text-xl' : 'text-[clamp(1.4rem,3vw,2rem)]',
                    )}
                  >
                    {keepTogether(view.priceShort)}
                  </dd>
                  {view.priceSub && (
                    <dd className="mt-1 text-sm text-ink-2">{keepTogether(view.priceSub)}</dd>
                  )}
                </div>
                <div className="rounded-[20px] border border-accent-line bg-accent-soft p-4 sm:p-5">
                  <dt className={small}>{rules.ui.termLabel}</dt>
                  <dd
                    data-wizard-term
                    className={cx(
                      'mt-1 font-display font-extrabold text-accent-text',
                      view.ask ? 'text-xl' : 'text-[clamp(1.4rem,3vw,2rem)]',
                    )}
                  >
                    {keepTogether(view.term)}
                  </dd>
                  <dd className="mt-1 text-sm text-ink-2">
                    {keepTogether(view.ask ? rules.priceDisplay.noPrice.termSub : termSub)}
                  </dd>
                </div>
              </dl>
              {view.scope && (
                <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm font-bold">{view.scope}</p>
              )}
              {view.toQuote.length > 0 && (
                <div data-wizard-to-quote className={card}>
                  <p className={cx(small, 'mb-2')}>{rules.ui.toQuoteTitle}</p>
                  <ul className="flex flex-wrap gap-2">
                    {view.toQuote.map((name) => (
                      <li
                        key={name}
                        className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-extrabold text-accent-text"
                      >
                        + {name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2.5 text-sm text-ink-2">
                    {keepTogether(rules.priceDisplay.moreSelectedNote)}
                  </p>
                </div>
              )}
              {view.honest && <Note tone="plain">{view.honest}</Note>}
              {view.checklist.length > 0 && (
                <fieldset className={card}>
                  <legend className="sr-only">{rules.ui.checklist.title}</legend>
                  <div className="flex items-center justify-between gap-3" aria-hidden="true">
                    <p className={small}>{rules.ui.checklist.title}</p>
                    <p className="shrink-0 text-sm font-extrabold text-accent-text">
                      {rules.ui.checklist.count
                        .replace('{n}', String(checkedCount))
                        .replace('{z}', String(view.checklist.length))}
                    </p>
                  </div>
                  <div
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-chip"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-ok transition-[width]"
                      style={{
                        width: `${Math.round((checkedCount / view.checklist.length) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {view.checklist.map((item, index) => {
                      const on = answers.checklist.includes(index)
                      return (
                        <label
                          key={item}
                          className={cx(
                            'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-[1.5px] px-3 text-sm font-bold',
                            on ? 'border-ok-text' : 'border-border',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              update({
                                checklist: on
                                  ? answers.checklist.filter((each) => each !== index)
                                  : [...answers.checklist, index],
                              })
                            }
                            className="size-[18px] accent-ok-text"
                          />
                          {item}
                        </label>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-sm text-ink-2">{rules.ui.checklist.hint}</p>
                </fieldset>
              )}
              {view.addOns.length > 0 && (
                <div className={card}>
                  <p className={cx(small, 'mb-3')}>{rules.ui.addOns.title}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {view.addOns.map((addOn) => (
                      <button
                        key={addOn.id}
                        type="button"
                        aria-pressed={addOn.on}
                        onClick={() => {
                          if (!addOn.on) track('kreator_dodatek', { id: addOn.id })
                          update({ addOns: toggle(answers.addOns, addOn.id) })
                        }}
                        className={cx(
                          'flex items-start gap-3 rounded-2xl border-[1.5px] p-3.5 text-left active:scale-[0.99]',
                          addOn.on
                            ? 'border-accent bg-accent-soft'
                            : 'border-border bg-card hover:border-ink-2',
                        )}
                      >
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-chip text-accent-text">
                          <PathIcon d={addOn.icon} className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <b className="block">{addOn.name}</b>
                          <span className="block text-sm text-ink-2">{addOn.description}</span>
                          <span className="mt-1 block text-sm font-extrabold text-accent-text">
                            {keepTogether(addOn.price)}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={cx(
                            'shrink-0 self-center rounded-full px-3 py-1.5 text-sm font-extrabold',
                            addOn.on ? 'bg-accent text-accent-ink' : 'bg-chip',
                          )}
                        >
                          {addOn.on ? rules.ui.addOns.added : rules.ui.addOns.add}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {answers.description.trim() && (
                <div className="rounded-[20px] bg-surface-2 p-4">
                  <p className={small}>{rules.ui.yourNeeds}</p>
                  <p className="mt-2 italic">„{answers.description.trim()}”</p>
                </div>
              )}
              {view.whenNote && (
                <p className="flex items-start gap-2 font-bold">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-ok" />
                  {keepTogether(view.whenNote)}
                </p>
              )}
              <button
                type="button"
                onClick={restart}
                className="inline-flex min-h-11 items-center gap-2 self-start px-1 text-sm font-extrabold text-ink-2"
              >
                <PathIcon d="M3 12a9 9 0 1 0 2.6-6.4M3 3v6h6" className="size-4" />
                {rules.ui.restart}
              </button>
            </section>
          )}
        </div>

        {/* Right column: the live quote (desktop); at the result the quote block. */}
        <div
          data-wizard-column="right"
          className="flex min-w-0 flex-col gap-4 min-[1081px]:sticky min-[1081px]:top-24 min-[1081px]:self-start"
        >
          <p className="hidden items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] min-[1081px]:flex">
            <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
            {isResult ? rules.ui.live.previewTitle : rules.ui.live.title}
          </p>
          <button
            type="button"
            aria-expanded={previewOpen}
            aria-controls={`${id}-preview`}
            onClick={() => setPreviewOpen(!previewOpen)}
            className={cx(
              'min-h-12 items-center justify-between rounded-2xl border border-border bg-card px-4 font-extrabold min-[1081px]:hidden',
              isResult ? 'order-2' : 'order-0',
              live ? 'flex' : 'hidden',
            )}
          >
            {rules.mobile.previewToggle[previewOpen ? 1 : 0]}
            <span aria-hidden="true" className="text-xl text-accent-text">
              {previewOpen ? '−' : '+'}
            </span>
          </button>
          <div
            id={`${id}-preview`}
            className={cx(
              'min-[1081px]:flex min-[1081px]:flex-col',
              previewOpen ? 'flex flex-col' : 'hidden',
              isResult ? 'order-3 min-[1081px]:order-0' : 'order-1',
            )}
          >
            <WizardPreview preview={preview} idle={rules.ui.idle} />
          </div>
          {isResult ? (
            <div id={`${id}-send`} className="order-1 scroll-mt-28 min-[1081px]:order-0">
              <WizardSend
                rules={rules}
                answers={answers}
                view={view}
                onContactPref={(contactPref) => update({ contactPref })}
                formToken={formToken}
                heading={StepHeading}
                phone={phone}
                sent={sent}
                onSent={setSent}
                stepNumber={stepNames.length}
              />
            </div>
          ) : (
            <div
              data-wizard-live
              aria-live="polite"
              className="order-2 hidden rounded-[22px] border border-border bg-card p-5 min-[1081px]:block"
            >
              {live ? (
                <>
                  <p className="font-bold">{view.result.n}</p>
                  <p
                    className={cx(
                      'mt-1 font-display font-extrabold text-accent-text',
                      view.ask ? 'text-2xl' : 'text-[2rem]',
                    )}
                  >
                    {keepTogether(view.priceShort)}
                  </p>
                  {view.priceSub && (
                    <p className="text-sm text-ink-2">{keepTogether(view.priceSub)}</p>
                  )}
                  <p className="mt-2 flex items-center gap-1.5 font-bold">
                    <PathIcon d={clock} className="size-4" />
                    {keepTogether(view.term)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-[2rem] font-extrabold text-ink-2">
                    {rules.ui.live.empty}
                  </p>
                  <p className="mt-1 text-sm text-ink-2">{rules.ui.live.emptyText}</p>
                </>
              )}
              <div className="mt-4 border-t border-dashed border-border pt-4">
                <Choice
                  title={rules.ui.yourChoice}
                  chips={choiceOf(rules, answers, {
                    withWhen: stepIndex >= steps.indexOf('scope'),
                  })}
                  empty={rules.ui.choiceEmpty}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {live && inView && (
        <WizardBar
          label={rules.ui.live.label}
          price={keepTogether(view.ask ? rules.priceDisplay.noPrice.mobileBar : view.priceShort)}
          term={view.ask ? '' : keepTogether(view.term)}
          ask={view.ask}
          action={barAction}
        />
      )}
    </div>
  )
}
