'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { Icon } from '@/components/ui/Icon'
import type { OfferView } from '@/lib/software/offer'
import { MAX_PROJECT_ITEMS, PROJECT_SEND_HREF } from '@/lib/software/project'
import { projectActions, useProject } from '@/lib/software/projectStore'

import {
  AskCard,
  CheckList,
  CompareTable,
  Fact,
  IncludedCard,
  LevelChoice,
  LiveBadge,
  OfferBadge,
  OfferSection,
  Questions,
  RelatedCards,
  Steps,
} from './OfferParts'
import { OfferThumb } from './OfferThumb'

/** Phone ≤ 640 px: a sheet from the bottom; above: a modal in the middle (spec. §5.1). */
const PANEL =
  'inset-0 m-auto h-[calc(100dvh-80px)] max-h-[980px] w-[min(1180px,calc(100vw-48px))] max-w-none rounded-[28px] min-[641px]:[&_[data-sheet-handle]]:hidden max-[640px]:inset-x-0 max-[640px]:bottom-0 max-[640px]:top-auto max-[640px]:h-auto max-[640px]:max-h-[94dvh] max-[640px]:w-full max-[640px]:rounded-b-none'
const BACKDROP = 'backdrop:bg-surface-dark/60 backdrop:backdrop-blur-sm'
const CONTENT = 'px-4 pb-6 pt-2.5 min-[641px]:px-7 min-[641px]:pt-0'

