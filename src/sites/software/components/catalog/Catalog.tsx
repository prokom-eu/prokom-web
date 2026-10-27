'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'
import {
  catalogHref,
  DEFAULT_CATALOG_STATE,
  parseCatalogState,
  runCatalog,
  sheetFilterCount,
  type SoftwareCatalogState,
} from '@/lib/software/catalog'
import type { SolutionCategory } from '@/lib/software/options'
import { useProject } from '@/lib/software/projectStore'
import { prepareSolutionSearch } from '@/lib/software/search'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { BottomSheet } from '../BottomSheet'
import { DeviceIcon } from '../FrameIcons'
import { CatalogFilters } from './CatalogFilters'
import { SolutionCard } from './SolutionCard'

/** The URL follows the search box after a short pause, not on every key. */
const QUERY_DELAY_MS = 300

const ICONS: Record<SolutionCategory | 'all', IconName | 'device'> = {
  all: 'grid',
  strony: 'site',
  systemy: 'panel',
  aplikacje: 'device',
  automatyzacje: 'bolt',
  opieka: 'shield',
}

/** Writes a view to the address; the Next router follows `history` (Biznes pattern). */
function writeUrl(next: SoftwareCatalogState, mode: 'push' | 'replace' = 'push') {
  const href = catalogHref(next)
  if (mode === 'push') window.history.pushState(null, '', href)
  else window.history.replaceState(null, '', href)
}

const solutionsWord = (n: number) =>
  `${n} ${plural(n, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}`

type Props = {
  index: SolutionsIndex
  /** Breadcrumbs, eyebrow, H1 and lead — rendered on the server, next to the search box. */
  hero: ReactNode
}

/**
 * The catalog island (spec. §5, board `Katalog`, `stany/88a–b`): search, category tabs, filters,
 * cards. The view is read from the URL only; every change writes it (`history`, which the Next
 * router follows), so Back, a refresh and a shared link show the same list — the server renders
 * the first view from the same URL. Up to 1080 px: tabs in a scrolling row, a sticky search bar
 * with „Filtry (n)” and the filters in a sheet.
 */
