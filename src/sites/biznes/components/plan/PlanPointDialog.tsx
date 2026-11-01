'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useRef } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { planNote, type PlanPoint, type PlanScene } from '@/lib/catalog/floorPlan'
import { cartActions, openCartDrawer, useCart } from '@/lib/cart/store'

import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'
import { VideoFacade } from '../VideoFacade'
import type { PlanProduct } from './types'

type Props = {
  scene: PlanScene
  points: readonly PlanPoint[]
  products: Readonly<Record<string, PlanProduct>>
  /** Index into `points`; `null` = closed. */
  current: number | null
  onMove: (next: number | null) => void
  /** Called after closing with the number of the point, to give the focus back to it. */
  onClosed: (n: number) => void
}

const STEP =
  'inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-ink hover:bg-surface-2'

/**
 * A device of the plan (K31-ZMIANY §6, spec. §6.12, `Web-Plan-punkt`, `App-Plan-punkt`): the bar
 * „n · etykieta · rola — 3 z 19 — ‹ › ×”, the film behind its facade on the left (no film: the
 * photo on the studio), on the right the brand, name, benefit, 3 features, 4 parameters, „Dodaj
 * do zapytania” with the note „Plan: <scena>”, „Zobacz produkt” and „Następne na planie”. A modal
 * `<dialog>` — a sheet from the bottom on a phone: the browser keeps focus inside and closes on
 * Esc; ←/→ step; changing the device remounts the film, which stops it.
 */
export function PlanPointDialog({ scene, points, products, current, onMove, onClosed }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const last = useRef<number | null>(null)
  const headingId = useId()
  const cart = useCart()
  const point = current === null ? null : (points[current] ?? null)
  const product = point ? products[point.product] : undefined
  const on = product ? cart.some((item) => item.id === product.slug) : false
  const next = current === null || points.length < 2 ? null : points[(current + 1) % points.length]

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (point) last.current = point.n
    if (point && !element.open) element.showModal()
    if (!point && element.open) element.close()
  }, [point])

  const step = (delta: number) => {
    if (current === null || points.length < 2) return
    onMove((current + delta + points.length) % points.length)
  }

  const add = () => {
    if (!product) return
    if (on) {
      openCartDrawer()
      return
    }
    cartActions.addItems([{ id: product.slug, q: 1, uwaga: planNote(scene) }], () => product.name)
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      onClose={() => {
        onMove(null)
        if (last.current !== null) onClosed(last.current)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1)
        if (event.key === 'ArrowLeft') step(-1)
      }}
      onClick={(event) => {
        // The backdrop is the dialog element itself outside its box.
        if (event.target === dialog.current) dialog.current?.close()
      }}
      className={cx(
        'fixed inset-x-0 bottom-0 m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[26px] border border-border bg-card p-0 text-ink shadow-2xl backdrop:bg-surface-dark/60',
        'sm:inset-0 sm:m-auto sm:max-h-[90dvh] sm:w-[min(77.5rem,calc(100%-2rem))] sm:rounded-[28px]',
      )}
    >
      {point && product && (
        <div>
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card px-4 py-3 sm:px-5">
            <p className="flex min-w-0 flex-1 items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-accent-ink">
                {point.n}
              </span>
              <span className="truncate text-[13.5px] font-bold text-accent-text">
                {point.label}
                {point.description ? ` · ${point.description}` : ''}
              </span>
            </p>
            <span className="hidden text-[13px] font-bold text-ink-3 sm:inline">
              {current! + 1} z {points.length}
            </span>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Poprzednie urządzenie"
              className={STEP}
            >
              <Icon name="arrow" className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Następne urządzenie"
              className={STEP}
            >
              <Icon name="arrow" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Zamknij"
              className={STEP}
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>

          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6">
            <div>
              {product.video ? (
                <>
                  <VideoFacade
                    key={`${point.n}-${product.video.id}`}
                    video={product.video}
                    label="Film o tym produkcie"
                    poster={
                      product.image ? (
                        <Image
                          src={product.image.url}
                          alt=""
                          width={product.image.width}
                          height={product.image.height}
                          unoptimized
                          className="h-auto max-h-full w-auto max-w-full object-contain"
                        />
                      ) : undefined
                    }
                  />
                  <p className="mt-2 text-[12px] text-ink-3">
                    Film z oficjalnego kanału producenta. Odtwarza się po kliknięciu (YouTube bez
                    plików cookie).
                  </p>
                </>
              ) : (
                <ProductStage className="aspect-[16/10] rounded-[20px]">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.name}
                      width={product.image.width}
                      height={product.image.height}
                      unoptimized
                      className={cx('max-h-[78%] w-auto max-w-[70%] object-contain', STAGE_SHADOW)}
                    />
                  ) : (
                    <StageFallback icon={product.icon} size="lg" name={product.name} />
                  )}
                </ProductStage>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {product.brand && (
                <p className="text-[12px] font-extrabold tracking-[0.12em] text-ink-3 uppercase">
                  {product.brand}
                </p>
              )}
              <h2
                id={headingId}
                className="font-display text-[clamp(1.35rem,2.4vw,1.75rem)] leading-tight font-extrabold text-ink"
              >
                {product.name}
              </h2>
              {product.benefit && <p className="text-[15px] text-ink-2">{product.benefit}</p>}
              {product.features.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px] font-bold text-ink-2"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              {product.params.length > 0 && (
                <dl className="divide-y divide-border border-y border-border">
                  {product.params.map((param) => (
                    <div
                      key={param.label}
                      className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 py-2.5 text-[13.5px]"
                    >
                      <dt className="text-ink-3">{param.label}</dt>
                      <dd className="font-semibold text-ink">{param.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={add}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-accent px-5 font-extrabold text-accent-ink hover:brightness-110"
                >
                  {on ? '✓ W zapytaniu' : 'Dodaj do zapytania'}
                </button>
                <Link
                  href={product.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border px-5 font-extrabold text-ink hover:bg-surface-2"
                >
                  Zobacz produkt
                </Link>
              </div>
              {next && products[next.product] && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="flex min-h-11 items-center gap-3 rounded-xl bg-surface-2 px-3 py-2 text-left"
                >
                  <span className="text-[11.5px] font-extrabold tracking-[0.1em] text-ink-2 uppercase">
                    Następne na planie
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">
                    {products[next.product]!.name}
                  </span>
                  <Icon name="arrow" className="size-4 shrink-0 text-ink-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
