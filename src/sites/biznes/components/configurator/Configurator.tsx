'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { planHref } from '@/lib/catalog/floorPlan'
import {
  configuratorHref,
  emptyWizardState,
  formatKr,
  runWizard,
  stepReady,
  type NeedSource,
  type WizardNeed,
  type WizardState,
} from '@/lib/catalog/wizardEngine'
import type { WizardScale, WizardStage } from '@/lib/catalog/wizard'
import { cartActions, openCartDrawer, useCart } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

import { BundleCard } from '../bundle/BundleCard'
import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'
import { ConfiguratorForm } from './ConfiguratorForm'
import { linkKey, type ConfiguratorData, type ConfiguratorProduct } from './types'

const STEPS = ['Firma', 'Sytuacja i skala', 'Szczegóły', 'Wynik'] as const

/** Tile colours of the firms (board `FC`) from the tone tokens; the rest on navy. */
const FIRM_TONE: Record<string, string> = {
  sklep: 'from-tone-green to-tone-green-2',
  gastro: 'from-tone-red to-tone-red-2',
  hotel: 'from-tone-violet to-tone-violet-2',
  biuro: 'from-tone-green to-tone-green-2',
  gabinet: 'from-tone-red to-tone-red-2',
  szkola: 'from-tone-blue to-tone-blue-2',
  produkcja: 'from-tone-blue to-tone-blue-2',
}

const STAGE_ICON: Record<WizardStage, IconName> = {
  nowa: 'home',
  wymiana: 'refresh',
  awaria: 'bell',
  ksef: 'doc',
}

/** „Kilka szczegółów o Twoim sklepie” (board `fGen`). */
const FIRM_LOCATIVE: Record<string, string> = {
  sklep: 'Twoim sklepie',
  gastro: 'Twoim lokalu',
  hotel: 'Twoim obiekcie',
  biuro: 'Twoim biurze',
  gabinet: 'Twoim gabinecie',
  szkola: 'Twojej szkole',
  warsztat: 'Twoim warsztacie',
}

const SOURCE_DOT: Record<'typ' | 'ans' | 'man', string> = {
  typ: 'bg-tone-blue',
  ans: 'bg-tone-green',
  man: 'bg-tone-violet',
}

const NEEDS: [string, string, string] = ['potrzeba', 'potrzeby', 'potrzeb']
const RECS: [string, string, string] = ['rekomendacja', 'rekomendacje', 'rekomendacji']

/** Where the note of a situation leads on the result (K35 §1.4). */
const NOTE_LINKS: Partial<Record<WizardStage, { label: string; href: string }>> = {
  nowa: { label: 'Ulga na kasę — szczegóły', href: '/ulga-na-kase-fiskalna' },
  ksef: { label: 'KSeF — co zrobić przed 2027', href: '/ksef' },
}

const CARD = 'rounded-[24px] bg-card shadow-[inset_0_0_0_1px_var(--border)]'
const TILE =
  'flex min-h-11 w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink-3)] aria-pressed:shadow-[inset_0_0_0_2px_var(--accent)]'

function PathIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx('size-5 shrink-0', className)}
    >
      <path d={d} />
    </svg>
  )
}

function Photo({ product, size }: { product: ConfiguratorProduct; size: 'big' | 'small' }) {
  return product.image ? (
    <Image
      src={product.image.url}
      alt={product.name}
      width={product.image.width}
      height={product.image.height}
      unoptimized
      className={cx(
        'h-auto w-auto object-contain',
        size === 'big' ? 'max-h-[78%] max-w-[78%]' : 'max-h-[70%] max-w-[70%]',
        STAGE_SHADOW,
      )}
    />
  ) : (
    <StageFallback icon={product.icon} size={size === 'big' ? 'md' : 'sm'} />
  )
}

