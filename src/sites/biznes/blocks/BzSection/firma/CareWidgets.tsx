'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { cartActions } from '@/lib/cart/store'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

import { useSwap } from '../../../components/motion/useSwap'
import { PathIcon } from '../../../components/product/PathIcon'
import { BTN_PRIMARY, CARD, TAB_KEYS } from '../ui'

export type AreaProduct = { slug: string; name: string; image?: IndexImage }

/**
 * Areas of care (#zakres): tabs on the left (arrows, Home/End), the chosen area on the right —
 * what we do there and the products we work on.
 */
export function CareAreas({
  data,
  products,
}: {
  data: SectionData<'care-areas'>
  products: Record<string, AreaProduct>
}) {
  const [current, setCurrent] = useState(0)
  const swap = useSwap(current)
  const base = useId()
  const area = data.areas[current] ?? data.areas[0]!
  const go = (next: number) => {
    const i = (next + data.areas.length) % data.areas.length
    setCurrent(i)
    document.getElementById(`${base}-t${i}`)?.focus()
  }
  const listed = area.products.flatMap((slug) => (products[slug] ? [products[slug]] : []))
  const photo = area.image ? products[area.image] : undefined
  return (
    <div className="grid gap-6 min-[1080px]:grid-cols-[300px_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label="Obszary opieki"
        aria-orientation="vertical"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 min-[1080px]:mx-0 min-[1080px]:flex-col min-[1080px]:overflow-visible min-[1080px]:px-0"
        onKeyDown={(event) => {
          if (TAB_KEYS.has(event.key)) event.preventDefault()
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') go(current + 1)
          if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') go(current - 1)
          if (event.key === 'Home') go(0)
          if (event.key === 'End') go(data.areas.length - 1)
        }}
      >
        {data.areas.map((item, i) => (
          <button
            key={item.t}
            id={`${base}-t${i}`}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-controls={`${base}-p`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => setCurrent(i)}
            className={cx(
              'flex min-h-12 shrink-0 items-center gap-3 rounded-2xl px-3 py-2 text-left font-extrabold transition-colors',
              i === current
                ? 'bg-card text-ink shadow-[0_16px_30px_-22px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)]'
                : 'text-ink hover:bg-card',
            )}
          >
            {item.iconPath && (
              <span
                aria-hidden="true"
                className={cx(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  i === current ? 'bg-ok-text text-surface' : 'bg-surface-2 text-accent-text',
                )}
              >
                <PathIcon d={item.iconPath} className="size-[18px]" />
              </span>
            )}
            {item.t}
          </button>
        ))}
      </div>
      <div
        id={`${base}-p`}
        role="tabpanel"
        {...swap}
        aria-labelledby={`${base}-t${current}`}
        className={cx(CARD, 'flex flex-col gap-5 p-6 text-ink sm:p-7')}
      >
        <div className="flex items-center gap-5">
          {photo?.image && (
            <span className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-surface-2 p-2 max-sm:hidden">
              <Image
                unoptimized
                src={photo.image.url}
                alt={photo.image.alt}
                // The name is in the text next to it: the alt serves search engines only.
                aria-hidden
                width={photo.image.width}
                height={photo.image.height}
                className="max-h-full w-auto object-contain"
              />
            </span>
          )}
          <div>
            <p className="text-[12px] font-extrabold tracking-[0.1em] text-accent-text uppercase">
              Obszar {current + 1} z {data.areas.length}
            </p>
            <h3 className="font-display text-[1.5rem] leading-tight font-extrabold">{area.t}</h3>
          </div>
        </div>
        <ul className="grid gap-2.5 min-[640px]:grid-cols-2">
          {area.co.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3.5 text-[15px] leading-snug font-bold text-ink"
            >
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ok-text text-[13px] text-surface"
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        {listed.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-extrabold text-ink-2">Na czym pracujemy</p>
            <ul className="grid grid-cols-2 gap-3 min-[640px]:grid-cols-3">
              {listed.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={productHref(product.slug)}
                    className="flex h-full flex-col items-center gap-2 rounded-2xl bg-surface-2 p-3 text-center hover:shadow-[inset_0_0_0_1px_var(--ink-3)]"
                  >
                    {product.image && (
                      <Image
                        unoptimized
                        src={product.image.url}
                        alt={product.image.alt}
                        // The name is in the text next to it: the alt serves search engines only.
                        aria-hidden
                        width={product.image.width}
                        height={product.image.height}
                        className="h-20 w-auto object-contain"
                      />
                    )}
                    <b className="text-[14px] leading-snug font-extrabold">{product.name}</b>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/** Icons of the steps by position (talk, put in order, care, plan ahead). */
const STEP_ICONS = ['chat', 'wrench', 'check', 'cal', 'bell', 'life'] as const

/** Steps behind a switch: „Start opieki” / „Gdy coś się dzieje”. */
export function SwitchSteps({ data }: { data: SectionData<'switch-steps'> }) {
  const [mode, setMode] = useState(0)
  const steps = (data.modes[mode] ?? data.modes[0]!).steps
  return (
    <div className="flex flex-col gap-6 max-md:gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pokaż kroki">
        {data.modes.map((item, i) => (
          <button
            key={item.t}
            type="button"
            aria-pressed={i === mode}
            onClick={() => setMode(i)}
            className={cx(
              'min-h-11 rounded-full px-5 font-extrabold transition-colors',
              i === mode
                ? 'bg-ink text-surface'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
            )}
          >
            {item.t}
          </button>
        ))}
      </div>
      {/* Phone (App-Opieka „Jak to działa”): the steps as one list in a card. */}
      <ol
        aria-live="polite"
        className="grid gap-4 max-md:gap-0 max-md:rounded-[22px] max-md:p-2 max-md:shadow-[inset_0_0_0_1px_var(--border)] min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4"
      >
        {steps.map((step, i) => (
          <li
            key={step.t}
            className={cx(
              CARD,
              'flex flex-col gap-2 p-6 text-ink max-md:grid max-md:grid-cols-[2.25rem_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-0.5 max-md:rounded-none max-md:p-3 max-md:shadow-none',
            )}
          >
            {/* Board `Web-opieka-it`: an icon tile with the step number on its corner. */}
            <span
              aria-hidden="true"
              className="relative mb-2 flex size-11 items-center justify-center rounded-xl bg-ok-text text-surface max-md:row-span-2 max-md:mb-0 max-md:size-9"
            >
              <Icon name={STEP_ICONS[i % STEP_ICONS.length]!} className="size-5" />
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-surface-dark text-[11px] font-extrabold text-white">
                {i + 1}
              </span>
            </span>
            <b className="font-display text-[1.1rem] leading-tight font-extrabold max-md:text-base">
              {step.t}
            </b>
            <span className="text-[15px] leading-relaxed text-ink-2 max-md:text-[13px] max-md:leading-snug">
              {step.d}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** „Ile masz stanowisk?”: the pick goes into the note of the care position on the inquiry. */
export function Seats({ data }: { data: SectionData<'seats'> }) {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Liczba stanowisk">
        {data.options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={picked === option}
            onClick={() => setPicked(picked === option ? null : option)}
            className={cx(
              'min-h-11 min-w-16 rounded-full px-4 font-extrabold transition-colors',
              picked === option
                ? 'bg-ink text-surface'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          cartActions.addItems(
            [{ id: data.slug, q: 1, uwaga: picked ? `Stanowiska: ${picked}` : data.note }],
            () => 'opieka IT',
          )
        }
        className={cx(BTN_PRIMARY, 'self-start')}
      >
        {picked ? `Zapytaj o opiekę · stanowiska: ${picked}` : data.label}
      </button>
      {data.link && (
        <Link
          href={data.link.href}
          className="inline-flex min-h-11 items-center gap-1.5 self-start font-extrabold text-accent-text underline-offset-4 hover:underline"
        >
          {data.link.label}
          <Icon name="arrow" className="size-4" />
        </Link>
      )}
    </div>
  )
}
