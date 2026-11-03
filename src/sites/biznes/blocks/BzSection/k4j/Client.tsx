'use client'

import { useId, useState, useSyncExternalStore, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import {
  isAfterSwitch,
  ksefQuizResult,
  timelineStatus,
  visibleQuestions,
  type TimelineStatus,
  type KsefQuiz,
} from '@/lib/biznes/pages/ksef'
import { cartActions, useCart } from '@/lib/cart/store'

import { CARD, TAB_KEYS } from '../ui'

const noop = () => () => {}

/**
 * Phase of the KSeF texts (D-K4-7): after the switch day in Poland, or earlier with `?ksefpo=1`.
 * The server renders the phase of the day; the browser also reads `?ksefpo=1` (the address is
 * the browser's) and switches right after hydration, which matches thanks to the server snapshot.
 */
export function useAfterSwitch(date: string, serverAfter: boolean): boolean {
  return useSyncExternalStore(
    noop,
    () => isAfterSwitch(date, new Date(), window.location.search),
    () => serverAfter,
  )
}

/** Text in two versions: before and after the switch day. */
export function PhaseText({
  date,
  serverAfter,
  before,
  after,
}: {
  date: string
  serverAfter: boolean
  before: ReactNode
  after: ReactNode
}) {
  return <>{useAfterSwitch(date, serverAfter) ? after : before}</>
}

/** Timeline of the KSeF dates with their status; the server's statuses for the first paint. */
export function KsefTimeline({
  points,
  switchDate,
  serverAfter,
  serverStatuses,
}: {
  points: readonly { date: string; d: string; t: string; s: string }[]
  switchDate: string
  serverAfter: boolean
  serverStatuses: readonly TimelineStatus[]
}) {
  const after = useAfterSwitch(switchDate, serverAfter)
  const dates = points.map((point) => point.date)
  const statuses = useSyncExternalStore(
    noop,
    () => dates.map((_, i) => timelineStatus(dates, i, new Date())).join('|'),
    () => serverStatuses.join('|'),
  ).split('|') as TimelineStatus[]
  return (
    <ol className="flex flex-col gap-2.5">
      {points.map((point, i) => {
        const status: TimelineStatus = after ? 'obowiązuje' : (statuses[i] ?? 'wkrótce')
        return (
          <li
            key={point.date}
            className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 max-md:items-center max-md:bg-transparent max-md:px-1 max-md:py-1.5 max-md:ring-0"
          >
            <span
              aria-hidden="true"
              className={cx(
                'mt-1.5 size-2.5 shrink-0 rounded-full',
                status === 'obowiązuje'
                  ? 'bg-ok'
                  : status === 'następne'
                    ? 'bg-promo'
                    : 'bg-white/40',
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <em className="text-[13px] font-extrabold text-white not-italic max-md:text-[11px] max-md:text-white/75">
                {point.d}
              </em>
              <b className="font-extrabold max-md:text-sm max-md:leading-snug">{point.t}</b>
              {/* Phone (App-KSeF): date, name and status only. */}
              <small className="text-[13.5px] text-white/75 max-md:hidden">{point.s}</small>
            </span>
            <strong className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-extrabold max-md:px-2 max-md:text-[11px]">
              {status}
            </strong>
          </li>
        )
      })}
    </ol>
  )
}

/** „Czy KSeF dotyczy mojej firmy?” — three questions (two after the switch) and the result. */
export function KsefQuizWidget({
  quiz,
  switchDate,
  serverAfter,
}: {
  quiz: KsefQuiz
  switchDate: string
  serverAfter: boolean
}) {
  const after = useAfterSwitch(switchDate, serverAfter)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const result = ksefQuizResult(quiz, answers, after)
  return (
    // Phone (App-KSeF): the questions in one card, two equal answers side by side, a short result.
    <div className="grid gap-6 max-md:gap-0 max-md:rounded-[22px] max-md:p-4 max-md:shadow-[inset_0_0_0_1px_var(--border)] min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5 max-md:gap-3.5">
        {visibleQuestions(quiz, after).map((question) => {
          const current = answers[question.key] ?? question.options[0]!.k
          return (
            <fieldset key={question.key} className="flex min-w-0 flex-col gap-2.5 max-md:gap-2">
              <legend className="mb-1 font-extrabold text-ink max-md:mb-2 max-md:text-sm">
                {question.t}
              </legend>
              <div className="flex flex-wrap gap-2 max-md:grid max-md:grid-cols-2 max-md:gap-1 max-md:rounded-xl max-md:bg-surface-2 max-md:p-1">
                {question.options.map((option) => (
                  <button
                    key={option.k}
                    type="button"
                    aria-pressed={current === option.k}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.key]: option.k }))}
                    className={cx(
                      'min-h-11 rounded-full px-4 font-extrabold transition-colors max-md:rounded-[10px] max-md:px-2 max-md:text-[13px]',
                      current === option.k
                        ? 'bg-ink text-surface max-md:bg-accent-text max-md:text-accent-ink'
                        : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] max-md:bg-transparent max-md:shadow-none',
                    )}
                  >
                    {option.n}
                  </button>
                ))}
              </div>
            </fieldset>
          )
        })}
      </div>
      <div
        aria-live="polite"
        data-testid="ksef-result"
        className={cx(
          CARD,
          'flex flex-col gap-3 p-6 text-ink max-md:mt-4 max-md:gap-1.5 max-md:bg-surface-2 max-md:p-3.5 max-md:shadow-none',
        )}
      >
        <b className="font-display text-[1.4rem] leading-tight font-extrabold max-md:text-base">
          {result.t}
        </b>
        {result.l.map((line, i) => (
          <p
            key={line}
            className={cx(
              'leading-relaxed text-ink-2 max-md:text-[13px]',
              i > 0 && 'max-md:hidden',
            )}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

/** Ticked steps per key, kept in `localStorage` (read and written in `try/catch`). */
const stepListeners = new Set<() => void>()

function readTicked(key: string): string {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number').join(',') : ''
  } catch {
    return ''
  }
}

const memory = new Map<string, string>()

function writeTicked(key: string, ticked: number[]) {
  memory.set(key, ticked.join(','))
  try {
    window.localStorage.setItem(key, JSON.stringify(ticked))
  } catch {
    // Private mode or blocked storage: the ticks live until the page closes.
  }
  for (const listener of stepListeners) listener()
}

const subscribeSteps = (listener: () => void) => {
  stepListeners.add(listener)
  return () => stepListeners.delete(listener)
}

/** „6 kroków do gotowości”: each step ticks; the progress stays in this browser. */
export function KsefChecklist({
  steps,
  storageKey,
}: {
  steps: readonly { t: string; d: string; w: string }[]
  storageKey: string
}) {
  const ticked = useSyncExternalStore(
    subscribeSteps,
    () => memory.get(storageKey) ?? readTicked(storageKey),
    () => '',
  )
  const current = (ticked ? ticked.split(',').map(Number) : []).filter((n) => n < steps.length)
  const toggle = (i: number) =>
    writeTicked(storageKey, current.includes(i) ? current.filter((n) => n !== i) : [...current, i])
  return (
    <div className="flex flex-col gap-5">
      <p className="font-extrabold text-ink" aria-live="polite" data-testid="ksef-progress">
        {current.length} z {steps.length} gotowe
      </p>
      <ol className="grid gap-3 max-md:gap-2 min-[768px]:grid-cols-2 min-[1080px]:grid-cols-3">
        {steps.map((step, i) => {
          const on = current.includes(i)
          return (
            <li key={step.t}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(i)}
                // Phone (App-KSeF): one row — tick box, the step and its short note.
                className={cx(
                  'flex size-full flex-col gap-1.5 rounded-[22px] bg-card p-5 text-left text-ink transition-shadow max-md:grid max-md:grid-cols-[auto_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-0.5 max-md:rounded-[16px] max-md:px-3.5 max-md:py-3',
                  on
                    ? 'shadow-[inset_0_0_0_2px_var(--ok-text)]'
                    : 'shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                )}
              >
                <span className="flex items-center justify-between max-md:row-span-2 max-md:self-center">
                  <span className="font-display text-[13px] font-extrabold text-ink-2 max-md:hidden">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'flex size-7 items-center justify-center rounded-lg text-[14px] font-extrabold',
                      on ? 'bg-ok-text text-surface' : 'bg-surface-2 text-transparent',
                    )}
                  >
                    ✓
                  </span>
                </span>
                <b className="font-extrabold max-md:text-sm">{step.t}</b>
                <span className="text-[14.5px] leading-relaxed text-ink-2 max-md:hidden">
                  {step.d}
                </span>
                <small className="mt-auto pt-1 text-[13px] text-ink-2 max-md:pt-0 max-md:text-xs">
                  {step.w}
                </small>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/**
 * Tabs whose panels the server rendered (catalog cards): only the switching runs in the browser,
 * so the catalog index never ships to the page. Arrow keys and Home/End move between tabs.
 */
export function ClientTabs({
  label,
  tabs,
  panels,
}: {
  label: string
  tabs: readonly { t: string; n?: number }[]
  panels: readonly ReactNode[]
}) {
  const [current, setCurrent] = useState(0)
  const base = useId()
  const go = (next: number) => {
    const i = (next + tabs.length) % tabs.length
    setCurrent(i)
    document.getElementById(`${base}-t${i}`)?.focus()
  }
  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
        onKeyDown={(event) => {
          if (TAB_KEYS.has(event.key)) event.preventDefault()
          if (event.key === 'ArrowRight') go(current + 1)
          if (event.key === 'ArrowLeft') go(current - 1)
          if (event.key === 'Home') go(0)
          if (event.key === 'End') go(tabs.length - 1)
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.t}
            id={`${base}-t${i}`}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-controls={`${base}-p${i}`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => setCurrent(i)}
            className={cx(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-extrabold transition-colors',
              i === current
                ? 'bg-ink text-surface'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
            )}
          >
            {tab.t}
            {tab.n !== undefined && <span className="text-[13px] opacity-70">{tab.n}</span>}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={tabs[i]?.t ?? i}
          id={`${base}-p${i}`}
          role="tabpanel"
          aria-labelledby={`${base}-t${i}`}
          hidden={i !== current}
          className="mt-5"
        >
          {panel}
        </div>
      ))}
    </div>
  )
}

/** „+ Do zapytania” on a machine of the picker, with the note of the vending choice. */
export function AddMachineButton({
  slug,
  name,
  note,
}: {
  slug: string
  name: string
  note: string
}) {
  const listed = useCart().some((item) => item.id === slug)
  return (
    <button
      type="button"
      aria-pressed={listed}
      aria-label={`${listed ? 'W zapytaniu' : 'Dodaj do zapytania'}: ${name}`}
      onClick={() => {
        if (!listed) cartActions.addItems([{ id: slug, q: 1, uwaga: note }], () => name)
      }}
      className={cx(
        'inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-[14px] font-extrabold',
        listed ? 'bg-ok/15 text-ink' : 'bg-accent-text text-accent-ink',
      )}
    >
      {listed ? '✓ W zapytaniu' : '+ Do zapytania'}
    </button>
  )
}
