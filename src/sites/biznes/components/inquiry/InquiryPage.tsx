'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { cartCount, MAX_NOTE, MAX_QTY, suggestFor } from '@/lib/cart/cart'
import { cartActions, useCart } from '@/lib/cart/store'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { itemsSummary } from '@/lib/inquiry/listForm'
import { plural } from '@/lib/plural'

import { AddToCartButton } from '../AddToCartButton'
import { ProductThumb, productSubtitle } from '../ProductThumb'
import { SearchIcon } from '../SearchIcon'
import { ListForm } from './ListForm'

type Props = {
  breadcrumbs: ReactNode
  formToken: string
  /** `?fraza=` of „Zapytaj o X” (search overlay, empty catalog result). */
  phrase: string | null
  /** `SiteSettings.biznes.promises.callbackTime` [SZEF], e.g. „Oddzwonimy w 60 minut”. */
  callbackTime: string | null
  /** Office hours in short, e.g. „pn–pt 9:00–17:00”. */
  hours: string | null
  phone: { label: string; href: string } | null
}

// `true` in the browser after hydration, `false` on the server and while hydrating.
const subscribeNothing = () => () => {}
const onClient = () => true
const onServer = () => false

type Sent = { number: string | null; emailed: boolean; items: string; hadItems: boolean }

const QTY_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-lg text-lg font-bold text-ink hover:bg-surface-3 aria-disabled:opacity-40 aria-disabled:hover:bg-transparent'
const LINK = 'font-extrabold text-accent-text hover:underline'

// A stable function: an inline ref would run again on every render and steal the focus.
const focusOnMount = (node: HTMLElement | null) => node?.focus()

/** „Lista ✓ — Dane — Wysłane” of the board. */
function Steps({ sent }: { sent: boolean }) {
  const steps = [
    { label: 'Lista', state: 'ok' },
    { label: 'Dane', state: sent ? 'ok' : 'on' },
    { label: 'Wysłane', state: sent ? 'ok' : 'todo' },
  ] as const
  return (
    <ol className="flex items-center gap-2.5 text-sm font-extrabold text-ink-3">
      {steps.map((step, i) => (
        <li
          key={step.label}
          aria-current={step.state === 'on' ? 'step' : undefined}
          className={cx('flex items-center gap-2', step.state !== 'todo' && 'text-ink')}
        >
          {i > 0 && <span aria-hidden="true" className="h-0.5 w-6 rounded bg-border sm:w-8" />}
          <span
            aria-hidden="true"
            className={cx(
              'inline-flex size-[30px] items-center justify-center rounded-full text-[13px]',
              step.state === 'ok' && 'bg-ok text-white',
              step.state === 'on' && 'bg-accent-text text-accent-ink',
              step.state === 'todo' && 'shadow-[inset_0_0_0_2px_var(--border)]',
            )}
          >
            {step.state === 'ok' ? (
              <Icon name="check" strokeWidth={2.6} className="size-4" />
            ) : (
              i + 1
            )}
          </span>
          {step.label}
          {step.state === 'ok' && <span className="sr-only"> (gotowe)</span>}
        </li>
      ))}
    </ol>
  )
}

/**
 * `/zapytanie` (spec. §6.3, plansza Zapytanie): the list from `pk-cart` with quantities and
 * notes, „Często dobierane razem” and the contact form; after sending, the number and the
 * timeline, and the list is cleared. Names and pictures come from the catalog index.
 */
