'use client'

import { useEffect, useState } from 'react'

import type { CatalogIndex } from './catalogIndex'

let loaded: CatalogIndex | null = null
let pending: Promise<CatalogIndex> | null = null

/**
 * The catalog index of the site (`GET /api/catalog-index`), fetched once per page load and
 * shared by every component that asks (search, inquiry drawer). A failed fetch is forgotten,
 * so the next `load` tries again.
 */
export function loadCatalogIndex(): Promise<CatalogIndex> {
  pending ??= fetch('/api/catalog-index')
    .then((response) => {
      if (!response.ok) throw new Error(`Catalog index: HTTP ${response.status}`)
      return response.json() as Promise<CatalogIndex>
    })
    .then((index) => (loaded = index))
    .catch((error: unknown) => {
      pending = null
      throw error
    })
  return pending
}

/**
 * Hands over an index the page already has (`/oferta` renders from it on the server), so the
 * search and the inquiry drawer of that page do not fetch it again.
 */
export function primeCatalogIndex(index: CatalogIndex) {
  if (loaded) return
  loaded = index
  pending = Promise.resolve(index)
}

export type CatalogIndexState =
  { status: 'idle' | 'loading' | 'error'; index: null } | { status: 'ready'; index: CatalogIndex }

/**
 * The index once `enabled` (e.g. when the search opens) — not on every page view (plan B, §4).
 * `retry` starts again after an error.
 */
export function useCatalogIndex(enabled: boolean): CatalogIndexState & { retry: () => void } {
  const [state, setState] = useState<CatalogIndexState>(() =>
    loaded ? { status: 'ready', index: loaded } : { status: 'idle', index: null },
  )

  useEffect(() => {
    if (!enabled || state.status !== 'idle') return
    let active = true
    loadCatalogIndex().then(
      (index) => active && setState({ status: 'ready', index }),
      () => active && setState({ status: 'error', index: null }),
    )
    return () => {
      active = false
    }
  }, [enabled, state.status])

  const loading = enabled && state.status === 'idle'
  return {
    ...(loading ? { status: 'loading', index: null } : state),
    // Back to idle: the effect fetches again.
    retry: () => setState({ status: 'idle', index: null }),
  }
}
