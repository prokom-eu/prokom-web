import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { type ProcessQuote, type ProcessStage, stageEyebrow } from '@/lib/software/process'

import { WeekTrack } from './ProcessExplorer'

type Texts = { stage: string; get: string; you: string }
/** Sample quote of stage 2; `null` when it cannot be shown (missing fact on production). */
type Quote = ProcessQuote | null

/**
 * One panel of the process (spec. §4 pkt 6), rendered on the server: what happens, what you
 * get, what you do and when you pay; next to it a picture of the stage (board `Main`, `prv1–5`)
 * — HTML from tokens, decorative, sample content. Stage 2 shows the sample quote of
 * `proceduralMock` (amounts of the price list, a made-up customer); its „szkic systemu” is left
 * out on a phone (spec. §4, telefon).
 */
export function ProcessPanel({
  stage,
  texts,
  quote,
}: {
  stage: ProcessStage
  texts: Texts
  quote: Quote
}) {
  return (
    <div className="grid overflow-hidden rounded-[28px] border border-border bg-card shadow-raised min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 p-5 min-[640px]:p-7">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent-text uppercase min-[640px]:text-sm">
          {stageEyebrow(texts.stage, stage)}
        </p>
        <h3 className="font-display text-[26px] leading-tight font-extrabold min-[640px]:text-[30px]">
          {stage.heading}
        </h3>
        {stage.text && (
          <p className="leading-relaxed text-ink-2 min-[640px]:text-base">{stage.text}</p>
        )}
        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <List title={texts.get} items={stage.get} tick />
          <List title={texts.you} items={stage.you} />
        </div>
        {stage.pay && (
          <p className="mt-1 flex items-start gap-3.5 rounded-2xl border border-accent-line bg-accent-soft p-4">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-button text-accent-ink"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18v12H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
              </svg>
            </span>
            <span className="flex flex-col">
              <b>{stage.pay}</b>
              {stage.payNote && <span className="text-[13px] text-ink-2">{stage.payNote}</span>}
            </span>
          </p>
        )}
      </div>
      <div
        aria-hidden="true"
        className="flex flex-col justify-center gap-4 bg-accent-soft bg-dots px-4 py-6 min-[640px]:p-7"
      >
        {VISUALS[stage.num]?.(quote)}
      </div>
    </div>
  )
}

