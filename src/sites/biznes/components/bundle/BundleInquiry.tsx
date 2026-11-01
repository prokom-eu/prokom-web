'use client'

import Link from 'next/link'
import { useId, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { bundleCartItems, type BundleItem } from '@/lib/catalog/bundle'
import { cartActions, useCart } from '@/lib/cart/store'
import { plural } from '@/lib/plural'

import { STICKY_ACTION_BUTTON, StickyAction } from '../mobile/StickyAction'

export type BundleRow = BundleItem & { name: string; href: string; thumb: ReactNode }

/**
 * „W zestawie” and the „Twój zestaw” card (`Web-Zestaw-1440`, spec. §6.10): items with their
 * role, version and quantity; optional ones get a checkbox (off by default). „Zapytaj o ten
 * zestaw · N poz.” puts the required and the ticked items on the inquiry list with quantity and
 * note — no prices, no sums. `children` is the text above the list, `after` the sections below.
 */
export function BundleInquiry({
  name,
  rows,
  services,
  children,
  after,
}: {
  name: string
  rows: BundleRow[]
  services: string[]
  children: ReactNode
  after: ReactNode
}) {
  const [optional, setOptional] = useState<ReadonlySet<string>>(new Set())
  // Said when no toast shows: notes added to listed items only, or the list is full.
  const [notice, setNotice] = useState<string | null>(null)
  const cart = useCart()
  const items = bundleCartItems({ name, items: rows }, optional)
  const listed = items.length > 0 && items.every((item) => cart.some((e) => e.id === item.id))
  const optionalCount = rows.filter((row) => !row.mandatory).length
  const toggle = (slug: string, on: boolean) => {
    setNotice(null)
    setOptional((before) => {
      const next = new Set(before)
      if (on) next.add(slug)
      else next.delete(slug)
      return next
    })
  }

  const askLabel = `Zapytaj o ten zestaw · ${items.length} poz.`
  const onAsk = () => {
    if (listed) return
    const result = cartActions.addItems(items, (added) =>
      added === items.length
        ? `zestaw „${name}”`
        : `${added} ${plural(added, ['pozycja', 'pozycje', 'pozycji'])} zestawu`,
    )
    setNotice(
      result.skipped > 0
        ? `Lista zapytania jest pełna: ${result.skipped} ${plural(result.skipped, ['pozycja nie zmieściła', 'pozycje nie zmieściły', 'pozycji nie zmieściło'])} się. Usuń coś z listy i kliknij jeszcze raz.`
        : result.added === 0 && result.noted > 0
          ? 'Te pozycje już były w zapytaniu. Dopisaliśmy przy nich zestaw.'
          : null,
    )
  }

  const ask = (
    <button
      type="button"
      aria-disabled={listed}
      onClick={onAsk}
      className={cx(
        'inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 font-extrabold transition-colors',
        listed
          ? 'cursor-default bg-ok/15 text-white'
          : 'bg-white text-surface-dark hover:bg-white/85',
      )}
    >
      {listed ? (
        <>
          Zestaw jest w zapytaniu
          <Icon name="check" strokeWidth={2.6} className="size-4" />
        </>
      ) : (
        askLabel
      )}
    </button>
  )

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-14">
      <div className="flex min-w-0 flex-col gap-14 sm:gap-20">
        <div className="flex flex-col gap-5">{children}</div>
        <section aria-labelledby="w-zestawie-h" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="w-zestawie-h"
              className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-ink font-stretch-110%"
            >
              W zestawie
            </h2>
            <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-extrabold text-ink-2">
              {rows.length - optionalCount} + {optionalCount} opcjonalnie
            </span>
          </div>
          <ul className="flex flex-col">
            {rows.map((row) => (
              <BundleItemRow
                key={row.product}
                row={row}
                checked={optional.has(row.product)}
                onToggle={toggle}
              />
            ))}
          </ul>
        </section>
        {after}
      </div>
      <aside
        id="twoj-zestaw"
        aria-labelledby="twoj-zestaw-h"
        data-surface="dark"
        className="scroll-mt-28 rounded-[26px] bg-surface-dark p-6 text-white lg:sticky lg:top-28"
      >
        <h2 id="twoj-zestaw-h" className="font-display text-xl font-extrabold">
          Twój zestaw
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75" aria-live="polite">
          {items.length}{' '}
          {plural(items.length, ['pozycja trafi', 'pozycje trafią', 'pozycji trafi'])} do zapytania.
          Ofertę dostaniesz na piśmie.
        </p>
        {/* On a phone the sticky bar carries the action and its notice. */}
        <div className="mt-5 max-md:hidden">{ask}</div>
        {/* Always in the page, so screen readers announce a new text. */}
        <p
          role="status"
          className="mt-3 text-sm leading-relaxed font-bold text-white empty:hidden max-md:hidden"
        >
          {notice}
        </p>
        {listed && (
          <Link
            href="/zapytanie"
            className="mt-3 inline-block text-sm font-bold text-white underline"
          >
            Przejdź do zapytania
          </Link>
        )}
        {services.length > 0 && (
          <div className="mt-6 border-t border-white/15 pt-5">
            <h3 className="text-xs font-extrabold tracking-[0.12em] text-white/70 uppercase">
              Przy wdrożeniu robimy
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm font-bold">
              {services.map((service) => (
                <li key={service} className="flex gap-2.5">
                  <Icon
                    name="check"
                    strokeWidth={2.6}
                    className="mt-0.5 size-4 shrink-0 text-white/80"
                  />
                  {service}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      {/* Phone (MOBILE-APLIKACJA §1): the same action sticks to the bottom; once the set is on
          the list it leads to the inquiry. */}
      <StickyAction>
        <p role="status" className="mb-2 text-sm leading-snug font-bold text-ink empty:hidden">
          {notice}
        </p>
        {listed ? (
          <Link href="/zapytanie" className={STICKY_ACTION_BUTTON}>
            Przejdź do zapytania
            <Icon name="arrow" strokeWidth={2.4} className="size-4" />
          </Link>
        ) : (
          <button type="button" onClick={onAsk} className={STICKY_ACTION_BUTTON}>
            {askLabel}
          </button>
        )}
      </StickyAction>
    </div>
  )
}

function BundleItemRow({
  row,
  checked,
  onToggle,
}: {
  row: BundleRow
  checked: boolean
  onToggle: (slug: string, on: boolean) => void
}) {
  const id = useId()
  const quantity = /^\d+$/.test(row.quantity) ? `×${row.quantity}` : row.quantity
  return (
    <li className="flex gap-4 border-b border-border py-5 first:pt-0">
      {row.thumb}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[0.7rem] font-extrabold tracking-[0.1em] text-ink-3 uppercase">
            {row.role}
          </p>
          <span className="shrink-0 text-right text-sm font-extrabold text-ink">
            <span className="sr-only">Ilość: </span>
            {quantity}
          </span>
        </div>
        <Link href={row.href} className="font-extrabold text-ink hover:underline">
          {row.name}
        </Link>
        {row.suggestedVersion && <p className="text-sm text-ink-2">{row.suggestedVersion}</p>}
        {!row.mandatory && (
          <label
            htmlFor={id}
            className="mt-1.5 inline-flex min-h-11 cursor-pointer items-center gap-2.5 self-start text-sm font-bold text-accent-text"
          >
            <input
              id={id}
              type="checkbox"
              checked={checked}
              onChange={(event) => onToggle(row.product, event.target.checked)}
              className="size-5 accent-[var(--accent-text)]"
            />
            Dodaj do zapytania (opcjonalnie)
          </label>
        )}
      </div>
    </li>
  )
}