export function InquiryPage({ breadcrumbs, formToken, phrase, callbackTime, hours, phone }: Props) {
  const cart = useCart()
  const catalog = useCatalogIndex(true)
  const index = catalog.index
  const [ask, setAsk] = useState(phrase?.trim() || null)
  const [notes, setNotes] = useState<ReadonlySet<string>>(() => new Set())
  const [sent, setSent] = useState<Sent | null>(null)
  // The list lives in the browser: the server and the first render see it empty, so until
  // mounted the page says it is loading instead of flashing „Lista jest pusta”.
  const mounted = useSyncExternalStore(subscribeNothing, onClient, onServer)
  // The visible line with the count (or „Lista jest pusta”): where the focus goes after a
  // removed row takes its button away (keyboard, WCAG 2.4.7).
  const listStatus = useRef<HTMLParagraphElement>(null)
  const focusListStatus = () => requestAnimationFrame(() => listStatus.current?.focus())

  useEffect(() => {
    if (index) cartActions.prune(new Set(index.products.map((product) => product.slug)))
  }, [index])

  const bySlug = useMemo(
    () => new Map(index?.products.map((product) => [product.slug, product])),
    [index],
  )
  const suggestions = useMemo(() => (index ? suggestFor(cart, index, 3) : []), [cart, index])
  const count = cartCount(cart)
  const callback = callbackTime?.trim() || null
  const promises = [
    callback && (hours ? `${callback} (${hours})` : callback),
    'Wycena na piśmie, z wariantami',
    'Bez zobowiązań, bez newslettera',
  ].filter((promise): promise is string => Boolean(promise))

  function removeAsk() {
    setAsk(null)
    // A refresh must not bring the phrase back.
    const url = new URL(window.location.href)
    url.searchParams.delete('fraza')
    window.history.replaceState(window.history.state, '', url)
  }

  function onSent({ number, emailed }: { number: string | null; emailed: boolean }) {
    const items =
      cart.length > 0
        ? itemsSummary(
            cart.map((item) => ({ name: bySlug.get(item.id)?.name ?? item.id, quantity: item.q })),
          )
        : ask
          ? `„${ask}”`
          : 'zapytanie ogólne'
    setSent({ number, emailed, items, hadItems: cart.length > 0 })
    cartActions.clear()
    setNotes(new Set())
    removeAsk()
  }

  const toggleNote = (id: string) =>
    setNotes((open) => {
      const next = new Set(open)
      if (!next.delete(id)) next.add(id)
      return next
    })

  return (
    <>
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_55%)]">
        <div className="mx-auto w-full max-w-7xl px-4 pt-5 pb-6 sm:px-6 sm:pt-7 lg:px-8">
          {breadcrumbs}
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-[clamp(2.5rem,4.4vw,3.75rem)] leading-[0.98] font-extrabold tracking-[-0.02em] text-ink">
                Twoje zapytanie
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">
                Sprawdź listę, dopisz uwagi i zostaw telefon. Przygotujemy wycenę na piśmie — z
                wariantami, bez zobowiązań.
              </p>
            </div>
            <Steps sent={sent !== null} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-start gap-7 px-4 pt-2.5 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_470px]">
        <section aria-labelledby="lista-h" className="flex flex-col gap-2.5">
          <h2 id="lista-h" className="sr-only">
            Pozycje na liście
          </h2>
          {ask && (
            <div className="flex items-center gap-3.5 rounded-[18px] bg-warn/12 px-4 py-3.5 text-[14.5px] text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--warn)_35%,transparent)]">
              <span
                aria-hidden="true"
                className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-warn text-surface-dark"
              >
                <SearchIcon size={18} />
              </span>
              <p>
                Szukałeś: <b>„{ask}”</b> — dopiszemy to do zapytania. Sprawdzimy dostępność u
                dystrybutorów.
              </p>
              <button
                type="button"
                onClick={removeAsk}
                className="ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-card hover:text-ink"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="sr-only">Usuń szukaną frazę</span>
              </button>
            </div>
          )}

          {!mounted ? (
            <p className="p-4 text-ink-2" role="status">
              Wczytuję listę…
            </p>
          ) : count === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl bg-card p-7 shadow-[inset_0_0_0_1px_var(--border)]">
              <p
                ref={listStatus}
                tabIndex={-1}
                className="font-display text-xl font-extrabold text-ink outline-offset-4"
              >
                Lista jest pusta
              </p>
              <p className="max-w-[52ch] text-ink-2">
                Dodawaj produkty i usługi przyciskiem „Do zapytania” w katalogu — albo po prostu
                napisz w formularzu obok, czego potrzebujesz.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href="/oferta"
                  className="inline-flex min-h-12 items-center rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink hover:bg-ink hover:text-surface"
                >
                  Przejdź do katalogu
                </Link>
                <Link href="/konfigurator" className={LINK}>
                  Otwórz konfigurator
                </Link>
              </div>
            </div>
          ) : !index ? (
            <div className="flex flex-wrap items-center gap-3 p-4 text-ink-2" role="status">
              {catalog.status === 'error' ? (
                <>
                  Nie udało się wczytać listy.
                  <button type="button" onClick={catalog.retry} className={LINK}>
                    Spróbuj ponownie
                  </button>
                </>
              ) : (
                'Wczytuję listę…'
              )}
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-2.5">
                {cart.map((item) => {
                  const product = bySlug.get(item.id)
                  if (!product) return null
                  const sub = productSubtitle(product, index)
                  const noteOpen = notes.has(item.id) || Boolean(item.uwaga)
                  const noteId = `uwaga-${item.id}`
                  return (
                    <li
                      key={item.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-3xl bg-card p-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
                    >
                      <ProductThumb product={product} index={index} large />
                      <div className="min-w-0">
                        <Link
                          href={`/produkt/${product.slug}`}
                          className="font-display text-lg leading-tight font-bold text-ink hover:underline"
                        >
                          {product.name}
                        </Link>
                        {sub && (
                          <small className="mt-0.5 block text-[13px] text-ink-2">{sub}</small>
                        )}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                          <div
                            role="group"
                            aria-label={`Ilość: ${product.name}`}
                            className="inline-flex items-center rounded-lg border border-border bg-card"
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
                          {/* A written note stays visible: hiding it would hide what is sent. */}
                          {!item.uwaga && (
                            <button
                              type="button"
                              aria-expanded={noteOpen}
                              aria-controls={noteOpen ? noteId : undefined}
                              onClick={() => toggleNote(item.id)}
                              className="px-0.5 py-1.5 text-[13.5px] font-extrabold text-accent-text hover:underline"
                            >
                              {noteOpen ? 'Ukryj uwagę' : '+ Dodaj uwagę do pozycji'}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          cartActions.remove(item.id)
                          focusListStatus()
                        }}
                        className="inline-flex size-9 items-center justify-center self-start rounded-[10px] bg-surface-2 text-ink-2 hover:text-ink"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
                      {noteOpen && (
                        <div className="col-span-full sm:col-start-2">
                          <label htmlFor={noteId} className="sr-only">
                            Uwagi do: {product.name}
                          </label>
                          <textarea
                            id={noteId}
                            value={item.uwaga ?? ''}
                            onChange={(event) => cartActions.setNote(item.id, event.target.value)}
                            maxLength={MAX_NOTE}
                            rows={2}
                            placeholder={`Uwagi do: ${product.name} — np. kolor, moduł, ile sztuk na kiedy`}
                            className="block min-h-16 w-full resize-y rounded-[14px] border-[1.5px] border-border-input bg-surface px-3.5 py-3 text-[14.5px] text-ink placeholder:text-ink-3 focus:border-accent-text"
                          />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3.5 text-[14.5px] text-ink-2">
                <p ref={listStatus} tabIndex={-1} aria-live="polite" className="outline-offset-4">
                  {count} {plural(count, ['pozycja', 'pozycje', 'pozycji'])} · bez cen, wycena na
                  piśmie
                </p>
                <p className="flex gap-4">
                  <Link href="/oferta" className={LINK}>
                    + Dodaj z katalogu
                  </Link>
                  <Link href="/konfigurator" className={LINK}>
                    Otwórz konfigurator
                  </Link>
                </p>
              </div>
              {suggestions.length > 0 && (
                <section aria-labelledby="sugestie-h">
                  <h3
                    id="sugestie-h"
                    className="mb-2 text-xs font-black tracking-[0.06em] text-ink-2 uppercase"
                  >
                    Często dobierane razem
                  </h3>
                  <ul className="grid gap-2.5 sm:grid-cols-3">
                    {suggestions.map((product) => (
                      <li
                        key={product.slug}
                        className="flex items-center gap-3 rounded-[18px] bg-surface-2 p-3"
                      >
                        <Link
                          href={`/produkt/${product.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <ProductThumb product={product} index={index} />
                          <span className="min-w-0">
                            <b className="block text-sm leading-tight font-extrabold text-ink">
                              {product.name}
                            </b>
                            <small className="text-xs text-ink-2">
                              {productSubtitle(product, index)}
                            </small>
                          </span>
                        </Link>
                        <AddToCartButton
                          slug={product.slug}
                          name={product.name}
                          onToggle={focusListStatus}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </section>

        <section
          aria-labelledby="dane-h"
          className="overflow-hidden rounded-[30px] bg-card shadow-[0_30px_60px_-40px_var(--glow),inset_0_0_0_1px_var(--border)] lg:sticky lg:top-24"
        >
          <div
            data-surface="dark"
            className="flex items-center justify-between gap-3 bg-surface-dark px-6 py-[22px] text-white"
          >
            <div>
              <h2 id="dane-h" className="font-display text-[22px] font-extrabold text-white">
                {sent ? 'Zapytanie wysłane' : 'Dane do kontaktu'}
              </h2>
              {!sent && (
                <p className="mt-0.5 text-[13px] text-white/80">
                  Imię i telefon albo e-mail wystarczą
                </p>
              )}
            </div>
            {!sent && count > 0 && (
              <span className="font-display text-[30px] font-extrabold text-accent-on-dark">
                {count}
                <span className="sr-only"> {plural(count, ['pozycja', 'pozycje', 'pozycji'])}</span>
              </span>
            )}
          </div>
          {sent ? (
            <div
              // Focused when it mounts, so screen readers announce the number at once.
              ref={focusOnMount}
              tabIndex={-1}
              role="status"
              className="flex flex-col items-start gap-4 px-6 py-7 outline-none"
            >
              <span
                aria-hidden="true"
                className="flex size-[76px] items-center justify-center rounded-full bg-ok text-white"
              >
                <Icon name="check" strokeWidth={2.6} className="size-9" />
              </span>
              {sent.number && (
                <p className="text-[13.5px] font-extrabold text-ink-2">
                  Zapytanie nr {sent.number}
                </p>
              )}
              <p className="font-display text-[26px] leading-[1.1] font-extrabold text-ink">
                {sent.hadItems
                  ? 'Dziękujemy — mamy Twoją listę.'
                  : 'Dziękujemy, zapytanie wysłane.'}
              </p>
              <p className="leading-relaxed text-ink-2">
                {sent.emailed &&
                  (sent.hadItems
                    ? 'Kopię listy wysłaliśmy na Twój e-mail. '
                    : 'Potwierdzenie wysłaliśmy na Twój e-mail. ')}
                {phone && (
                  <>
                    Pilna sprawa? Zadzwoń:{' '}
                    <a href={phone.href} className="font-bold text-ink">
                      {phone.label}
                    </a>
                    .
                  </>
                )}
              </p>
              <ol className="flex w-full flex-col">
                {[
                  { title: 'Zapytanie przyjęte', text: sent.items, done: true },
                  {
                    title: callback ?? 'Oddzwaniamy',
                    text: `w godzinach pracy${hours ? `, ${hours}` : ''} — dopytamy o szczegóły`,
                  },
                  {
                    title: 'Wycena na piśmie',
                    text: 'z wariantami do wyboru i terminem realizacji',
                  },
                  {
                    title: 'Dostawa i wdrożenie',
                    text: 'konfiguracja, fiskalizacja, szkolenie — u Ciebie',
                  },
                ].map((step, i, all) => (
                  <li key={step.title} className="relative grid grid-cols-[34px_1fr] gap-3 pb-4">
                    {i < all.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute top-[34px] bottom-0 left-4 w-0.5 bg-border"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={cx(
                        'flex size-[34px] items-center justify-center rounded-full text-sm font-extrabold',
                        step.done ? 'bg-ok text-white' : 'bg-surface-2 text-ink',
                      )}
                    >
                      {step.done ? (
                        <Icon name="check" strokeWidth={2.6} className="size-4" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span>
                      <b className="block text-ink">{step.title}</b>
                      <span className="text-sm text-ink-2">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/oferta"
                  className="inline-flex min-h-11 items-center rounded-xl bg-accent-text px-5 font-bold text-accent-ink hover:bg-ink hover:text-surface"
                >
                  Wróć do katalogu
                </Link>
                <button
                  type="button"
                  onClick={() => setSent(null)}
                  className="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-border-input px-5 font-bold text-ink hover:border-ink"
                >
                  Nowe zapytanie
                </button>
              </div>
            </div>
          ) : (
            <ListForm
              formToken={formToken}
              cart={cart}
              phrase={ask}
              promises={promises}
              onSent={onSent}
            />
          )}
        </section>
      </div>
    </>
  )
}
