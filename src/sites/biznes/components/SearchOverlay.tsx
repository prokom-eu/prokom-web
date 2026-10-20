'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type KeyboardEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

import { ICON_BUTTON } from '@/components/ui/iconButton'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import {
  matchCategories,
  matchPages,
  prepareSearch,
  resultsLabel,
  searchProducts,
} from '@/lib/search'

import { AddToCartButton } from './AddToCartButton'
import { ProductThumb, productSubtitle } from './ProductThumb'

const MAX_PRODUCTS = 6
const MAX_CATEGORIES = 4
const MAX_PAGES = 3

type Props = {
  /** wa.me link of the line; `null` hides "Napisz na WhatsApp" when nothing is found. */
  whatsapp: string | null
}

function SearchIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4.3-4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Typing into a field (or with a modifier) never opens the search on "/". */
function isTyping(event: globalThis.KeyboardEvent) {
  const target = event.target as HTMLElement | null
  return (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    Boolean(
      target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'),
    )
  )
}

/**
 * Search of the catalog (spec. §3.2, §8.2): the field in the header (a magnifier below 1280 px)
 * and "/" open a modal `<dialog>` — the browser keeps focus inside, closes it on Esc and
 * returns focus. The catalog index is fetched on the first opening, then matched on the client.
 */
export function SearchOverlay({ whatsapp }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const catalog = useCatalogIndex(open)
  const headingId = useId()

  const show = useCallback(() => {
    // Another modal (phone menu) is open: it owns the screen.
    if (!dialog.current || document.querySelector('dialog[open]')) return
    dialog.current.showModal()
    setOpen(true)
    input.current?.focus()
  }, [])

  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '/' || isTyping(event)) return
      event.preventDefault()
      show()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show])

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="/"
        onClick={show}
        className="hidden h-11 items-center gap-2.5 whitespace-nowrap rounded-xl border border-border bg-surface-2 px-3.5 text-sm font-semibold text-ink-2 hover:text-ink xl:inline-flex"
      >
        <SearchIcon size={18} />
        Szukaj w ofercie
        <kbd
          aria-hidden="true"
          className="ml-1 rounded-md border border-border bg-card px-1.5 font-sans text-xs text-ink-3"
        >
          /
        </kbd>
      </button>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={show}
        className={`${ICON_BUTTON} xl:hidden`}
      >
        <SearchIcon size={20} />
        <span className="sr-only">Szukaj w ofercie</span>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={headingId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          const box = dialog.current?.getBoundingClientRect()
          // The backdrop: a click outside the dialog box (the empty inside of it stays open).
          const outside =
            event.target === dialog.current &&
            box &&
            (event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom)
          // A followed link closes it too — not one opened in a new tab.
          const newTab = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0
          const link = !newTab && (event.target as Element).closest('a')
          if (outside || link) dialog.current?.close()
        }}
        className="fixed inset-x-0 top-0 m-0 max-h-dvh w-full max-sm:h-dvh max-w-none overflow-y-auto border-b border-border bg-card p-0 text-ink shadow-2xl backdrop:bg-surface-dark/60"
      >
        <div
          onKeyDown={moveFocus}
          className="mx-auto flex max-w-[76rem] flex-col gap-4 px-4 py-4 sm:px-8 sm:py-6"
        >
          <h2 id={headingId} className="sr-only">
            Szukaj w ofercie
          </h2>
          <div className="flex h-14 items-center gap-3 rounded-2xl bg-surface-2 pl-4 pr-2 text-accent-text shadow-[inset_0_0_0_2px_var(--accent-text),0_0_0_6px_var(--glow)] sm:h-[3.875rem] sm:pl-5">
            <SearchIcon size={22} />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                // In a search field Chrome's first Esc only clears the text: close at once.
                if (event.key === 'Escape') {
                  event.preventDefault()
                  dialog.current?.close()
                }
              }}
              placeholder="Czego szukasz? np. kasa na baterie, program do faktur, terminal"
              aria-label="Szukaj w ofercie"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-ink-3 sm:text-lg"
            />
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-3 text-xs font-extrabold text-ink-2 hover:text-ink"
            >
              Esc<span className="sr-only"> — zamknij wyszukiwarkę</span>
            </button>
          </div>

          {catalog.status === 'ready' ? (
            <SearchResults
              index={catalog.index}
              query={query}
              onPick={(phrase) => {
                setQuery(phrase)
                // Keep typing after a "Popularne" chip.
                input.current?.focus()
              }}
              whatsapp={whatsapp}
            />
          ) : catalog.status === 'error' ? (
            <p className="rounded-2xl bg-surface-2 p-5 text-ink-2">
              Nie udało się wczytać katalogu.{' '}
              <button
                type="button"
                onClick={catalog.retry}
                className="font-extrabold text-accent-text underline"
              >
                Spróbuj ponownie
              </button>{' '}
              albo{' '}
              <Link href="/oferta" className="font-extrabold text-accent-text underline">
                przejdź do oferty
              </Link>
              .
            </p>
          ) : (
            <p className="p-5 text-ink-3" role="status">
              Wczytuję katalog…
            </p>
          )}
        </div>
      </dialog>
    </>
  )
}

type ResultsProps = {
  index: CatalogIndex
  query: string
  onPick: (query: string) => void
  whatsapp: string | null
}

