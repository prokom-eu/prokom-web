'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { ICON_BUTTON } from '@/components/ui/iconButton'
import { cartCount, suggestFor } from '@/lib/cart/cart'
import { cartActions, onCartOpen, useCart } from '@/lib/cart/store'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { plural } from '@/lib/plural'

import { AddToCartButton } from './AddToCartButton'
import { ProductThumb, productSubtitle } from './ProductThumb'

type Props = {
  /** Main phone of the line (`tel:`) for "albo zadzwoń"; `null` hides it. */
  phone: { label: string; href: string } | null
}

const QTY_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-lg text-lg font-bold text-ink hover:bg-surface-3 disabled:opacity-40'

/**
 * Inquiry drawer from the right (spec. §3.2): the list with − / + and removal, "Często
 * dobierane" and the way to the inquiry form. A modal `<dialog>` — Esc closes it and focus
 * returns to the button that opened it. Names and pictures come from the catalog index; once
 * it loads, products the catalog no longer has leave the list (spec. §8.1).
 */
export function CartDrawer({ phone }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const cart = useCart()
  // Fetched when the drawer opens, not on every page view (plan B, §4).
  const catalog = useCatalogIndex(open)
  const index = catalog.index
  const titleId = useId()

  useEffect(
    () =>
      onCartOpen(() => {
        if (!dialog.current || dialog.current.open) return
        // The search (or the phone menu) closes first: one modal at a time.
        document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((d) => d.close())
        dialog.current.showModal()
        setOpen(true)
      }),
    [],
  )

  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  useEffect(() => {
    if (index) cartActions.prune(new Set(index.products.map((product) => product.slug)))
  }, [index])

  const bySlug = useMemo(
    () => new Map(index?.products.map((product) => [product.slug, product])),
    [index],
  )
  const suggestions = useMemo(() => (index ? suggestFor(cart, index) : []), [cart, index])
  const count = cartCount(cart)

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        // The backdrop: a pointer click on the dialog element outside its box (a keyboard
        // "click" on a button has no position, so the target decides). Links close it too.
        const box = dialog.current?.getBoundingClientRect()
        const outside =
          event.target === dialog.current &&
          box !== undefined &&
          (event.clientX < box.left || event.clientX > box.right)
        const newTab = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0
        const link = !newTab && (event.target as Element).closest('a')
        if (outside || link) dialog.current?.close()
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-[440px] bg-card p-0 text-ink shadow-2xl backdrop:bg-surface-dark/60 open:flex open:flex-col"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 pb-4 pt-5">
        <div>
          <h2 id={titleId} className="font-display text-xl font-extrabold">
            Twoje zapytanie
          </h2>
          <p className="text-sm text-ink-3">
            {count > 0
              ? `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])} · bez cen, wycena na piśmie`
              : 'bez cen, wycena na piśmie'}
          </p>
        </div>
        <button type="button" onClick={() => dialog.current?.close()} className={ICON_BUTTON}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="sr-only">Zamknij listę</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        {count === 0 ? (
          <div className="m-auto flex flex-col items-center gap-3 px-5 py-10 text-center text-ink-2">
            <b className="text-lg text-ink">Lista jest pusta</b>
            <p className="max-w-[30ch]">
              Dodawaj produkty i usługi przyciskiem „Do zapytania” — wyślesz je jednym formularzem,
              a wycenę dostaniesz na piśmie.
            </p>
            <Link
              href="/oferta"
              className="inline-flex min-h-12 items-center rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink"
            >
              Przeglądaj ofertę
            </Link>
            <Link href="/kontakt#formularz" className="font-extrabold text-accent-text">
              albo napisz do nas →
            </Link>
          </div>
        ) : !index ? (
          <p className="p-4 text-ink-3" role="status">
            {catalog.status === 'error' ? 'Nie udało się wczytać listy.' : 'Wczytuję listę…'}
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {cart.map((item) => {
                const product = bySlug.get(item.id)
                if (!product) return null
                const sub = productSubtitle(product, index)
                return (
                  <li
                    key={item.id}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-surface-2 p-2.5"
                  >
                    <ProductThumb product={product} index={index} />
                    <div className="min-w-0">
                      <Link
                        href={`/produkt/${product.slug}`}
                        className="block truncate font-extrabold text-ink hover:underline"
                      >
                        {product.name}
                      </Link>
                      {/* ink-2: ink-3 on surface-2 is below WCAG AA in the light theme. */}
                      {sub && <small className="block truncate text-sm text-ink-2">{sub}</small>}
                      <div
                        role="group"
                        aria-label={`Ilość: ${product.name}`}
                        className="mt-1 inline-flex items-center rounded-lg border border-border bg-card"
                      >
                        <button
                          type="button"
                          onClick={() => cartActions.changeQty(item.id, -1)}
                          disabled={item.q <= 1}
                          className={QTY_BUTTON}
                        >
                          −<span className="sr-only"> mniej</span>
                        </button>
                        <span className="min-w-8 text-center font-extrabold" aria-live="polite">
                          {item.q}
                          <span className="sr-only"> szt.</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => cartActions.changeQty(item.id, 1)}
                          className={QTY_BUTTON}
                        >
                          +<span className="sr-only"> więcej</span>
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => cartActions.remove(item.id)}
                      className="inline-flex size-9 items-center justify-center self-start rounded-lg text-ink-3 hover:text-ink"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="sr-only">Usuń: {product.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {suggestions.length > 0 && (
              <section aria-labelledby={`${titleId}-sug`} className="px-1 pt-2">
                <h3
                  id={`${titleId}-sug`}
                  className="mb-2 px-1 text-xs font-black uppercase tracking-[0.06em] text-ink-3"
                >
                  Często dobierane razem
                </h3>
                <ul className="flex flex-col gap-1">
                  {suggestions.map((product) => (
                    <li key={product.slug} className="flex items-center gap-2 rounded-2xl p-2">
                      <Link
                        href={`/produkt/${product.slug}`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <ProductThumb product={product} index={index} />
                        <span className="min-w-0">
                          <b className="block truncate font-extrabold text-ink">{product.name}</b>
                          <small className="block truncate text-sm text-ink-3">
                            {productSubtitle(product, index)}
                          </small>
                        </span>
                      </Link>
                      <AddToCartButton slug={product.slug} name={product.name} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {count > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-border px-5 pb-5 pt-4">
          <p className="text-sm text-ink-2">
            Bez cen na stronie: przygotujemy wycenę na piśmie, z wariantami.
          </p>
          <Link
            href="/zapytanie"
            className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink"
          >
            Przejdź do zapytania ({count})
          </Link>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={cartActions.clear}
              className="py-1.5 font-extrabold text-ink-3 hover:text-ink"
            >
              Wyczyść listę
            </button>
            {phone && (
              <a href={phone.href} className="font-extrabold text-ink">
                albo zadzwoń: {phone.label}
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
