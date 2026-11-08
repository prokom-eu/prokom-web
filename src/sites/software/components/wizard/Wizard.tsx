'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { track } from '@/lib/analytics/track'
import { keepTogether } from '@/lib/software/price'
import {
  canNext,
  chooseIndustry,
  chooseType,
  pickOptions,
  resultOf,
  stepsOf,
  summaryOf,
  tilePriceOf,
  tipOf,
  toggle,
  type WizardAnswers,
  type WizardSolution,
} from '@/lib/software/wizard/flow'
import type { SoftwareWizard, WizardPick, WizardStep } from '@/lib/software/wizard/schema'

import { WizardSend } from './WizardSend'

export type WizardProps = {
  rules: SoftwareWizard
  /** Published solutions the kinds point to (price, term, points). */
  solutions: WizardSolution[]
  /** Preset by `?firma=`, `?rodzaj=`, `?tryb=opis`. */
  initial: { answers: WizardAnswers; step: number }
  formToken: string
  /** `h1` on `/dobierz`, `h2` in the `#dobierz` section of the start page. */
  headingLevel: 'h1' | 'h2'
}

/** Multiple-choice questions of each step (`sysf` adds the team size, `redo` the address). */
const STEP_PICKS: Partial<Record<WizardStep, WizardPick[]>> = {
  have: ['have'],
  feat: ['feat'],
  redo: ['redo'],
  fix: ['fix'],
  today: ['today'],
  sysf: ['sysf'],
  auto: ['auto', 'prog'],
  desc: ['desc'],
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

/**
 * Wizard v3 „Aurora” (ZMIANY-v24 §7, board `AU-kreator`): the kind decides the questions (group
 * site / redo / sys / auto / idk), the live card follows every choice (price and term from
 * `Solutions`, the tip from the rules), the result sends the answers. One client island for
 * `/dobierz` and `#dobierz`; the behaviour is `lib/software/wizard/flow`.
 */
export function Wizard({ rules, solutions, initial, formToken, headingLevel }: WizardProps) {
  const ids = useId()
  const [answers, setAnswers] = useState(initial.answers)
  const [step, setStep] = useState(initial.step)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const started = useRef(false)
  const bySlug = useMemo(() => new Map(solutions.map((s) => [s.slug, s])), [solutions])

  const steps = stepsOf(rules, answers)
  const index = Math.min(step, steps.length - 1)
  const key = steps[index] ?? 'type'
  const last = index === steps.length - 1
  const result = resultOf(rules, answers, bySlug)
  const summary = summaryOf(rules, answers)
  const tip = tipOf(rules, answers)
  const Heading = headingLevel
  const StepHeading = headingLevel === 'h1' ? 'h2' : 'h3'

  // After a step change by the visitor: the new step's title takes the focus; analytics count it.
  useEffect(() => {
    if (!moved.current) return
    titleRef.current?.focus({ preventScroll: true })
    track('kreator_krok', { krok: index + 1 })
    if (key === 'res' && answers.type) track('kreator_wynik', { wynik: answers.type })
    // Only the step decides; answers changing on the same step are not a new step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function go(next: number) {
    moved.current = true
    setStep(Math.max(0, Math.min(next, steps.length - 1)))
  }

  function update(next: WizardAnswers) {
    if (!started.current) {
      started.current = true
      track('kreator_start')
    }
    setAnswers(next)
  }

  const chips = (pick: WizardPick, title?: string) => {
    const options = pickOptions(rules, answers, pick)
    const picked = answers.picks[pick] ?? []
    return (
      <fieldset className="wz-group" key={pick}>
        {title && <legend className="wz-q">{title}</legend>}
        {!title && <legend className="sr-only">{rules.steps[key].title}</legend>}
        <div className="wz-opts">
          {options.map((option) => {
            const on = picked.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                className="wz-opt"
                onClick={() => update(toggle(rules, answers, pick, option.id))}
              >
                <span className="wz-mark" aria-hidden="true">
                  {on ? '✓' : '+'}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      </fieldset>
    )
  }

  function stepBody() {
    if (key === 'type') {
      return (
        <div className="wz-types">
          {rules.types.map((type, i) => (
            <button
              key={type.id}
              type="button"
              aria-pressed={answers.type === type.id}
              className="wz-type"
              onClick={() => {
                update(chooseType(rules, answers, type.id))
                go(1)
              }}
            >
              <span className="wz-n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <b>{type.label}</b>
                <small>{type.desc}</small>
              </span>
              <span className="wz-p">{keepTogether(tilePriceOf(rules, type, bySlug))}</span>
            </button>
          ))}
        </div>
      )
    }
    if (key === 'ind') {
      return (
        <div className="wz-inds">
          {rules.industries.map((industry) => (
            <button
              key={industry.key}
              type="button"
              aria-pressed={answers.industry === industry.key}
              className="wz-ind"
              onClick={() => {
                update(chooseIndustry(rules, answers, industry.key))
                go(index + 1)
              }}
            >
              <span className="wz-ii">
                <Icon d={industry.icon} />
              </span>
              {industry.name}
            </button>
          ))}
        </div>
      )
    }
    if (key === 'res') {
      return (
        <WizardSend
          send={rules.send}
          answers={answers}
          onNote={(note) => setAnswers((current) => ({ ...current, note }))}
          formToken={formToken}
        />
      )
    }
    return (
      <div className="wz-stack">
        {key === 'redo' && (
          <div className="wz-field">
            <label htmlFor={`${ids}-url`}>{rules.ui.urlLabel}</label>
            <input
              id={`${ids}-url`}
              value={answers.url}
              onChange={(event) => update({ ...answers, url: event.target.value })}
              placeholder={rules.ui.urlPlaceholder}
              inputMode="url"
              autoComplete="url"
              maxLength={200}
            />
          </div>
        )}
        {key === 'desc' && (
          <div className="wz-field">
            <label htmlFor={`${ids}-desc`} className="sr-only">
              {rules.steps.desc.title}
            </label>
            <textarea
              id={`${ids}-desc`}
              value={answers.description}
              onChange={(event) => update({ ...answers, description: event.target.value })}
              placeholder={rules.ui.descPlaceholder}
              maxLength={1500}
              rows={4}
            />
          </div>
        )}
        {(STEP_PICKS[key] ?? []).map((pick, i) =>
          chips(
            pick,
            pick === 'prog'
              ? rules.ui.progQ
              : key === 'desc' && i === 0
                ? rules.ui.descPick
                : undefined,
          ),
        )}
        {key === 'sysf' && (
          <fieldset className="wz-group">
            <legend className="wz-q">{rules.ui.sizeQ}</legend>
            <div className="wz-opts wz-opts-4">
              {rules.options.sizes.map((size) => {
                const on = answers.size === size.id
                return (
                  <button
                    key={size.id}
                    type="button"
                    aria-pressed={on}
                    className="wz-opt"
                    onClick={() => update({ ...answers, size: on ? null : size.id })}
                  >
                    {size.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}
        {key === 'feat' && (
          <p className="wz-inprice">
            <b>{rules.inPrice.title}</b> {rules.inPrice.items.join(' · ')}
          </p>
        )}
      </div>
    )
  }

  const text = rules.steps[key]
  return (
    <div className="wz" data-wizard>
      <header className="wz-head">
        <p className="sw-eyebrow">{rules.ui.eyebrow}</p>
        <Heading className="sw-h2">
          {rules.ui.title} <em className="sw-em">{rules.ui.em}</em>
        </Heading>
        <p className="wz-lead">{rules.ui.lead}</p>
      </header>
      <div className="wz-grid">
        <div className="wz-main sw-glass">
          <ol className="wz-steps" aria-label={rules.ui.live}>
            {steps.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  className="wz-st"
                  data-state={i === index ? 'on' : i < index ? 'done' : undefined}
                  aria-current={i === index ? 'step' : undefined}
                  disabled={i > index}
                  onClick={() => go(i)}
                >
                  <i aria-hidden="true">{i < index ? '✓' : i + 1}</i>
                  {rules.steps[s].label}
                </button>
              </li>
            ))}
          </ol>
          <div className="wz-bar" aria-hidden="true">
            <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
          </div>
          <section
            key={key}
            className="wz-step"
            data-wizard-step={key}
            aria-labelledby={`${ids}-t`}
          >
            <StepHeading id={`${ids}-t`} ref={titleRef} tabIndex={-1} className="wz-title">
              {text.title}
            </StepHeading>
            {text.lead && <p className="wz-sub">{text.lead}</p>}
            {stepBody()}
          </section>
          <div className="wz-nav">
            <button
              type="button"
              className="wz-back"
              onClick={() => go(index - 1)}
              disabled={index === 0}
            >
              {rules.ui.back}
            </button>
            {!last && index > 0 && (
              <button type="button" className="wz-skip" onClick={() => go(index + 1)}>
                {rules.ui.skip}
              </button>
            )}
            {last ? (
              <button
                type="button"
                className="wz-next wz-ghost"
                onClick={() => {
                  setAnswers(initial.answers)
                  go(0)
                }}
              >
                {rules.ui.restart}
              </button>
            ) : (
              <button
                type="button"
                className="wz-next"
                aria-disabled={!canNext(key, answers) || undefined}
                onClick={() => canNext(key, answers) && go(index + 1)}
              >
                {index === steps.length - 2 ? rules.ui.showResult : rules.ui.next}
              </button>
            )}
          </div>
        </div>
        <aside className="wz-live sw-glass" aria-label={rules.ui.live} data-wizard-live>
          <p className="wz-livehead">
            <span>{rules.ui.live}</span>
            <span>
              {rules.ui.stepOf
                .replace('{n}', String(index + 1))
                .replace('{m}', String(steps.length))}
            </span>
          </p>
          <div className="wz-res">
            <p className="wz-name">
              <b data-wizard-name>{result.name}</b>
              <span>{keepTogether(result.term)}</span>
            </p>
            <p className="wz-price" data-wizard-price>
              {keepTogether(result.price)}
            </p>
            <p className="wz-net">{result.priceSub}</p>
          </div>
          {summary.length > 0 && (
            <dl className="wz-sum">
              {summary.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.values.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          )}
          {result.points.length > 0 && (
            <ul className="wz-points">
              {result.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          <div className={cx('wz-tip')} data-wizard-tip>
            <b>{rules.ui.tipLabel}</b>
            <p>{tip}</p>
          </div>
          {result.solution && (
            <Link href={`/rozwiazania/${result.solution}`} className="wz-more">
              {rules.ui.fullOffer}
            </Link>
          )}
        </aside>
      </div>
    </div>
  )
}
