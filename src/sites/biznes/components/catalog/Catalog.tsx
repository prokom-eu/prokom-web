'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import {
  activeFilters,
  CATALOG_PAGE_SIZE,
  catalogHref,
  clearFilters,
  parseCatalogState,
  runCatalog,
  SORTS,
  updateState,
  type CatalogState,
} from '@/lib/catalog/filters'
import { catalogSlots, emptySuggestions, PARTNERS } from '@/lib/catalog/listing'
import { primeCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { plural } from '@/lib/plural'
import { prepareSearch } from '@/lib/search'

import { SearchIcon } from '../SearchIcon'
import { CatalogFilters } from './CatalogFilters'
import { EmptyResult } from './EmptyResult'
import { FilterSheet } from './FilterSheet'
import { ProductCard } from './ProductCard'
import { PartnersCard, WizardCard } from './PromoCards'

/** The URL follows the search box after a short pause, not on every key. */
const QUERY_DELAY_MS = 300

const positions = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`

/**
 * The catalog island (spec. §5, §8.3): search box, group tiles, filters, results. The view is
 * read from the URL only; every change writes the URL (`history.pushState`, which the Next
 * router follows), so Back, a refresh and a shared link show the same list. The server renders
 * the first view from the same URL and the same index.
 */
export function Catalog({ index }: { index: CatalogIndex }) {
  const searchParams = useSearchParams()
  const state = useMemo(() => parseCatalogState(searchParams, index), [searchParams, index])
  const search = useMemo(() => prepareSearch(index), [index])
  // A layout effect runs before the header's effects: the search and the drawer reuse this
  // index instead of fetching it. Not in render — that also runs on the server.
  useLayoutEffect(() => primeCatalogIndex(index), [index])

  // The box shows what is typed at once; the URL catches up after a pause.
  const [draft, setDraft] = useState(state.query)
  const [syncedQuery, setSyncedQuery] = useState(state.query)
  /** The phrase the box last wrote to the URL. */
  const [written, setWritten] = useState<string | null>(null)
  if (syncedQuery !== state.query) {
    // The URL changed elsewhere (chip ×, Back): the box follows it — but not when the URL only
    // caught up with the box, or what was typed meanwhile (a space, a letter) would vanish.
    setSyncedQuery(state.query)
    if (state.query !== written) setDraft(state.query)
  }
  const typing = draft.trim() !== state.query
  const view = useMemo(
    () => (typing ? updateState(state, { query: draft.trim() }) : state),
    [typing, state, draft],
  )
  const { results, visible, facets } = useMemo(
    () => runCatalog(index, search, view),
    [index, search, view],
  )
  const chips = activeFilters(view, index)

  const countRef = useRef<HTMLParagraphElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const focusCard = useRef<number | null>(null)
  const sheetTitle = useRef<HTMLSpanElement>(null)

  const write = (next: CatalogState, mode: 'push' | 'replace' = 'push') => {
    const href = catalogHref(next)
    if (mode === 'push') window.history.pushState(null, '', href)
    else window.history.replaceState(null, '', href)
  }
  const change = (patch: Partial<CatalogState>) => write(updateState(view, patch))

  useEffect(() => {
    if (!typing) return
    const timer = window.setTimeout(() => {
      setWritten(view.query)
      write(view, 'replace')
    }, QUERY_DELAY_MS)
    return () => window.clearTimeout(timer)
  })

  // After „Pokaż kolejne”: focus the first new card, so the keyboard continues there.
  useEffect(() => {
    if (focusCard.current === null) return
    const card = listRef.current?.querySelector<HTMLAnchorElement>(
      `[data-card="${focusCard.current}"] h3 a`,
    )
    focusCard.current = null
    card?.focus()
  }, [visible.length])

  /** A chip or „Wyczyść” removes the focused button: focus goes to the result count. */
  const changeAndFocusCount = (next: CatalogState) => {
    write(next)
    setDraft(next.query)
    countRef.current?.focus()
  }

  const activeCount = chips.filter((chip) => chip.key !== 'query').length
  /**
   * „Wyczyść (N)” disappears with the filters it cleared. In the sheet focus goes to its
   * title — the count is outside the modal, where focus cannot go.
   */
  const clearPanel = (inSheet: boolean) => {
    const next = clearFilters(view, { keepQuery: true })
    if (!inSheet) return changeAndFocusCount(next)
    write(next)
    sheetTitle.current?.focus()
  }
  const filters = (inSheet: boolean) => (
    <CatalogFilters
      index={index}
      state={view}
      facets={facets}
      onChange={change}
      onClear={() => clearPanel(inSheet)}
      activeCount={activeCount}
      heading={!inSheet}
    />
  )
  const partners = PARTNERS.map((partner) => partner.slug).filter((slug) =>
    index.brands.some((brand) => brand.slug === slug),
  )
  const slots = catalogSlots(visible, view, partners)
  const list = view.view === 'list'

  const more = results.length - visible.length
  const next = updateState(view, { page: view.page + 1 })

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            write(view, 'replace')
          }}
        >
          <label htmlFor="catalog-search" className="sr-only">
            Szukaj w katalogu
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-accent-text">
              <SearchIcon size={24} />
            </span>
            <input
              id="catalog-search"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Szukaj: kasa na baterie, program do faktur, terminal, laptop…"
              autoComplete="off"
              enterKeyHint="search"
              className="h-14 w-full rounded-2xl border border-border-input bg-card pl-14 pr-4 text-base text-ink shadow-[0_18px_40px_-30px_var(--glow)] placeholder:text-ink-3 sm:h-[66px] sm:text-lg"
            />
          </div>
        </form>
        {index.search.popular.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-ink-3">
            <span>Popularne:</span>
            {index.search.popular.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => {
                  setDraft(phrase)
                  change({ query: phrase })
                }}
                className="min-h-9 rounded-full bg-surface-2 px-3.5 text-[0.85rem] font-bold text-ink hover:bg-surface-3"
              >
                {phrase}
              </button>
            ))}
          </div>
        )}

        <ul className="-mx-4 mt-6 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {[
            { slug: null, name: 'Wszystko', count: facets.groups.all ?? 0, group: null },
            ...index.groups.map((group) => ({
              slug: group.slug,
              name: group.name,
              count: facets.groups[group.slug] ?? 0,
              group,
            })),
          ].map((tile) => {
            const on = view.group === tile.slug
            return (
              <li key={tile.name} className="w-[136px] shrink-0 snap-start sm:w-auto">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    change({ group: on || tile.slug === null ? null : tile.slug, categories: [] })
                  }
                  className={cx(
                    'flex h-full w-full flex-col items-start gap-2.5 rounded-[20px] bg-card p-3.5 text-left transition-shadow',
                    on
                      ? 'shadow-[inset_0_0_0_2px_var(--accent-text),0_18px_36px_-22px_var(--glow)]'
                      : 'shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--border-input)]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'flex size-10 items-center justify-center rounded-xl text-white',
                      !tile.group && 'bg-surface-dark',
                    )}
                    style={
                      tile.group
                        ? {
                            backgroundImage: `linear-gradient(145deg, ${tile.group.gradient[0]}, ${tile.group.gradient[1]})`,
                          }
                        : undefined
                    }
                  >
                    {tile.group ? (
                      <Icon name={tile.group.icon} className="size-5" strokeWidth={2} />
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                        <path
                          d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-[0.92rem] font-bold leading-tight text-ink">
                    {tile.name}
                  </span>
                  <span className="text-xs font-extrabold text-ink-3">{positions(tile.count)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-start gap-7 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <FilterSheet activeCount={activeCount} resultCount={results.length} titleRef={sheetTitle}>
          {filters(true)}
        </FilterSheet>
        <aside
          aria-label="Filtry katalogu"
          className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto lg:pr-1.5"
        >
          {filters(false)}
        </aside>

        <section aria-labelledby="catalog-results" className="min-w-0">
          <h2 id="catalog-results" className="sr-only">
            Produkty i usługi
          </h2>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <p
                ref={countRef}
                tabIndex={-1}
                aria-live="polite"
                className="text-[0.95rem] text-ink-2 outline-none"
              >
                <b className="mr-1 font-display text-[1.375rem] text-ink">{results.length}</b>{' '}
                {plural(results.length, ['pozycja', 'pozycje', 'pozycji'])}
              </p>
              {chips.length > 0 && (
                <ul className="flex flex-wrap items-center gap-1.5">
                  {chips.map((chip) => (
                    <li key={chip.key}>
                      <button
                        type="button"
                        onClick={() => changeAndFocusCount(updateState(view, chip.remove))}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-accent-text py-1.5 pl-3 pr-2.5 text-[0.82rem] font-extrabold text-accent-ink"
                      >
                        {chip.label}
                        <span className="sr-only">— usuń filtr</span>
                        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                          <path
                            d="M6 6l12 12M18 6L6 18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => changeAndFocusCount(clearFilters(view))}
                      className="min-h-9 px-2 text-[0.82rem] font-extrabold text-ink-2 underline hover:text-ink"
                    >
                      Wyczyść wszystko
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <div
              role="group"
              aria-label="Sortowanie"
              className="inline-flex gap-0.5 rounded-[13px] bg-surface-2 p-1"
            >
              {SORTS.map((sort) => (
                <button
                  key={sort.value}
                  type="button"
                  aria-pressed={view.sort === sort.value}
                  onClick={() => change({ sort: sort.value })}
                  className={cx(
                    'min-h-9 rounded-[10px] px-3 text-[0.82rem] font-extrabold',
                    view.sort === sort.value
                      ? 'bg-card text-ink shadow-sm'
                      : 'text-ink-2 hover:text-ink',
                  )}
                >
                  {sort.label}
                </button>
              ))}
            </div>
            <div
              role="group"
              aria-label="Widok"
              className="hidden gap-0.5 rounded-[13px] bg-surface-2 p-1 sm:inline-flex"
            >
              {(
                [
                  {
                    value: 'grid',
                    label: 'Siatka',
                    icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
                  },
                  { value: 'list', label: 'Lista', icon: 'M4 5h16v5H4zM4 14h16v5H4z' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={view.view === option.value}
                  aria-label={option.label}
                  onClick={() => change({ view: option.value })}
                  className={cx(
                    'inline-flex min-h-9 min-w-10 items-center justify-center rounded-[10px]',
                    view.view === option.value
                      ? 'bg-card text-ink shadow-sm'
                      : 'text-ink-2 hover:text-ink',
                  )}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                      d={option.icon}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyResult
              query={view.query}
              suggestions={emptySuggestions(index, search, view.query)}
              index={index}
              onClear={() => changeAndFocusCount(clearFilters(view))}
            />
          ) : (
            <ul
              ref={listRef}
              data-catalog-grid
              className={cx(
                'grid gap-2.5 sm:gap-3.5',
                list ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-3',
              )}
            >
              {slots.map((slot) =>
                slot.type === 'product' ? (
                  <li key={slot.product.slug} className="flex">
                    <ProductCard
                      product={slot.product}
                      index={index}
                      position={slot.position}
                      layout={view.view}
                    />
                  </li>
                ) : slot.type === 'wizard' ? (
                  <li key="wizard" className={cx('flex', list ? '' : 'max-sm:col-span-2')}>
                    <WizardCard index={index} />
                  </li>
                ) : (
                  <li
                    key="partners"
                    className={cx(
                      'flex',
                      // Two partners take two columns; one fits a single column from 1280 px.
                      !list &&
                        (slot.partners.length > 1 ? 'col-span-2' : 'col-span-2 xl:col-span-1'),
                    )}
                  >
                    <PartnersCard partners={slot.partners} index={index} />
                  </li>
                ),
              )}
            </ul>
          )}

          {more > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2.5">
              <p className="text-sm font-bold text-ink-3">
                Widzisz {visible.length} z {results.length}
              </p>
              <span
                aria-hidden="true"
                className="h-[5px] w-60 overflow-hidden rounded-full bg-surface-2"
              >
                <span
                  className="block h-full rounded-full bg-accent-text"
                  style={{ width: `${Math.round((visible.length / results.length) * 100)}%` }}
                />
              </span>
              {/* A real link (`?strona=N`) for crawlers and without JavaScript (spec. §5.3). */}
              <a
                href={catalogHref(next)}
                onClick={(event) => {
                  // Ctrl/⌘/Shift-click and the middle button keep the browser's new tab.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
                    return
                  }
                  event.preventDefault()
                  focusCard.current = visible.length
                  write(next, 'replace')
                }}
                className="inline-flex min-h-[50px] items-center gap-2 rounded-xl border-2 border-border-input px-6 font-bold text-ink hover:bg-surface-2"
              >
                Pokaż kolejne
                <span className="text-sm font-extrabold text-ink-3">
                  {Math.min(more, CATALOG_PAGE_SIZE)}
                </span>
              </a>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
