'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { ICON_BUTTON } from '@/components/ui/iconButton'
import { cartCount, MAX_QTY, suggestFor } from '@/lib/cart/cart'
import { cartActions, onCartOpen, useCart } from '@/lib/cart/store'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { plural } from '@/lib/plural'

import { AddToCartButton } from './AddToCartButton'
import { ListForm } from './inquiry/ListForm'
import { ProductThumb, productSubtitle } from './ProductThumb'

type Sent = { number: string | null; emailed: boolean }
type Token = { status: 'loading' | 'error' } | { status: 'ready'; value: string }

const focusOnMount = (node: HTMLElement | null) => node?.focus()

/**
 * A fresh form token when the drawer opens (`/api/inquiry-token`): the drawer lives in the
 * layout of cached pages, so a token rendered with it could be too old (ADR-003).
 */
function useFormToken(enabled: boolean): Token {
  const [token, setToken] = useState<Token>({ status: 'loading' })
  const ready = token.status === 'ready'
  useEffect(() => {
    if (!enabled || ready) return
    let alive = true
    fetch('/api/inquiry-token', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        if (!alive) return
        const value = (data as { formToken?: unknown } | null)?.formToken
        setToken(typeof value === 'string' ? { status: 'ready', value } : { status: 'error' })
      })
      .catch(() => alive && setToken({ status: 'error' }))
    return () => {
      alive = false
    }
  }, [enabled, ready])
  return token
}

type Props = {
  /** Main phone of the line (`tel:`) for "albo zadzwoń"; `null` hides it. */
  phone: { label: string; href: string } | null
}

const QTY_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-lg text-lg font-bold text-ink hover:bg-surface-3 aria-disabled:opacity-40 aria-disabled:hover:bg-transparent'

/**
 * „Twoje zapytanie (n)” from the right (spec. §3.2, K4-FINAL §5): the list with − / + and
 * removal, "Często dobierane" and the inquiry form under the list — sent without leaving the
 * page. A modal `<dialog>` — Esc closes it and focus returns to the button that opened it.
 * Names and pictures come from the catalog index; once it loads, products the catalog no
 * longer has leave the list (spec. §8.1).
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
  const heading = useRef<HTMLHeadingElement>(null)
  // A removed row (or a suggestion that moved onto the list) takes its focused button with it:
  // focus goes to the title, and the count below it is announced (keyboard, spec. §9 pkt 7).
  const focusTitle = () => heading.current?.focus()

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
  const [sent, setSent] = useState<Sent | null>(null)
  const token = useFormToken(open && count > 0)

  function onSent(result: Sent) {
    setSent(result)
    cartActions.clear()
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={() => {
        setOpen(false)
        // The thanks belong to this opening; the next one starts with the list again.
        setSent(null)
      }}
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
          <h2
            ref={heading}
            id={titleId}
            tabIndex={-1}
            className="font-display text-xl font-extrabold outline-none"
          >
            Twoje zapytanie ({count})
          </h2>
          <p className="text-sm text-ink-2" aria-live="polite">
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
        {sent ? (
          <div
            // Focused when it mounts, so screen readers announce the number at once.
            ref={focusOnMount}
            tabIndex={-1}
            role="status"
            className="m-auto flex flex-col items-center gap-3 px-5 py-10 text-center text-ink-2 outline-none"
          >
            {sent.number && (
              <p className="text-[13.5px] font-extrabold">Zapytanie nr {sent.number}</p>
            )}
            <b className="font-display text-xl text-ink">Dziękujemy, zapytanie wysłane</b>
            <p className="max-w-[34ch]">
              Oddzwonimy w ciągu 60 minut w godzinach pracy. Poza godzinami — następnego dnia
              roboczego. Ofertę dostaniesz na piśmie.
              {sent.emailed && ' Kopię listy wysłaliśmy na Twój e-mail.'}
            </p>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="inline-flex min-h-12 items-center rounded-xl border-[1.5px] border-border-input px-5 font-extrabold text-ink hover:border-ink"
            >
              Nowe zapytanie
            </button>
          </div>
        ) : count === 0 ? (
          <div className="m-auto flex flex-col items-center gap-3 px-5 py-10 text-center text-ink-2">
            <b className="text-lg text-ink">Lista jest pusta</b>
            <p className="max-w-[30ch]">
              Dodaj produkty z oferty albo po prostu opisz, czego potrzebujesz — dobierzemy resztę.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/oferta"
                className="inline-flex min-h-12 items-center rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink"
              >
                Przeglądaj ofertę
              </Link>
              {/* TODO(krystian): /konfigurator after K4g. */}
              <Link
                href="/kreator"
                className="inline-flex min-h-12 items-center rounded-xl border-[1.5px] border-border-input px-5 font-extrabold text-ink hover:border-ink"
              >
                Konfigurator
              </Link>
            </div>
            <Link href="/zapytanie" className="font-extrabold text-accent-text">
              Opisz, czego potrzebujesz →
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
                          // aria-disabled, not disabled: a disabled button would drop focus.
                          aria-disabled={item.q <= 1}
                          onClick={() => item.q > 1 && cartActions.changeQty(item.id, -1)}
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
                          aria-disabled={item.q >= MAX_QTY}
                          onClick={() => item.q < MAX_QTY && cartActions.changeQty(item.id, 1)}
                          className={QTY_BUTTON}
                        >
                          +<span className="sr-only"> więcej</span>
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cartActions.remove(item.id)
                        focusTitle()
                      }}
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
                      <AddToCartButton
                        slug={product.slug}
                        name={product.name}
                        onToggle={focusTitle}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section
              aria-labelledby={`${titleId}-form`}
              className="mt-2 rounded-2xl bg-surface-2 px-4 pt-4 pb-5"
            >
              <h3 id={`${titleId}-form`} className="mb-3 font-display text-lg font-extrabold">
                Dokąd wysłać ofertę?
              </h3>
              {token.status === 'ready' ? (
                <ListForm
                  compact
                  formToken={token.value}
                  cart={cart}
                  phrase={null}
                  promises={[]}
                  onSent={onSent}
                />
              ) : token.status === 'loading' ? (
                <p className="text-ink-2" role="status">
                  Wczytuję formularz…
                </p>
              ) : (
                <p className="text-ink-2">
                  Nie udało się wczytać formularza.{' '}
                  <Link href="/zapytanie" className="font-extrabold text-accent-text">
                    Wyślij listę ze strony zapytania →
                  </Link>
                </p>
              )}
            </section>
          </>
        )}
      </div>

      {count > 0 && !sent && (
        <div className="flex flex-col gap-2.5 border-t border-border px-5 pb-4 pt-3">
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
