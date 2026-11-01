'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import {
  packageHardware,
  packageItems,
  packageModules,
  selectionForVenue,
  toggleModule,
} from '@/lib/biznes/pages/gopos'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { cartActions } from '@/lib/cart/store'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

import { BTN_OUTLINE, BTN_PRIMARY, CARD, EYEBROW } from '../ui'
import { Ticket } from './Stage'
import { goposActions, pickedOr, useGopos } from './store'

const FLOW_FOR_TICKET = (venues: SectionData<'gopos-venues'>['venues']) =>
  // The ticket names the step; the venue section has no flow of its own, so the statuses do.
  venues[0]!.ticket.statuses.map((k) => ({ k, t: k, d: '' }))

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
  return { current, setCurrent, base, go }
}

/** „Twój lokal” (#lokal): a venue tab sets the package to its starting modules. */
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
  const pick = (i: number) => {
    const next = data.venues[i]!
    goposActions.pickVenue(
      next.key,
      next.modules.map((module) => module.slug),
    )
  }
  const image = venue.image ? images[venue.image] : undefined
  return (
    <div className="grid gap-6 min-[1080px]:grid-cols-[280px_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label="Rodzaj lokalu"
        aria-orientation="vertical"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 min-[1080px]:mx-0 min-[1080px]:flex-col min-[1080px]:overflow-visible min-[1080px]:px-0"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') pick(tabs.go(index + 1))
          if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') pick(tabs.go(index - 1))
        }}
      >
        {data.venues.map((item, i) => (
          <button
            key={item.key}
            id={`${tabs.base}-t${i}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-controls={`${tabs.base}-p`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => pick(i)}
            className={cx(
              'flex min-h-12 shrink-0 items-center justify-between gap-3 rounded-2xl px-4 text-left font-extrabold transition-colors',
              i === index
                ? 'bg-ink text-surface'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
            )}
          >
            {item.tab}
          </button>
        ))}
      </div>
      <div
        id={`${tabs.base}-p`}
        role="tabpanel"
        aria-labelledby={`${tabs.base}-t${index}`}
        className={cx(
          CARD,
          'grid gap-6 p-6 sm:p-8 min-[900px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]',
        )}
      >
        <div className="flex flex-col gap-4 text-ink">
          <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight font-extrabold text-balance">
            {venue.h1a} <em className="text-ok-text not-italic">{venue.h1b}</em>
          </h3>
          <p className="leading-relaxed text-pretty text-ink-2">{venue.lead}</p>
          <div>
            <p className={cx(EYEBROW, 'mb-2 text-ink-3')}>Pakiet na start</p>
            <ul className="flex flex-wrap gap-2">
              {['GoPOS', ...venue.modules.map((module) => module.name)].map((name) => (
                <li
                  key={name}
                  className="rounded-full bg-ok/15 px-3 py-1.5 text-[14px] font-extrabold text-ink"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <a href="#pakiet" className={BTN_PRIMARY}>
              Skonfiguruj pakiet
            </a>
          </div>
        </div>
        <div className="relative flex min-h-[240px] items-center justify-center rounded-2xl bg-surface-2 p-6">
          {image && (
            <Image
              unoptimized
              src={image.url}
              alt=""
              width={image.width}
              height={image.height}
              className="max-h-[260px] w-auto object-contain"
            />
          )}
          <Ticket
            ticket={venue.ticket}
            flow={FLOW_FOR_TICKET(data.venues)}
            className="absolute inset-x-4 bottom-4 hidden min-[761px]:flex"
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
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') tabs.go(tabs.current + 1)
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') tabs.go(tabs.current - 1)
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
        <ul
          id={`${tabs.base}-p`}
          role="tabpanel"
          aria-labelledby={`${tabs.base}-t${tabs.current}`}
          className={cx(CARD, 'flex flex-col divide-y divide-border p-2 text-ink')}
        >
          {area.items.map((item) => {
            const inPackage =
              item.slug !== undefined && (item.slug === data.core || picked.has(item.slug))
            return (
              <li key={item.t} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5">
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
                    aria-label={`Zobacz kartę: ${item.t}`}
                    className="inline-flex min-h-11 items-center px-2 text-[14px] font-extrabold text-accent-text hover:underline"
                  >
                    Karta →
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
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
              {data.ext.source && <p className="text-[13px] text-ink-3">{data.ext.source}</p>}
            </div>
          </div>
        </details>
      )}
    </>
  )
}

/** GoHub: five apps into one queue, „Dodaj GoHub do pakietu”. */
export function GoposHub({ data }: { data: SectionData<'gopos-hub'> }) {
  const state = useGopos()
  const inPackage = pickedOr(state, data.initial).has(data.hubSlug)
  return (
    <div className="grid items-center gap-5 min-[900px]:grid-cols-[1fr_auto_1fr]">
      <ul className="flex flex-wrap gap-2 min-[900px]:flex-col">
        {data.platforms.map((platform) => (
          <li key={platform} className={cx(CARD, 'px-4 py-3 font-extrabold text-ink')}>
            {platform}
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-3 rounded-[22px] bg-ok-text p-6 text-center text-surface">
        <b className="font-display text-2xl font-extrabold">GoHub</b>
        <small>zamówienia w jednym miejscu</small>
        <button
          type="button"
          aria-pressed={inPackage}
          onClick={() => goposActions.addModule(data.hubSlug, data.initial)}
          className="inline-flex min-h-11 items-center rounded-xl bg-surface px-4 font-extrabold text-ink"
        >
          {inPackage ? 'GoHub jest w pakiecie ✓' : 'Dodaj GoHub do pakietu'}
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {data.out.map((out) => (
          <li key={out.t} className={cx(CARD, 'flex flex-col px-4 py-3 text-ink')}>
            <b className="font-extrabold">{out.t}</b>
            <small className="text-[14px] text-ink-2">{out.d}</small>
          </li>
        ))}
      </ul>
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
                    'flex size-full min-h-14 gap-3 rounded-2xl p-4 text-left transition-shadow',
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
                    <span className="text-[14px] leading-relaxed text-ink-2">{module.text}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <aside
          aria-label="Twój pakiet GoPOS"
          className="flex flex-col gap-4 self-start rounded-[22px] bg-surface-dark p-6 text-white min-[1080px]:sticky min-[1080px]:top-28"
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
              <p className="px-4 py-3 text-[13px] text-ink-3">{data.compare.source}</p>
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
            <p className="text-[13px] text-ink-3">
              Dostępność części funkcji zależy od pakietu — przy wycenie zaznaczymy, co jest w
              Twoim.
            </p>
          </div>
        </div>
      </details>
    </>
  )
}
