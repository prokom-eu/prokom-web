'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'
import type { PaletteAction } from '@/lib/shared/search/palette'
import { RAIL_QUERY, whileMatches } from '@/lib/shared/whileMatches'
import { PROJECT_SEND_HREF } from '@/lib/software/project'
import { railAway } from '@/lib/software/railAway'
import type { SearchPage } from '@/lib/software/searchEntries'

import { LazySearch } from './LazySearch'
import { useProjectCount } from './ProjectCount'

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

/**
 * The side rail (from 1400 px) and the search window of prokomsoftware.pl (SWA5, ZMIANY-v24
 * §3.3–3.4): on the start page its sections with the premium glide, on subpages „Na tej stronie”;
 * at the bottom „Kreator 60 s” — or „Twój projekt” with its count once the list has items. The
 * window (`LazySearch` → `SwSearch`, loaded at the first request to search) finds the offer, the
 * posts, industry and city pages and the pages, legal ones too, with a preview beside the list.
 * Opened by the rail's „Szukaj”, the capsule's loupe, Ctrl/⌘K and „/”.
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
  // AUDYT po SWA7 #4: the fixed rail would lie over the band above the footer and the footer
  // itself — it steps aside (fades and slides left, `shell.css`) once either reaches it.
  // Only while the rail is shown (from 1400 px): a phone's scroll measures nothing for it.
  useEffect(() => {
    const root = document.documentElement
    const rail = document.querySelector('[data-site-rail]')
    if (!rail) return
    return whileMatches(window.matchMedia(RAIL_QUERY), () => stepAside(root, rail))
  }, [pathname])

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
      <LazySearch
        pages={pages}
        shortcuts={shortcuts}
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

/** The rail steps aside near the footer (`data-rail-away`); returns the cleanup. */
function stepAside(root: HTMLElement, rail: Element): () => void {
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
}
