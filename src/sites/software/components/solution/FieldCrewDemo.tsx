'use client'

import { useEffect, useReducer, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import {
  type DemoState,
  type DemoTexts,
  demoReducer,
  demoTexts,
  doneCount,
  INITIAL_DEMO,
  MAX_PHOTOS,
  TASK_COUNT,
} from '@/lib/software/fieldCrewDemo'
import type { SolutionDemo } from '@/lib/software/solutionPage'

import { AddToProject } from './AddToProject'

type Props = {
  demo: SolutionDemo
  project: { id: string; name: string }
}

/** Photo placeholders: the card gradients of the theme (`--grad-card-*`), never new colours. */
const PHOTOS = ['sage', 'sand', 'peach', 'sage'] as const

const AUTO_MS = 7000

/** Number of the fictitious job on the board. */
const JOB_NUMBER = 128

/**
 * Clickable field crew demo (spec. §6.1, board `Rozwiazanie`, `stany/89a`): the phone of a
 * worker and the office board change together. It plays on its own every 7 s until the visitor
 * clicks (never with `prefers-reduced-motion`, paused in a hidden tab). From 1081 px the laptop
 * with the board and the phone next to it; below a readable phone and the office card.
 * Fictitious data — the box under it says so.
 */
export function FieldCrewDemo({ demo, project }: Props) {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_DEMO)
  const texts = demoTexts(state)
  const [visible, setVisible] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Plays only while on screen: a demo moving below the fold would announce changes for nothing.
  useEffect(() => {
    const element = root.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(Boolean(entry?.isIntersecting)),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (state.touched || !visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      if (!document.hidden) dispatch({ type: 'auto' })
    }, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [state.touched, visible])

  const phone = (
    <Phone
      state={state}
      texts={texts}
      tasks={demo.tasks}
      onToggle={(index) => dispatch({ type: 'toggleTask', index })}
      onPhoto={() => dispatch({ type: 'addPhoto' })}
      onSign={() => dispatch({ type: 'sign' })}
      onNext={() => dispatch({ type: 'next' })}
    />
  )

  return (
    <section
      id="jak-dziala"
      aria-labelledby="demo-h"
      className="scroll-mt-24 py-6 min-[641px]:py-10"
    >
      <div
        ref={root}
        className="rounded-[28px] border border-accent-line bg-stage p-3 min-[641px]:p-6"
      >
        <h2 id="demo-h" className="sr-only">
          Jak to działa, krok po kroku
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Etapy zlecenia"
            className="flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-card p-1.5 shadow-[inset_0_0_0_1px_var(--border)] [scrollbar-width:none]"
          >
            {demo.steps.map(([number, name], i) => {
              const on = i === state.step
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'pick', step: i })}
                  className={cx(
                    'relative inline-flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-xl px-3 text-sm font-extrabold active:scale-[0.97] motion-reduce:transition-none min-[641px]:px-4 min-[641px]:text-base',
                    on ? 'bg-button text-accent-ink' : 'text-ink',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'inline-flex h-6 min-w-7 items-center justify-center rounded-full px-1.5 text-xs',
                      on ? 'bg-surface/20' : 'bg-chip text-ink-2',
                    )}
                  >
                    {number}
                  </span>
                  {name}
                  {on && !state.touched && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-surface/60 motion-safe:animate-demo-progress"
                    />
                  )}
                </button>
              )
            })}
          </div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-ink-2">
            <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
            {texts.hint}
          </p>
        </div>

        {/* Desktop: laptop with the office board and the phone over its right edge. */}
        <div className="relative mt-8 hidden pb-6 min-[1081px]:block">
          <OfficeBoard state={state} texts={texts} />
          <FloatCard
            className="left-0 top-10"
            icon="bell"
            title={texts.cardA.title}
            text={texts.cardA.text}
          />
          <FloatCard
            className="bottom-28 left-4"
            icon="check"
            title={texts.cardB.title}
            text={texts.cardB.text}
            ok
          />
          <div className="absolute right-[7%] top-12 w-[240px]">{phone}</div>
        </div>

        {/* Phone and tablet: a readable phone, then the office card (`stany/89a`). */}
        <div className="mt-6 grid gap-4 min-[641px]:grid-cols-[minmax(0,320px)_1fr] min-[641px]:items-start min-[1081px]:hidden">
          <div className="mx-auto w-full max-w-[320px]">{phone}</div>
          <div className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
              Tablica w biurze, na żywo
            </p>
            <p className="mt-2 font-extrabold">{texts.cardA.title}</p>
            <p className="text-sm text-ink-2">{texts.cardA.text}</p>
            <p className="mt-3 border-t border-border pt-3 text-sm text-ink-2">
              <b className="text-ink">Dziennik:</b> {texts.log}
            </p>
          </div>
        </div>

        <ol className="mt-6 grid gap-2.5 min-[641px]:grid-cols-3">
          {demo.flow.map((item, i) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <span className="font-display text-xl font-extrabold text-accent-text">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <b className="block font-extrabold">{item.title}</b>
                <span className="text-sm text-ink-2">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-3 flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
              {demo.intro.eyebrow}
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold leading-tight min-[641px]:text-[28px]">
              {demo.intro.title}
            </p>
            <p className="mt-1 text-sm text-ink-2">{demo.intro.lead}</p>
          </div>
          <div className="flex flex-col gap-2.5 min-[641px]:flex-row min-[641px]:shrink-0">
            <button
              type="button"
              onClick={() => dispatch({ type: 'restart' })}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
            >
              Od początku
            </button>
            <AddToProject id={project.id} name={project.name} />
          </div>
        </div>
        {/* Announced only after a click: the demo playing on its own stays silent (WCAG 4.1.3). */}
        <p className="sr-only" aria-live="polite">
          {state.touched ? `${demo.steps[state.step]?.[1] ?? ''}: ${texts.log}` : ''}
        </p>
      </div>
    </section>
  )
}

