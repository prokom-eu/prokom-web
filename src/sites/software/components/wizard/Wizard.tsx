'use client'

import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SoftwareWizard } from '@/lib/software/wizard'
import {
  choiceOf,
  EMPTY_ANSWERS,
  hasSize,
  needOf,
  orderedNeeds,
  previewOf,
  resultView,
  STEP,
  type WizardAnswers,
  type WizardSolution,
} from '@/lib/software/wizardFlow'

import { PathIcon, WizardPreview } from './WizardPreview'
import { WizardSend } from './WizardSend'

export type WizardProps = {
  /** Rules of `SoftwareSettings.wizard` with facts already filled in (an empty text = hidden). */
  rules: SoftwareWizard
  /** Solutions that price the results, by slug (published ones of this site). */
  solutions: Record<string, WizardSolution>
  /** From `parseWizardParams` (`?potrzeba=`, `?firma=`, `?tryb=opis`). */
  initial: { step: number; answers: WizardAnswers }
  formToken: string
  phone: { label: string; href: string } | null
  /** `h1` on `/dobierz`, `h2` as a section of the start page (SW5). */
  headingLevel: 'h1' | 'h2'
}

const label = 'text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2'
const chip = (on: boolean) =>
  cx(
    'min-h-11 rounded-full border px-4 text-sm font-bold transition-colors',
    on
      ? 'border-accent-text bg-accent-soft text-accent-text'
      : 'border-border bg-card hover:border-ink-2',
  )
const primary =
  'inline-flex min-h-12 items-center justify-center rounded-2xl bg-button px-6 font-display text-base font-extrabold text-accent-ink shadow-raised'
const stepTitle =
  'scroll-mt-44 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold leading-tight outline-none'

/** Action row; sticks above the bottom bar on the phone (spec. §8.6). */
function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[calc(88px+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 flex items-center justify-end gap-4 bg-surface/90 px-4 py-3 backdrop-blur-md min-[1081px]:static min-[1081px]:mx-0 min-[1081px]:bg-transparent min-[1081px]:p-0 min-[1081px]:backdrop-blur-none">
      {children}
    </div>
  )
}

