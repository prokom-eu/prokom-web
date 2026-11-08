'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { SearchDialog } from '@/components/shared/SearchDialog'
import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'
import { buildLineProvider } from '@/lib/shared/search/lineProvider'
import type { PaletteAction } from '@/lib/shared/search/palette'
import { onSearchRequest } from '@/lib/site/searchOpen'
import { PROJECT_SEND_HREF } from '@/lib/software/project'
import { railAway } from '@/lib/software/railAway'
import {
  searchSettings,
  softwareSearchEntries,
  type SearchPage,
} from '@/lib/software/searchEntries'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { useProjectCount } from './ProjectCount'

const INDEX_URL = '/api/solutions-index'

type Props = {
  sections: SiteRailProps['sections']
  /** `shared.tabBar.center`: „Kreator 60 s”. */
  action: NonNullable<SiteRailProps['action']> | null
  pages: readonly SearchPage[]
  shortcuts: readonly { label: string; href: string }[]
  actions: readonly PaletteAction[]
  recentlyViewed: boolean
  phone: string | null
}

/** One fetch per page load, shared by every caller (the rail stays mounted across pages). */
let indexRequest: Promise<SolutionsIndex | null> | null = null
function loadIndex(): Promise<SolutionsIndex | null> {
  indexRequest ??= fetch(INDEX_URL)
    .then((response) => {
      // A passing error (503) is not kept: the next request to search tries again.
      if (!response.ok) throw new Error(`index ${response.status}`)
      return response.json() as Promise<SolutionsIndex>
    })
    .catch(() => {
      indexRequest = null
      return null
    })
  return indexRequest
}

/**
 * The side rail (from 1400 px) and the search window of prokomsoftware.pl (SWA5, ZMIANY-v24
 * §3.3–3.4): on the start page its sections with the premium glide, on subpages „Na tej stronie”;
 * at the bottom „Kreator 60 s” — or „Twój projekt” with its count once the list has items. The
 * window searches the offer (`/api/solutions-index`, fetched when the browser is idle or at the
 * first request to search) and the pages, legal ones too. Opened by the rail's „Szukaj”, the
 * capsule's loupe, Ctrl/⌘K and „/”.
 */
export function SwRail({
  sections,
  action,
  pages,
  shortcuts,
  actions,
  recentlyViewed,
  phone,
}: Props) {
  const pathname = usePathname()
  const onHome = pathname === '/'
  const count = useProjectCount()
  const [index, setIndex] = useState<SolutionsIndex | null>(null)

  useEffect(() => {
    let alive = true
    const load = () => void loadIndex().then((loaded) => alive && loaded && setIndex(loaded))
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

  // AUDYT po SWA7 #4: the fixed rail would lie over the band above the footer and the footer
  // itself — it steps aside (fades and slides left, `shell.css`) once either reaches it.
  useEffect(() => {
    const root = document.documentElement
    const rail = document.querySelector('[data-site-rail]')
    if (!rail) return
    let frame = 0
    const update = () => {
      frame = 0
      const targetTops = [...document.querySelectorAll('[data-footer-cta], [data-site-footer]')]
        .map((target) => target.getBoundingClientRect())
        .filter((box) => box.height > 0)
        .map((box) => box.top)
      const away = railAway({
        railBottom: rail.getBoundingClientRect().bottom,
        targetTops,
        scrolled: window.scrollY > 0,
      })
      root.toggleAttribute('data-rail-away', away)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      root.removeAttribute('data-rail-away')
    }
  }, [pathname])

  const provider = useMemo(
    () => buildLineProvider(softwareSearchEntries(index, pages), searchSettings(index, shortcuts)),
    [index, pages, shortcuts],
  )
  const railAction =
    count > 0
      ? {
          label: 'Twój projekt',
          href: PROJECT_SEND_HREF,
          icon: 'brief',
          count,
          countLabel: 'W projekcie',
          current: pathname === '/kontakt',
        }
      : action && { ...action, current: pathname === action.href }
  return (
    <>
      <SiteRail sections={sections} onHome={onHome} action={railAction} />
      <SearchDialog
        provider={provider}
        actions={actions}
        line="software"
        recentlyViewed={recentlyViewed}
        phone={phone}
        label="Szukaj na stronie"
        placeholder="Szukaj: strona dla pensjonatu, CRM, faktury…"
      />
    </>
  )
}
