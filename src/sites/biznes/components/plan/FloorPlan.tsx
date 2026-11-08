'use client'

import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BundleCardData } from '@/lib/catalog/bundle'
import { pickScene, planCartItems, type PlanScene } from '@/lib/catalog/floorPlan'
import { cartActions } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

import { BundleCard } from '../bundle/BundleCard'
import { ProductStage, StageFallback } from '../ProductStage'
import { PlanPointDialog } from './PlanPointDialog'
import type { FloorPlanData, FloorPlanLabels, PlanProduct } from './types'

import './floorPlan.css'

const POINTS: [string, string, string] = ['punkt', 'punkty', 'punktów']
const ITEMS: [string, string, string] = ['pozycja', 'pozycje', 'pozycji']

/** The home section (B3-1, D8): industry tabs, a short list and one bundle card per scene. */
export type FloorPlanHome = {
  /** „Gotowy zestaw dla tej branży” of each scene that has one (`homeBundlesByScene`). */
  bundles: Record<string, BundleCardData>
  /** Points listed before „Pokaż wszystkie”. */
  pointsLimit: number
}

/** Icon of a scene: the 24×24 path from the panel (`FloorPlans.iconPath`). */
export function SceneIcon({ path, className }: { path: string | null; className?: string }) {
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
      {path ? <path d={path} /> : <path d="M4 20V9l8-5 8 5v11z" />}
    </svg>
  )
}

/** Columns of „Na tym planie” on a computer: 4, or 3 when 4 would leave one card alone. */
export const listColumns = (count: number) => (count % 4 === 1 && count % 3 !== 1 ? 3 : 4)

function Thumb({ product, size }: { product: PlanProduct; size: 'point' | 'list' }) {
  return product.image ? (
    <Image
      src={product.image.url}
      alt={product.image.alt}
      width={product.image.width}
      height={product.image.height}
      unoptimized
      className={cx(
        'h-auto w-auto object-contain',
        size === 'point' ? 'max-h-[72%] max-w-[72%]' : 'max-h-9 max-w-11',
      )}
    />
  ) : (
    <StageFallback icon={product.icon} size="sm" />
  )
}

/**
 * „Plan Twojej firmy” 2.0 (K31-ZMIANY §6–7, spec. §6.12, K4: `k4/boards/Web-Plan*`): scene
 * tiles (phone: chips), the drawing of the active scene with numbered product points, „Na tym
 * planie” under it, the bar „Dodaj cały plan do zapytania” and the scene's ready bundles. One
 * component on `/plan-firmy` and on the home page. Only the active drawing is in the page; the
 * others load from `/api/plan-svg/<scena>` when picked. `?scena=` picks the scene on load.
 */