type Props = {
  /** Windows of the tenant's published solutions by slug (`getOfferViews`). */
  views: Readonly<Record<string, OfferView>>
  /** Open window; `null` = closed. */
  slug: string | null
  /** Order for ←/→ and the counter („1 / 29”): the visible list (catalog results, the 12). */
  list: readonly string[]
  onSwitch: (slug: string) => void
  /** `'link'`: a link in the window was followed (no history step back). */
  onClose: (reason?: 'link') => void
  /**
   * The window keeps no address of its own (start page, industry page): the phone's „back”
   * closes it (`BottomSheet` `closeOnBack`). The catalog drives history itself (`?rozwiazanie=`).
   */
  closeOnBack?: boolean
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d={back ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

/**
 * The offer window — one component for the catalog (SWR3), „12 rzeczy” (SWR5) and the industry
 * page (SW10). On the shared `BottomSheet`: native modal `<dialog>` (focus stays inside, Esc,
 * focus back on the card), a tap on the backdrop, a pull down on the phone. ←/→ move along
 * `list`; „+ Dodaj do wyceny” turns into „Wyślij do wyceny →”, which takes the focus.
 */
export function SolutionDialog({
  views,
  slug,
  list,
  onSwitch,
  onClose,
  closeOnBack = false,
}: Props) {
  const view = slug ? views[slug] : undefined
  const project = useProject()
  const [pick, setPick] = useState<{ slug: string; index: number } | null>(null)
  /** The list was full when this solution was added (no toast then, so the window says it). */
  const [fullFor, setFullFor] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const send = useRef<HTMLAnchorElement>(null)
  const focusSend = useRef(false)
  /** The solution a quick second ←/→ starts from, before the address has caught up. */
  const current = useRef(slug)
  useEffect(() => {
    current.current = slug
  }, [slug])

  const tones = useMemo(
    () => Object.fromEntries(Object.values(views).map((item) => [item.slug, item.tone])),
    [views],
  )
  const position = view ? list.indexOf(view.slug) : -1
  const added = view ? project.some((item) => item.id === view.slug) : false

  const step = (direction: 1 | -1) => {
    if (list.length < 2) return
    const from = current.current ? list.indexOf(current.current) : -1
    // Outside the list (opened from „Dobrze łączy się z”): → starts at the first, ← at the last.
    const index = from < 0 ? (direction === 1 ? 0 : list.length - 1) : from + direction
    const next = list[(index + list.length) % list.length]
    if (!next) return
    current.current = next
    onSwitch(next)
  }

  // A new solution starts at the top (its default level: `pick` is per slug).
  useEffect(() => {
    if (!slug) return
    top.current?.scrollIntoView({ block: 'start' })
    // Focus left on a part of the previous window (gone now): to the new name.
    const active = document.activeElement
    if (!active || active === document.body || !active.isConnected) heading.current?.focus()
  }, [slug])

  useEffect(() => {
    if (added && focusSend.current) {
      focusSend.current = false
      send.current?.focus()
    }
  }, [added])

  useEffect(() => {
    if (!slug) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const target = event.target as HTMLElement | null
      // Fields, and the rows that scroll sideways (levels, table): the arrows belong to them.
      if (
        target?.closest('input, textarea, select, [contenteditable="true"], table, [role="group"]')
      ) {
        return
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return
      event.preventDefault()
      step(event.key === 'ArrowRight' ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!view) {
    return (
      <BottomSheet open={false} onClose={onClose} title="" panelClassName={PANEL}>
        {null}
      </BottomSheet>
    )
  }

  const price = view.price
  const levels = price.kind === 'levels' ? price : null
  const selected = levels ? (pick?.slug === view.slug ? pick.index : levels.defaultIndex) : 0
  const level = levels?.levels[selected]
  const steps = level ? level.steps : view.steps
  const choose = (index: number) => setPick({ slug: view.slug, index })
  const bar = level ? { label: level.barLabel, price: level.price } : view.bar
  const projectName = level ? level.projectName : view.name

  const add = () => {
    focusSend.current = true
    const changed = projectActions.toggle(view.slug, projectName)
    if (!changed) {
      focusSend.current = false
      setFullFor(view.slug)
    }
  }

  const header = (
    <div className="-mx-4 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 min-[641px]:-mx-7 min-[641px]:px-7">
      {list.length > 1 && (
        <div className="flex items-center rounded-2xl border border-border bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => step(-1)}
            className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-card"
          >
            <Chevron back />
            <span className="sr-only">Poprzednie rozwiązanie</span>
          </button>
          {position >= 0 && (
            <span className="min-w-14 text-center text-sm font-bold tabular-nums">
              {position + 1} / {list.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => step(1)}
            className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-card"
          >
            <Chevron />
            <span className="sr-only">Następne rozwiązanie</span>
          </button>
        </div>
      )}
      <p className="hidden text-sm font-bold text-ink-2 min-[641px]:block">
        Oferta · {view.categoryName}
      </p>
      <button
        type="button"
        onClick={() => onClose()}
        className="ml-auto inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2"
      >
        <Icon name="x" strokeWidth={2.4} className="size-5" />
        <span className="sr-only">Zamknij</span>
      </button>
    </div>
  )

  const footer = (
    <div className="flex flex-wrap items-center gap-3 min-[641px]:px-3">
      <p className="min-w-0 flex-1" aria-live="polite">
        <span className="block text-xs font-bold text-ink-2">
          {added ? `✓ W wycenie · ${bar.label}` : bar.label}
        </span>
        <span className="block font-display text-xl font-extrabold text-accent-text">
          {bar.price}
        </span>
      </p>
      <Link
        href="/dobierz"
        className="hidden min-h-12 items-center rounded-2xl border border-border bg-card px-5 font-bold min-[641px]:inline-flex"
      >
        Dobierz w kreatorze
      </Link>
      {added ? (
        <Link
          ref={send}
          href={PROJECT_SEND_HREF}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-button px-5 font-bold text-accent-ink"
        >
          Wyślij do wyceny
          <Icon name="arrow" strokeWidth={2.4} className="size-4" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-12 items-center rounded-2xl bg-button px-5 font-bold text-accent-ink"
        >
          <span aria-hidden="true">+ Dodaj do wyceny</span>
          <span className="sr-only">Dodaj do wyceny: {projectName}</span>
        </button>
      )}
      {fullFor === view.slug && !added && (
        <p role="status" className="w-full text-xs font-bold text-ink-2">
          Twój projekt ma już {MAX_PROJECT_ITEMS} pozycji — usuń którąś, żeby dodać tę.
        </p>
      )}
    </div>
  )

  const facts = (
    <dl className="mt-4 flex flex-wrap gap-2.5">
      {level && <Fact label="Cena" value={level.price} />}
      {/* A level without its time in the panel: no empty tile (decyzja SWD2 3). */}
      {(level ? level.term : view.term) && (
        <Fact label={view.termLabel} value={(level ? level.term : view.term) ?? ''} />
      )}
      {view.forWhomShort && <Fact label="Dla kogo" value={view.forWhomShort} wide />}
    </dl>
  )

  const guarantees =
    view.guarantees.length > 0 ? (
      <ul className="space-y-1.5 text-sm font-bold">
        {view.guarantees.map((item) => (
          <li key={item} className="flex gap-2">
            <Icon name="check" strokeWidth={2.6} className="mt-0.5 size-4 shrink-0 text-ok-text" />
            {item}
          </li>
        ))}
      </ul>
    ) : null

  const who =
    view.forWhom || view.situations.length > 0 ? (
      <OfferSection title="Dla kogo">
        {view.forWhom && <p className="text-ink-2">{view.forWhom}</p>}
        {view.situations.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm">
            {view.situations.map((item) => (
              <li key={item} className="flex gap-2">
                <Icon
                  name="check"
                  strokeWidth={2.6}
                  className="mt-0.5 size-4 shrink-0 text-ok-text"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </OfferSection>
    ) : null

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={view.name}
      headingRef={heading}
      header={header}
      stickyHeader
      panelClassName={PANEL}
      backdropClassName={BACKDROP}
      contentClassName={CONTENT}
      footer={footer}
      dragToClose
      closeOnBack={closeOnBack}
    >
      <div ref={top} className="scroll-mt-24" />
      <div className="mt-5 grid gap-6 min-[981px]:grid-cols-[minmax(0,1fr)_440px]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {view.label && <OfferBadge tone={view.tone}>{view.label}</OfferBadge>}
            {view.hasLivePreview && <LiveBadge />}
          </div>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-3 font-display text-3xl font-extrabold leading-tight outline-none min-[641px]:text-[40px]"
          >
            {view.name}
          </h2>
          {view.lead && <p className="mt-2 text-lg text-ink-2">{view.lead}</p>}
          {facts}
          <div className="mt-4 space-y-3">
            {price.kind === 'included' && <IncludedCard price={price} />}
            {price.kind === 'ask' && <AskCard price={price} />}
            {levels && (
              <LevelChoice
                title={levels.title}
                levels={levels.levels}
                selected={selected}
                onPick={choose}
              />
            )}
            {view.note && (
              <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm">{view.note}</p>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="relative">
            <OfferThumb src={view.thumbnail} tone={view.tone} eager className="rounded-[22px]" />
            {view.toast && (
              <span
                aria-hidden="true"
                className="absolute -bottom-3 left-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl bg-surface-dark px-3 py-2 text-xs font-bold text-white shadow-raised"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-ok" />
                <span className="truncate">{view.toast}</span>
              </span>
            )}
          </div>
          {view.hasLivePreview && (
            // The full solution page with its live preview comes with SW10.
            <Link
              href={`/rozwiazania/${view.slug}`}
              className="mt-2 flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-4 font-bold text-accent-text"
            >
              Zobacz podgląd na żywo
            </Link>
          )}
          {guarantees}
        </div>
      </div>

      <div className="mt-6 grid items-start gap-4 min-[981px]:grid-cols-[repeat(2,minmax(0,1fr))]">
        <div className="min-w-0 space-y-4">
          {levels && levels.rows.length > 0 && (
            <CompareTable
              title={levels.monthly ? 'Porównanie poziomów' : 'Porównanie audytów'}
              first={levels.monthly ? 'Cena za miesiąc' : 'Zakres'}
              levels={levels.levels}
              rows={levels.rows}
              selected={selected}
              onPick={choose}
            />
          )}
          {view.benefits.items.length > 0 && (
            <OfferSection title={view.benefits.title || 'Co dostajesz'}>
              <CheckList items={view.benefits.items} />
            </OfferSection>
          )}
        </div>
        <div className="min-w-0 space-y-4">
          {view.example && (
            <OfferSection
              title="Przykład z życia"
              aside={
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold">
                  Przykład
                </span>
              }
            >
              <p className="border-l-4 border-accent-line pl-4 text-ink-2">{view.example}</p>
            </OfferSection>
          )}
          {who}
        </div>
      </div>

      {steps.length > 0 && (
        <OfferSection title="Jak to wygląda" className="mt-4">
          <Steps steps={steps} />
        </OfferSection>
      )}

      {(view.needs.length > 0 || view.faq.length > 0) && (
        <div className="mt-4 grid items-start gap-4 min-[981px]:grid-cols-[repeat(2,minmax(0,1fr))]">
          {view.needs.length > 0 && (
            <OfferSection title="Co od Ciebie">
              <ul className="flex flex-wrap gap-2">
                {view.needs.map((item) => (
                  <li key={item} className="rounded-xl bg-surface-2 px-3.5 py-2 font-bold">
                    {item}
                  </li>
                ))}
              </ul>
              {view.needsHint && <p className="mt-3 text-sm text-ink-2">{view.needsHint}</p>}
            </OfferSection>
          )}
          {view.faq.length > 0 && (
            <OfferSection title="Pytania, które słyszymy">
              {/* `key`: a new solution starts with its first answer open. */}
              <Questions key={view.slug} faq={view.faq} />
            </OfferSection>
          )}
        </div>
      )}

      {view.related.length > 0 && (
        <OfferSection title="Dobrze łączy się z" className="mt-4">
          <RelatedCards cards={view.related} tones={tones} onPick={onSwitch} />
        </OfferSection>
      )}
    </BottomSheet>
  )
}
