'use client'

import Image from 'next/image'
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

import { isSearchShortcut } from '@/lib/site/searchShortcut'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { ICON_BUTTON } from '@/components/ui/iconButton'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { brandHref } from '@/lib/catalog/brand'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'
import {
  matchBrands,
  matchCategories,
  matchPages,
  prepareSearch,
  resultsLabel,
  searchProducts,
} from '@/lib/search'

import { AddToCartButton } from './AddToCartButton'
import { ProductThumb, productSubtitle } from './ProductThumb'
import { SearchIcon } from './SearchIcon'

const MAX_PRODUCTS = 7
const MAX_CATEGORIES = 4
const MAX_PAGES = 3
const MAX_BRANDS = 3
const MAX_BUNDLES = 2

/** „Na skróty” of the empty search (K33 §2.5, `szybkie_kategorie` of the K4 home page). */
const SHORTCUT_CATEGORIES = [
  'kasy-fiskalne',
  'laptopy',
  'terminale-platnicze',
  'programy-sprzedazowe-erp',
  'siec-wifi',
  'serwery-nas-ups',
]
/** „Salony marek” of the empty search, in the board's order; brands without a logo drop out. */
const SHOWROOM_LOGOS = ['apple', 'samsung', 'lenovo', 'dell', 'posnet', 'elzab', 'sunmi', 'polcard']
// `/kreator` until K4g, the home page plan until K31d′.
const CONFIGURATOR_HREF = '/kreator'
const PLAN_HREF = '/#plan'

type Props = {
  /** wa.me link of the line; `null` hides "Napisz na WhatsApp" when nothing is found. */
  whatsapp: string | null
}

/** The focus is in a field: „/” is typed there, not a shortcut. */
function inField(event: globalThis.KeyboardEvent) {
  const target = event.target as HTMLElement | null
  return Boolean(
    target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'),
  )
}

/**
 * Search of the catalog (spec. §3.2, §8.2): the magnifier in the header and "/" open a modal
 * `<dialog>` — the browser keeps focus inside, closes it on Esc and returns focus. The catalog
 * index is fetched on the first opening, then matched on the client.
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
      const { key, ctrlKey, metaKey, altKey } = event
      if (!isSearchShortcut({ key, ctrlKey, metaKey, altKey, typing: inField(event) })) return
      event.preventDefault()
      show()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show])

  return (
    <>
      {/* K4 (K33 §2.2): „Szukaj · Ctrl K” from 640 px, the magnifier alone on phones. */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K /"
        onClick={show}
        className={cx(ICON_BUTTON, 'sm:w-auto sm:gap-2.5 sm:bg-surface-2 sm:px-4 sm:font-bold')}
      >
        <SearchIcon size={18} />
        {/* The name comes from the visible text (WCAG 2.5.3): „Szukaj w ofercie Ctrl K”. On
            phones the text is only for screen readers — the magnifier shows. */}
        <span className="sr-only sm:not-sr-only">
          Szukaj<span className="sr-only"> w ofercie</span>
        </span>
        <kbd className="sr-only rounded-md border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-bold whitespace-nowrap text-ink-2 sm:not-sr-only">
          Ctrl K
        </kbd>
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
        className="fixed inset-x-0 top-0 m-0 max-h-dvh w-full max-w-none overflow-y-auto bg-card p-0 text-ink shadow-2xl backdrop:bg-surface-dark/60 max-sm:h-dvh sm:top-[8vh] sm:mx-auto sm:max-h-[88vh] sm:w-[min(61rem,calc(100%-2rem))] sm:rounded-3xl sm:border sm:border-border"
      >
        <div onKeyDown={moveFocus} className="flex flex-col">
          <h2 id={headingId} className="sr-only">
            Szukaj w ofercie
          </h2>
          <div className="flex h-16 items-center gap-3 border-b border-border px-5 text-accent-text sm:h-[4.375rem] sm:px-6">
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
              placeholder="Czego szukasz? np. kasa na baterie, Subiekt, Wi-Fi dla gości"
              aria-label="Szukaj w ofercie"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-3 sm:text-xl [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface-2 px-2.5 text-xs font-extrabold text-ink-2 hover:text-ink"
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
            <p className="m-5 rounded-2xl bg-surface-2 p-5 text-ink-2">
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

  return (
    <div className="flex flex-col">
      {/* Results replace each other while typing: announce only the count. */}
      <p className="sr-only" aria-live="polite">
        {results === null ? '' : resultsLabel(results.length)}
      </p>
      {results === null ? (
        <EmptySearch index={index} onPick={onPick} ids={ids} />
      ) : results.length === 0 ? (
        <div className="p-5 sm:p-6">
          <NothingFound query={trimmed} whatsapp={whatsapp} />
        </div>
      ) : (
        <Found index={index} prepared={prepared} results={results} query={deferred} ids={ids} />
      )}
      <div className="hidden flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2 px-6 py-3 text-sm text-ink-2 sm:flex">
        <span className="flex items-center gap-2">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> wybór <Kbd>Enter</Kbd> otwórz <Kbd>Esc</Kbd> zamknij
        </span>
        <span>Rozumiemy literówki, odmianę i brak polskich znaków</span>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-card px-1.5 font-sans text-xs font-bold text-ink-2">
      {children}
    </kbd>
  )
}

