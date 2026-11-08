'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { track } from '@/lib/analytics/track'
import { keepTogether } from '@/lib/software/price'
import {
  canNext,
  chooseIndustry,
  chooseType,
  pickOptions,
  previewOf,
  resultOf,
  shownAnswers,
  stepsOf,
  summaryOf,
  tilePriceOf,
  tipOf,
  toggle,
  type WizardAnswers,
  type WizardSolution,
} from '@/lib/software/wizard/flow'
import type { SoftwareWizard, WizardPick, WizardStep } from '@/lib/software/wizard/schema'

import { Mockup } from '@/sites/software/components/mockups/Mockup'
import { usePausedOffscreen } from '@/sites/software/components/v24home/usePausedOffscreen'

import { WizardSend } from './WizardSend'
import { PriceTween } from './PriceTween'
import { EmText } from '@/sites/software/components/ui/EmText'

export type WizardProps = {
  rules: SoftwareWizard
  /** Published solutions the kinds point to (price, term, points). */
  solutions: WizardSolution[]
  /** Preset by `?firma=`, `?rodzaj=`, `?tryb=opis`. */
  initial: { answers: WizardAnswers; step: number }
  formToken: string
  /**
   * Level of the wizard's title: `h2` in the `#dobierz` section of the start page; `h1` on
   * `/dobierz`, where the page hero carries the H1 and the wizard drops its own head (`head`).
   * The step titles are one level lower.
   */
  headingLevel: 'h1' | 'h2'
  /** The eyebrow, title and lead above the wizard (off on `/dobierz`, ZMIANY-v24 §9.5). */
  head?: boolean
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
export function Wizard({
  rules,
  solutions,
  initial,
  formToken,
  headingLevel,
  head = true,
}: WizardProps) {
  const ids = useId()
  const [answers, setAnswers] = useState(initial.answers)
  const [step, setStep] = useState(initial.step)
  // The next step slides in from the right, a step back from the left (AUDYT-0811 P2 A10).
  const [dir, setDir] = useState<'next' | 'back' | null>(null)
  // Name and contact of the result live here: a step back and forth keeps them.
  const [who, setWho] = useState({ name: '', contact: '' })
  const titleRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)
  const started = useRef(false)
  // Phone: the live card folds into a price bar above Back / Next (ZMIANY-v24 §7.1).
  const [liveOpen, setLiveOpen] = useState(false)
  const liveRef = usePausedOffscreen<HTMLElement>()
  const bySlug = useMemo(() => new Map(solutions.map((s) => [s.slug, s])), [solutions])

  const steps = stepsOf(rules, answers)
  const index = Math.min(step, steps.length - 1)
  const key = steps[index] ?? 'type'
  const last = index === steps.length - 1
  // Before step 1 the card shows the default kind; the tiles stay unticked.
  const shown = shownAnswers(rules, answers)
  const result = resultOf(rules, shown, bySlug)
  const summary = summaryOf(rules, answers)
  const tip = tipOf(rules, shown)
  const preview = previewOf(rules, shown)
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
    setDir(next < step ? 'back' : 'next')
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
          who={who}
          onWho={setWho}
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
      {head && (
        <header className="wz-head">
          <p className="sw-eyebrow">{rules.ui.eyebrow}</p>
          <Heading className="sw-h2">
            <EmText text={rules.ui.title} />
          </Heading>
          <p className="wz-lead">{rules.ui.lead}</p>
        </header>
      )}
      <div className="wz-grid">
        <div className="wz-main sw-glass" data-wizard-dir={dir ?? undefined}>
          <ol className="wz-steps" aria-label={rules.ui.stepsLabel}>
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
          <div className="wz-mbar" data-wizard-bar>
            <span>
              <b>{result.name}</b>
              <span data-wizard-bar-price>{keepTogether(result.price)}</span>
            </span>
            <button
              type="button"
              aria-expanded={liveOpen}
              aria-controls={`${ids}-live`}
              onClick={() => setLiveOpen((open) => !open)}
            >
              {rules.ui.live}
            </button>
          </div>
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
        <aside
          ref={liveRef}
          id={`${ids}-live`}
          className="wz-live sw-glass"
          aria-label={rules.ui.live}
          data-open={liveOpen || undefined}
          data-wizard-live
        >
          <p className="wz-livehead">
            <span>{rules.ui.live}</span>
            <span>
              {rules.ui.stepOf
                .replace('{n}', String(index + 1))
                .replace('{m}', String(steps.length))}
            </span>
          </p>
          <div className="wz-screen">
            <Mockup
              key={`${preview.kind}-${preview.variant}`}
              kind={preview.kind}
              variant={preview.variant}
              className="wz-swap"
            />
          </div>
          <div className="wz-res">
            <p className="wz-name">
              <b data-wizard-name>{result.name}</b>
              <span>{keepTogether(result.term)}</span>
            </p>
            <p className="wz-price" data-wizard-price>
              <PriceTween text={keepTogether(result.price)} />
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
          <div className="wz-tip" data-wizard-tip>
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