/**
 * Konfigurator 3.0 (K35 §1, boards `Web-Kreator`, `Web-Kreator-wynik`, `App-Kreator*`): four
 * steps — firm, situation and scale, questions with the needs grid, the result — with a clickable
 * progress bar, „Twój zestaw na żywo” beside them (the form on the result) and a sticky bar on a
 * phone. The engine (`wizardEngine.ts`) runs on every change; „+ Do zapytania” adds to the shared
 * inquiry list with the note „Konfigurator: <potrzeba>”. The result is in `?kr=`.
 */
export function Configurator({ data }: { data: ConfiguratorData }) {
  const { rules, products } = data
  const [state, setState] = useState<WizardState>(data.initial.state)
  const [step, setStep] = useState(data.initial.step)
  const [copied, setCopied] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formId = useId()
  const cart = useCart()
  const inCart = (slug: string) => cart.some((item) => item.id === slug)

  const listed = (slug: string) => slug in products
  const result = useMemo(
    () => runWizard(rules, state, (slug) => slug in products, data.bundles),
    [rules, state, products, data.bundles],
  )
  const kr = formatKr(state, result.selected)
  const tops = result.needs.map((need) => need.top)
  const allTopsIn = tops.length > 0 && tops.every(inCart)

  // The result keeps its link in the address (K35 §1.3); the steps before it drop it.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (step === 3) url.searchParams.set('kr', kr)
    else url.searchParams.delete('kr')
    url.searchParams.delete('firma')
    window.history.replaceState(window.history.state, '', url)
  }, [step, kr])

  const go = (next: number) => {
    if (!stepReady(rules, state, next)) return
    setStep(next)
    setCopied(false)
    requestAnimationFrame(() => {
      const top = topRef.current
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: 'start' })
      headingRef.current?.focus({ preventScroll: true })
    })
  }
  const update = (patch: Partial<WizardState>, next?: number) => {
    const nextState = { ...state, ...patch }
    setState(nextState)
    if (next !== undefined && stepReady(rules, nextState, next)) {
      setStep(next)
      requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }))
    }
  }
  const restart = () => {
    setState(emptyWizardState())
    setStep(0)
  }

  const addOne = (need: WizardNeed, slug: string) => {
    if (inCart(slug)) {
      openCartDrawer()
      return
    }
    cartActions.addItems(
      [{ id: slug, q: 1, uwaga: `Konfigurator: ${need.title}` }],
      () => products[slug]?.name ?? slug,
    )
  }
  const addAll = () => {
    const outcome = cartActions.addItems(
      result.needs.map((need) => ({ id: need.top, q: 1, uwaga: `Konfigurator: ${need.title}` })),
      (n) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])} z konfiguratora`,
    )
    setAdded(
      outcome.added || outcome.noted
        ? 'Dodano polecane do zapytania.'
        : outcome.skipped
          ? 'Lista zapytania jest pełna.'
          : null,
    )
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(configuratorHref(kr), window.location.origin).href,
      )
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const toggleNeed = (id: string) => {
    const on = result.selected.includes(id)
    const auto = (result.sources[id] ?? []).some((s) => s !== 'man')
    const manual = { ...state.manual }
    if (on) {
      if (auto) manual[id] = false
      else delete manual[id]
    } else if (auto) delete manual[id]
    else manual[id] = true
    update({ manual })
  }

  const firm = rules.firms.find((f) => f.id === state.firm) ?? null
  const ready = stepReady(rules, state, 3) && result.needs.length > 0
  const heading =
    step === 3 ? (
      <>
        Oto, co polecamy
        <br />
        dla Twojej firmy.
      </>
    ) : (
      <>
        Dobierzmy rozwiązanie
        <br />
        dla Twojej firmy.
      </>
    )
  const eyebrow = step === 3 ? 'Wynik' : `Pytanie ${Math.min(step + 1, 3)} z 3`
  const stepValues = [
    result.firmName,
    [result.stageName, result.scaleName].filter(Boolean).join(' · '),
    step >= 2 && result.needs.length
      ? `${result.needs.length} ${plural(result.needs.length, NEEDS)}`
      : '',
    step === 3 ? 'gotowe' : '',
  ]

  const live = result.needs
    .map((need) => products[need.top])
    .filter(Boolean)
    .slice(0, 6)
  const altCount = result.needs.reduce((sum, need) => sum + need.alts.length, 0)

  return (
    <div ref={topRef} className="scroll-mt-24">
      <header className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
            <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
            Konfigurator · {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4.4vw,3.3rem)] leading-[1.02] font-extrabold tracking-tight text-ink">
            {heading}
          </h1>
          <p className="mt-3 max-w-[38rem] text-[15.5px] leading-relaxed text-ink-2">
            {step === 3
              ? 'Do każdej potrzeby: nasz wybór z uzasadnieniem i dwie inne opcje. Dodaj wszystko jednym kliknięciem albo wybierz pojedynczo.'
              : 'Trzy krótkie pytania, potem wynik. Pytania dopasowujemy do Twojej branży, a każdą rekomendację uzasadniamy. Do zapytania trafia tylko to, co sam wybierzesz.'}
          </p>
        </div>
        <ul className="hidden flex-wrap gap-2 sm:flex">
          {(
            [
              ['clock', 'ok. 1 minuta'],
              ['shield', 'bez rejestracji'],
              ['check', 'sam decydujesz, co trafi do zapytania'],
            ] as const
          ).map(([icon, text]) => (
            <li
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[13px] font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <Icon name={icon} strokeWidth={2.2} className="size-4 text-accent-text" />
              {text}
            </li>
          ))}
        </ul>
      </header>

      {/* Progress: steps already reached are clickable. */}
      <ol aria-label="Postęp" className="mt-6 grid grid-cols-4 gap-2 sm:gap-4">
        {STEPS.map((name, i) => {
          const can = i !== step && stepReady(rules, state, i) && (i < 3 || ready)
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => go(i)}
                disabled={!can}
                aria-current={i === step ? 'step' : undefined}
                className="flex min-h-11 w-full flex-col items-start justify-end gap-2 text-left disabled:cursor-default"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cx(
                      'hidden size-8 items-center justify-center rounded-lg text-[13px] font-extrabold sm:flex',
                      i === step
                        ? 'bg-accent text-accent-ink'
                        : i < step
                          ? 'bg-ok-text text-white'
                          : 'bg-surface-2 text-ink-2',
                    )}
                  >
                    {i < step ? <Icon name="check" strokeWidth={2.6} className="size-4" /> : i + 1}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cx(
                        'text-[12.5px] leading-tight font-extrabold sm:text-[14.5px]',
                        i <= step ? 'text-ink' : 'text-ink-3',
                      )}
                    >
                      {name}
                    </span>
                    <span className="hidden max-w-[16rem] truncate text-[12px] text-ink-3 sm:block">
                      {i === step && i < 3 ? 'teraz' : stepValues[i] || '—'}
                    </span>
                  </span>
                </span>
                <span aria-hidden="true" className="block h-1 w-full rounded-full bg-surface-3">
                  <span
                    className={cx(
                      'block h-full rounded-full',
                      i < step ? 'w-full bg-ok-text' : i === step ? 'w-1/2 bg-accent' : 'w-0',
                    )}
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <section aria-labelledby={`${formId}-step`} className="min-w-0">
          {step === 0 && (
            <div className={cx(CARD, 'p-5 sm:p-7')}>
              <StepHeading id={`${formId}-step`} innerRef={headingRef}>
                Jaką firmę prowadzisz?
              </StepHeading>
              <p className="mt-1 text-[14.5px] text-ink-2">
                Wybierz najbliższą — od tego zależą kolejne pytania i typowe potrzeby. Przejdziemy
                dalej sami.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rules.firms.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={state.firm === option.id}
                    onClick={() =>
                      update(
                        {
                          firm: option.id,
                          // Another firm: its own questions and needs.
                          ...(state.firm !== option.id ? { answers: {}, manual: {} } : {}),
                        },
                        // Situation and scale already given: straight to the details (board).
                        state.stage && state.scale ? 2 : 1,
                      )
                    }
                    className={cx(TILE, 'min-h-[76px]')}
                  >
                    <span
                      className={cx(
                        'flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-linear-145 text-white',
                        FIRM_TONE[option.id] ?? 'from-surface-dark to-surface-dark',
                      )}
                    >
                      <PathIcon d={option.iconPath} className="size-[22px]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[15.5px] font-extrabold text-ink">{option.name}</span>
                      <span className="text-[12.5px] font-semibold text-ink-3">
                        {option.caption}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={cx(CARD, 'p-5 sm:p-7')}>
              <StepHeading id={`${formId}-step`} innerRef={headingRef}>
                Co się teraz dzieje w firmie?
              </StepHeading>
              <p className="mt-1 text-[14.5px] text-ink-2">Od tego zależy, od czego zaczniemy.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {rules.stages.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={state.stage === option.id}
                    // „Coś nie działa” stays here: the service panel shows first (board).
                    onClick={() =>
                      update({ stage: option.id }, option.id === 'awaria' ? undefined : 2)
                    }
                    className={TILE}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text">
                      <Icon name={STAGE_ICON[option.id]} className="size-5" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[15px] font-extrabold text-ink">{option.name}</span>
                      <span className="text-[12.5px] text-ink-3">{option.caption}</span>
                    </span>
                  </button>
                ))}
              </div>
              {state.stage === 'awaria' && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-surface-2 p-4">
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="font-extrabold text-ink">Coś nie działa? Zadzwoń od razu.</p>
                    <p className="text-[13.5px] text-ink-2">
                      Jesteśmy autoryzowanym serwisem Posnet i Elzab, serwisujemy też komputery,
                      sieć i drukarki.
                    </p>
                  </div>
                  {data.phone && (
                    <a
                      href={data.phone.href}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 font-extrabold text-accent-ink"
                    >
                      <Icon name="phone" className="size-4" />
                      {data.phone.label}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={openCartDrawer}
                    className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 font-extrabold text-ink"
                  >
                    Opisz usterkę
                  </button>
                </div>
              )}
              <h3 className="mt-7 font-display text-[19px] font-extrabold text-ink">
                Ile stanowisk lub kas?
              </h3>
              <p className="mt-1 text-[14px] text-ink-2">
                Pomoże dobrać skalę — od jednej kasy po kilka budynków.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {rules.scales.map((option, i) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={state.scale === option.id}
                    onClick={() => update({ scale: option.id as WizardScale }, 2)}
                    className={cx(TILE, 'flex-col items-start gap-1')}
                  >
                    <span className="text-[12px] font-extrabold text-accent-text">{i + 1}</span>
                    <span className="text-[15px] font-extrabold text-ink">{option.name}</span>
                    <span className="text-[12.5px] text-ink-3">{option.caption}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => go(0)}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-extrabold text-ink hover:bg-surface-2"
                >
                  ← Wstecz
                </button>
                <p className="text-[13px] text-ink-3">
                  {!state.stage
                    ? 'Wybierz sytuację i skalę — przejdziemy dalej sami.'
                    : !state.scale
                      ? 'Jeszcze skala — i przechodzimy dalej.'
                      : ''}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={cx(CARD, 'p-5 sm:p-7')}>
              <StepHeading id={`${formId}-step`} innerRef={headingRef}>
                Kilka szczegółów o {FIRM_LOCATIVE[state.firm ?? ''] ?? 'Twojej firmie'}
              </StepHeading>
              <p className="mt-1 text-[14.5px] text-ink-2">
                Zaznaczyliśmy najczęstsze odpowiedzi — popraw tylko to, co się nie zgadza.
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {result.questions.map((q) => {
                  const yes = result.answers[q.id] ?? false
                  return (
                    <li
                      key={q.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1 basis-56" id={`${formId}-q-${q.id}`}>
                        <p className="font-extrabold text-ink">{q.question}</p>
                        <p className="text-[12.5px] text-ink-2">{q.caption}</p>
                      </div>
                      <div
                        role="group"
                        aria-labelledby={`${formId}-q-${q.id}`}
                        className="flex gap-1 rounded-xl bg-card p-1 shadow-[inset_0_0_0_1px_var(--border)]"
                      >
                        {([true, false] as const).map((value) => (
                          <button
                            key={String(value)}
                            type="button"
                            aria-pressed={yes === value}
                            onClick={() => update({ answers: { ...state.answers, [q.id]: value } })}
                            className="min-h-11 min-w-16 rounded-lg px-3 font-extrabold text-ink-2 aria-pressed:bg-accent aria-pressed:text-accent-ink"
                          >
                            {value ? 'Tak' : 'Nie'}
                          </button>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-7 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-[19px] font-extrabold text-ink">
                  Twoje potrzeby{' '}
                  <span className="text-ink-3">
                    · {result.selected.length} {plural(result.selected.length, NEEDS)}
                  </span>
                </h3>
                <ul className="flex flex-wrap gap-3 text-[12.5px] text-ink-3">
                  {(
                    [
                      ['typ', 'typowe dla branży'],
                      ['ans', 'z Twoich odpowiedzi'],
                      ['man', 'dodane przez Ciebie'],
                    ] as const
                  ).map(([source, label]) => (
                    <li key={source} className="flex items-center gap-1.5">
                      <i
                        aria-hidden="true"
                        className={cx('size-2 rounded-full', SOURCE_DOT[source])}
                      />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {rules.needs.map((need) => {
                  const on = result.selected.includes(need.id)
                  const dot = dotOf(result.sources[need.id])
                  return (
                    <button
                      key={need.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleNeed(need.id)}
                      className={cx(
                        TILE,
                        'p-3 text-[14px] font-bold',
                        on ? 'text-ink' : 'text-ink-3',
                      )}
                    >
                      <PathIcon d={need.iconPath} className={on ? 'text-accent-text' : ''} />
                      <span className="min-w-0 flex-1">{need.name}</span>
                      {on && dot && (
                        <i
                          aria-hidden="true"
                          className={cx('size-2 rounded-full', SOURCE_DOT[dot])}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-extrabold text-ink hover:bg-surface-2"
                >
                  ← Wstecz
                </button>
                <button
                  type="button"
                  onClick={() => go(3)}
                  disabled={!ready}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 font-extrabold text-accent-ink disabled:opacity-60"
                >
                  {ready
                    ? `Pokaż mój zestaw · ${result.needs.length} ${plural(result.needs.length, RECS)}`
                    : 'Zaznacz przynajmniej jedną potrzebę'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className={cx(CARD, 'p-5 sm:p-6')}>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-ok-text text-white">
                    <Icon name="check" strokeWidth={2.6} className="size-6" />
                  </span>
                  <StepHeading id={`${formId}-step`} innerRef={headingRef}>
                    Twój zestaw jest gotowy
                  </StepHeading>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      [result.firmName, 0],
                      [result.stageName, 1],
                      [result.scaleName, 1],
                      [`${result.needs.length} ${plural(result.needs.length, NEEDS)}`, 2],
                    ] as const
                  ).map(([label, target]) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(target)}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-[13px] font-bold text-ink"
                      >
                        {label}
                        <em className="text-[12px] font-extrabold text-accent-text not-italic">
                          zmień
                        </em>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addAll}
                  disabled={allTopsIn}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 font-extrabold text-accent-ink disabled:opacity-70 sm:w-auto"
                >
                  {allTopsIn
                    ? '✓ Wszystkie polecane w zapytaniu'
                    : `+ Dodaj wszystkie polecane · ${tops.length}`}
                </button>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-4 font-extrabold text-ink hover:bg-surface-2"
                >
                  {copied ? 'Link skopiowany ✓' : 'Skopiuj link do wyniku'}
                </button>
                <button
                  type="button"
                  onClick={() => go(2)}
                  className="inline-flex min-h-12 items-center px-2 text-[14px] font-bold text-ink-2 underline-offset-4 hover:underline"
                >
                  Zmień odpowiedzi
                </button>
                <p
                  role="status"
                  className="w-full text-[13px] font-semibold text-ink-2 empty:hidden"
                >
                  {added}
                </p>
              </div>

              {state.stage && rules.stageNotes[state.stage] && (
                <div className="rounded-[20px] bg-surface-2 p-4 sm:p-5">
                  <p className="font-extrabold text-ink">{rules.stageNotes[state.stage]!.title}</p>
                  <p className="mt-1 text-[14px] text-ink-2">
                    {rules.stageNotes[state.stage]!.text}
                  </p>
                  {NOTE_LINKS[state.stage] && (
                    <Link
                      href={NOTE_LINKS[state.stage]!.href}
                      className="mt-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-extrabold text-accent-text"
                    >
                      {NOTE_LINKS[state.stage]!.label}
                      <Icon name="arrow" className="size-4" />
                    </Link>
                  )}
                </div>
              )}

              {result.needs.map((need, i) => (
                <NeedCard
                  key={need.id}
                  need={need}
                  index={i}
                  count={result.needs.length}
                  products={products}
                  links={data.links}
                  inCart={inCart}
                  onAdd={addOne}
                  listed={listed}
                />
              ))}

              {(result.bundle && data.bundleCards[result.bundle]) ||
              (result.scene && data.sceneTitles[result.scene]) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.bundle && data.bundleCards[result.bundle] && (
                    <div>
                      <p className="mb-2 text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
                        Pasujący gotowy zestaw
                      </p>
                      <BundleCard bundle={data.bundleCards[result.bundle]!} headingLevel="h3" />
                    </div>
                  )}
                  {result.scene && data.sceneTitles[result.scene] && (
                    <div>
                      <p className="mb-2 text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
                        Plan lokalu
                      </p>
                      <Link
                        href={planHref(result.scene)}
                        className={cx(
                          CARD,
                          'flex min-h-24 items-center gap-3 p-4 hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                        )}
                      >
                        <span className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-accent-text">
                          <Icon name="map" className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-extrabold text-ink">
                            Zobacz, gdzie co stanie
                          </span>
                          <span className="block text-[13px] text-ink-3">
                            Plan: {data.sceneTitles[result.scene]}
                          </span>
                        </span>
                        <Icon name="arrow" className="size-4 text-ink-2" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}

              <div
                data-surface="dark"
                className="rounded-[22px] bg-surface-dark p-5 text-white sm:p-6"
              >
                <p className="font-display text-[18px] font-extrabold">Co dalej?</p>
                <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      ['Wysyłasz zapytanie', 'z listą i opisem firmy — bez rejestracji'],
                      [data.callbackTime ?? 'Odezwiemy się', 'w godzinach pracy'],
                      ['Oferta na piśmie', 'warianty do wyboru, bez zobowiązań'],
                    ] as const
                  ).map(([title, text], n) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[13px] font-extrabold">
                        {n + 1}
                      </span>
                      <span>
                        <span className="block font-extrabold">{title}</span>
                        <span className="block text-[13px] text-white/80">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Phone: the form under the result (the side column is the computer's). */}
              <div className={cx(CARD, 'p-5 lg:hidden')}>
                <ConfiguratorForm
                  id={`${formId}-form-m`}
                  formToken={data.formToken}
                  kr={kr}
                  cart={cart}
                  callbackTime={data.callbackTime}
                  onRestart={restart}
                />
              </div>
            </div>
          )}
        </section>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className={cx(CARD, 'p-5')}>
            {step < 3 ? (
              <div className="flex flex-col gap-3">
                <p className="font-display text-[17px] font-extrabold text-ink">
                  Twój zestaw na żywo
                </p>
                <dl className="flex flex-col gap-1.5">
                  {(
                    [
                      ['Firma', result.firmName],
                      ['Sytuacja', result.stageName],
                      ['Skala', result.scaleName],
                    ] as const
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2"
                    >
                      <dt className="text-[12px] font-bold text-ink-2">{label}</dt>
                      <dd className="text-right text-[13px] font-bold text-ink">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
                {firm && live.length > 0 ? (
                  <>
                    <ul className="grid grid-cols-3 gap-2">
                      {live.map((product) => (
                        <li key={product!.slug}>
                          <ProductStage className="aspect-square rounded-xl">
                            <Photo product={product!} size="small" />
                          </ProductStage>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[13px] text-ink-2">
                      <b className="text-ink">
                        {result.needs.length} {plural(result.needs.length, RECS)}
                      </b>
                      {altCount > 0 ? ` · +${altCount} do porównania` : ''}
                      <br />
                      {ready ? 'gotowe do pokazania' : 'powstaje na żywo'}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(3)}
                      disabled={!ready}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border font-extrabold text-ink hover:bg-surface-2 disabled:opacity-60"
                    >
                      Pokaż wynik teraz
                      <Icon name="arrow" className="size-4" />
                    </button>
                  </>
                ) : (
                  <p className="rounded-xl bg-surface-2 p-3 text-[13.5px] text-ink-2">
                    Wybierz branżę — tutaj zobaczysz, jak powstaje Twój zestaw.
                  </p>
                )}
                {data.phone && (
                  <a
                    href={data.phone.href}
                    className="inline-flex min-h-11 items-center gap-2 text-[14px] font-bold text-ink"
                  >
                    <Icon name="phone" className="size-4 text-accent-text" />
                    Wolisz porozmawiać? <b>{data.phone.label}</b>
                  </a>
                )}
              </div>
            ) : (
              <ConfiguratorForm
                id={`${formId}-form`}
                formToken={data.formToken}
                kr={kr}
                cart={cart}
                callbackTime={data.callbackTime}
                onRestart={restart}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Phone: the step, the count and the main button. It is the screen's sticky action
          (MOBILE-APLIKACJA §1), so the tab bar hides on this page (`data-sticky-action`). */}
      <div
        data-sticky-action
        className="sticky bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 mt-6 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[0_18px_40px_-20px_var(--shd),inset_0_0_0_1px_var(--border)] md:bottom-4 lg:hidden"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold text-ink">
            {step === 3 ? 'Wynik' : `Pytanie ${Math.min(step + 1, 3)} z 3`}
          </p>
          <p className="truncate text-[12.5px] text-ink-3">
            {step === 0
              ? 'wybierz branżę, żeby zacząć'
              : step === 3
                ? cart.length
                  ? `w zapytaniu: ${cart.length} ${plural(cart.length, ['pozycja', 'pozycje', 'pozycji'])}`
                  : 'wybierz, co dodać, albo wyślij sam opis'
                : `${result.needs.length} ${plural(result.needs.length, RECS)}`}
          </p>
        </div>
        {step === 3 ? (
          <a
            href={`#${formId}-form-m`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 font-extrabold text-accent-ink"
          >
            Wyślij
          </a>
        ) : (
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={!stepReady(rules, state, step + 1) || (step === 2 && !ready)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 font-extrabold text-accent-ink disabled:opacity-50"
          >
            {step === 2 ? 'Pokaż wynik' : 'Dalej'}
          </button>
        )}
      </div>
    </div>
  )
}