function Choice({ title, chips, empty }: { title: string; chips: string[]; empty: string }) {
  return (
    <div>
      <p className={label}>{title}</p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {chips.length === 0 && <li className="text-sm font-bold text-ink-2">{empty}</li>}
        {chips.map((item) => (
          <li
            key={item}
            className="rounded-[10px] bg-accent-soft px-2.5 py-1.5 text-sm font-extrabold text-accent-text"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The Software wizard (spec. §6.3, board `Kreator`, stany 50–55, 87a–f): five steps on the left,
 * the live preview on the right, the result with the price of the chosen size and the quote
 * form. One component for `/dobierz` and the start page section (SW5). Everything it shows comes
 * from `rules` through `lib/software/wizardFlow` — no need ids here.
 */
export function Wizard({ rules, solutions, initial, formToken, phone, headingLevel }: WizardProps) {
  const id = useId()
  const [answers, setAnswers] = useState<WizardAnswers>(initial.answers)
  const [step, setStep] = useState(initial.step)
  const [maxStep, setMaxStep] = useState(initial.step)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sent, setSent] = useState<{ number: string | null } | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  // After a step change the new heading takes the focus (and the view); not on the first render.
  useEffect(() => {
    if (moved.current) titleRef.current?.focus()
  }, [step])

  const need = needOf(rules, answers)
  const sized = hasSize(rules, answers)
  const update = (patch: Partial<WizardAnswers>) => {
    setSent(null)
    setAnswers((current) => ({ ...current, ...patch }))
  }
  const go = (next: number) => {
    moved.current = true
    setStep(next)
    setMaxStep((current) => Math.max(current, next))
  }
  const skipped = (index: number) => answers.own && (index === STEP.detail || index === STEP.scope)

  const pickNeed = (needId: string) => {
    setSent(null)
    setAnswers((current) => ({
      ...EMPTY_ANSWERS,
      size: current.size,
      contactPref: current.contactPref,
      // A new path clears the description of the previous one (spec. §6.3).
      description: current.need === needId ? current.description : '',
      need: needId,
    }))
    moved.current = true
    setStep(STEP.detail)
    setMaxStep(STEP.detail)
  }
  const pickOwn = () => {
    setSent(null)
    setAnswers((current) => ({
      ...EMPTY_ANSWERS,
      contactPref: current.contactPref,
      description: current.own ? current.description : '',
      own: true,
    }))
    moved.current = true
    setStep(STEP.describe)
    setMaxStep(STEP.describe)
  }
  const pickOption = (optionId: string) => {
    if (!need) return
    if (need.multi) {
      const has = answers.options.includes(optionId)
      update({
        options: has
          ? answers.options.filter((option) => option !== optionId)
          : [...answers.options, optionId],
      })
    } else {
      update({ options: [optionId], checklist: [] })
      go(STEP.scope)
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

  const Heading = headingLevel
  // One level under the wizard's title: h2 on /dobierz, h3 as a section of the start page.
  const StepHeading = headingLevel === 'h1' ? 'h2' : 'h3'
  const view = resultView(rules, answers, solutions)
  const preview = previewOf(rules, answers)
  const haveSet = need?.have ? rules.haves[need.have] : undefined
  const rows = [...new Set(Object.values(rules.needs).map((each) => each.row))].sort()
  const multiEmpty = step === STEP.detail && !!need?.multi && answers.options.length === 0

  return (
    <div>
      <div className="grid gap-4 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] min-[1081px]:items-end min-[1081px]:gap-10">
        <div>
          <p className="text-sm font-extrabold text-accent-text">{rules.ui.eyebrow}</p>
          <Heading className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05]">
            {rules.ui.title}
          </Heading>
        </div>
        <div>
          <p className="text-ink-2">{rules.ui.lead}</p>
          <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 text-sm font-bold [scrollbar-width:none]">
            {rules.badges.map((badge, i) => (
              <li
                key={badge}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3.5"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-xs text-accent-ink"
                >
                  {i === 0 ? rules.steps.length : i === 1 ? '●' : '✓'}
                </span>
                {i === 0 ? badge.replace(/^\d+\s*/, '') : badge}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 grid gap-6 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] min-[1081px]:gap-7">
        {/* Left column: steps. */}
        <div data-wizard-column="left" className="min-w-0">
          <div className="sticky top-[66px] z-20 -mx-4 flex items-center gap-2 bg-surface/90 px-4 py-3 backdrop-blur-md sm:top-[76px] min-[1081px]:static min-[1081px]:mx-0 min-[1081px]:bg-transparent min-[1081px]:p-0 min-[1081px]:backdrop-blur-none">
            <ol className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {rules.steps.map((name, index) => {
                const current = index === step
                const done = index <= maxStep && !current
                const off = skipped(index)
                return (
                  <li key={name} className="shrink-0">
                    <button
                      type="button"
                      aria-current={current ? 'step' : undefined}
                      disabled={index > maxStep || off}
                      onClick={() => go(index)}
                      className={cx(
                        'inline-flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-extrabold',
                        current ? 'bg-accent text-accent-ink' : 'bg-chip text-ink',
                        off && 'opacity-45',
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
                      {/* On the phone only the current step keeps its name (stany/87a). */}
                      <span className={cx(!current && 'sr-only min-[1081px]:not-sr-only')}>
                        {name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            {step > 0 && (
              <button
                type="button"
                onClick={() => go(answers.own && step === STEP.describe ? STEP.need : step - 1)}
                className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-sm font-extrabold"
              >
                <Icon name="arrow" className="size-4 rotate-180" />
                <span className="sr-only sm:not-sr-only">{rules.ui.back}</span>
              </button>
            )}
          </div>

          {step === STEP.need && (
            <section aria-labelledby={`${id}-title`} className="mt-5">
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {rules.ui.needTitle}
              </StepHeading>
              {rows.map((row) => {
                const entries = orderedNeeds(rules).filter(([, each]) => each.row === row)
                return (
                  <div key={row} className="mt-5">
                    <p className={label}>{rules.ui.rows[row]}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {entries.map(([needId, each]) => (
                        <button
                          key={needId}
                          type="button"
                          aria-pressed={answers.need === needId}
                          onClick={() => pickNeed(needId)}
                          className={cx(
                            'flex flex-col items-start gap-2 rounded-[20px] border bg-card p-4 text-left shadow-raised transition-colors',
                            answers.need === needId
                              ? 'border-accent-text'
                              : 'border-border hover:border-ink-2',
                          )}
                        >
                          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                            <PathIcon d={each.ic} />
                          </span>
                          <b className="mt-1 font-display text-[17px] leading-tight">{each.n}</b>
                          <span className="hidden text-sm text-ink-2 sm:block">{each.d}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              <button
                type="button"
                onClick={pickOwn}
                className="mt-4 flex w-full items-center gap-4 rounded-[20px] border border-dashed border-accent-line bg-card p-4 text-left"
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

          {step === STEP.detail && need && (
            <section aria-labelledby={`${id}-title`} className="mt-5">
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {need.q}
              </StepHeading>
              <p className="mt-1.5 text-sm text-ink-2">{need.h}</p>
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
                        'flex min-h-14 items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left font-bold transition-colors',
                        on
                          ? 'border-accent-text bg-accent-soft'
                          : 'border-border hover:border-ink-2',
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
                    onClick={() => !multiEmpty && go(STEP.scope)}
                    className={cx(primary, multiEmpty && 'bg-chip text-ink-2 shadow-none')}
                  >
                    {rules.ui.next}
                  </button>
                </Actions>
              )}
            </section>
          )}

          {step === STEP.scope && need && (
            <section aria-labelledby={`${id}-title`} className="mt-5">
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {rules.ui.scopeTitle}
              </StepHeading>
              {sized && (
                <fieldset className="mt-5">
                  <legend className={label}>{rules.ui.sizeQ}</legend>
                  <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                    {rules.sizes.map((size) => {
                      const on = answers.size === size.id
                      return (
                        <button
                          key={size.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => update({ size: size.id })}
                          className={cx(
                            'rounded-2xl border bg-card px-3 py-3 text-left',
                            on ? 'border-accent-text' : 'border-border hover:border-ink-2',
                          )}
                        >
                          <b className="block text-sm">{size.n}</b>
                          <span className="text-xs text-ink-2 sm:text-sm">{size.d}</span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )}
              {need.url && (
                <div className="mt-5">
                  <label htmlFor={`${id}-url`} className={label}>
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
                <fieldset className="mt-5">
                  <legend className={label}>{haveSet.q}</legend>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {haveSet.o.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={answers.have === option.id}
                        onClick={() => update({ have: option.id })}
                        className={chip(answers.have === option.id)}
                      >
                        {option.n}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {need.fileNote && <p className="mt-3 text-sm text-ink-2">{need.fileNote}</p>}
              <fieldset className="mt-5">
                <legend className={label}>{rules.ui.whenQ}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {rules.whens.map((when) => (
                    <button
                      key={when.id}
                      type="button"
                      aria-pressed={answers.when === when.id}
                      onClick={() => update({ when: when.id })}
                      className={chip(answers.when === when.id)}
                    >
                      {when.n}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Actions>
                <button type="button" onClick={() => go(STEP.describe)} className={primary}>
                  {rules.ui.next}
                </button>
              </Actions>
            </section>
          )}

          {step === STEP.describe && (
            <section aria-labelledby={`${id}-title`} className="mt-5">
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
                className="mt-4 block w-full rounded-[18px] border-[1.5px] border-border-input bg-surface-2 p-4 text-ink placeholder:text-ink-3 focus:border-accent-text"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {rules.phrases.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => addPhrase(phrase)}
                    className="min-h-11 rounded-full border border-dashed border-accent-line px-3.5 text-sm font-bold text-accent-text"
                  >
                    + {phrase}
                  </button>
                ))}
              </div>
              <Actions>
                <button
                  type="button"
                  onClick={() => go(STEP.result)}
                  className="min-h-12 px-3 font-extrabold"
                >
                  {rules.ui.describe.skip}
                </button>
                <button type="button" onClick={() => go(STEP.result)} className={primary}>
                  {rules.ui.showResult}
                </button>
              </Actions>
            </section>
          )}

          {step === STEP.result && (
            <section aria-labelledby={`${id}-title`} className="mt-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-ok-text px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-surface">
                  {rules.ui.recommend}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
                  {view.result.kind}
                </span>
              </div>
              <StepHeading id={`${id}-title`} ref={titleRef} tabIndex={-1} className={stepTitle}>
                {view.result.n}
              </StepHeading>
              {view.resultNote && (
                <p className="self-start rounded-xl bg-accent-soft px-3 py-2 text-sm font-extrabold text-accent-text">
                  {view.resultNote}
                </p>
              )}
              {view.hasSize && (
                <div role="group" aria-label={rules.ui.sizeQ} className="grid grid-cols-3 gap-2.5">
                  {rules.sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={answers.size === size.id}
                      onClick={() => update({ size: size.id })}
                      className={cx(
                        'min-h-11 rounded-2xl border bg-card px-2 text-sm font-bold',
                        answers.size === size.id
                          ? 'border-accent-text'
                          : 'border-border hover:border-ink-2',
                      )}
                    >
                      {size.n}
                    </button>
                  ))}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3" aria-live="polite">
                <div className="rounded-2xl border border-accent-line bg-accent-soft p-4">
                  <dt className={label}>{rules.ui.priceLabel}</dt>
                  <dd
                    data-wizard-price
                    className="mt-1 font-display text-xl font-extrabold text-accent-text sm:text-2xl"
                  >
                    {view.price}
                  </dd>
                </div>
                <div className="rounded-2xl border border-accent-line bg-accent-soft p-4">
                  <dt className={label}>{rules.ui.termLabel}</dt>
                  <dd
                    data-wizard-term
                    className="mt-1 font-display text-xl font-extrabold text-accent-text sm:text-2xl"
                  >
                    {view.term}
                  </dd>
                </div>
              </dl>
              {view.scope && (
                <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-sm font-bold">
                  {view.scope}
                </p>
              )}
              {view.whenNote && (
                <p className="flex items-start gap-2 text-sm font-bold">
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-ok" />
                  {view.whenNote}
                </p>
              )}
              <fieldset className="rounded-[20px] border border-border bg-card p-4">
                <legend className={cx(label, 'float-left mb-3 w-full')}>
                  {rules.ui.checklist.title}
                </legend>
                <div className="clear-both flex flex-wrap gap-2">
                  {view.checklist.map((item, index) => {
                    const on = answers.checklist.includes(index)
                    return (
                      <label
                        key={item}
                        className={cx(
                          'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold',
                          on ? 'border-accent-text bg-accent-soft' : 'border-border',
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
                          className="size-[18px] accent-accent-text"
                        />
                        {item}
                      </label>
                    )
                  })}
                </div>
                <p className="mt-3 text-sm text-ink-2">{rules.ui.checklist.hint}</p>
              </fieldset>
              {answers.description.trim() && (
                <div className="rounded-[20px] bg-surface-2 p-4">
                  <p className={label}>{rules.ui.yourNeeds}</p>
                  <p className="mt-2 italic">„{answers.description.trim()}”</p>
                </div>
              )}
              <Choice
                title={rules.ui.yourChoice}
                chips={view.choice}
                empty={rules.ui.choiceEmpty}
              />
            </section>
          )}
        </div>

        {/* Right column: preview, then the choice or (result) the quote form. */}
        <div data-wizard-column="right" className="flex min-w-0 flex-col gap-4">
          <button
            type="button"
            aria-expanded={previewOpen}
            aria-controls={`${id}-preview`}
            onClick={() => setPreviewOpen(!previewOpen)}
            className={cx(
              'flex min-h-12 items-center justify-between rounded-2xl border border-border bg-card px-4 font-extrabold min-[1081px]:hidden',
              step === STEP.result ? 'order-2' : 'order-0',
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
              'min-[1081px]:flex min-[1081px]:flex-1 min-[1081px]:flex-col',
              previewOpen ? 'flex flex-col' : 'hidden',
              step === STEP.result ? 'order-3 min-[1081px]:order-0' : 'order-1',
            )}
          >
            <WizardPreview preview={preview} idle={rules.ui.idle} />
          </div>
          {step === STEP.result ? (
            <div className="order-1 min-[1081px]:order-0">
              <WizardSend
                rules={rules}
                answers={answers}
                onContactPref={(contactPref) =>
                  setAnswers((current) => ({ ...current, contactPref }))
                }
                formToken={formToken}
                heading={StepHeading}
                phone={phone}
                sent={sent}
                onSent={(number) => setSent({ number })}
              />
            </div>
          ) : (
            <div className="order-2 hidden rounded-[20px] border border-border bg-card p-4 min-[1081px]:block">
              <Choice
                title={rules.ui.yourChoice}
                chips={choiceOf(rules, answers, { withScope: step > STEP.scope })}
                empty={rules.ui.choiceEmpty}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
