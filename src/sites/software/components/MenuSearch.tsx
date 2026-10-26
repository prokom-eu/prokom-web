'use client'

import Link from 'next/link'
import { useId, useMemo, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { plural } from '@/lib/plural'
import { prepareSolutionSearch, searchSolutions } from '@/lib/software/search'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

/** How many hints fit above the wizard card without pushing the menu off the screen. */
const MAX_HINTS = 5
/** The catalog reads the query (SW9): `/rozwiazania?q=…`. */
const CATALOG = '/rozwiazania'

type Index = { state: 'idle' | 'loading' | 'failed' } | { state: 'ready'; index: SolutionsIndex }

/**
 * „Czego szukasz?” of the phone menu (spec. §3.2, §8.2): Enter opens the catalog with the query;
 * while typing, up to 5 solutions from `/api/solutions-index` (fetched on first focus, matched on
 * the client — the shared engine and synonyms of the catalog). Hints are plain links reached with
 * Tab (no ARIA combobox); their count is announced. Without the index the form still works.
 */
export function MenuSearch({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<Index>({ state: 'idle' })
  const statusId = useId()

  function load() {
    if (index.state !== 'idle') return
    setIndex({ state: 'loading' })
    fetch('/api/solutions-index')
      .then((response) => (response.ok ? (response.json() as Promise<SolutionsIndex>) : null))
      .then((data) => setIndex(data ? { state: 'ready', index: data } : { state: 'failed' }))
      .catch(() => setIndex({ state: 'failed' }))
  }

  const prepared = useMemo(
    () => (index.state === 'ready' ? prepareSolutionSearch(index.index) : null),
    [index],
  )
  const hints = prepared ? (searchSolutions(prepared, query)?.slice(0, MAX_HINTS) ?? null) : null

  return (
    <div className="mt-4">
      <form action={CATALOG} role="search">
        <label className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border bg-card px-4 focus-within:border-accent-text">
          <Icon name="search" strokeWidth={2.2} className="size-5 text-accent-text" />
          <span className="sr-only">Szukaj w ofercie</span>
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={load}
            placeholder={placeholder}
            autoComplete="off"
            aria-describedby={statusId}
            className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-2"
          />
        </label>
      </form>
      <p id={statusId} role="status" className="sr-only">
        {hints
          ? hints.length === 0
            ? 'Brak podpowiedzi'
            : `${hints.length} ${plural(hints.length, ['podpowiedź', 'podpowiedzi', 'podpowiedzi'])}`
          : ''}
      </p>
      {hints && hints.length > 0 && (
        <ul
          aria-label="Podpowiedzi"
          className="mt-2 overflow-hidden rounded-2xl border border-border bg-card"
        >
          {hints.map((solution) => (
            <li key={solution.slug} className="border-b border-border last:border-b-0">
              <Link
                href={`${CATALOG}/${solution.slug}`}
                className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 font-bold"
              >
                {solution.name}
                <Icon name="arrow" strokeWidth={2.2} className="size-4 text-ink-2" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