/** The dot of a selected need: by hand, from an answer, else typical for the firm. */
function dotOf(sources: readonly NeedSource[] | undefined): 'typ' | 'ans' | 'man' | null {
  if (!sources?.length) return null
  if (sources.includes('man')) return 'man'
  if (sources.includes('ans')) return 'ans'
  return 'typ'
}

function StepHeading({
  id,
  innerRef,
  children,
}: {
  id: string
  innerRef: React.RefObject<HTMLHeadingElement | null>
  children: ReactNode
}) {
  return (
    <h2
      id={id}
      ref={innerRef}
      tabIndex={-1}
      className="font-display text-[clamp(1.35rem,2.4vw,1.75rem)] leading-tight font-extrabold text-ink outline-none"
    >
      {children}
    </h2>
  )
}

function NeedCard({
  need,
  index,
  count,
  products,
  links,
  inCart,
  onAdd,
  listed,
}: {
  need: WizardNeed
  index: number
  count: number
  products: Record<string, ConfiguratorProduct>
  links: Record<string, string>
  inCart: (slug: string) => boolean
  onAdd: (need: WizardNeed, slug: string) => void
  listed: (slug: string) => boolean
}) {
  const top = products[need.top]
  if (!top) return null
  const alts = need.alts.filter(listed).map((slug) => products[slug]!)
  const shownLinks = need.links.flatMap((link) => {
    const href = links[linkKey(link.kind, link.target)]
    return href ? [{ label: link.label, href }] : []
  })
  return (
    <article className={cx(CARD, 'p-4 sm:p-5')}>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text">
            <PathIcon d={need.iconPath} />
          </span>
          <div>
            <p className="text-[11.5px] font-extrabold tracking-[0.12em] text-ink-3 uppercase">
              Potrzeba {index + 1} z {count}
            </p>
            <h3 className="font-display text-[18px] leading-tight font-extrabold text-ink">
              {need.title}
            </h3>
          </div>
        </div>
        <p className="min-w-0 flex-1 basis-72 text-[13.5px] text-ink-2">{need.why}</p>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-[20px] bg-surface-2 p-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-4">
          <Link href={top.href} className="relative block">
            <ProductStage className="aspect-square rounded-2xl">
              <Photo product={top} size="big" />
            </ProductStage>
            <span className="absolute top-2 left-2 rounded-full bg-accent px-2.5 py-1 text-[11.5px] font-extrabold text-accent-ink">
              Nasz wybór
            </span>
          </Link>
          <div className="flex min-w-0 flex-col gap-2">
            {top.brand && (
              <p className="text-[11.5px] font-extrabold tracking-[0.1em] text-ink-2 uppercase">
                {top.brand}
              </p>
            )}
            <Link
              href={top.href}
              className="font-display text-[17px] font-extrabold text-ink hover:underline"
            >
              {top.name}
            </Link>
            {top.benefit && <p className="text-[13.5px] text-ink-2">{top.benefit}</p>}
            {need.reasons.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                <span className="font-bold text-ink-2">Dopasowane, bo:</span>
                {need.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full bg-card px-2 py-0.5 font-bold text-ink-2 shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
            {top.features.length > 0 && (
              <ul className="flex flex-col gap-0.5 text-[13px] text-ink">
                {top.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5">
                    <Icon name="check" strokeWidth={2.6} className="size-3.5 text-ok-text" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAdd(need, top.slug)}
                className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-[14px] font-extrabold text-accent-ink"
              >
                {inCart(top.slug) ? '✓ Na liście' : '+ Do zapytania'}
              </button>
              <Link
                href={top.href}
                className="inline-flex min-h-11 items-center px-2 text-[14px] font-extrabold text-accent-text"
              >
                Szczegóły
              </Link>
            </div>
          </div>
        </div>
        <div>
          {alts.length > 0 && (
            <>
              <p className="text-[11.5px] font-extrabold tracking-[0.12em] text-ink-3 uppercase">
                Inne opcje
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {alts.map((product) => (
                  <li
                    key={product.slug}
                    className="flex items-center gap-3 rounded-2xl p-1.5 shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    <ProductStage className="size-14 shrink-0 rounded-xl">
                      <Photo product={product} size="small" />
                    </ProductStage>
                    <span className="min-w-0 flex-1">
                      {product.brand && (
                        <span className="block text-[11px] font-extrabold tracking-[0.08em] text-ink-3 uppercase">
                          {product.brand}
                        </span>
                      )}
                      <Link
                        href={product.href}
                        className="block text-[14px] leading-tight font-extrabold text-ink hover:underline"
                      >
                        {product.name}
                      </Link>
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdd(need, product.slug)}
                      aria-label={`${inCart(product.slug) ? 'Na liście' : 'Dodaj do zapytania'}: ${product.name}`}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-[18px] font-extrabold text-ink hover:bg-surface-3"
                    >
                      {inCart(product.slug) ? '✓' : '+'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {shownLinks.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {shownLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center gap-1 text-[13.5px] font-extrabold text-ink hover:underline"
                  >
                    {link.label}
                    <Icon name="arrow" className="size-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}
