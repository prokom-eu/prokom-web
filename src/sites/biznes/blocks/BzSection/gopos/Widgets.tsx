'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import {
  packageHardware,
  packageItems,
  packageModules,
  queueAt,
  selectionForVenue,
  toggleModule,
} from '@/lib/biznes/pages/gopos'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { cartActions } from '@/lib/cart/store'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

import { useSwap } from '../../../components/motion/useSwap'
import { BTN_OUTLINE, BTN_PRIMARY, CARD, EYEBROW, TAB_KEYS } from '../ui'
import { PauseButton, Ticket, useReducedMotion } from './Stage'
import { goposActions, pickedOr, useGopos } from './store'

/** POPRAWKI-0311 §B: the venue's ticket moves through its statuses every 1.8 s. */
const TICKET_MS = 1800

/** Tabs with arrow keys: returns the props of the tab list and of each tab. */
function useTabs(count: number) {
  const [current, setCurrent] = useState(0)
  const base = useId()
  const go = (next: number) => {
    const i = (next + count) % count
    setCurrent(i)
    document.getElementById(`${base}-t${i}`)?.focus()
    return i
  }
  const swap = useSwap(current)
  return { current, setCurrent, base, go, swap }
}

/**
 * The ticket of the venue scene: its own clock, from „Przyjęte” again on every venue. Stopped by
 * the page's pause button and by reduced motion.
 */
function useTicketClock(venue: string) {
  const { paused } = useGopos()
  const reduce = useReducedMotion()
  const [clock, setClock] = useState({ venue, step: 0 })
  // A new venue starts its ticket from the first status (state reset during render).
  if (clock.venue !== venue) setClock({ venue, step: 0 })
  useEffect(() => {
    if (paused || reduce) return
    const timer = window.setInterval(
      () => setClock((c) => ({ venue: c.venue, step: (c.step + 1) % 4 })),
      TICKET_MS,
    )
    return () => window.clearInterval(timer)
  }, [paused, reduce])
  return clock.venue === venue ? clock.step : 0
}

/**
 * „Twój lokal” (#lokal, POPRAWKI-0311 §B): a venue tab (with a thumbnail of its picture) sets
 * the package to its starting modules; the scene shows the venue's GoPOS set with the screen on,
 * its ticket below the device, never over it. The picture and the text swap smoothly.
 */
