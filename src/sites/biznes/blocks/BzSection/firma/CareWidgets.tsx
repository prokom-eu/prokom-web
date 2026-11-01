'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { cartActions } from '@/lib/cart/store'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'

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
  const base = useId()
  const area = data.areas[current] ?? data.areas[0]!
  const go = (next: number) => {
    const i = (next + data.areas.length) % data.areas.length
    setCurrent(i)
    document.getElementById(`${base}-t${i}`)?.focus()
  }
  const listed = area.products.flatMap((slug) => (products[slug] ? [products[slug]] : []))
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
              'flex min-h-12 shrink-0 items-center rounded-2xl px-4 text-left font-extrabold transition-colors',
              i === current
                ? 'bg-ink text-surface'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
            )}
          >
            {item.t}
          </button>
        ))}
      </div>
      <div
        id={`${base}-p`}
        role="tabpanel"
        aria-labelledby={`${base}-t${current}`}
        className={cx(CARD, 'flex flex-col gap-5 p-6 text-ink sm:p-7')}
      >
        <div>
          <p className="text-[13px] font-extrabold text-ink-2">
            Obszar {current + 1} z {data.areas.length}
          </p>
          <h3 className="font-display text-[1.5rem] leading-tight font-extrabold">{area.t}</h3>
        </div>
        <ul className="grid gap-2 min-[640px]:grid-cols-2">
          {area.co.map((item) => (
            <li key={item} className="flex gap-2 text-[15px] leading-relaxed text-ink-2">
              <span aria-hidden="true" className="text-ok-text">
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
                        alt=""
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

/** Steps behind a switch: „Start opieki” / „Gdy coś się dzieje”. */
export function SwitchSteps({ data }: { data: SectionData<'switch-steps'> }) {
  const [mode, setMode] = useState(0)
  const steps = (data.modes[mode] ?? data.modes[0]!).steps
  return (
    <div className="flex flex-col gap-6">
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
      <ol
        aria-live="polite"
        className="grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4"
      >
        {steps.map((step, i) => (
          <li key={step.t} className={cx(CARD, 'flex flex-col gap-2 p-6 text-ink')}>
            <span
              aria-hidden="true"
              className="mb-2 flex size-10 items-center justify-center rounded-full bg-accent-text font-display font-extrabold text-accent-ink"
            >
              {i + 1}
            </span>
            <b className="font-display text-[1.1rem] leading-tight font-extrabold">{step.t}</b>
            <span className="text-[15px] leading-relaxed text-ink-2">{step.d}</span>
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
    </div>
  )
}
