'use client'

import { IntentLink as Link } from '@/components/shared/IntentLink'
import { type PointerEvent, startTransition, useEffect, useRef, useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics/track'
import { stripBold } from '@/lib/site/emphasis'
import type { OfferView } from '@/lib/software/offer'
import { askHref, extrasLabel } from '@/lib/software/offerExtras'
import { MAX_PROJECT_ITEMS } from '@/lib/software/project'
import { heroHead } from '@/lib/software/heroPrice'
import { neighbourOf } from '@/lib/software/offerCompare'
import { projectActions, useProject } from '@/lib/software/projectStore'
import { type SpotKey, spotsOf } from '@/lib/software/spots'
import { mockupSpots } from '@/sites/software/components/mockups/spots'

import { OfferGallery, type SpotPoint } from './OfferGallery'
import { CategoryDots, SectionTabs, ShortcutHint, type TabItem } from './OfferNav'
import {
  AskCard,
  CheckDot,
  CheckList,
  CompareTable,
  ExampleQuote,
  type HeroPrice,
  type IncludedPoint,
  IncludedPoints,
  LevelChoice,
  LiveBadge,
  OfferBadge,
  OfferCompare,
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
  'sw-offer-panel inset-0 m-auto h-[min(920px,calc(100svh-40px))] max-h-none w-[min(1480px,calc(100vw-48px))] max-w-none rounded-[28px] min-[768px]:[&_[data-sheet-handle]]:hidden max-[767px]:inset-x-0 max-[767px]:bottom-0 max-[767px]:top-auto max-[767px]:h-auto max-[767px]:w-full max-[767px]:rounded-b-none'
const BACKDROP = 'backdrop:bg-surface-dark/70 backdrop:backdrop-blur-md'
/**
 * Phone: one height from the start, like an app (AUDYT-PROD-TELEFON §2 #7–#8) — no 70 % stop that
 * grew mid-gesture, and `svh`, which does not follow Chrome's bars as they hide and show.
 */
const SHEET = 'sw-offer-sheet max-[767px]:max-h-[92svh]'
/** A swipe across the phone's mock-up: at least this far, and mostly sideways. */
const SWIPE_PX = 60
const CONTENT = 'px-4 pb-6 pt-2.5 min-[768px]:px-7 min-[768px]:pt-0'
/** = `--dur-offer-in` (tokens.css): the mock-up's motion starts once the panel is in (SWA14 §2.2). */
const ENTER_MS = 240

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

/** A touch gesture on the phone: `onEnd` gets how far it went (end − start). */
function phoneGesture(
  event: PointerEvent<HTMLElement>,
  onEnd: (dx: number, dy: number) => void,
): void {
  if (event.pointerType === 'mouse' || !window.matchMedia('(max-width: 767px)').matches) return
  const { clientX: x, clientY: y } = event
  const stop = () => {
    window.removeEventListener('pointerup', end)
    window.removeEventListener('pointercancel', stop)
  }
  // The browser took the touch for scrolling: no gesture.
  const end = (up: globalThis.PointerEvent) => {
    stop()
    onEnd(up.clientX - x, up.clientY - y)
  }
  window.addEventListener('pointerup', end)
  window.addEventListener('pointercancel', stop)
}

/** „od 3 490 zł netto” → the amount and a flag for the small „netto” after it. */
function splitNet(price: string): { amount: string; net: boolean } {
  const amount = price.replace(/\s+netto$/, '')
  return { amount, net: amount !== price }
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
  /** The point of „W cenie” whose area is lit on the mock-up (§2.2). */
  const [litPoint, setLitPoint] = useState<number | null>(null)
  /** Chips of „Potrzebujesz więcej?” chosen for the open solution (§2.3). */
  const [chosen, setChosen] = useState<{ slug: string; extras: string[] } | null>(null)
  /** Which way the last switch went (§2.5): the details come in from that side. */
  const [direction, setDirection] = useState<1 | -1>(1)
  /** The offer the window opened with: only its sections come in one by one (§2.5). */
  const [first, setFirst] = useState<string | null>(null)
  /** The amount of the hero price shown last, while the window stays open (§2.5). */
  const [trail, setTrail] = useState<{ key: string; amount: string; from: string | null }>({
    key: '',
    amount: '',
    from: null,
  })
  // Reset when the window opens — not when it closes, so the closing window stays as it was.
  const [wasOpen, setWasOpen] = useState(isOpen)
  const opening = isOpen && !wasOpen
  /**
   * A light first frame (SWA14 §2.2): the header, name, price and mock-up come at once; the
   * sections below (scope, steps, FAQ, related) and the mock-up's motion once the panel is in
   * (240 ms) — committing them during the entry held its frames back.
   */
  const [entered, setEntered] = useState(false)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setFirst(slug)
      setTrail({ key: '', amount: '', from: null })
      setEntered(false)
    }
  }
  useEffect(() => {
    if (!isOpen || entered) return
    // Reduced motion: the panel is there at once, so are its sections (przegląd SWA14 #5).
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(
      () => startTransition(() => setEntered(true)),
      still ? 0 : ENTER_MS,
    )
    return () => window.clearTimeout(timer)
  }, [isOpen, entered])
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

  const go = (next: string, way?: 1 | -1) => {
    const from = current.current ? list.indexOf(current.current) : -1
    const to = list.indexOf(next)
    setDirection(way ?? (to >= 0 && from >= 0 && to < from ? -1 : 1))
    // Back on the first offer later: a side move, not the opening's sections again.
    setFirst('')
    current.current = next
    onSwitch(next)
  }

  const step = (direction: 1 | -1) => {
    if (list.length < 2) return
    const from = current.current ? list.indexOf(current.current) : -1
    // Outside the list (opened from „Dobrze łączy się z”): → starts at the first, ← at the last.
    const index = from < 0 ? (direction === 1 ? 0 : list.length - 1) : from + direction
    const next = list[(index + list.length) % list.length]
    if (next) go(next, direction)
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

  // Across the mock-up: the next or previous offer (§2.6), not a vertical scroll.
  const swipe = (event: PointerEvent<HTMLElement>) =>
    phoneGesture(event, (dx, dy) => {
      if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1)
    })

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
  const bar = level ? { label: level.barLabel, price: level.price, ask: false } : view.bar
  const barPrice = splitNet(bar.price)
  const projectName = level ? level.projectName : view.name

  // Points of „W cenie” with an area on this offer's mock-up get a number (§2.2); the others stay
  // plain — no area, no light.
  const areas = mockupSpots(view.preview?.kind ?? null, view.preview?.variant ?? null)
  let counter = 0
  const included: (IncludedPoint & { spots: SpotKey[] })[] =
    price.kind === 'included'
      ? price.items.map((text) => {
          const spots = spotsOf(text).filter((spot) => areas.has(spot))
          return { text, spots, number: spots.length > 0 ? ++counter : null }
        })
      : []
  const spotPoints: SpotPoint[] = included.flatMap((point) =>
    point.number ? [{ number: point.number, label: point.text, spots: point.spots }] : [],
  )
  const litSpots = spotPoints.find((point) => point.number === litPoint)?.spots ?? null
  const extras = chosen?.slug === view.slug ? chosen.extras : []
  const toggleExtra = (extra: string) =>
    setChosen({
      slug: view.slug,
      extras: extras.includes(extra)
        ? extras.filter((item) => item !== extra)
        : view.extras.filter((item) => item === extra || extras.includes(item)),
    })
  // A tap on a point lights its area and brings the mock-up into view (the phone: above).
  const showPoint = (number: number) => {
    setLitPoint(number)
    const shot = document.querySelector('.sw-offer-panel .sw-offer-shot')
    const box = shot?.getBoundingClientRect()
    if (shot && box && (box.top < 80 || box.bottom > window.innerHeight - 80)) {
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      shot.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' })
    }
  }
  // A click on a marker goes to its point and lights it.
  const goToPoint = (number: number) => {
    const point = document.querySelector<HTMLButtonElement>(`[data-point="${number}"]`)
    if (!point) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    point.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' })
    point.focus({ preventScroll: true })
  }

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
    (price.kind === 'included' && (price.items.length > 0 || Boolean(price.more))) ||
    (price.kind === 'ask' && Boolean(price.text || price.note)) ||
    levels !== null ||
    view.benefits.items.length > 0 ||
    Boolean(view.example)
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
    <div className="flex items-center gap-3 max-[399px]:gap-2 min-[768px]:px-3">
      <p className="min-w-0 flex-1" aria-live="polite">
        <span className="block truncate text-xs font-bold text-ink-2">
          {fullFor === view.slug && !added
            ? `Twój projekt ma już ${MAX_PROJECT_ITEMS} pozycji — usuń którąś, żeby dodać tę.`
            : [added ? '✓ W wycenie' : null, extrasLabel(extras) ?? (added ? bar.label : null)]
                .filter(Boolean)
                .join(' · ') || bar.label}
        </span>
        {/* One line on the phone too (AUDYT-0911 wieczór #4): „netto” small after the amount.
            No price: a small badge, not the price's type (SWA14 §4.1). */}
        {bar.ask ? (
          <span className="v-ask mt-1">{bar.price}</span>
        ) : (
          <span className="block truncate font-display text-xl font-extrabold text-accent-text max-[767px]:text-[19px]">
            {barPrice.amount}
            {barPrice.net && (
              <>
                {' '}
                <small className="font-sans text-xs font-bold text-ink-2">netto</small>
              </>
            )}
          </span>
        )}
      </p>
      {added ? (
        <Link
          ref={send}
          href={askHref(view.name, extras)}
          data-motion="button-outline"
          className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-accent-line px-4 font-bold text-accent-text min-[768px]:px-5"
        >
          <span aria-hidden="true">
            ✓<span className="max-[767px]:hidden"> W wycenie · Wyślij</span>
          </span>
          <span className="sr-only">W wycenie · Wyślij do wyceny</span>
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
          contact form opens with it (`?projekt=1`); chosen chips start its message (`?fraza=`). */}
      <Link
        href={askHref(view.name, extras)}
        aria-label="Zapytaj o tę ofertę"
        onClick={() => {
          if (!added && projectActions.toggle(view.slug, projectName)) {
            track('oferta_dodaj', { slug: view.slug })
          }
        }}
        data-motion="button"
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-button px-5 font-bold text-accent-ink max-[399px]:px-4"
      >
        <span className="max-[767px]:hidden">Zapytaj o tę ofertę</span>
        <span className="min-[768px]:hidden">Zapytaj</span>
        <Icon name="arrow" strokeWidth={2.4} className="size-4" />
      </Link>
    </div>
  )

  const heroPrice: HeroPrice | null = level
    ? {
        kind: 'amount',
        before: '',
        amount: level.amount,
        // A free level („0 zł”) has no „/ mies.”.
        after: level.price === level.amount ? '' : level.suffix,
      }
    : price.kind === 'included'
      ? { kind: 'amount', ...heroHead(price.head) }
      : price.kind === 'ask'
        ? { kind: 'text', text: price.title }
        : null
  const termValue = level ? level.term : view.term
  const neighbour = neighbourOf(view, views, list)
  const heroAmount = heroPrice?.kind === 'amount' ? heroPrice.amount : ''
  const trailKey = `${view.slug}|${heroAmount}`
  if (trail.key !== trailKey) {
    // On opening the price starts as it is; only a switch inside the open window counts.
    setTrail({ key: trailKey, amount: heroAmount, from: opening ? null : trail.amount || null })
  }

  return (
    <BottomSheet
      motion="dialog"
      open={isOpen}
      onClose={onClose}
      title={view.name}
      headingRef={heading}
      header={header}
      stickyHeader
      panelClassName={`${PANEL} ${SHEET}`}
      backdropClassName={BACKDROP}
      contentClassName={CONTENT}
      footer={footer}
      dragToClose
      closeOnBack={closeOnBack}
    >
      <div ref={top} className="scroll-mt-24" />
      {/* §2.2 D: the mock-up is the biggest thing — on the right and stuck from 981 px (58 % from
          1280 px), shown first on the phone by CSS; in the DOM after the details, so the reading
          and Tab order follow the wide layout. `key`: the next offer (←/→) fades in. */}
      <div
        key={view.slug}
        data-dir={direction}
        data-intro={view.slug === first ? '' : undefined}
        data-entering={entered ? undefined : ''}
        className="sw-offer-swap sw-offer-grid mt-5"
      >
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
            priceFrom={trail.key === trailKey ? trail.from : null}
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

          {entered ? (
            <>
              {hasScope && (
                <section id="oferta-zakres" aria-label="Zakres" className="sw-offer-block">
                  {price.kind === 'included' && (
                    <IncludedPoints
                      points={included}
                      more={price.more}
                      extras={view.extras}
                      chosen={extras}
                      onLight={setLitPoint}
                      onShow={showPoint}
                      onToggleExtra={toggleExtra}
                    />
                  )}
                  {neighbour && (
                    <OfferCompare
                      current={view}
                      other={neighbour}
                      onOpen={() => go(neighbour.slug)}
                    />
                  )}
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
                      {view.needsHint && (
                        <p className="mt-3 text-sm text-ink-2">{view.needsHint}</p>
                      )}
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
            </>
          ) : (
            // Holds the place of the sections until the panel is in.
            <div aria-hidden="true" className="sw-offer-later" />
          )}
        </div>

        <aside onPointerDown={swipe} className="sw-offer-aside min-w-0">
          <OfferGallery
            key={view.slug}
            preview={view.preview}
            thumbnail={view.thumbnail}
            toast={view.toast}
            points={spotPoints}
            lit={litSpots}
            onMarker={goToPoint}
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
      </div>
    </BottomSheet>
  )
}
