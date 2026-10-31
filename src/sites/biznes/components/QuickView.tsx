'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useRef } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import { cardIcon, productHref } from '@/lib/catalog/card'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import { cartActions, openCartDrawer, useCart } from '@/lib/cart/store'

import { ProductStage, StageFallback } from './ProductStage'

type Props = {
  /** Products the preview steps through (the search results); `null` = closed. */
  products: readonly IndexProduct[]
  current: number | null
  index: CatalogIndex
  onMove: (next: number | null) => void
}

/** Features shown in the preview (K33 §2.6: 3–4). */
const FEATURES = 4

/**
 * Quick preview of a product (K33 §2.6): picture on the studio, brand logo, „Nowość”, category,
 * name, benefit, features, „+ Do zapytania” / „✓ W zapytaniu” (a second click opens the inquiry
 * drawer) and „Pełna karta →”; ←/→ step through the list it was opened from. A modal `<dialog>`
 * over the search: the browser keeps focus inside and closes it on Esc.
 */
export function QuickView({ products, current, index, onMove }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  const product = current === null ? null : products[current]
  const cart = useCart()
  const on = product ? cart.some((item) => item.id === product.slug) : false

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (product && !element.open) element.showModal()
    if (!product && element.open) element.close()
  }, [product])

  const step = (delta: number) => {
    if (current === null || products.length < 2) return
    onMove((current + delta + products.length) % products.length)
  }

  const brand = product ? index.brands.find((item) => item.slug === product.brand) : undefined
  const category = product
    ? index.categories.find((item) => item.slug === product.categories[0])
    : undefined

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      onClose={() => onMove(null)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1)
        if (event.key === 'ArrowLeft') step(-1)
      }}
      onClick={(event) => {
        // The backdrop is the dialog element itself outside its box.
        if (event.target === dialog.current) dialog.current?.close()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(56rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-border bg-card p-0 text-ink shadow-2xl backdrop:bg-surface-dark/60"
    >
      {product && (
        <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ProductStage className="min-h-64 sm:min-h-full">
            {product.image ? (
              <Image
                src={product.image.url}
                alt={product.name}
                width={product.image.width}
                height={product.image.height}
                unoptimized
                className="max-h-72 w-auto max-w-[80%] object-contain"
              />
            ) : (
              <StageFallback icon={cardIcon(product, index)} name={product.name} />
            )}
          </ProductStage>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {brand?.logo && (
                  <span className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-2">
                    <Image
                      src={brand.logo.url}
                      alt={brand.name}
                      width={brand.logo.width}
                      height={brand.logo.height}
                      unoptimized
                      className="max-h-5 w-auto max-w-24 object-contain"
                    />
                  </span>
                )}
                {product.isNew && (
                  <span className="rounded-full bg-accent-text px-2.5 py-1 text-xs font-extrabold text-accent-ink">
                    Nowość
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Zamknij podgląd"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border hover:bg-surface-2"
              >
                <Icon name="x" className="size-4" />
              </button>
            </div>

            <div>
              {category && <p className="text-sm font-bold text-ink-2">{category.name}</p>}
              <h2 id={headingId} className="font-display text-2xl leading-tight font-extrabold">
                {product.name}
              </h2>
              {product.benefit && <p className="mt-2 text-ink-2">{product.benefit}</p>}
            </div>

            {product.features.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {product.features.slice(0, FEATURES).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Icon
                      name="check"
                      strokeWidth={2.6}
                      className="mt-0.5 size-4 shrink-0 text-ok-text"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  on ? openCartDrawer() : cartActions.add(product.slug, product.name)
                }
                className={cx(
                  'inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 font-display font-extrabold',
                  on
                    ? 'bg-surface-2 text-ok-text shadow-[inset_0_0_0_1px_var(--border)]'
                    : 'bg-accent-text text-accent-ink hover:bg-ink hover:text-surface',
                )}
              >
                {on ? '✓ W zapytaniu' : '+ Do zapytania'}
              </button>
              <Link
                href={productHref(product.slug)}
                className="font-extrabold text-accent-text hover:underline"
              >
                Pełna karta →
              </Link>
            </div>

            {products.length > 1 && current !== null && (
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-ink-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="rounded-lg px-2 py-1 font-bold hover:bg-surface-2"
                >
                  ← Poprzedni
                </button>
                <span aria-live="polite">
                  {current + 1} / {products.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="rounded-lg px-2 py-1 font-bold hover:bg-surface-2"
                >
                  Następny →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
