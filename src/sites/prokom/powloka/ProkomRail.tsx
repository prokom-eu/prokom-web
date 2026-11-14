'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { SearchDialog } from '@/components/shared/SearchDialog'
import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'
import { track } from '@/lib/analytics/track'
import {
  buildLineProvider,
  type LineSearchEntry,
  type LineSearchSettings,
} from '@/lib/shared/search/lineProvider'
import type { PaletteAction } from '@/lib/shared/search/palette'
import { onSearchRequest } from '@/lib/site/searchOpen'

const INDEX_URL = '/api/hub-search-index'

type Props = {
  sections: SiteRailProps['sections']
  action: SiteRailProps['action']
  settings: LineSearchSettings
  actions: readonly PaletteAction[]
  recentlyViewed: boolean
  phone: string | null
}

/** One fetch per page load, shared by every caller (the rail stays mounted across pages). */
let indexRequest: Promise<LineSearchEntry[]> | null = null
function loadIndex(): Promise<LineSearchEntry[]> {
  indexRequest ??= fetch(INDEX_URL)
    .then((response) => {
      // A passing error (503) is not kept: the next request to search tries again.
      if (!response.ok) throw new Error(`index ${response.status}`)
      return response.json() as Promise<LineSearchEntry[]>
    })
    .catch(() => {
      indexRequest = null
      return []
    })
  return indexRequest
}

const reportNoResults = () => track('szukaj_brak_wyniku', { miejsce: 'okno' })

/**
 * Side rail of pro-kom.eu (spec §5.3: home page only) and the search window (spec §5.6): the
 * window searches the hub's index (`/api/hub-search-index` — lines, services, tools, help, pages),
 * fetched when the browser is idle or at the first request to search, so it never weighs on the
 * page. Opened by the rail's „Szukaj”, the capsule's loupe, Ctrl/⌘K and „/”. A search that finds
 * nothing is counted in Umami without the phrase (`szukaj_brak_wyniku`, ADR-020).
 */
export function ProkomRail({ sections, action, settings, actions, recentlyViewed, phone }: Props) {
  const onHome = usePathname() === '/'
  const [entries, setEntries] = useState<LineSearchEntry[]>([])

  useEffect(() => {
    let alive = true
    const load = () => void loadIndex().then((index) => alive && setEntries(index))
    const idle = window.requestIdleCallback?.(load, { timeout: 4000 })
    const timer = idle === undefined ? window.setTimeout(load, 1500) : undefined
    const off = onSearchRequest(load)
    return () => {
      alive = false
      if (idle !== undefined) window.cancelIdleCallback(idle)
      window.clearTimeout(timer)
      off()
    }
  }, [])

  const provider = useMemo(() => buildLineProvider(entries, settings), [entries, settings])
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
        onNoResults={reportNoResults}
      />
    </>
  )
}
