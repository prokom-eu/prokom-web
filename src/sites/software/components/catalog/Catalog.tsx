'use client'

import { IntentLink as Link } from '@/components/shared/IntentLink'
import { useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { plural } from '@/lib/plural'
import {
  catalogHref,
  DEFAULT_CATALOG_STATE,
  OFFER_GROUPS,
  offerGroup,
  parseCatalogState,
  runCatalog,
  type SoftwareCatalogState,
} from '@/lib/software/catalog'
import type { OfferView } from '@/lib/software/offer'
import { INDUSTRY_GROUPS, SITUATIONS } from '@/lib/software/options'
import { solutionCard } from '@/lib/software/priceCards'
import { prepareSolutionSearch } from '@/lib/software/search'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { SolutionDialog } from '../offer/SolutionDialogLazy'
import { Chip } from '../ui/Chip'
import { Glass } from '../ui/Glass'
import { PriceCard } from './PriceCard'

/** The URL follows the search box after a short pause, not on every key. */
const QUERY_DELAY_MS = 300

const GROUP_SHORT = Object.fromEntries(OFFER_GROUPS.map(({ value, short }) => [value, short]))

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
  /** Offer windows of the published solutions by slug (`getOfferViews`). */
  offers: Readonly<Record<string, OfferView>>
  /** The subpage hero — rendered on the server, it carries the H1. */
  hero: ReactNode
}

/**
 * The catalog island (ZMIANY-v24 §6.2, board `AU-oferta`): four group tiles, group chips with
 * their counts, the search and the cards with mock-ups. The view is read from the URL only; every
 * change writes it (`history`, which the Next router follows), so Back, a refresh and a shared link
 * show the same list — the server renders the first view from the same URL. A situation or an
 * industry from a link (`?sytuacja=`, `?branza=`) shows as a chip that takes it off (decyzja 08.11).
 */
