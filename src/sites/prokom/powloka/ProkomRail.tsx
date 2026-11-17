'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { SearchDialog } from '@/components/shared/SearchDialog'
import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'
import { track } from '@/lib/analytics/track'
import { buildHubSearchProvider } from '@/lib/prokom/searchProvider'
import type { HubSearchEntry } from '@/lib/prokom/searchQuery'
import type { LineSearchSettings } from '@/lib/shared/search/lineProvider'
import type { PaletteAction } from '@/lib/shared/search/palette'
import { onSearchRequest } from '@/lib/site/searchOpen'
import { isSearchShortcut } from '@/lib/site/searchShortcut'

import { loadHubIndex } from './hubIndex'

type Props = {
  sections: SiteRailProps['sections']
  action: SiteRailProps['action']
  settings: LineSearchSettings
  actions: readonly PaletteAction[]
  recentlyViewed: boolean
  phone: string | null
}

const reportNoResults = () => track('szukaj_brak_wyniku', { miejsce: 'okno' })

/**
 * Side rail of pro-kom.eu (spec §5.3: home page only) and the search window (spec §5.6): the
 * window searches the hub's index (`/api/hub-search-index` — lines, services, tools, help, pages),
 * fetched once per full page load when the browser is idle, or at once on the first request to
 * search (button or shortcut) — after the page itself, never in its way. Empty field: „Na skróty” with the five lines and „Najczęściej szukane” (`buildHubSearchProvider`, like Biznes). Opened by the rail's „Szukaj”, the capsule's search field, Ctrl/⌘K and „/”. A search that finds
 * nothing is counted in Umami without the phrase (`szukaj_brak_wyniku`, ADR-020).
 */
export function ProkomRail({ sections, action, settings, actions, recentlyViewed, phone }: Props) {
  const onHome = usePathname() === '/'
  const [entries, setEntries] = useState<HubSearchEntry[]>([])
  // „No results” counts only against a loaded index — not while it loads or after a failed fetch,
  // when every phrase finds nothing (the spec §1 measure would lie).
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    const load = () =>
      void loadHubIndex().then((index) => {
        if (!alive) return
        setEntries(index.entries)
        setLoaded(index.ok)
      })
    const idle = window.requestIdleCallback?.(load, { timeout: 4000 })
    const timer = idle === undefined ? window.setTimeout(load, 1500) : undefined
    const off = onSearchRequest(load)
    // Ctrl/⌘K and „/” open the window without `requestSearch()`: they start the fetch too.
    const onKey = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey } = event
      if (isSearchShortcut({ key, ctrlKey, metaKey, altKey, typing: false })) load()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      alive = false
      if (idle !== undefined) window.cancelIdleCallback(idle)
      window.clearTimeout(timer)
      off()
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const provider = useMemo(() => buildHubSearchProvider(entries, settings), [entries, settings])
  return (
    <>
      {onHome && <SiteRail sections={sections} onHome action={action} />}
      <SearchDialog
        provider={provider}
        actions={actions}
        line="prokom"
        recentlyViewed={recentlyViewed}
        phone={phone}
        label="Szukaj w PRO-KOM"
        placeholder="Szukaj: kasa fiskalna, kamery, pęknięty ekran…"
        onNoResults={loaded ? reportNoResults : undefined}
      />
    </>
  )
}
