'use client'

import { usePathname } from 'next/navigation'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

import { Icon } from '@/components/ui/Icon'
import {
  hasPageGroup,
  PAGE_GROUP_MAX,
  presentSections,
  railHref,
  railIcon,
  sectionsCount,
  type PageSection,
  type RailSection,
} from '@/lib/shared/rail'
import { glideTo } from '@/lib/shared/smoothScroll'
import { activeSection, railLineEnd, railProgress } from '@/lib/site/railActive'
import { requestSearch } from '@/lib/site/searchOpen'

export type RailAction = {
  label: string
  href: string
  icon?: string | null
  /** Live count (inquiry list, project); shown on the icon, also when the rail is folded. */
  count?: number | null
  /** Read out when the count changes, e.g. „W zapytaniu” → „W zapytaniu: 3” (`aria-live`). */
  countLabel?: string | null
  /** The action's own page is open (Instalacje „Zaplanuj” on `/zaplanuj`). */
  current?: boolean
}

export type SiteRailProps = {
  /** Home page sections of the line (`shared.rail.sections`), in page order. */
  sections: readonly RailSection[]
  /** The home page is open: anchors and smooth scroll; elsewhere `/#id` and „Na tej stronie”. */
  onHome: boolean
  /** The line's action at the bottom (`shared.tabBar.center`), spec §5.1 dodatek 1. */
  action?: RailAction | null
}

const HOME_OPEN_KEY = 'pk-rail-home'
const PULSE_KEY = 'pk-rail-pulse'
const noSubscription = () => () => {}

/** Marked sections of the current subpage (`[data-rail-section]` with an id), as one string. */
function readPageSections(): string {
  return JSON.stringify(
    [...document.querySelectorAll<HTMLElement>('[data-rail-section][id]')].map((element) => ({
      id: element.id,
      label: element.dataset.railLabel || element.dataset.railSection || element.id,
      icon: element.dataset.railIcon ?? null,
    })),
  )
}

/** Anchors of the home page sections present in the DOM. */
const readPresent = (ids: string) =>
  ids
    .split(' ')
    .filter((id) => id && document.getElementById(id))
    .join(' ')

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

function sessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function setSessionFlag(key: string, on: boolean) {
  try {
    if (on) sessionStorage.setItem(key, '1')
    else sessionStorage.removeItem(key)
  } catch {
    // Storage blocked: the state lasts until the next page.
  }
}

/** Focus moves on to the section, as after a plain anchor (the next Tab starts there). */
function focusSection(section: HTMLElement) {
  if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1')
  section.focus({ preventScroll: true })
}

/**
 * Side rail of every line from 1400 px (spec §5.1, board 07 „Szyna”): „Szukaj” on top (pulses
 * once per visit, opens the line's search), the home page sections with a gliding marker of the
 * current one (`railActive`), on subpages „Na tej stronie” from 3 marked sections and the home page
 * folded into one row, the line's action with a live count and „Do góry”; a progress line along
 * the tracked list ends at the section being read. Folded
 * to 64 px; opens to 248 px on hover or keyboard focus (`clip-path`, 120 / 250 ms), Esc folds it.
 */