export function GoposVenues({
  data,
  images,
}: {
  data: SectionData<'gopos-venues'>
  images: Record<string, IndexImage>
}) {
  const state = useGopos()
  const tabs = useTabs(data.venues.length)
  const index = Math.max(
    0,
    data.venues.findIndex((venue) => venue.key === state.venue),
  )
  const venue = data.venues[index]!
  const ticketNow = useTicketClock(venue.key)
  const pick = (i: number) => {
    const next = data.venues[i]!
    goposActions.pickVenue(
      next.key,
      next.modules.map((module) => module.slug),
    )
  }
  const imageOf = (key: string | number | undefined) =>
    key === undefined ? undefined : images[String(key)]
  const image = imageOf(venue.image)
  return (
    <div className="grid gap-5 min-[1080px]:grid-cols-[260px_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label="Rodzaj lokalu"
        aria-orientation="vertical"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 min-[1080px]:mx-0 min-[1080px]:flex-col min-[1080px]:overflow-visible min-[1080px]:px-0"
        onKeyDown={(event) => {
          if (TAB_KEYS.has(event.key)) event.preventDefault()
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') pick(tabs.go(index + 1))
          if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') pick(tabs.go(index - 1))
          if (event.key === 'Home') pick(tabs.go(0))
          if (event.key === 'End') pick(tabs.go(data.venues.length - 1))
        }}
      >
        {data.venues.map((item, i) => {
          const thumb = imageOf(item.image)
          return (
            <button
              key={item.key}
              id={`${tabs.base}-t${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={`${tabs.base}-p`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => pick(i)}
              className="gps-vtab"
            >
              <span className="gps-vtab-th" aria-hidden="true">
                {thumb && (
                  <Image
                    unoptimized
                    src={thumb.url}
                    alt={thumb.alt}
                    // The name is in the text next to it: the alt serves search engines only.
                    aria-hidden
                    width={thumb.width}
                    height={thumb.height}
                  />
                )}
              </span>
              {item.tab}
            </button>
          )
        })}
      </div>
      <div
        id={`${tabs.base}-p`}
        role="tabpanel"
        aria-labelledby={`${tabs.base}-t${index}`}
        className={cx(
          CARD,
          'grid items-center gap-8 p-8 max-[820px]:gap-5 max-[820px]:p-5 min-[821px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] min-[821px]:min-h-[440px]',
        )}
      >
        <div key={venue.key} className="gps-swap flex flex-col gap-4 text-ink max-md:gap-3">
          <h3 className="font-display text-[clamp(1.5rem,2.5vw,2.125rem)] leading-tight font-extrabold text-balance max-md:text-[21px]">
            {venue.h1a} <em className="text-ok-text not-italic">{venue.h1b}</em>
          </h3>
          <p className="leading-relaxed text-pretty text-ink-2 max-md:text-sm">{venue.lead}</p>
          <div>
            <p className={cx(EYEBROW, 'mb-2 text-ink-2')}>Pakiet na start</p>
            <ul className="flex flex-wrap gap-2">
              {['GoPOS', ...venue.modules.map((module) => module.name)].map((name) => (
                <li
                  key={name}
                  className="rounded-full bg-ok/15 px-3 py-1.5 text-[14px] font-extrabold text-ink max-md:px-2.5 max-md:py-1 max-md:text-[13px]"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 max-md:mt-1 max-md:grid">
            <a href="#pakiet" className={BTN_PRIMARY}>
              Skonfiguruj pakiet
            </a>
          </div>
        </div>
        <div className="gps-scene">
          {image && (
            <Image
              key={venue.key}
              unoptimized
              src={image.url}
              alt={image.alt}
              // The name is in the text next to it: the alt serves search engines only.
              aria-hidden
              width={image.width}
              height={image.height}
              className="gps-scene-img"
            />
          )}
          <Ticket
            ticket={venue.ticket}
            title={venue.ticket.label}
            current={ticketNow}
            className="gps-scene-ticket"
          />
        </div>
      </div>
    </div>
  )
}

/** Areas of GoPOS (#moduly): tabs; a module of the package is marked „w pakiecie”. */
export function GoposAreas({ data }: { data: SectionData<'gopos-areas'> }) {
  const state = useGopos()
  const picked = pickedOr(state, data.initial)
  const tabs = useTabs(data.areas.length)
  const area = data.areas[tabs.current] ?? data.areas[0]!
  const [ext, setExt] = useState(0)
  const extra = data.ext.items[ext]
  return (
    <>
      <div className="grid gap-6 min-[1080px]:grid-cols-[300px_minmax(0,1fr)]">
        <div
          role="tablist"
          aria-label="Obszary GoPOS"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 min-[1080px]:mx-0 min-[1080px]:flex-col min-[1080px]:overflow-visible min-[1080px]:px-0"
          onKeyDown={(event) => {
            if (TAB_KEYS.has(event.key)) event.preventDefault()
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') tabs.go(tabs.current + 1)
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') tabs.go(tabs.current - 1)
            if (event.key === 'Home') tabs.go(0)
            if (event.key === 'End') tabs.go(data.areas.length - 1)
          }}
        >
          {data.areas.map((item, i) => (
            <button
              key={item.t}
              id={`${tabs.base}-t${i}`}
              type="button"
              role="tab"
              aria-selected={i === tabs.current}
              aria-controls={`${tabs.base}-p`}
              tabIndex={i === tabs.current ? 0 : -1}
              onClick={() => tabs.setCurrent(i)}
              className={cx(
                'flex min-h-14 shrink-0 items-center justify-between gap-3 rounded-2xl px-4 text-left transition-colors',
                i === tabs.current
                  ? 'bg-ink text-surface'
                  : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
              )}
            >
              <b className="font-extrabold">{item.t}</b>
              <em className="text-[13px] not-italic opacity-75">{item.items.length}</em>
            </button>
          ))}
        </div>
        <div
          id={`${tabs.base}-p`}
          role="tabpanel"
          {...tabs.swap}
          aria-labelledby={`${tabs.base}-t${tabs.current}`}
        >
          <ul className={cx(CARD, 'flex flex-col divide-y divide-border p-2 text-ink')}>
            {area.items.map((item) => {
              const inPackage =
                item.slug !== undefined && (item.slug === data.core || picked.has(item.slug))
              return (
                <li
                  key={item.t}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <b className="font-extrabold">{item.t}</b>
                    <small className="text-[14px] text-ink-2">{item.d}</small>
                  </span>
                  {inPackage && (
                    <em className="rounded-full bg-ok/15 px-2.5 py-1 text-[12px] font-extrabold text-ok-text not-italic">
                      w pakiecie
                    </em>
                  )}
                  {item.slug && (
                    <Link
                      href={productHref(item.slug)}
                      className="inline-flex min-h-11 items-center px-2 text-[14px] font-extrabold text-accent-text hover:underline"
                    >
                      Karta<span className="sr-only">: {item.t}</span> →
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      {data.ext.items.length > 0 && extra && (
        <details className="group mt-6">
          <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-2xl px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              Moduły rozszerzające ({data.ext.items.length})
            </span>
            <span className="hidden group-open:inline">Zwiń moduły rozszerzające</span>
          </summary>
          <div className="mt-5 grid gap-5 min-[1080px]:grid-cols-[300px_minmax(0,1fr)]">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 min-[1080px]:mx-0 min-[1080px]:flex-col min-[1080px]:px-0">
              {data.ext.items.map((item, i) => (
                <button
                  key={item.t}
                  type="button"
                  aria-pressed={i === ext}
                  onClick={() => setExt(i)}
                  className={cx(
                    'flex min-h-12 shrink-0 flex-col items-start justify-center rounded-2xl px-4 py-2 text-left',
                    i === ext
                      ? 'bg-ink text-surface'
                      : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
                  )}
                >
                  <b className="font-extrabold">{item.t}</b>
                  <small className="text-[13px] opacity-75">{item.k}</small>
                </button>
              ))}
            </div>
            <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink')}>
              <div>
                <b className="font-display text-xl font-extrabold">{extra.t}</b>
                <p className="text-ink-2">{extra.k}</p>
              </div>
              <ul className="grid gap-2 min-[640px]:grid-cols-2">
                {extra.f.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[15px] text-ink-2">
                    <span aria-hidden="true" className="text-ok-text">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              {extra.v.length > 0 && (
                <dl className="grid gap-3 min-[640px]:grid-cols-3">
                  {extra.v.map((v) => (
                    <div key={v.n} className="rounded-xl bg-surface-2 p-3">
                      <dt className="font-extrabold">{v.n}</dt>
                      <dd className="text-[14px] text-ink-2">{v.d}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {extra.slug && (
                <button
                  type="button"
                  aria-pressed={picked.has(extra.slug)}
                  onClick={() => goposActions.addModule(extra.slug!, data.initial)}
                  className={cx(picked.has(extra.slug) ? BTN_OUTLINE : BTN_PRIMARY, 'self-start')}
                >
                  {picked.has(extra.slug) ? 'W Twoim pakiecie ✓' : `Dodaj ${extra.t} do pakietu`}
                </button>
              )}
              {data.ext.source && <p className="text-[13px] text-ink-2">{data.ext.source}</p>}
            </div>
          </div>
        </details>
      )}
    </>
  )
}

/** GoHub: five apps into one queue, „Dodaj GoHub do pakietu”. */
export function GoposHub({
  data,
  onDark = false,
}: {
  data: SectionData<'gopos-hub'>
  /** Navy section (board Web-gopos „Dowozy · GoHub”): glass tiles, dashed links, the green hub. */
  onDark?: boolean
}) {
  const state = useGopos()
  const inPackage = pickedOr(state, data.initial).has(data.hubSlug)
  const tile = onDark
    ? 'rounded-2xl bg-white/[0.06] ring-1 ring-white/12 text-white'
    : cx(CARD, 'text-ink')
  return (
    <div className="grid items-center gap-5 min-[900px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] min-[900px]:gap-0">
      <ul className="flex flex-wrap gap-2 min-[900px]:flex-col min-[900px]:gap-3">
        {data.platforms.map((platform) => (
          <li key={platform} className="flex items-center min-[900px]:gap-0">
            <span
              className={cx(
                tile,
                'flex items-center gap-3 px-3 py-2.5 font-extrabold',
                onDark && 'min-[900px]:w-52',
              )}
            >
              {onDark && (
                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-lg bg-white text-surface-dark"
                >
                  <Icon name="bag" className="size-4" strokeWidth={2.2} />
                </span>
              )}
              {platform}
            </span>
            {onDark && <Wire />}
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-4">
        <div
          className={cx(
            'flex flex-col items-center justify-center gap-1 p-6 text-center',
            onDark
              ? 'size-44 rounded-full bg-ok text-surface-dark shadow-[0_0_0_14px_color-mix(in_srgb,var(--ok)_14%,transparent),0_0_60px_-6px_var(--ok)]'
              : 'rounded-[22px] bg-ok-text text-surface',
          )}
        >
          <b className="font-display text-2xl font-extrabold">GoHub</b>
          <small className="text-[13px] font-bold">zamówienia w jednym miejscu</small>
        </div>
        <button
          type="button"
          aria-pressed={inPackage}
          onClick={() => goposActions.addModule(data.hubSlug, data.initial)}
          className={cx(
            'inline-flex min-h-11 items-center rounded-xl px-4 font-extrabold',
            onDark ? 'bg-white text-surface-dark' : 'bg-surface text-ink',
          )}
        >
          {inPackage ? 'GoHub jest w pakiecie ✓' : 'Dodaj GoHub do pakietu'}
        </button>
        {data.orders.length > 0 && <OrderQueue orders={data.orders} onDark={onDark} />}
      </div>
      <ul className="flex flex-col gap-2 min-[900px]:gap-3">
        {data.out.map((out) => (
          <li key={out.t} className="flex items-center">
            {onDark && <Wire />}
            <span className={cx(tile, 'flex grow flex-col px-4 py-3')}>
              <b className="font-extrabold">{out.t}</b>
              <small className={cx('text-[14px]', onDark ? 'text-white/75' : 'text-ink-2')}>
                {out.d}
              </small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A dashed link between a tile and the hub (desktop only, decorative). */
function Wire() {
  return (
    <span
      aria-hidden="true"
      className="hidden h-px w-8 shrink-0 border-t border-dashed border-accent-on-dark/60 min-[900px]:block min-[1080px]:w-12"
    />
  )
}

const QUEUE_MS = 2600

/**
 * The GoHub queue (PREMIUM-1011, `gopos.ord`): the orders arrive one by one — the newest on top,
 * channel, items and time. Stops while the pointer or the focus is on it and with the page's
 * „Wstrzymaj animację”; with reduced motion the queue just stands still.
 */
function OrderQueue({
  orders,
  onDark,
}: {
  orders: SectionData<'gopos-hub'>['orders']
  onDark: boolean
}) {
  const { paused } = useGopos()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [hold, setHold] = useState(false)
  const moving = !reduce && !paused && !hold && orders.length > 1
  useEffect(() => {
    if (!moving) return
    const timer = window.setInterval(() => setStep((value) => value + 1), QUEUE_MS)
    return () => window.clearInterval(timer)
  }, [moving])
  const queue = queueAt(orders, step)
  // The times stay with the places: the newest order is always „teraz”.
  const times = orders.map((order) => order.t)
  return (
    <div
      className="w-full max-w-[19rem]"
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
      data-order-queue
    >
      <p
        className={cx(
          'mb-2 text-center text-xs font-extrabold tracking-[0.08em] uppercase',
          onDark ? 'text-white/70' : 'text-ink-2',
        )}
      >
        Kolejka zamówień
      </p>
      {/* Not a live region: the queue is a picture of how GoHub works, not news to read out. */}
      <ol className="flex flex-col gap-2" tabIndex={0} aria-label="Przykładowa kolejka zamówień">
        {queue.map((order, i) => (
          <li
            key={`${order.c}-${step - i}`}
            className={cx(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px]',
              onDark ? 'bg-white/[0.08] ring-1 ring-white/12' : cx(CARD),
              i === 0 && moving && 'animate-[sw-arrive_1.3s_var(--ease-out)]',
            )}
          >
            <b className="font-extrabold">{order.c}</b>
            <span className={cx('grow', onDark ? 'text-white/75' : 'text-ink-2')}>{order.d}</span>
            <span
              className={cx(
                'rounded-full px-2 py-0.5 text-[12px] font-extrabold',
                i === 0 ? 'bg-ok text-surface-dark' : onDark ? 'bg-white/10' : 'bg-surface-2',
              )}
            >
              {times[i]}
            </span>
          </li>
        ))}
      </ol>
      {/* WCAG 2.2.2: a pause within reach on touch screens too (hidden with reduced motion). */}
      <PauseButton className="mx-auto mt-3 block" />
    </div>
  )
}

/**
 * Package configurator (#pakiet): modules on the left, „Twój pakiet GoPOS” on the right — the
 * modules, the hardware we will pick, „Zapytaj o ten pakiet” (one position per module).
 */
export function GoposPackage({ data }: { data: SectionData<'gopos-package'> }) {
  const state = useGopos()
  const picked = selectionForVenue(data.modules, [...pickedOr(state, data.initial)])
  const selected = packageModules(data.modules, picked)
  const hardware = packageHardware(data.modules, picked)
  return (
    <>
      <div className="grid gap-6 min-[1080px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ul className="grid gap-3 min-[640px]:grid-cols-2">
          {data.modules.map((module) => {
            const on = module.core || picked.has(module.slug)
            return (
              <li key={module.slug}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-disabled={module.core}
                  onClick={() =>
                    goposActions.setPicked(toggleModule(data.modules, picked, module.slug))
                  }
                  className={cx(
                    'flex size-full min-h-14 gap-3 rounded-2xl p-4 text-left transition-shadow max-md:p-3.5',
                    on
                      ? 'bg-card shadow-[inset_0_0_0_2px_var(--ok-text)]'
                      : 'bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                    module.core && 'cursor-default',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[13px] font-extrabold',
                      on ? 'bg-ok-text text-surface' : 'bg-surface-2 text-transparent',
                    )}
                  >
                    ✓
                  </span>
                  <span className="flex flex-col gap-1">
                    <b className="leading-snug font-extrabold text-ink">{module.name}</b>
                    <span className="text-[14px] leading-relaxed text-ink-2 max-md:text-[13px] max-md:leading-snug">
                      {module.text}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <aside
          aria-label="Twój pakiet GoPOS"
          className="flex flex-col gap-4 self-start rounded-[22px] bg-surface-dark p-6 text-white max-md:gap-3 max-md:p-[18px] min-[1080px]:sticky min-[1080px]:top-28"
        >
          <p className="font-display text-lg font-extrabold">Twój pakiet GoPOS</p>
          <dl className="flex flex-col gap-2" aria-live="polite">
            {selected.map((module) => (
              <div
                key={module.slug}
                className="flex justify-between gap-3 border-b border-white/10 pb-2"
              >
                <dt className="text-[14px] text-white/70">{module.core ? 'System' : 'Moduł'}</dt>
                <dd className="text-right font-extrabold">{module.name}</dd>
              </div>
            ))}
          </dl>
          {hardware.length > 0 && (
            <>
              <p className="text-[13px] font-extrabold tracking-[0.06em] text-white/70 uppercase">
                Sprzęt, który dobierzemy
              </p>
              <ul className="flex flex-wrap gap-2">
                {hardware.map((item) => (
                  <li key={item} className="rounded-full bg-white/10 px-3 py-1.5 text-[14px]">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          <button
            type="button"
            onClick={() =>
              cartActions.addItems(
                packageItems(data.modules, picked),
                (added) => `pakiet GoPOS (${added})`,
              )
            }
            className={BTN_PRIMARY}
          >
            Zapytaj o ten pakiet
          </button>
          {data.note && <p className="text-[13px] leading-relaxed text-white/75">{data.note}</p>}
        </aside>
      </div>
      <details className="group mt-6">
        <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-2xl px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Porównaj Basic i Pro</span>
          <span className="hidden group-open:inline">Zwiń porównanie</span>
        </summary>
        <div className="mt-5 grid gap-5 min-[1080px]:grid-cols-2">
          <div className={cx(CARD, 'overflow-x-auto p-2')}>
            <table className="w-full text-left text-[15px] text-ink">
              <thead>
                <tr>
                  {data.compare.head.map((cell, i) => (
                    <th key={i} scope="col" className="px-4 py-3 font-extrabold">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.compare.rows.map(([k, a, b]) => (
                  <tr key={k} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 font-bold text-ink-2">
                      {k}
                    </th>
                    <td className="px-4 py-3">{a}</td>
                    <td className="px-4 py-3 font-extrabold">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.compare.source && (
              <p className="px-4 py-3 text-[13px] text-ink-2">{data.compare.source}</p>
            )}
          </div>
          <div className={cx(CARD, 'flex flex-col gap-3 p-6 text-ink')}>
            <p className="font-extrabold">Funkcje systemu</p>
            <ul className="flex flex-wrap gap-2">
              {data.compare.functions.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-[14px] text-ink-2"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-extrabold">Dodatki do licencji</p>
            <ul className="flex flex-wrap gap-2">
              {data.compare.addons.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-[14px] text-ink-2"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-2">
              Dostępność części funkcji zależy od pakietu. Przy wycenie zaznaczymy, co jest w Twoim.
            </p>
          </div>
        </div>
      </details>
    </>
  )
}