/** Empty field (K33 §2.5): most searched phrases, shortcuts and the brand showrooms. */
function EmptySearch({
  index,
  onPick,
  ids,
}: {
  index: CatalogIndex
  onPick: (query: string) => void
  ids: string
}) {
  const categories = SHORTCUT_CATEGORIES.flatMap((slug) => {
    const category = index.categories.find((item) => item.slug === slug)
    return category ? [category] : []
  })
  const logos = SHOWROOM_LOGOS.flatMap((slug) => {
    const brand = index.brands.find((item) => item.slug === slug)
    return brand?.logo ? [{ ...brand, logo: brand.logo }] : []
  })
  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      {index.search.popular.length > 0 && (
        <section aria-labelledby={`${ids}-popular`}>
          <h3 id={`${ids}-popular`} className={HEADING}>
            Najczęściej szukane
          </h3>
          <div className="flex flex-wrap gap-2">
            {index.search.popular.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => onPick(phrase)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 font-semibold text-ink hover:bg-surface-2"
              >
                <SearchIcon size={14} />
                {phrase}
              </button>
            ))}
          </div>
        </section>
      )}
      <section aria-labelledby={`${ids}-shortcuts`}>
        <h3 id={`${ids}-shortcuts`} className={HEADING}>
          Na skróty
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/oferta/${category.slug}`} data-result className={TILE}>
                <TileIcon icon={category.icon ?? 'store'} />
                <span className="min-w-0">
                  <b className="block truncate font-extrabold text-ink">{category.name}</b>
                  <small className="block text-sm text-ink-2">{itemsLabel(category.count)}</small>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={CONFIGURATOR_HREF} data-result className={TILE}>
              <TileIcon icon="star" />
              <span className="min-w-0">
                <b className="block font-extrabold text-ink">Konfigurator</b>
                <small className="block text-sm text-ink-2">kilka pytań, około minuty</small>
              </span>
            </Link>
          </li>
          <li>
            <Link href={PLAN_HREF} data-result className={TILE}>
              <TileIcon icon="map" />
              <span className="min-w-0">
                <b className="block font-extrabold text-ink">Plan Twojej firmy</b>
                <small className="block text-sm text-ink-2">kliknij urządzenie na planie</small>
              </span>
            </Link>
          </li>
        </ul>
      </section>
      {logos.length > 0 && (
        <section aria-labelledby={`${ids}-showrooms`}>
          <h3 id={`${ids}-showrooms`} className={HEADING}>
            Salony marek
          </h3>
          <ul className="flex flex-wrap gap-2">
            {logos.map((brand) => (
              <li key={brand.slug}>
                <Link href={brandHref(brand.slug)} data-result className={LOGO}>
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    unoptimized
                    className="max-h-6 w-auto max-w-full object-contain"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/** Live results (K33 §2.5): products on the left; pages, categories, brands, bundles right. */
function Found({
  index,
  prepared,
  results,
  query,
  ids,
}: {
  index: CatalogIndex
  prepared: ReturnType<typeof prepareSearch>
  results: IndexProduct[]
  query: string
  ids: string
}) {
  const trimmed = query.trim()
  const categories = matchCategories(index, prepared, results, query).slice(0, MAX_CATEGORIES)
  const matched = matchPages(index, query)
  const pages = matched.filter((page) => !page.slug.startsWith('zestawy/')).slice(0, MAX_PAGES)
  const bundles = matched.filter((page) => page.slug.startsWith('zestawy/')).slice(0, MAX_BUNDLES)
  const brands = matchBrands(index, query).slice(0, MAX_BRANDS)
  return (
    <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section
        aria-labelledby={`${ids}-products`}
        className="p-5 sm:p-6 lg:border-r lg:border-border"
      >
        <h3 id={`${ids}-products`} className={HEADING}>
          <span>Produkty i usługi</span>
          <span className="tracking-normal normal-case text-accent-text">
            {resultsLabel(results.length)}
          </span>
        </h3>
        <ul className="flex flex-col gap-1">
          {results.slice(0, MAX_PRODUCTS).map((product) => (
            <li key={product.slug}>
              <ProductResult product={product} index={index} />
            </li>
          ))}
        </ul>
        <Link
          href={`/oferta?szukaj=${encodeURIComponent(trimmed)}`}
          data-result
          className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 font-extrabold text-ink hover:underline"
        >
          Pokaż wszystkie wyniki w ofercie · {resultsLabel(results.length)}
          <span aria-hidden="true">→</span>
        </Link>
      </section>
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {pages.length > 0 && (
          <section aria-labelledby={`${ids}-pages`}>
            <h3 id={`${ids}-pages`} className={HEADING}>
              Strony i usługi
            </h3>
            <ul className="flex flex-col gap-1">
              {pages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} data-result className={ROW}>
                    <TileIcon icon="arrow" />
                    <b className="font-extrabold text-ink">{page.title}</b>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {categories.length > 0 && (
          <section aria-labelledby={`${ids}-categories`}>
            <h3 id={`${ids}-categories`} className={HEADING}>
              Kategorie
            </h3>
            <ul className="flex flex-col gap-1">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/oferta/${category.slug}`} data-result className={ROW}>
                    <TileIcon icon={category.icon ?? 'store'} />
                    <span className="min-w-0">
                      <b className="block font-extrabold text-ink">{category.name}</b>
                      <small className="block text-sm text-ink-2">
                        {category.hits && category.hits < category.count
                          ? `${category.hits} z ${itemsLabel(category.count)}`
                          : itemsLabel(category.count)}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {brands.length > 0 && (
          <section aria-labelledby={`${ids}-brands`}>
            <h3 id={`${ids}-brands`} className={HEADING}>
              Marki
            </h3>
            <ul className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <li key={brand.slug}>
                  <Link href={brandHref(brand.slug)} data-result className={LOGO}>
                    {brand.logo ? (
                      <Image
                        src={brand.logo.url}
                        alt={brand.name}
                        width={brand.logo.width}
                        height={brand.logo.height}
                        unoptimized
                        className="max-h-6 w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-extrabold text-ink">{brand.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {bundles.length > 0 && (
          <section aria-labelledby={`${ids}-bundles`}>
            <h3 id={`${ids}-bundles`} className={HEADING}>
              Gotowe zestawy
            </h3>
            <ul className="flex flex-col gap-1">
              {bundles.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} data-result className={ROW}>
                    <TileIcon icon="box" />
                    <b className="truncate font-extrabold text-ink">{page.title}</b>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function TileIcon({ icon }: { icon: IconName }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent-text"
    >
      <Icon name={icon} className="size-[18px]" strokeWidth={2} />
    </span>
  )
}

const itemsLabel = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`

const HEADING =
  'mb-3 flex justify-between px-1 text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2'
const ROW =
  'flex items-center gap-3 rounded-xl px-2 py-2 text-ink-2 hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2'
const TILE =
  'flex h-full items-center gap-3 rounded-2xl bg-surface-2 px-3 py-3 hover:bg-surface focus-visible:bg-surface'
const LOGO =
  'inline-flex h-12 w-[6.5rem] items-center justify-center rounded-xl border border-border bg-white px-3 hover:border-accent'

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