export function Catalog({ index, offers, hero }: Props) {
  const searchParams = useSearchParams()
  const state = useMemo(() => parseCatalogState(searchParams), [searchParams])
  const search = useMemo(() => prepareSolutionSearch(index), [index])

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

  // The window follows the address (`?rozwiazanie=`, decyzja 1); an unknown slug opens nothing.
  const openSlug = state.solution && offers[state.solution] ? state.solution : null
  /** The window's history entry is ours (opened here): closing goes back instead of adding one. */
  const ownEntry = useRef(false)
  useEffect(() => {
    // Closed by the browser's Back (or a filter): the entry is gone, nothing of ours to undo.
    if (!state.solution) ownEntry.current = false
  }, [state.solution])
  const countRef = useRef<HTMLParagraphElement>(null)

  const change = (patch: Partial<SoftwareCatalogState>) => {
    writeUrl({ ...view, ...patch, solution: null })
  }
  const openWindow = (slug: string) => {
    ownEntry.current = true
    writeUrl({ ...view, solution: slug })
  }
  const switchWindow = (slug: string) => writeUrl({ ...view, solution: slug }, 'replace')
  const closeWindow = (reason?: 'link') => {
    // Already closed by the browser's Back: nothing to write (a typed draft stays out of the URL).
    if (!state.solution) return
    // A link in the window leaves the page: a `history.back()` now could undo that navigation.
    if (reason === 'link') {
      ownEntry.current = false
      return
    }
    if (ownEntry.current) {
      ownEntry.current = false
      window.history.back()
    } else writeUrl({ ...view, solution: null }, 'replace')
  }

  useEffect(() => {
    if (!typing) return
    const timer = window.setTimeout(() => {
      setWritten(view.query)
      writeUrl({ ...view, solution: null }, 'replace')
    }, QUERY_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [typing, view])

  const anyFilter =
    view.category !== null || view.situation !== null || view.group !== null || view.query !== ''
  /** „Wyczyść filtry” removes itself: focus goes to the result count. */
  const clearAll = () => {
    setDraft('')
    writeUrl(DEFAULT_CATALOG_STATE)
    countRef.current?.focus()
  }
  const list = useMemo(() => results.map((solution) => solution.slug), [results])
  const countText = `${solutionsWord(results.length)} ${anyFilter ? 'pasuje do filtrów' : 'w ofercie'}`

  // Filters from a link: a chip with the name, a click takes it off.
  const linkFilters = [
    view.situation && {
      key: 'situation',
      label: SITUATIONS.find(({ value }) => value === view.situation)?.label,
      clear: { situation: null },
    },
    view.group && {
      key: 'group',
      label: INDUSTRY_GROUPS.find(({ value }) => value === view.group)?.label,
      clear: { group: null },
    },
  ].filter(Boolean) as { key: string; label: string; clear: Partial<SoftwareCatalogState> }[]

  return (
    <>
      {hero}
      <div className="v-wrap">
        <div className="sw-offer-tiles" role="group" aria-label="Grupy oferty">
          {OFFER_GROUPS.map((group, i) => (
            <button
              key={group.value}
              type="button"
              aria-pressed={view.category === group.value}
              onClick={() => change({ category: group.value })}
              className="sw-glass sw-offer-tile"
            >
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {group.label}
            </button>
          ))}
        </div>

        <div className="sw-offer-bar">
          <div className="v-chips v-chips-scroll" role="group" aria-label="Kategoria">
            <Chip pressed={view.category === null} onClick={() => change({ category: null })}>
              Wszystko · {facets.category.all ?? 0}
            </Chip>
            {OFFER_GROUPS.map((group) => (
              <Chip
                key={group.value}
                pressed={view.category === group.value}
                onClick={() => change({ category: group.value })}
              >
                {group.short} · {facets.category[group.value] ?? 0}
              </Chip>
            ))}
            {linkFilters.map((filter) => (
              <Chip
                key={filter.key}
                pressed
                onClick={() => change(filter.clear)}
                aria-label={`Usuń filtr: ${filter.label}`}
              >
                {filter.label} <span aria-hidden="true">×</span>
              </Chip>
            ))}
          </div>
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              writeUrl({ ...view, query: draft.trim(), solution: null }, 'replace')
            }}
            className="sw-offer-search"
          >
            <Icon name="search" strokeWidth={2.2} className="size-[18px] text-accent-text" />
            <label className="contents">
              <span className="sr-only">Szukaj w ofercie</span>
              <input
                type="search"
                name="q"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="np. zlecenia, pensjonat, Excel…"
                autoComplete="off"
              />
            </label>
          </form>
          {/* H1 → H2 → card name: the list has its heading (Lighthouse, spec. §10 kryt. 7). */}
          <h2 className="sr-only">Rozwiązania</h2>
          <p ref={countRef} tabIndex={-1} className="sw-offer-count">
            {countText}
          </p>
          <p role="status" className="sr-only">
            {solutionsWord(committed)} {anyFilter ? 'pasuje do filtrów' : 'w ofercie'}
          </p>
          {anyFilter && (
            <button type="button" onClick={clearAll} className="sw-offer-clear">
              Wyczyść filtry
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <Glass className="sw-offer-empty">
            <h2 className="font-display text-xl font-extrabold">Nic nie pasuje do tych filtrów.</h2>
            <p className="mt-2 text-ink-2">
              Zmień filtry albo napisz, czego szukasz. Jeśli da się to sensownie zbudować, powiemy
              jak, za ile i w jakim terminie. Jeśli nie warto, też powiemy.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-12 items-center rounded-xl border border-border px-5 font-bold"
              >
                Wyczyść filtry
              </button>
              <Link
                href="/kontakt"
                className="inline-flex min-h-12 items-center rounded-xl bg-button px-5 font-bold text-accent-ink"
              >
                Napisz, czego szukasz
              </Link>
              {/* SW7: the wizard opens in its „opisz po swojemu” mode (spec. §5). */}
              <Link
                href="/dobierz?tryb=opis"
                className="inline-flex min-h-12 items-center px-2 font-bold text-accent-text underline underline-offset-4"
              >
                Opisz w kreatorze
              </Link>
            </div>
          </Glass>
        ) : (
          <ul className="v-cards" data-rise-group>
            {results.map((solution) => (
              <li key={solution.slug}>
                <PriceCard
                  card={solutionCard(
                    solution,
                    index.priceDisplay,
                    GROUP_SHORT[offerGroup(solution)] ?? '',
                  )}
                  details="Szczegóły →"
                  href={catalogHref({ ...view, solution: solution.slug })}
                  onOpen={() => openWindow(solution.slug)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <SolutionDialog
        views={offers}
        slug={openSlug}
        list={list}
        onSwitch={switchWindow}
        onClose={closeWindow}
      />
    </>
  )
}