export function Catalog({ index, hero }: Props) {
  const searchParams = useSearchParams()
  const state = useMemo(() => parseCatalogState(searchParams), [searchParams])
  const search = useMemo(() => prepareSolutionSearch(index), [index])
  const situationNames = useMemo(
    () => Object.fromEntries(index.situations.map(({ slug, name }) => [slug, name])),
    [index],
  )

  // The box shows what is typed at once; the URL catches up after a pause (Biznes pattern).
  const [draft, setDraft] = useState(state.query)
  const [syncedQuery, setSyncedQuery] = useState(state.query)
  const [written, setWritten] = useState<string | null>(null)
  if (syncedQuery !== state.query) {
    // The URL changed elsewhere (Back, „Wyczyść”, the menu search): the box follows it — but not
    // when the URL only caught up with the box. The mark is used once, so a later return to the
    // same phrase (Back after „Wyczyść filtry”) refills the box.
    setSyncedQuery(state.query)
    if (state.query !== written) setDraft(state.query)
    setWritten(null)
  }
  const typing = draft.trim() !== state.query
  const view = useMemo(
    () => (typing ? { ...state, query: draft.trim() } : state),
    [typing, state, draft],
  )
  const { results, facets } = useMemo(() => runCatalog(index, search, view), [index, search, view])
  // Screen readers hear the count of the view in the URL, not one per key while typing.
  const committed = useMemo(
    () => (typing ? runCatalog(index, search, state).results.length : results.length),
    [typing, index, search, state, results],
  )

  const [open, setOpen] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const countRef = useRef<HTMLParagraphElement>(null)
  const sheetTitle = useRef<HTMLHeadingElement>(null)

  const write = writeUrl
  const change = (patch: Partial<SoftwareCatalogState>) => {
    setOpen(null)
    write({ ...view, ...patch })
  }

  useEffect(() => {
    if (!typing) return
    const timer = window.setTimeout(() => {
      setWritten(view.query)
      writeUrl(view, 'replace')
    }, QUERY_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [typing, view])

  const anyFilter = view.category !== null || sheetFilterCount(view) > 0 || view.query !== ''
  /** „Wyczyść filtry” removes itself: focus goes to the result count. */
  const clearAll = () => {
    setDraft('')
    write(DEFAULT_CATALOG_STATE)
    countRef.current?.focus()
  }
  const sheetCount = sheetFilterCount(view)

  const tabs = [
    { value: null, name: 'Wszystko', icon: ICONS.all, count: facets.category.all ?? 0 },
    ...index.categories.map(({ slug, name }) => ({
      value: slug,
      name,
      icon: ICONS[slug],
      count: facets.category[slug] ?? 0,
    })),
  ]

  const searchBox = (className: string, label: string) => (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        write({ ...view, query: draft.trim() }, 'replace')
      }}
      className={className}
    >
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-accent-line bg-card px-5 focus-within:border-accent-text">
        <Icon name="search" strokeWidth={2.2} className="size-5 text-accent-text" />
        <span className="sr-only">{label}</span>
        <input
          type="search"
          name="q"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="np. zlecenia, pensjonat, Excel…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-2"
        />
      </label>
    </form>
  )

  return (
    <>
      <div className="grid items-end gap-8 min-[1081px]:grid-cols-[1fr_420px]">
        {hero}
        <div className="hidden min-[1081px]:block">
          {searchBox('', 'Szukaj w ofercie')}
          <p className="mt-2 text-[13px] text-ink-2">
            Rozumie literówki i język klienta: „kartki”, „portale”, „informatyk zniknął”.
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Kategoria"
        className="-mx-4 mt-8 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[1081px]:mx-0 min-[1081px]:inline-flex min-[1081px]:flex-wrap min-[1081px]:rounded-[22px] min-[1081px]:border min-[1081px]:border-border min-[1081px]:bg-card min-[1081px]:p-1.5"
      >
        {tabs.map((tab) => {
          const active = tab.value === view.category
          return (
            <button
              key={tab.value ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => change({ category: tab.value })}
              className={cx(
                'inline-flex min-h-12 shrink-0 snap-start items-center gap-2.5 rounded-2xl px-4 font-bold',
                active ? 'bg-button text-accent-ink' : 'text-ink hover:bg-surface-2',
              )}
            >
              {tab.icon === 'device' ? (
                <DeviceIcon className="size-[18px]" />
              ) : (
                <Icon name={tab.icon} className="size-[18px]" />
              )}
              {tab.name}
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-xs font-extrabold',
                  // A solid chip on the active tab: a translucent one lost contrast (axe).
                  active ? 'bg-surface text-accent-text' : 'bg-chip text-ink-2',
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Phone and tablet: the search and the sheet's button stay under the header. */}
      {/* `top` = the compact header's height (66 px, 76 px from `sm`, `SoftwareHeader`). */}
      <div className="sticky top-[66px] z-30 -mx-4 mt-4 flex gap-3 border-b border-border bg-header-bg px-4 py-3 backdrop-blur-md sm:top-[76px] min-[1081px]:hidden">
        {searchBox('min-w-0 flex-1', 'Szukaj w ofercie')}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setSheetOpen(true)}
          className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-4 font-bold"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
            className="size-5"
          >
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>
          Filtry{sheetCount > 0 && ` (${sheetCount})`}
        </button>
      </div>

      <div className="mt-8 grid gap-6 min-[1081px]:grid-cols-[260px_1fr]">
        <aside aria-label="Filtry" className="hidden space-y-3 min-[1081px]:block">
          <CatalogFilters
            index={index}
            state={view}
            facets={facets}
            onChange={change}
            variant="list"
          />
          <ProjectBox />
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* H1 → H2 → card H3: the list has its heading (Lighthouse, spec. §10 kryt. 7). */}
            <h2 className="sr-only">Rozwiązania</h2>
            <p ref={countRef} tabIndex={-1} className="font-extrabold outline-none">
              {solutionsWord(results.length)}{' '}
              {anyFilter ? 'pasuje do Twoich filtrów' : 'w pełnej ofercie'}
            </p>
            <p role="status" className="sr-only">
              {solutionsWord(committed)}{' '}
              {anyFilter ? 'pasuje do Twoich filtrów' : 'w pełnej ofercie'}
            </p>
            {anyFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="min-h-11 px-2 text-sm font-bold text-accent-text underline underline-offset-4"
              >
                Wyczyść filtry
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="mt-4 rounded-[22px] border border-border bg-card p-6">
              <h2 className="font-display text-xl font-extrabold">Nie widzisz swojej sytuacji?</h2>
              <p className="mt-2 text-ink-2">
                Nie mamy dokładnie tego w katalogu, ale to nie znaczy, że tego nie zrobimy. Opisz to
                w kreatorze albo napisz do nas. Większość naszych systemów zaczynała się od „a da
                się…?”.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {/* SW7: the wizard opens in its „opisz po swojemu” mode (spec. §5). */}
                <Link
                  href="/dobierz?tryb=opis"
                  className="inline-flex min-h-11 items-center rounded-xl bg-button px-5 font-bold text-accent-ink"
                >
                  Opisz w kreatorze
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 font-bold"
                >
                  Napisz do nas
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-4 grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((solution) => (
                <li key={solution.slug}>
                  <SolutionCard
                    solution={solution}
                    display={index.priceDisplay}
                    situationNames={situationNames}
                    open={open === solution.slug}
                    onToggle={() => setOpen(open === solution.slug ? null : solution.slug)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtry"
        headingRef={sheetTitle}
      >
        <div className="mt-4">
          <CatalogFilters
            index={index}
            state={view}
            facets={facets}
            onChange={change}
            variant="chips"
          />
        </div>
        <div className="sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t border-border bg-surface px-4 pt-4">
          <button
            type="button"
            disabled={sheetCount === 0}
            onClick={() => {
              change({ situation: null, group: null, preview: false })
              sheetTitle.current?.focus()
            }}
            className="min-h-[52px] rounded-full border border-border px-4 font-bold disabled:text-ink-3"
          >
            Wyczyść
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="min-h-[52px] flex-1 rounded-2xl bg-button px-5 font-bold text-accent-ink"
          >
            Pokaż {solutionsWord(results.length)}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}

/** „Twój projekt” in the sidebar (board `Katalog`): the count and the way to the wizard. */
function ProjectBox() {
  const count = useProject().length
  return (
    <section
      aria-label="Twój projekt"
      className="rounded-[20px] border border-accent-line bg-accent-soft p-4"
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
        Twój projekt
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold">{count}</p>
      <p className="mt-1 text-sm text-ink-2">
        {count === 0
          ? 'Dodawaj rozwiązania, które Cię interesują.'
          : `${plural(count, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])} w Twoim projekcie`}
      </p>
      <Link
        href="/dobierz"
        className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-button px-4 font-bold text-accent-ink"
      >
        Dokończ w kreatorze
      </Link>
    </section>
  )
}