type PhoneProps = {
  state: DemoState
  texts: DemoTexts
  tasks: readonly string[]
  onToggle: (index: number) => void
  onPhoto: () => void
  onSign: () => void
  onNext: () => void
}

/** The worker's phone — a mock-up (smaller text allowed, MOBILE-APLIKACJA §5), real buttons. */
function Phone({ state, texts, tasks, onToggle, onPhoto, onSign, onNext }: PhoneProps) {
  return (
    <div className="rounded-[34px] bg-surface-dark p-2 shadow-raised">
      <div className="overflow-hidden rounded-[28px] bg-card">
        <div className="bg-accent px-4 pb-3 pt-6 text-accent-ink">
          <p className="text-xs font-bold opacity-90">Zlecenie #{JOB_NUMBER}</p>
          <p className="text-base font-extrabold">Łazienka · Kowalscy</p>
          <span className="mt-1.5 inline-block rounded-full bg-surface/20 px-2.5 py-0.5 text-xs font-extrabold">
            {texts.status}
          </span>
        </div>
        <div className="flex min-h-[290px] flex-col gap-2 p-3 text-[13px]">
          {state.step === 0 && (
            <>
              <p className="font-extrabold">12 min · 8,4 km</p>
              <p>ul. Orkana 12, Rabka-Zdrój</p>
              <p className="text-ink-2">Kod do bramy: 1234 · Pies w ogrodzie, łagodny</p>
              <p className="text-ink-2">Materiały: płytki 30×60 (12 m²), fuga grafit</p>
              <p className="mt-auto inline-flex items-center gap-2 font-bold text-accent-text">
                <Icon name="phone" className="size-4" /> Telefon do klienta w zleceniu
              </p>
            </>
          )}
          {state.step === 1 && (
            <>
              <ul className="flex flex-col gap-1.5">
                {tasks.map((task, i) => {
                  const on = state.tasks[i] ?? false
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => onToggle(i)}
                        className="flex min-h-11 w-full items-center gap-2.5 rounded-xl border border-border px-3 text-left active:scale-[0.98] motion-reduce:transition-none"
                      >
                        <span
                          aria-hidden="true"
                          className={cx(
                            'inline-flex size-4 shrink-0 items-center justify-center rounded-[5px]',
                            on ? 'bg-accent text-accent-ink' : 'border-2 border-border-input',
                          )}
                        >
                          {on && <Icon name="check" className="size-3" />}
                        </span>
                        {task}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="grid grid-cols-3 gap-1.5">
                {PHOTOS.slice(0, state.photos).map((tone, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="h-11 rounded-lg"
                    style={{ backgroundImage: `var(--grad-card-${tone})` }}
                  />
                ))}
                {state.photos < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={onPhoto}
                    className="min-h-11 rounded-lg border border-dashed border-accent-line text-xs font-bold text-accent-text"
                  >
                    + zdjęcie
                  </button>
                )}
              </div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-warn">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-warn" />
                Bez zasięgu · zapis w telefonie
              </p>
            </>
          )}
          {state.step === 2 && (
            <>
              <p className="font-extrabold">Protokół odbioru</p>
              <p className="text-ink-2">{texts.protocol}</p>
              <button
                type="button"
                onClick={onSign}
                aria-pressed={state.signed}
                className="flex min-h-24 items-center justify-center rounded-xl border-2 border-dashed border-border-input text-sm font-bold text-ink-2"
              >
                {state.signed ? (
                  <span className="font-display text-xl italic text-ink">Kowalski</span>
                ) : (
                  'kliknij, żeby podpisać'
                )}
              </button>
              <p className="text-xs text-ink-2">Klient dostanie protokół PDF na maila.</p>
            </>
          )}
          {state.step === 3 && (
            <>
              <p className="inline-flex items-center gap-2 font-extrabold text-ok-text">
                <Icon name="check" className="size-4" /> Zlecenie zakończone
              </p>
              <p className="text-ink-2">
                Protokół i zdjęcia są już w biurze. Faktura czeka na jedno kliknięcie.
              </p>
              <p className="mt-auto rounded-xl bg-surface-2 px-3 py-2 text-xs font-bold">
                Następne: Taras · Lis · 13:00
              </p>
            </>
          )}
        </div>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={onNext}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-3 text-sm font-extrabold text-accent-ink active:scale-[0.98] motion-reduce:transition-none"
          >
            {texts.button}
          </button>
        </div>
      </div>
    </div>
  )
}

type Job = { name: string; meta: string; focus?: boolean }

/** The office board in the laptop: the demo job moves between the columns. */
function OfficeBoard({ state, texts }: { state: PhoneProps['state']; texts: PhoneProps['texts'] }) {
  const done = doneCount(state)
  const job: Job = {
    name: `Łazienka #${JOB_NUMBER}`,
    meta: [
      'Kowalscy · ekipa Marka · 7:40',
      `Kowalscy · ${state.photos} zdj. · ${done}/${TASK_COUNT} zadań`,
      `Kowalscy · ${state.photos} zdj. · ${done}/${TASK_COUNT} zadań`,
      'Kowalscy · 3 zdj. · podpis',
    ][state.step]!,
    focus: true,
  }
  const columns: { title: string; jobs: Job[] }[] = [
    {
      title: 'Nowe',
      jobs: [
        { name: 'Elewacja', meta: 'Zając · czw' },
        { name: 'Taras', meta: 'Lis · pt' },
      ],
    },
    {
      title: 'W drodze',
      jobs: [
        { name: 'Kuchnia', meta: 'Nowakowie · ekipa Piotra' },
        ...(state.step === 0 ? [job] : []),
      ],
    },
    {
      title: 'Na miejscu',
      jobs: [
        { name: 'Poddasze', meta: 'Wiśniewscy · 2 zdjęcia' },
        ...(state.step === 1 || state.step === 2 ? [job] : []),
      ],
    },
    {
      title: 'Gotowe',
      jobs: [...(state.step === 3 ? [job] : []), { name: 'Schody', meta: 'Kmieć · wczoraj' }],
    },
  ]
  return (
    <div aria-hidden="true" className="mx-auto w-[78%]">
      <div className="rounded-t-[18px] bg-surface-dark p-3">
        <div className="rounded-lg bg-surface p-4 text-xs">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-base font-extrabold">Zlecenia · ten tydzień</p>
            <p className="flex gap-1.5 text-[11px] font-bold">
              <span className="rounded-md bg-ink px-2 py-1 text-surface">Wszystkie ekipy</span>
              <span className="rounded-md border border-border bg-card px-2 py-1">Ekipa Marka</span>
              <span className="rounded-md bg-surface-2 px-2 py-1 text-ok-text">● Na żywo</span>
            </p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {columns.map((column, i) => (
              <div key={column.title} className="min-h-[340px] rounded-lg bg-surface-2 p-2">
                <p className="mb-2 text-[11px] font-extrabold uppercase text-ink-2">
                  {column.title} · {texts.columns[i]}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {column.jobs.map((item) => (
                    <li
                      key={item.name + item.meta}
                      className={cx(
                        'rounded-md bg-card p-2',
                        item.focus && 'ring-2 ring-accent',
                        column.title === 'Gotowe' && !item.focus && 'opacity-70',
                      )}
                    >
                      <b className="block">{item.name}</b>
                      <span className="text-ink-2">{item.meta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-2.5 flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
            <span>
              <b>Dziennik:</b> {texts.log}
            </span>
            {state.step === 3 && <b className="text-accent-text">Wystaw fakturę →</b>}
          </p>
        </div>
      </div>
      <div className="h-3 rounded-b-xl bg-border" />
    </div>
  )
}

function FloatCard({
  className,
  icon,
  title,
  text,
  ok = false,
}: {
  className: string
  icon: 'bell' | 'check'
  title: string
  text: string
  ok?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        'absolute flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 shadow-raised',
        className,
      )}
    >
      <span
        className={cx(
          'inline-flex size-10 items-center justify-center rounded-xl text-accent-ink',
          ok ? 'bg-ok' : 'bg-accent',
        )}
      >
        <Icon name={icon} className="size-5" />
      </span>
      <span>
        <b className="block text-sm font-extrabold">{title}</b>
        <span className="text-xs text-ink-2">{text}</span>
      </span>
    </div>
  )
}