/** Arrow keys move between the result links (the field stays reachable with ↑ from the top). */
function moveFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const links = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-result]')]
  const current = links.indexOf(document.activeElement as HTMLElement)
  const next = current + (event.key === 'ArrowDown' ? 1 : -1)
  if (next < 0) {
    event.currentTarget.closest('dialog')?.querySelector<HTMLElement>('input')?.focus()
  } else {
    links[Math.min(next, links.length - 1)]?.focus()
  }
  event.preventDefault()
}

function SearchResults({ index, query, onPick, whatsapp }: ResultsProps) {
  const ids = useId()
  const prepared = useMemo(() => prepareSearch(index), [index])
  const deferred = useDeferredValue(query)
  const results = useMemo(() => searchProducts(prepared, deferred), [prepared, deferred])
  const trimmed = deferred.trim()

  const products = results ?? [...index.products].sort((a, b) => b.popularity - a.popularity)
  const categories = results
    ? matchCategories(index, results).slice(0, MAX_CATEGORIES)
    : [...index.categories]
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_CATEGORIES)
        .map((category) => ({ ...category, hits: 0 }))
  const pages = (results ? matchPages(index, deferred) : index.pages).slice(0, MAX_PAGES)
  const nothing = results !== null && results.length === 0

  return (
    <div className="flex flex-col gap-4">
      {index.search.popular.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink-3">
          <span>{trimmed ? 'Spróbuj też:' : 'Popularne:'}</span>
          {index.search.popular.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => onPick(phrase)}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-ink-2 hover:text-ink"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Results replace each other while typing: announce only the count. */}
      <p className="sr-only" aria-live="polite">
        {results === null ? '' : resultsLabel(results.length)}
      </p>

      {nothing ? (
        <NothingFound query={trimmed} whatsapp={whatsapp} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section aria-labelledby={`${ids}-products`}>
            <h3 id={`${ids}-products`} className={HEADING}>
              <span>Produkty i usługi</span>
              <span>{results ? resultsLabel(results.length) : 'najczęściej wybierane'}</span>
            </h3>
            <ul className="grid gap-1 sm:grid-cols-2">
              {products.slice(0, MAX_PRODUCTS).map((product) => (
                <li key={product.slug}>
                  <ProductResult product={product} index={index} />
                </li>
              ))}
            </ul>
          </section>
          <div className="flex flex-col gap-4">
            {categories.length > 0 && (
              <section aria-labelledby={`${ids}-categories`}>
                <h3 id={`${ids}-categories`} className={HEADING}>
                  Kategorie
                </h3>
                <ul className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link href={`/oferta/${category.slug}`} data-result className={ROW}>
                        {category.name}
                        <small className="text-sm font-semibold text-ink-3">
                          {category.hits ? `${category.hits} z ${category.count}` : category.count}
                        </small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {pages.length > 0 && (
              <section aria-labelledby={`${ids}-pages`}>
                <h3 id={`${ids}-pages`} className={HEADING}>
                  Strony i poradniki
                </h3>
                <ul className="flex flex-col gap-1">
                  {pages.map((page) => (
                    <li key={page.slug}>
                      <Link href={`/${page.slug}`} data-result className={ROW}>
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5 text-sm text-ink-3">
        <span>
          Szukamy w produktach, usługach, kategoriach i stronach. Rozumiemy literówki i potoczne
          nazwy („kasa na baterie”).
        </span>
        <Link
          // TODO(krystian): B5 reads the phrase from `?szukaj=` (catalog filters in the URL).
          href={trimmed ? `/oferta?szukaj=${encodeURIComponent(trimmed)}` : '/oferta'}
          data-result
          className="font-extrabold text-accent-text hover:underline"
        >
          Wszystkie wyniki w katalogu →
        </Link>
      </div>
    </div>
  )
}

const HEADING =
  'mb-2 flex justify-between px-1 text-xs font-black uppercase tracking-[0.06em] text-ink-3'
const ROW =
  'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-bold text-ink-2 hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2'

function ProductResult({ product, index }: { product: IndexProduct; index: CatalogIndex }) {
  const sub = productSubtitle(product, index)
  return (
    <div className="flex items-center gap-2 rounded-2xl p-2 hover:bg-surface-2">
      <Link
        href={`/produkt/${product.slug}`}
        data-result
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl"
      >
        <ProductThumb product={product} index={index} />
        <span className="min-w-0">
          <b className="block truncate text-[0.95rem] font-extrabold text-ink">{product.name}</b>
          {sub && <small className="block truncate text-sm text-ink-3">{sub}</small>}
        </span>
      </Link>
      <AddToCartButton slug={product.slug} name={product.name} />
    </div>
  )
}

function NothingFound({ query, whatsapp }: { query: string; whatsapp: string | null }) {
  return (
    <div className="grid gap-4 rounded-2xl bg-surface-2 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-card text-accent-text"
      >
        <SearchIcon size={26} />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-extrabold text-ink">
          Nie znaleźliśmy „{query}” w katalogu — ale pewnie załatwimy.
        </p>
        <p className="text-ink-2">
          Katalog to nie wszystko, co dostarczamy. Napisz, czego szukasz: sprawdzimy u dystrybutorów
          i oddzwonimy.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/zapytanie?fraza=${encodeURIComponent(query)}`}
            data-result
            className="inline-flex min-h-[46px] items-center rounded-xl bg-accent-text px-4 font-extrabold text-accent-ink"
          >
            Zapytaj o „{query}”
          </Link>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener"
              data-result
              className="inline-flex min-h-[46px] items-center rounded-xl border border-border bg-card px-4 font-extrabold text-ink"
            >
              Napisz na WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