export function FloorPlan({
  data,
  labels,
  headingLevel = 'h2',
  home,
}: {
  data: FloorPlanData
  labels: FloorPlanLabels
  /** Level of the scene, list and bundle headings: `h2` on the page, `h3` in a home section. */
  headingLevel?: 'h2' | 'h3'
  /** On the home page: tabs, a short list and one bundle card instead of the bundles section. */
  home?: FloorPlanHome
}) {
  const Heading = headingLevel
  const { scenes, products } = data
  const [sceneSlug, setSceneSlug] = useState(scenes[0]?.slug ?? '')
  const [svgs, setSvgs] = useState<Record<string, string>>(() =>
    data.firstSvg && scenes[0] ? { [scenes[0].slug]: data.firstSvg } : {},
  )
  const [open, setOpen] = useState<number | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  // R2: pointing at a point lights up its row in „Na tym planie”, and the other way round.
  const [hot, setHot] = useState<number | null>(null)
  const [allPoints, setAllPoints] = useState(false)
  const pointRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const headingId = useId()
  const bundlesId = useId()
  const tabsId = useId()
  const listId = useId()
  const scene: PlanScene = pickScene(scenes, sceneSlug) ?? scenes[0]!

  const show = useCallback(
    (slug: string, { remember = true }: { remember?: boolean } = {}) => {
      const next = pickScene(scenes, slug)
      if (!next) return
      setSceneSlug(next.slug)
      setOpen(null)
      setAdded(null)
      setAllPoints(false)
      if (remember) {
        const url = new URL(window.location.href)
        url.searchParams.set('scena', next.slug)
        window.history.replaceState(window.history.state, '', url)
      }
    },
    [scenes],
  )

  // `?scena=` of the address (read here, so the page stays static).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('scena')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- once, from the address after hydration
    if (fromUrl) show(fromUrl, { remember: false })
  }, [show])

  useEffect(() => {
    if (svgs[scene.slug] !== undefined) return
    let cancelled = false
    fetch(`/api/plan-svg/${encodeURIComponent(scene.slug)}`)
      .then((response) => (response.ok ? response.text() : null))
      .catch(() => null)
      .then((svg) => {
        // A failed load is not remembered: picking the scene again tries once more.
        if (!cancelled && svg) setSvgs((all) => ({ ...all, [scene.slug]: svg }))
      })
    return () => {
      cancelled = true
    }
  }, [scene.slug, svgs])

  const points = scene.points.filter((point) => products[point.product])
  const items = planCartItems({ ...scene, points })
  const bundles = home ? [] : (data.bundles[scene.slug] ?? [])
  const homeBundle = home?.bundles[scene.slug] ?? null
  const shortList = home !== undefined && !allPoints && points.length > home.pointsLimit
  const listed = shortList ? points.slice(0, home.pointsLimit) : points
  const columns = listColumns(listed.length)
  const tabId = (slug: string) => `${tabsId}-${slug}`
  const panelId = `${tabsId}-panel`

  // ARIA tabs (home): arrows, Home and End move between the industries and show them at once.
  const onTabsKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = scenes.findIndex((item) => item.slug === scene.slug)
    const moves: Record<string, number> = {
      ArrowRight: at + 1,
      ArrowDown: at + 1,
      ArrowLeft: at - 1,
      ArrowUp: at - 1,
      Home: 0,
      End: scenes.length - 1,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    const target = scenes[(next + scenes.length) % scenes.length]
    if (!target) return
    show(target.slug, { remember: !home })
    document.getElementById(tabId(target.slug))?.focus()
  }
  const svg = svgs[scene.slug]

  const addPlan = () => {
    const result = cartActions.addItems(
      items,
      (n) => `${n} ${plural(n, ITEMS)} z planu: ${scene.name}`,
    )
    setAdded(
      result.added || result.noted
        ? null
        : result.skipped
          ? 'Lista zapytania jest pełna.'
          : 'Wszystko z tego planu jest już w zapytaniu.',
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Scenes: 6 × 2 tiles on a computer, sticky chips in a row on a phone. */}
      <div
        {...(home
          ? { role: 'tablist', 'aria-label': 'Branże', onKeyDown: onTabsKey }
          : { role: 'group', 'aria-label': 'Rodzaj firmy' })}
        className="sticky top-[61px] z-20 -mx-4 flex snap-x gap-2 overflow-x-auto bg-surface/90 px-4 py-2 backdrop-blur-md [scrollbar-width:none] sm:static sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none lg:grid-cols-6"
      >
        {scenes.map((item) => {
          const active = item.slug === scene.slug
          return (
            <button
              key={item.slug}
              type="button"
              {...(home
                ? {
                    role: 'tab',
                    id: tabId(item.slug),
                    'aria-selected': active,
                    'aria-controls': panelId,
                    tabIndex: active ? 0 : -1,
                  }
                : { 'aria-pressed': active })}
              onClick={() => show(item.slug, { remember: !home })}
              className={cx(
                'flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-full px-4 py-2 text-left transition-colors sm:rounded-2xl sm:p-3',
                active
                  ? 'bg-surface-dark text-white sm:bg-card sm:text-ink sm:shadow-[inset_0_0_0_2px_var(--accent)]'
                  : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
              )}
            >
              <span
                className={cx(
                  'flex size-7 items-center justify-center rounded-lg sm:size-9 sm:rounded-xl',
                  active
                    ? 'bg-white/15 sm:bg-accent sm:text-accent-ink'
                    : 'bg-surface-2 text-ink-2',
                )}
              >
                <SceneIcon path={item.iconPath} className="size-4 sm:size-[18px]" />
              </span>
              <span className="flex flex-col">
                <span className="text-[14px] leading-tight font-extrabold">{item.name}</span>
                <span className="hidden text-[12px] text-ink-3 sm:block">
                  {item.points.length} {plural(item.points.length, POINTS)}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Home: the scene, its list, the bundle card and the bar are the panel of the tabs. */}
      <div
        {...(home ? { role: 'tabpanel', id: panelId, 'aria-labelledby': tabId(scene.slug) } : {})}
        className="flex flex-col gap-4"
      >
        {/* The scene: heading, the drawing with points. */}
        <section
          aria-labelledby={headingId}
          className="overflow-hidden rounded-[24px] bg-card shadow-[inset_0_0_0_1px_var(--border)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase sm:hidden">
                {points.length} {plural(points.length, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}{' '}
                z naszej oferty
              </p>
              <Heading
                id={headingId}
                className="font-display text-[20px] leading-tight font-extrabold text-ink"
              >
                {scene.title}
              </Heading>
              {scene.lead && <p className="mt-1 text-[13.5px] text-ink-2">{scene.lead}</p>}
            </div>
            <span className="hidden rounded-full bg-surface-2 px-3 py-1 text-[12.5px] font-bold text-ink-2 sm:inline-block">
              {points.length} {plural(points.length, POINTS)}
            </span>
          </div>

          <div className="overflow-x-auto px-2 pb-2 [scrollbar-width:thin] sm:px-3 sm:pb-3">
            <div
              className="fp-stage relative min-w-[720px] overflow-hidden rounded-[18px] bg-surface-2"
              style={{ aspectRatio: `${scene.width} / ${scene.height}` }}
            >
              {svg ? (
                // The drawing is checked as a drawing on save and again by the route (`isSafeSvg`).
                <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
              ) : null}
              {points.map((point) => {
                const product = products[point.product]!
                const active = open !== null && points[open]?.n === point.n
                return (
                  <button
                    key={point.n}
                    ref={(element) => {
                      if (element) pointRefs.current.set(point.n, element)
                      else pointRefs.current.delete(point.n)
                    }}
                    type="button"
                    data-plan-point
                    onClick={() => setOpen(points.indexOf(point))}
                    onPointerEnter={() => setHot(point.n)}
                    onPointerLeave={() => setHot(null)}
                    aria-label={`${point.n}. ${point.label} — ${product.name}`}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-offset-4"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <ProductStage
                      as="span"
                      className={cx(
                        'size-11 rounded-full bg-white shadow-[0_6px_16px_-6px_var(--shd),0_0_0_2px_var(--surface-dark)] transition-transform group-hover:scale-110 lg:size-12',
                        (active || hot === point.n) && 'scale-110',
                        active && 'fp-active',
                      )}
                    >
                      <Thumb product={product} size="point" />
                    </ProductStage>
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10.5px] font-extrabold text-accent-ink shadow-[0_0_0_2px_var(--card)]"
                    >
                      {point.n}
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 rounded-lg bg-surface-dark px-2.5 py-1 text-[12px] font-bold whitespace-nowrap text-white group-hover:block group-focus-visible:block"
                    >
                      {point.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <p className="flex justify-between px-4 pb-3 text-[12.5px] font-bold text-ink-3 sm:hidden">
            <span>Przesuń plan palcem →</span>
            <span>Dotknij urządzenie</span>
          </p>
        </section>

        {/* „Na tym planie”: under the plan, without an orphan in the last row. */}
        <section
          aria-label="Na tym planie"
          className="rounded-[24px] bg-card px-4 py-4 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5"
        >
          <Heading className="font-display text-[17px] font-extrabold text-ink">
            Na tym planie
          </Heading>
          {labels.listNote && <p className="text-[13px] text-ink-3">{labels.listNote}</p>}
          <ol
            id={listId}
            className={cx(
              'mt-3 grid gap-x-4 sm:grid-cols-2',
              columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
            )}
          >
            {listed.map((point, i) => {
              const product = products[point.product]!
              return (
                <li key={point.n} className="border-b border-border last:border-b-0 sm:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    onPointerEnter={() => setHot(point.n)}
                    onPointerLeave={() => setHot(null)}
                    className={cx(
                      'flex min-h-14 w-full items-center gap-3 rounded-xl py-2 text-left hover:bg-surface-2 sm:px-1',
                      hot === point.n && 'bg-surface-2',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-accent-ink"
                    >
                      {point.n}
                    </span>
                    <ProductStage as="span" className="size-11 shrink-0 rounded-xl">
                      <Thumb product={product} size="list" />
                    </ProductStage>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] leading-tight font-extrabold text-ink">
                        {point.label}
                      </span>
                      {point.description && (
                        <span className="block text-[12.5px] leading-snug text-ink-3">
                          {point.description}
                        </span>
                      )}
                    </span>
                    {product.video ? (
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-bold text-ink-2">
                        ▸ film
                      </span>
                    ) : (
                      <Icon name="arrow" className="size-4 shrink-0 text-ink-3" />
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
          {home !== undefined && points.length > home.pointsLimit && (
            <button
              type="button"
              aria-expanded={allPoints}
              aria-controls={listId}
              onClick={() => setAllPoints((value) => !value)}
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 text-[14px] font-extrabold text-accent-text hover:underline"
            >
              {allPoints ? 'Zwiń listę' : `Pokaż wszystkie ${points.length}`}
              <Icon
                name="arrow"
                strokeWidth={2.4}
                className={allPoints ? 'size-3.5 -rotate-90' : 'size-3.5 rotate-90'}
              />
            </button>
          )}
        </section>

        {homeBundle && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[24px] bg-card px-4 py-4 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-accent text-accent-ink"
            >
              <Icon name="box" className="size-[22px]" />
            </span>
            <div className="min-w-0 flex-1 basis-[22rem]">
              <p className="text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
                {labels.bundlesLabel}
              </p>
              <p className="mt-0.5 font-display text-[17px] leading-snug font-extrabold text-ink">
                {homeBundle.name}
              </p>
              <p className="mt-0.5 text-[13.5px] text-ink-2">
                {homeBundle.label} · {homeBundle.count} {plural(homeBundle.count, ITEMS)}
              </p>
            </div>
            <a
              href={homeBundle.href}
              data-home-bundle
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-2 px-4 text-[14px] font-extrabold text-ink hover:underline"
            >
              Zobacz zestaw
              <span className="sr-only">: {homeBundle.name}</span>
              <Icon name="arrow" strokeWidth={2.4} className="size-4" />
            </a>
          </div>
        )}

        {/* The bar: the whole plan into the inquiry, ready bundles. */}
        <div className="flex flex-wrap items-center gap-3 rounded-[20px] bg-surface-2 px-4 py-3 sm:px-5">
          {scene.lead && (
            <p className="hidden min-w-0 flex-1 text-[14px] font-semibold text-ink-2 sm:block">
              {scene.lead}
            </p>
          )}
          <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
            <button
              type="button"
              onClick={addPlan}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-card px-4 text-[14px] font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)] sm:flex-none"
            >
              {labels.inquiryLabel} · {items.length} poz.
            </button>
            {bundles.length > 0 && (
              <a
                href={`#${bundlesId}`}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent px-4 text-[14px] font-extrabold text-accent-ink hover:brightness-110 sm:flex-none"
              >
                {labels.bundlesLabel}
              </a>
            )}
          </div>
          <p role="status" className="w-full text-[13px] font-semibold text-ink-2 empty:hidden">
            {added}
          </p>
        </div>
      </div>

      {bundles.length > 0 && (
        <section aria-labelledby={bundlesId} className="mt-8 scroll-mt-24">
          <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
            <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
            {labels.bundlesLabel}
          </p>
          <Heading
            id={bundlesId}
            className="mt-2 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-ink"
          >
            {labels.bundlesLabel}: {scene.name}
          </Heading>
          <ul className="-mx-4 mt-5 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <li key={bundle.slug} className="w-[80%] shrink-0 snap-start sm:w-auto">
                <BundleCard bundle={bundle} headingLevel={headingLevel === 'h2' ? 'h3' : 'h4'} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <PlanPointDialog
        scene={scene}
        points={points}
        products={products}
        current={open}
        onMove={setOpen}
        onClosed={(n) => pointRefs.current.get(n)?.focus()}
      />
    </div>
  )
}
