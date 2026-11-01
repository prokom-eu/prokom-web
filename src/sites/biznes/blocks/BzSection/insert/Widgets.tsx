'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { cx } from '@/components/ui/cx'
import {
  INSPOINTS_STEP,
  insPointsLabel,
  insPointsNote,
  insPointsUsage,
  pickProgram,
  poolCoverage,
} from '@/lib/biznes/pages/insert'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { cartActions } from '@/lib/cart/store'
import type { IndexProduct } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

import { BTN_OUTLINE, BTN_PRIMARY, CARD, EYEBROW } from '../ui'

type Program = Pick<IndexProduct, 'slug' | 'name' | 'benefit' | 'features' | 'image'>

/**
 * „Który Subiekt dla mnie?” (#ktory): three questions, the first option of each picked; the first
 * matching rule names the program (K33 §7). The card adds it with the note „Dobór Subiekta”.
 */
export function InsertPicker({
  data,
  programs,
}: {
  data: SectionData<'insert-picker'>
  programs: Record<string, Program>
}) {
  const [answers, setAnswers] = useState<number[]>(() => data.questions.map(() => 0))
  const rule = pickProgram(data.questions, data.rules, answers)
  const program = programs[rule.slug]
  return (
    <div className="grid gap-6 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        {data.questions.map((question, q) => (
          <fieldset key={question.q} className="flex flex-col gap-2.5">
            <legend className="mb-1 font-extrabold text-ink">{question.q}</legend>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option, o) => (
                <button
                  key={option.k}
                  type="button"
                  aria-pressed={answers[q] === o}
                  onClick={() => setAnswers((prev) => prev.map((a, i) => (i === q ? o : a)))}
                  className={cx(
                    'min-h-11 rounded-full px-4 font-extrabold transition-colors',
                    answers[q] === o
                      ? 'bg-ink text-surface'
                      : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                  )}
                >
                  {option.t}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div
        aria-live="polite"
        data-testid="subiekt-result"
        data-slug={rule.slug}
        className="flex flex-col gap-4 rounded-[24px] bg-surface-dark p-6 text-white sm:p-8"
      >
        <p className={cx(EYEBROW, 'text-accent-on-dark')}>Polecamy na start</p>
        <div className="flex items-center gap-4">
          {program?.image && (
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
              <Image
                unoptimized
                src={program.image.url}
                alt=""
                width={program.image.width}
                height={program.image.height}
                className="max-h-full w-auto object-contain"
              />
            </span>
          )}
          <div>
            <b className="font-display text-2xl font-extrabold">{program?.name ?? rule.slug}</b>
            {program?.benefit && <p className="text-white/80">{program.benefit}</p>}
          </div>
        </div>
        {program && program.features.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {program.features.slice(0, 3).map((feature) => (
              <li key={feature} className="rounded-full bg-white/10 px-3 py-1.5 text-[14px]">
                {feature}
              </li>
            ))}
          </ul>
        )}
        <p className="leading-relaxed text-white/85">{rule.why}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              cartActions.addItems(
                [{ id: rule.slug, q: 1, uwaga: 'Dobór Subiekta' }],
                () => program?.name ?? rule.slug,
              )
            }
            className={BTN_PRIMARY}
          >
            Dodaj do zapytania
          </button>
          <Link
            href={productHref(rule.slug)}
            className="inline-flex min-h-12 items-center px-3 font-extrabold text-white hover:underline"
          >
            Szczegóły →
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * InsPunkty calculator (#inspunkty): presets, ± on sales and purchase invoices, monthly and
 * yearly usage, how long the pool from the Abonament lasts; „Zapytaj o paczkę InsPunktów”.
 */
export function InsertPoints({ data }: { data: SectionData<'insert-points'> }) {
  const [sales, setSales] = useState(data.defaults[0])
  const [purchases, setPurchases] = useState(data.defaults[1])
  const { month, year } = insPointsUsage(sales, purchases)
  const coverage = poolCoverage(data.pool, month)
  const pct = Math.min(100, Math.round((data.pool / Math.max(year, 1)) * 100))
  const row = (title: string, hint: string, value: number, set: (n: number) => void) => (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3">
      <span className="flex flex-col">
        <b className="font-extrabold text-ink">{title}</b>
        <small className="text-[14px] text-ink-2">{hint}</small>
      </span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${title}: mniej`}
          onClick={() => set(Math.max(0, value - INSPOINTS_STEP))}
          className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-xl font-extrabold text-ink"
        >
          −
        </button>
        <output
          aria-label={title}
          className="w-12 text-center font-display text-xl font-extrabold tabular-nums text-ink"
        >
          {value}
        </output>
        <button
          type="button"
          aria-label={`${title}: więcej`}
          onClick={() => set(value + INSPOINTS_STEP)}
          className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-xl font-extrabold text-ink"
        >
          +
        </button>
      </span>
    </div>
  )
  return (
    <>
      <div className="grid gap-6 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className={cx(CARD, 'p-6 text-ink')}>
          <p className="mb-3 font-display text-lg font-extrabold">Jak to działa</p>
          <ol className="flex flex-col gap-3">
            {data.steps.map((step, i) => (
              <li key={step.t} className="flex gap-3">
                <i className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-display font-extrabold text-accent-text not-italic">
                  {i + 1}
                </i>
                <span className="flex flex-col">
                  <b className="font-extrabold">{step.t}</b>
                  <small className="text-[14px] leading-relaxed text-ink-2">{step.d}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className={cx(CARD, 'flex flex-col gap-3 p-6 text-ink')}>
          <p className="font-display text-lg font-extrabold">Policz w 10 sekund</p>
          <div className="flex flex-wrap gap-2">
            {data.presets.map((preset) => (
              <button
                key={preset.t}
                type="button"
                aria-pressed={sales === preset.sales && purchases === preset.purchases}
                onClick={() => {
                  setSales(preset.sales)
                  setPurchases(preset.purchases)
                }}
                className={cx(
                  'min-h-11 rounded-full px-4 font-extrabold',
                  sales === preset.sales && purchases === preset.purchases
                    ? 'bg-ink text-surface'
                    : 'bg-surface-2 text-ink',
                )}
              >
                {preset.t}
              </button>
            ))}
          </div>
          {row('Faktury sprzedaży', 'wysyłane do KSeF w miesiącu', sales, setSales)}
          {row('Faktury zakupu', 'pobierane z KSeF w miesiącu', purchases, setPurchases)}
          <div className="grid grid-cols-2 gap-3" aria-live="polite">
            <div className="rounded-2xl bg-surface-2 p-4">
              <small className="text-[13px] text-ink-3">Miesięcznie</small>
              <b
                data-testid="inspunkty-month"
                className="block font-display text-xl font-extrabold"
              >
                {insPointsLabel(month)}
              </b>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <small className="text-[13px] text-ink-3">W skali roku</small>
              <b data-testid="inspunkty-year" className="block font-display text-xl font-extrabold">
                {insPointsLabel(year)}
              </b>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[13px] text-ink-3">
              <span>Pula z Abonamentu · {data.pool}</span>
              <span>Zużycie roczne · {insPointsLabel(year)}</span>
            </div>
            <div
              className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-2"
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full bg-accent-text"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-ink-2">
            {coverage
              ? `${data.pool} InsPunktów z Abonamentu wystarczy przy takiej liczbie faktur na ${coverage}. Resztę dobierzemy w paczce — sprzedajemy paczki InsPunktów jako partner InsERT.`
              : 'Podaj liczbę faktur, żeby zobaczyć wynik.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                cartActions.addItems(
                  [{ id: data.slug, q: 1, uwaga: insPointsNote(month) }],
                  () => 'paczka InsPunktów',
                )
              }
              className={BTN_PRIMARY}
            >
              Zapytaj o paczkę InsPunktów
            </button>
            <Link href={productHref(data.slug)} className={BTN_OUTLINE}>
              Wszystko o InsPunktach
            </Link>
          </div>
        </div>
      </div>
      {data.notes.length > 0 && (
        <ul className="mt-5 grid gap-3 min-[900px]:grid-cols-3">
          {data.notes.map((note) => (
            <li key={note.t} className="rounded-2xl bg-surface-2 p-4 text-[15px] text-ink-2">
              <b className="text-ink">{note.t}</b> {note.d}
            </li>
          ))}
        </ul>
      )}
      {data.rules.length > 0 && (
        <details className="group mt-5">
          <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-2xl px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Zasady Portfela InsERT</span>
            <span className="hidden group-open:inline">Zwiń zasady Portfela</span>
          </summary>
          <ol className="mt-4 grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
            {data.rules.map((rule, i) => (
              <li key={rule.t} className={cx(CARD, 'flex flex-col gap-1.5 p-5 text-ink')}>
                <i className="font-display font-extrabold text-accent-text not-italic">{i + 1}</i>
                <b className="font-extrabold">{rule.t}</b>
                <span className="text-[14px] leading-relaxed text-ink-2">{rule.d}</span>
              </li>
            ))}
          </ol>
          {data.rulesSource && <p className="mt-3 text-[13px] text-ink-3">{data.rulesSource}</p>}
        </details>
      )}
    </>
  )
}