function List({ title, items, tick = false }: { title: string; items: string[]; tick?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase">{title}</p>
      <ul className="flex flex-col gap-2 text-[15px]">
        {items.map((item, i) => (
          <li key={`${i}-${item}`} className="flex items-start gap-2.5">
            <i
              aria-hidden="true"
              className={cx(
                'mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full text-[10px] not-italic',
                tick ? 'bg-accent-soft text-accent-text' : 'bg-chip text-ink-2',
              )}
            >
              {tick ? '✓' : '·'}
            </i>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-extrabold text-accent-text">{children}</span>
}

const bubble = 'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-raised'

function Talk() {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <span className={cx(bubble, 'self-start bg-card')}>
          Mamy 3 ekipy, zlecenia idą SMS-em, protokoły na kartkach…
        </span>
        <span className={cx(bubble, 'self-end bg-button text-accent-ink')}>
          Pokażę, jak to może wyglądać. Macie program do faktur?
        </span>
        <span className={cx(bubble, 'self-start bg-card')}>Tak, Subiekt.</span>
        <span className={cx(bubble, 'self-end bg-button text-accent-ink')}>
          Zostaje. Podepniemy go.
        </span>
      </div>
      <Caption>rozmowa · 30 min · u Was albo online</Caption>
    </>
  )
}

function QuoteDoc({ quote }: { quote: ProcessQuote }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-card p-4 text-[13px] text-ink shadow-raised min-[640px]:p-5">
      <span className="flex items-center justify-between gap-3 text-xs">
        <b className="text-[13px]">
          PRO<span className="text-accent-text">-</span>KOM Software
        </b>
        <span className="text-ink-2">Wycena nr {quote.number}</span>
      </span>
      <b className="text-[15px]">{quote.title}</b>
      {quote.rows.map(([name, value], i) => (
        <span
          key={`${i}-${name}`}
          className="flex justify-between gap-3 border-b border-dashed border-border pb-2"
        >
          <span>{name}</span>
          <span className="text-right">{value}</span>
        </span>
      ))}
      <span className="flex justify-between gap-3 font-extrabold">
        <span>{quote.totalLabel}</span>
        <span className="text-right">{quote.total}</span>
      </span>
      <span className="flex items-center justify-between gap-3 text-xs text-ink-2">
        <span>Termin: {quote.term} · Ważna 30 dni</span>
        <span className="-rotate-6 rounded-md border-2 border-ok-text px-2 py-0.5 font-extrabold tracking-[0.08em] text-ok-text">
          NA PIŚMIE
        </span>
      </span>
    </div>
  )
}

function Review(quote: Quote) {
  return (
    <>
      {quote && <QuoteDoc quote={quote} />}
      <div className="hidden flex-col gap-2 min-[641px]:flex">
        <div className="flex h-20 gap-2 rounded-xl bg-card p-2 shadow-raised">
          <span className="flex w-6 flex-col gap-1 rounded bg-surface-2 p-1">
            <i className="h-1 rounded bg-accent" />
            <i className="h-1 rounded bg-border" />
            <i className="h-1 rounded bg-border" />
          </span>
          <span className="flex flex-1 flex-col gap-1.5">
            <i className="h-3 rounded bg-surface-2" />
            <i className="h-1.5 w-[70%] rounded bg-accent-soft" />
            <i className="h-1.5 w-[45%] rounded bg-surface-2" />
          </span>
        </div>
        <Caption>szkic Twojego systemu, za darmo</Caption>
      </div>
    </>
  )
}

function Launch() {
  return (
    <>
      <ul className="flex flex-col gap-2 rounded-2xl bg-card p-4 text-sm shadow-raised">
        {[
          'Dane przeniesione z Excela',
          'Konta dla 7 pracowników',
          'Szkolenie w biurze · 1,5 h',
          'Instrukcja na 2 strony',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2.5">
            <i className="grid size-5 place-items-center rounded-full bg-ok text-[10px] not-italic text-white">
              ✓
            </i>
            {item}
          </li>
        ))}
        <li className="flex items-center gap-2.5 font-extrabold text-accent-text">
          <i className="size-5 rounded-full border-2 border-accent motion-safe:animate-pulse" />
          Start: poniedziałek 7:00
        </li>
      </ul>
      <Caption>uruchomienie bez zatrzymywania firmy</Caption>
    </>
  )
}

function Care() {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Kopia zapasowa', 'dziś 03:00'],
          ['Aktualizacje', 'w piątek'],
          ['Monitoring', 'działa · 100%'],
          ['Czas reakcji', 'zapisany w umowie'],
        ].map(([name, state]) => (
          <span
            key={name}
            className="flex flex-col gap-1 rounded-xl bg-card p-3 text-xs shadow-raised"
          >
            <b className="text-[13px]">{name}</b>
            <span className="flex items-center gap-1.5 text-ink-2">
              <i
                className={cx(
                  'size-2 rounded-full bg-ok',
                  name === 'Monitoring' && 'motion-safe:animate-pulse',
                )}
              />
              {state}
            </span>
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        {['Rok 1 · system zleceń', 'Rok 2 · + aplikacja ekip', 'Rok 3 · + panel klienta'].map(
          (year, i) => (
            <span
              key={year}
              className="rounded-lg bg-card px-3 py-2 font-bold shadow-raised"
              style={{ marginLeft: `${i * 12}%` }}
            >
              {year}
            </span>
          ),
        )}
      </div>
      <Caption>rośnie razem z firmą, bez pisania od nowa</Caption>
    </>
  )
}

function Build() {
  return (
    <>
      <WeekTrack />
      <Caption>klikasz, zgłaszasz uwagi, my poprawiamy</Caption>
    </>
  )
}

/**
 * Pictures of the 5 stages by their number (rozmowa, wycena, budowa, wdrożenie, opieka) — not by
 * position, since a stage may be skipped on production; another number has no picture.
 */
const VISUALS: Record<string, (quote: Quote) => ReactNode> = {
  '01': Talk,
  '02': Review,
  '03': Build,
  '04': Launch,
  '05': Care,
}
