'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'
import type { PaletteAction } from '@/lib/shared/search/palette'
import { onSearchRequest } from '@/lib/site/searchOpen'
import { RAIL_QUERY, whileMatches } from '@/lib/shared/whileMatches'
import { PROJECT_SEND_HREF } from '@/lib/software/project'
import { railAway } from '@/lib/software/railAway'
import { buildLineProvider } from '@/lib/shared/search/lineProvider'
import type { SearchPage } from '@/lib/software/searchEntries'
import type { SearchExtras } from '@/lib/software/searchExtras'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { LazySearch } from './LazySearch'
import { useProjectCount } from './ProjectCount'

const INDEX_URL = '/api/solutions-index'
const EXTRAS_URL = '/api/software-search'

type SearchBundle = typeof import('./searchBundle')

/** One import per page load (as the data): the provider and the preview of the window. */
let bundleRequest: Promise<SearchBundle | null> | null = null
function loadBundle(): Promise<SearchBundle | null> {
  bundleRequest ??= import('./searchBundle').catch(() => {
    bundleRequest = null
    return null
  })
  return bundleRequest
}

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

/** One fetch per page load and address, shared by every caller (the rail stays mounted). */
const requests = new Map<string, Promise<unknown>>()
function loadJson<T>(url: string): Promise<T | null> {
  let request = requests.get(url) as Promise<T | null> | undefined
  if (!request) {
    request = fetch(url)
      .then((response) => {
        // A passing error (503) is not kept: the next request to search tries again.
        if (!response.ok) throw new Error(`${url} ${response.status}`)
        return response.json() as Promise<T>
      })
      .catch(() => {
        requests.delete(url)
        return null
      })
    requests.set(url, request)
  }
  return request
}

/**
 * The side rail (from 1400 px) and the search window of prokomsoftware.pl (SWA5, ZMIANY-v24
 * §3.3–3.4): on the start page its sections with the premium glide, on subpages „Na tej stronie”;
 * at the bottom „Kreator 60 s” — or „Twój projekt” with its count once the list has items. The
 * window searches the offer (`/api/solutions-index`), the posts, industry and city pages
 * (`/api/software-search`) — both fetched when the browser is idle or at the first request to
 * search — and the pages, legal ones too, with a preview of the active result beside the list. Opened by the rail's „Szukaj”, the
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
  const [extras, setExtras] = useState<SearchExtras | null>(null)
  const [bundle, setBundle] = useState<SearchBundle | null>(null)

  useEffect(() => {
    let alive = true
    const load = () => {
      void loadJson<SolutionsIndex>(INDEX_URL).then((loaded) => alive && loaded && setIndex(loaded))
      void loadJson<SearchExtras>(EXTRAS_URL).then((loaded) => alive && loaded && setExtras(loaded))
      void loadBundle().then((loaded) => alive && loaded && setBundle(() => loaded))
    }
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
  // Only while the rail is shown (from 1400 px): a phone's scroll measures nothing for it.
  useEffect(() => {
    const root = document.documentElement
    const rail = document.querySelector('[data-site-rail]')
    if (!rail) return
    return whileMatches(window.matchMedia(RAIL_QUERY), () => stepAside(root, rail))
  }, [pathname])

  const provider = useMemo(
    () =>
      bundle
        ? bundle.softwareSearchProvider(index, extras, pages, shortcuts)
        : // Until the bundle comes: the pages and the panel's shortcuts, as before (light).
          buildLineProvider(
            pages.map((page) => ({
              id: `strona:${page.href}`,
              group: 'Strony',
              title: page.label,
              hint: page.hint ?? null,
              href: page.href,
              icon: 'doc',
            })),
            { shortcuts },
          ),
    [bundle, index, extras, pages, shortcuts],
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
      <LazySearch
        provider={provider}
        actions={actions}
        line="software"
        recentlyViewed={recentlyViewed}
        phone={phone}
        label="Szukaj na stronie"
        placeholder="Szukaj: strona dla pensjonatu, CRM, faktury…"
        renderPreview={
          bundle
            ? (result) => <bundle.SearchPreview result={result} index={index} extras={extras} />
            : undefined
        }
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
