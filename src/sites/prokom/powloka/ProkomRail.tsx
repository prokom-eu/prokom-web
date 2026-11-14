'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { SearchDialog } from '@/components/shared/SearchDialog'
import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'
import { buildLineProvider, type LineSearchSettings } from '@/lib/shared/search/lineProvider'
import type { PaletteAction } from '@/lib/shared/search/palette'

type Props = {
  sections: SiteRailProps['sections']
  action: SiteRailProps['action']
  settings: LineSearchSettings
  actions: readonly PaletteAction[]
  recentlyViewed: boolean
  phone: string | null
}

/**
 * Side rail of pro-kom.eu (spec §5.3: home page only — the shared rail shows the home sections
 * there and „Na tej stronie” elsewhere) and the search window (spec §5.6). The hub's index comes in
 * H1-3; until then the window offers the shortcuts of the panel, the palette (call, write, route)
 * and „Zapytaj o …” with the company phone — never a dead button.
 */
export function ProkomRail({ sections, action, settings, actions, recentlyViewed, phone }: Props) {
  const onHome = usePathname() === '/'
  const provider = useMemo(() => buildLineProvider([], settings), [settings])
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
      />
    </>
  )
}
