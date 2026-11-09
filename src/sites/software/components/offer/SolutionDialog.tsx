'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics/track'
import { stripBold } from '@/lib/site/emphasis'
import type { OfferView } from '@/lib/software/offer'
import { MAX_PROJECT_ITEMS, PROJECT_SEND_HREF } from '@/lib/software/project'
import { heroHead } from '@/lib/software/heroPrice'
import { projectActions, useProject } from '@/lib/software/projectStore'

import { OfferGallery } from './OfferGallery'
import { CategoryDots, SectionTabs, ShortcutHint, type TabItem } from './OfferNav'
import {
  AskCard,
  CheckDot,
  CheckList,
  CompareTable,
  ExampleQuote,
  type HeroPrice,
  IncludedChips,
  LevelChoice,
  LiveBadge,
  OfferBadge,
  OfferSection,
  PriceHero,
  Questions,
  RelatedCards,
  Steps,
} from './OfferParts'

/**
 * Phone ≤ 767 px (OKNO-OFERTY-PREMIUM §2.6): a sheet from the bottom; above: a wide glass modal
 * in the middle (ZMIANY-v24 §6.1, AUDYT-0811 #5, odbiór 08.11: up to 1480 × 920, radius 28, the
 * page dimmed and blurred behind).
 */
const PANEL =
  'sw-offer-panel inset-0 m-auto h-[min(920px,calc(100dvh-40px))] max-h-none w-[min(1480px,calc(100vw-48px))] max-w-none rounded-[28px] min-[768px]:[&_[data-sheet-handle]]:hidden max-[767px]:inset-x-0 max-[767px]:bottom-0 max-[767px]:top-auto max-[767px]:h-auto max-[767px]:max-h-[94dvh] max-[767px]:w-full max-[767px]:rounded-b-none'
const BACKDROP = 'backdrop:bg-surface-dark/70 backdrop:backdrop-blur-md'
const CONTENT = 'px-4 pb-6 pt-2.5 min-[768px]:px-7 min-[768px]:pt-0'

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
 * The offer window (v24 look, OKNO-OFERTY-PREMIUM „okno decyzji”) — one component for the
 * catalog, the price page and the industry page. On the shared `BottomSheet`: native modal
 * `<dialog>` (focus stays inside, Esc, focus back on the card), a tap on the backdrop, a pull down
 * on the phone. ←/→ and the category dots move along `list`; the tabs scroll to the sections;
 * „+ Do wyceny” turns into „✓ W wycenie · Wyślij →”, which takes the focus.
 */