export function SiteRail({ sections, onHome, action }: SiteRailProps) {
  const ids = sections.map((section) => section.anchorId).join(' ')
  const pathname = usePathname()
  // The page is read after each navigation (in D3 the rail lives in the line's frame, which stays
  // mounted while App Router swaps the page). Before that — server, first paint — every home page
  // section counts and the subpage has no group.
  const [dom, setDom] = useState<{ present: string | null; page: string }>({
    present: null,
    page: '[]',
  })
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDom({ present: readPresent(ids), page: readPageSections() }),
      0,
    )
    return () => window.clearTimeout(timer)
  }, [pathname, ids])
  const presentIds = dom.present
  const pageJson = dom.page
  const mac = useSyncExternalStore(noSubscription, isMac, () => false)

  const home = presentSections(
    sections,
    onHome && presentIds !== null ? new Set(presentIds.split(' ')) : null,
  )
  const pageSections: PageSection[] = onHome ? [] : JSON.parse(pageJson)
  const pageGroup = hasPageGroup(pageSections)
  // The list the marker follows: the home page sections there, the subpage's own ones here.
  const tracked = onHome
    ? home.map((s) => s.anchorId)
    : pageGroup
      ? pageSections.map((s) => s.id)
      : []
  const trackedKey = tracked.join(' ')

  const [active, setActive] = useState<string | null>(null)
  const [showUp, setShowUp] = useState(false)
  const [homeOpen, setHomeOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [pulse, setPulse] = useState(false)
  const homeListId = useId()
  const progress = useRef<HTMLSpanElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [markerTop, setMarkerTop] = useState<number | null>(null)

  // Saved states of the visit: the folded home page row, the one pulse of „Szukaj”.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHomeOpen(sessionFlag(HOME_OPEN_KEY))
      if (!sessionFlag(PULSE_KEY)) {
        setPulse(true)
        setSessionFlag(PULSE_KEY, true)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  // One measurement per frame on scroll and resize: current section, progress, „Do góry”.
  useEffect(() => {
    const elements = trackedKey
      ? trackedKey.split(' ').flatMap((id) => document.getElementById(id) ?? [])
      : []
    let frame = 0
    // The progress line runs from the centre of the first entry to the centre of the last one and
    // ends at the section being read (AUDYT-0811 #8): measured from the list on every frame.
    const drawLine = (position: number) => {
      const line = progress.current
      const box = list.current
      if (!line || !box) return
      const centers = Array.from(
        box.querySelectorAll<HTMLElement>('a.srail__item'),
        (link) => link.offsetTop + link.offsetHeight / 2,
      )
      const top = centers[0] ?? 0
      const length = (centers[centers.length - 1] ?? top) - top
      const share = railLineEnd(position, centers)
      line.style.setProperty('--rail-line-top', `${top}px`)
      line.style.setProperty('--rail-line-h', `${length}px`)
      line.style.setProperty('--rail-progress', String(share))
      line.style.setProperty('--rail-dot', `${share * length}px`)
    }
    const update = () => {
      frame = 0
      const root = document.scrollingElement ?? document.documentElement
      const atBottom = window.scrollY >= root.scrollHeight - window.innerHeight - 2
      if (elements.length) {
        const tops = elements.map((element) => element.getBoundingClientRect().top)
        setActive(
          activeSection(
            elements.map((element, i) => ({ id: element.id, top: tops[i]! })),
            window.innerHeight,
            atBottom,
          ),
        )
        drawLine(railProgress(tops, window.innerHeight, atBottom))
      }
      setShowUp(window.scrollY > window.innerHeight)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [trackedKey])

  // The marker slides to the current entry (measured from the list after each change).
  useLayoutEffect(() => {
    const box = list.current
    if (!box) return
    const measure = () => {
      const link = box.querySelector<HTMLElement>('a[aria-current="location"]')
      setMarkerTop(link && link.offsetParent ? link.offsetTop : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [active, trackedKey])

  // Esc folds the rail and leaves focus where it is (WCAG 2.4.3); the next focus move or the
  // pointer coming back opens it again.
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') setCollapsed(true)
  }

  const glide = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id)
    if (!section) return
    event.preventDefault()
    history.pushState(null, '', `#${id}`)
    focusSection(section)
    glideTo(section)
  }

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    const main = document.getElementById('tresc')
    if (main) focusSection(main)
  }

  const toggleHome = () => {
    setHomeOpen((open) => {
      setSessionFlag(HOME_OPEN_KEY, !open)
      return !open
    })
  }

  const count = action?.count ?? 0
  // The badge hops when the count changes, not on the first paint of the page.
  const [initialCount] = useState(count)
  const sectionLink = (
    id: string,
    label: string,
    icon: string | null,
    href: string,
    inList: boolean,
  ) => (
    <a
      key={id}
      href={href}
      className="srail__item"
      aria-current={inList && id === active ? 'location' : undefined}
      onClick={inList && (onHome || pageGroup) ? (event) => glide(event, id) : undefined}
    >
      <span className="srail__icon">
        <Icon name={railIcon(icon)} strokeWidth={1.8} className="size-[22px]" />
      </span>
      <span className="srail__label">
        {label}
        {!inList && !onHome && (
          <span className="srail__aside" aria-hidden="true">
            ↗
          </span>
        )}
      </span>
    </a>
  )

  const homeLinks = home.map((section) =>
    sectionLink(
      section.anchorId,
      section.label,
      section.icon,
      railHref(section.anchorId, onHome),
      onHome,
    ),
  )

  return (
    // The wrapper carries the position and the shadow: `clip-path` on the rail would cut both.
    <div className="srail-wrap" data-site-rail-wrap>
      <nav
        aria-label="Sekcje strony"
        className="srail"
        data-collapsed={collapsed ? '' : undefined}
        data-site-rail
        onKeyDown={onKeyDown}
        onMouseEnter={() => setCollapsed(false)}
        onFocus={() => setCollapsed(false)}
      >
        <button
          type="button"
          className="srail__search"
          data-pulse={pulse ? '' : undefined}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K /"
          onClick={() => requestSearch()}
        >
          <span className="srail__icon">
            <Icon name="search" strokeWidth={2} className="size-[22px]" />
          </span>
          <span className="srail__label">
            Szukaj
            <kbd className="srail__kbd">{mac ? '⌘K' : 'Ctrl K'} lub /</kbd>
          </span>
        </button>
        <span className="srail__sep" aria-hidden="true" />

        {pageGroup && (
          <>
            <span className="srail__caption" aria-hidden="true">
              <span className="srail__icon">•</span>
              <span className="srail__label">Na tej stronie</span>
            </span>
            <div
              ref={list}
              role="group"
              aria-label="Na tej stronie"
              className="srail__list"
              data-scroll-thin
              data-long={pageSections.length > PAGE_GROUP_MAX ? '' : undefined}
            >
              {markerTop !== null && (
                <span
                  aria-hidden="true"
                  className="srail__marker"
                  style={{ transform: `translateY(${markerTop}px)` } as CSSProperties}
                />
              )}
              <span ref={progress} className="srail__progress" aria-hidden="true">
                <span />
                <i />
              </span>
              {pageSections.map((section) =>
                sectionLink(section.id, section.label, section.icon, `#${section.id}`, true),
              )}
            </div>
            <span className="srail__sep" aria-hidden="true" />
            <button
              type="button"
              className="srail__item"
              aria-expanded={homeOpen}
              aria-controls={homeListId}
              onClick={toggleHome}
            >
              <span className="srail__icon">
                <Icon name="home" strokeWidth={1.8} className="size-[22px]" />
              </span>
              <span className="srail__label">
                Strona główna
                <span className="srail__aside">
                  {sectionsCount(home.length)} {homeOpen ? '▴' : '▾'}
                </span>
              </span>
            </button>
            <div
              id={homeListId}
              role="group"
              aria-label="Strona główna"
              className="srail__list srail__list--home"
              hidden={!homeOpen}
            >
              {homeLinks}
            </div>
          </>
        )}
        {!pageGroup && (
          <div
            ref={onHome ? list : undefined}
            role="group"
            aria-label={onHome ? 'Na tej stronie' : 'Strona główna'}
            className="srail__list"
          >
            {onHome && markerTop !== null && (
              <span
                aria-hidden="true"
                className="srail__marker"
                style={{ transform: `translateY(${markerTop}px)` } as CSSProperties}
              />
            )}
            {onHome && (
              <span ref={progress} className="srail__progress" aria-hidden="true">
                <span />
                <i />
              </span>
            )}
            {homeLinks}
          </div>
        )}

        {action && (
          <>
            <span className="srail__sep" aria-hidden="true" />
            <a
              href={action.href}
              className="srail__item srail__item--action"
              aria-current={action.current ? 'page' : undefined}
            >
              <span className="srail__icon">
                <Icon name={railIcon(action.icon)} strokeWidth={1.8} className="size-[22px]" />
                {count > 0 && (
                  <span
                    key={count}
                    className="srail__badge"
                    data-bump={count !== initialCount ? '' : undefined}
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                )}
              </span>
              <span className="srail__label">{action.label}</span>
            </a>
            {action.countLabel && (
              <span className="sr-only" aria-live="polite">
                {count > 0 ? `${action.countLabel}: ${count}` : ''}
              </span>
            )}
          </>
        )}
        <button
          type="button"
          className="srail__item srail__up"
          data-shown={showUp ? '' : undefined}
          // Out of reach (focus, screen readers) until it shows.
          inert={!showUp}
          onClick={toTop}
        >
          <span className="srail__icon">
            <Icon name="arrow" strokeWidth={1.8} className="size-[22px] -rotate-90" />
          </span>
          <span className="srail__label">Do góry</span>
        </button>
      </nav>
    </div>
  )
}