export function SolutionDialog({
  views,
  slug,
  list,
  onSwitch,
  onClose,
  closeOnBack = false,
}: Props) {
  const opened = slug ? views[slug] : undefined
  // While it closes, the window keeps showing the last solution (SWV7: the closing transition
  // would otherwise move an empty panel). Stored during render, the React way for „previous”.
  const [lastView, setLastView] = useState(opened)
  if (opened && opened !== lastView) setLastView(opened)
  const view = opened ?? lastView
  const isOpen = Boolean(opened)
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

  const position = view ? list.indexOf(view.slug) : -1
  const added = view ? project.some((item) => item.id === view.slug) : false

  const go = (next: string) => {
    current.current = next
    onSwitch(next)
  }

  const step = (direction: 1 | -1) => {
    if (list.length < 2) return
    const from = current.current ? list.indexOf(current.current) : -1
    // Outside the list (opened from „Dobrze łączy się z”): → starts at the first, ← at the last.
    const index = from < 0 ? (direction === 1 ? 0 : list.length - 1) : from + direction
    const next = list[(index + list.length) % list.length]
    if (next) go(next)
  }

  // A new solution starts at the top (its default level: `pick` is per slug).
  const shown = useRef(false)
  useEffect(() => {
    if (!slug) {
      shown.current = false
      return
    }
    track('oferta_okno', { slug })
    top.current?.scrollIntoView({ block: 'start' })
    // On opening the focus goes to the name, not to „←” — `showModal()` (BottomSheet, whose
    // effect runs first) puts it on the first button, and its ring looked like an error
    // (AUDYT po SWA7 #8). Later, focus left on a part of the previous window (gone now): too.
    const opening = !shown.current
    shown.current = true
    const active = document.activeElement
    if (opening || !active || active === document.body || !active.isConnected) {
      heading.current?.focus({ preventScroll: true })
    }
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
      <BottomSheet open={false} onClose={onClose} title="" panelClassName={PANEL} motion="dialog">
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
    // `toggle` also takes an item out: only an addition counts as `oferta_dodaj`.
    const adding = !project.some((item) => item.id === view.slug)
    focusSend.current = true
    const changed = projectActions.toggle(view.slug, projectName)
    if (!changed) {
      focusSend.current = false
      setFullFor(view.slug)
      return
    }
    if (adding) track('oferta_dodaj', { slug: view.slug })
  }

  // The window's sections, for the tabs in the header (§2.1) — only those this offer has.
  const hasScope =
    price.kind !== 'levels' || levels !== null || view.benefits.items.length > 0 || !!view.example
  const hasHow = steps.length > 0 || view.needs.length > 0
  const hasWho = Boolean(view.forWhom) || view.situations.length > 0
  const tabs: TabItem[] = [
    ...(hasScope ? [{ id: 'oferta-zakres', label: 'Zakres' }] : []),
    ...(hasHow ? [{ id: 'oferta-jak', label: 'Jak to wygląda' }] : []),
    ...(hasWho ? [{ id: 'oferta-dla-kogo', label: 'Dla kogo' }] : []),
    { id: 'oferta-pytania', label: 'Pytania' },
  ]

  // Dots of the offers of this category in the window's list (§2.1 H).
  const dots = list.flatMap((item) => {
    const other = views[item]
    return other && other.category === view.category ? [{ slug: item, name: other.name }] : []
  })

  const header = (
    <div className="sw-offer-head -mx-4 flex items-center gap-3 border-b border-border px-4 py-3 min-[768px]:-mx-7 min-[768px]:px-7">
      {list.length > 1 && (
        <div className="flex shrink-0 items-center rounded-full border border-border bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => step(-1)}
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-card"
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
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-card"
          >
            <Chevron />
            <span className="sr-only">Następne rozwiązanie</span>
          </button>
        </div>
      )}
      {dots.length > 1 ? (
        <CategoryDots items={dots} current={view.slug} label={view.categoryName} onPick={go} />
      ) : (
        <p className="sw-eyebrow hidden min-[768px]:block">Oferta · {view.categoryName}</p>
      )}
      <SectionTabs items={tabs} resetKey={view.slug} />
      <ShortcutHint />
      <button
        type="button"
        onClick={() => onClose()}
        className="ml-auto inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2"
      >
        <Icon name="x" strokeWidth={2.4} className="size-5" />
        <span className="sr-only">Zamknij</span>
      </button>
    </div>
  )

  // The bar (§2.4 G): the price and the state on the left; „+ Do wyceny” (turns into
  // „✓ W wycenie · Wyślij →” and takes the focus), then the main step „Zapytaj o tę ofertę →”.
  const footer = (
    <div className="flex items-center gap-3 min-[768px]:px-3">
      <p className="min-w-0 flex-1" aria-live="polite">
        <span className="block truncate text-xs font-bold text-ink-2">
          {added ? `✓ W wycenie · ${bar.label}` : bar.label}
        </span>
        <span className="block font-display text-xl font-extrabold text-accent-text">
          {bar.price}
        </span>
      </p>
      {added ? (
        <Link
          ref={send}
          href={PROJECT_SEND_HREF}
          data-motion="button-outline"
          className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-accent-line px-4 font-bold text-accent-text min-[768px]:px-5"
        >
          <span aria-hidden="true">
            ✓<span className="max-[767px]:hidden"> W wycenie · Wyślij</span>
          </span>
          <span className="sr-only">Wyślij do wyceny</span>
          <Icon name="arrow" strokeWidth={2.4} className="size-4 max-[767px]:hidden" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={add}
          data-motion="button-outline"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-border px-4 font-bold min-[768px]:px-5"
        >
          <span aria-hidden="true">
            +<span className="max-[767px]:hidden"> Do wyceny</span>
          </span>
          <span className="sr-only">Dodaj do wyceny: {projectName}</span>
        </button>
      )}
      {/* „Zapytaj o tę ofertę →” (ZMIANY-v24 §6.1): the solution goes into „Twój projekt”, so the
          contact form opens with it (the form reads only `?projekt=1`). */}
      <Link
        href={PROJECT_SEND_HREF}
        aria-label="Zapytaj o tę ofertę"
        onClick={() => {
          if (!added && projectActions.toggle(view.slug, projectName)) {
            track('oferta_dodaj', { slug: view.slug })
          }
        }}
        data-motion="button"
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-button px-5 font-bold text-accent-ink"
      >
        <span className="max-[767px]:hidden">Zapytaj o tę ofertę</span>
        <span className="min-[768px]:hidden">Zapytaj</span>
        <Icon name="arrow" strokeWidth={2.4} className="size-4" />
      </Link>
      {fullFor === view.slug && !added && (
        <p role="status" className="sr-only">
          Twój projekt ma już {MAX_PROJECT_ITEMS} pozycji — usuń którąś, żeby dodać tę.
        </p>
      )}
    </div>
  )

  const heroPrice: HeroPrice | null = level
    ? { kind: 'amount', before: '', amount: level.amount, after: level.suffix }
    : price.kind === 'included'
      ? { kind: 'amount', ...heroHead(price.head) }
      : price.kind === 'ask'
        ? { kind: 'text', text: price.title }
        : null
  const termValue = level ? level.term : view.term

  return (
    <BottomSheet
      motion="dialog"
      open={isOpen}
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
      {/* §2.2 D: the mock-up is the biggest thing — first on the phone, on the right and stuck
          from 981 px (58 % from 1280 px). `key`: the next offer (←/→) fades in. */}
      <div key={view.slug} className="sw-offer-swap sw-offer-grid mt-5">
        <aside className="sw-offer-aside min-w-0">
          <OfferGallery
            key={view.slug}
            preview={view.preview}
            thumbnail={view.thumbnail}
            overlay={
              view.toast && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-4 z-10 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl bg-surface-dark px-3 py-2 text-xs font-bold text-white shadow-raised"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-ok" />
                  <span className="truncate">{view.toast}</span>
                </span>
              )
            }
          />
          {view.hasLivePreview && (
            <Link
              href={`/rozwiazania/${view.slug}`}
              className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold text-accent-text"
            >
              Zobacz podgląd na żywo
              <Icon name="arrow" strokeWidth={2.4} className="size-4" />
            </Link>
          )}
        </aside>

        <div className="sw-offer-main min-w-0">
          <div className="flex flex-wrap gap-2">
            {view.label && <OfferBadge>{view.label}</OfferBadge>}
            {view.hasLivePreview && <LiveBadge />}
          </div>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-3 font-display text-3xl font-extrabold leading-tight outline-none min-[768px]:text-[40px]"
          >
            {view.name}
          </h2>
          {view.lead && <p className="mt-2 text-lg text-ink-2">{view.lead}</p>}
          <PriceHero
            price={heroPrice}
            termLabel={view.termLabel}
            term={termValue || null}
            careFrom={view.careFrom}
            next={view.guarantees}
          />
          {view.note && (
            <p className="mt-5 rounded-2xl border border-accent-line bg-accent-soft px-4 py-3 text-sm">
              {view.note}
            </p>
          )}

          {hasScope && (
            <section id="oferta-zakres" aria-label="Zakres" className="sw-offer-block">
              {price.kind === 'included' && <IncludedChips price={price} />}
              {price.kind === 'ask' && <AskCard price={price} />}
              {levels && (
                <LevelChoice
                  title={levels.title}
                  levels={levels.levels}
                  selected={selected}
                  onPick={choose}
                />
              )}
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
                <OfferSection title={stripBold(view.benefits.title) || 'Co dostajesz'}>
                  <CheckList items={view.benefits.items} />
                </OfferSection>
              )}
              {view.example && <ExampleQuote text={view.example} />}
            </section>
          )}

          {hasHow && (
            <section id="oferta-jak" aria-label="Jak to wygląda" className="sw-offer-block">
              {steps.length > 0 && (
                <OfferSection title="Jak to wygląda">
                  <Steps steps={steps} />
                </OfferSection>
              )}
              {view.needs.length > 0 && (
                <OfferSection title="Co od Ciebie">
                  <ul className="flex flex-wrap gap-2">
                    {view.needs.map((item) => (
                      <li key={item} className="sw-chip text-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                  {view.needsHint && <p className="mt-3 text-sm text-ink-2">{view.needsHint}</p>}
                </OfferSection>
              )}
            </section>
          )}

          {hasWho && (
            <section id="oferta-dla-kogo" aria-label="Dla kogo" className="sw-offer-block">
              <OfferSection title="Dla kogo">
                {view.forWhom && <p className="text-ink-2">{view.forWhom}</p>}
                {view.situations.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                    {view.situations.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckDot small />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </OfferSection>
            </section>
          )}

          <section id="oferta-pytania" aria-label="Pytania" className="sw-offer-block">
            {view.faq.length > 0 && (
              <OfferSection title="Pytania, które słyszymy">
                {/* `key`: a new solution starts with its first answer open. */}
                <Questions key={view.slug} faq={view.faq} />
              </OfferSection>
            )}
            {/* §2.4: the wizard is a way out of the window — a text link here, not in the bar. */}
            <p className="sw-offer-part text-ink-2">
              Nie wiesz, czy to dla Ciebie?{' '}
              <Link
                href="/dobierz"
                className="inline-flex min-h-11 items-center gap-1 font-bold text-accent-text underline-offset-4 hover:underline"
              >
                Kreator 60 s <span aria-hidden="true">→</span>
              </Link>
            </p>
            {view.related.length > 0 && (
              <OfferSection title="Często łączone z">
                <RelatedCards cards={view.related} onPick={go} />
              </OfferSection>
            )}
          </section>
        </div>
      </div>
    </BottomSheet>
  )
}
