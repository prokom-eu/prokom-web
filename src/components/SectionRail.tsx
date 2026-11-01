'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { activeSection } from '@/lib/site/railActive'
import { requestSearch } from '@/lib/site/searchOpen'
import { glideTo } from '@/lib/software/smoothScroll'

export type RailItem = { id: string; label: string; icon: IconName }

/** Width from which the rail shows: Biznes from 1400 px (spec. §3.7), Software above 1400 px (§3.3). */
const FROM = {
  1400: 'min-[1400px]:block',
  1401: 'min-[1401px]:block',
} as const

export type RailFrom = keyof typeof FROM

/**
 * One entry of the rail: icon always, label once the rail opens. With `marker` the current entry
 * has no background of its own — the sliding marker of `SectionRail` sits behind it.
 */
export function railLinkClass(current: boolean, marker = false): string {
  return cx(
    'flex h-9 items-center gap-3 rounded-[14px] px-2 text-sm font-bold whitespace-nowrap',
    marker && 'relative z-[1]',
    current
      ? marker
        ? 'text-accent-ink'
        : 'bg-accent-text text-accent-ink'
      : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  )
}

type ShellProps = {
  /** Name of the navigation landmark. */
  label: string
  /** Small heading of the open rail, when it differs from `label` (board: „Menu”). */
  heading?: string
  from?: RailFrom
  /** „Szukaj · Ctrl K lub /” on top (Biznes K33 §2.4): opens the site search. */
  search?: boolean
  /** Drawn first inside the rail box (the sliding marker of `SectionRail`). */
  marker?: ReactNode
  /** The rail box, for measuring the current entry. */
  boxRef?: RefObject<HTMLDivElement | null>
  children: ReactNode
}

/**
 * The floating rail on the left of wide screens: icons, labels on hover or keyboard focus.
 * Shared by the section rail of a start page and the Biznes menu of subpages.
 */
export function RailShell({
  label,
  heading = label,
  from = 1400,
  search = false,
  marker,
  boxRef,
  children,
}: ShellProps) {
  return (
    <nav
      aria-label={label}
      className={cx('group/rail fixed top-1/2 left-4 z-30 hidden -translate-y-1/2', FROM[from])}
    >
      <div
        ref={boxRef}
        className="relative flex w-11 flex-col gap-1 overflow-hidden rounded-[22px] bg-card p-1 shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[width] duration-200 group-focus-within/rail:w-[214px] group-hover/rail:w-[214px] motion-reduce:transition-none"
      >
        {marker}
        {search && (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K /"
            onClick={() => requestSearch()}
            className="flex h-10 items-center gap-3 rounded-[14px] bg-accent-text px-2 text-left text-sm font-bold whitespace-nowrap text-accent-ink"
          >
            <Icon name="search" className="size-5 shrink-0" />
            <span>
              Szukaj<span className="sr-only"> w ofercie</span>
              <kbd className="ml-2 font-sans text-xs font-bold opacity-80">Ctrl K lub /</kbd>
            </span>
          </button>
        )}
        {/* Biznes only (with the search): Software keeps its rail as it was. */}
        {search && (
          <p
            aria-hidden="true"
            className="h-0 overflow-hidden px-2 text-[11px] font-black tracking-[0.06em] whitespace-nowrap text-ink-2 uppercase opacity-0 transition-opacity group-focus-within/rail:h-auto group-focus-within/rail:pt-1.5 group-focus-within/rail:opacity-100 group-hover/rail:h-auto group-hover/rail:pt-1.5 group-hover/rail:opacity-100 motion-reduce:transition-none"
          >
            {heading}
          </p>
        )}
        <ul className="flex flex-col gap-1">{children}</ul>
      </div>
    </nav>
  )
}

type Props = {
  items: RailItem[]
  from?: RailFrom
  search?: boolean
  /** Software (SWV5): glide to the section with braking instead of the browser jump. */
  glide?: boolean
}

const noSubscription = () => () => {}

/**
 * Floating section rail of a start page (Biznes spec. §3.7, K36 §1; Software spec. §3.3): the
 * current section marked while scrolling (`lib/site/railActive`). Plain anchor links — they work
 * without JavaScript too; with `glide` a click glides there instead (`lib/software/smoothScroll`).
 */
export function SectionRail({ items, from = 1400, search = false, glide = false }: Props) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  // Sections found on the page: a block may render nothing (texts missing in the panel), and
  // the rail must not link to a section that is not there (Software spec. §3.3). The anchors do
  // not change while the page is open; on the server every item counts.
  const present = useSyncExternalStore(
    noSubscription,
    () =>
      items
        .filter((item) => document.getElementById(item.id))
        .map((item) => item.id)
        .join(' '),
    () => null,
  )

  useEffect(() => {
    const sections = items.flatMap((item) => document.getElementById(item.id) ?? [])
    // Measured on scroll and resize, once per frame (`railActive`: top past 40% of the screen,
    // the last section at the bottom of the page).
    let frame = 0
    const update = () => {
      frame = 0
      const root = document.scrollingElement ?? document.documentElement
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2
      const id = activeSection(
        sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top })),
        window.innerHeight,
        atBottom,
      )
      if (id) setActive(id)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [items])

  // Software (`glide`): one marker slides to the current entry instead of the background jumping
  // (SWV7); measured from the rail box after each change.
  const box = useRef<HTMLDivElement>(null)
  const [markerTop, setMarkerTop] = useState<number | null>(null)
  useLayoutEffect(() => {
    const rail = box.current
    if (!glide || !rail) return
    // A hidden rail (narrow window) measures 0: no marker then — the entry keeps its own
    // background — and measure again once the rail shows (its size changes).
    const measure = () => {
      const link = rail.querySelector<HTMLElement>('a[aria-current="true"]')
      setMarkerTop(link && link.offsetParent ? link.offsetTop : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [glide, active, present])

  const shown =
    present === null ? items : items.filter((item) => present.split(' ').includes(item.id))
  if (shown.length < 2) return null
  return (
    <RailShell
      label="Na tej stronie"
      from={from}
      search={search}
      boxRef={box}
      marker={
        markerTop === null ? null : (
          <span
            aria-hidden="true"
            data-rail-marker
            className="pointer-events-none absolute inset-x-1 top-0 h-9 rounded-[14px] bg-accent-text transition-transform duration-(--dur-state) ease-(--ease-out) motion-reduce:transition-none"
            style={{ transform: `translateY(${markerTop}px)` }}
          />
        )
      }
    >
      {shown.map((item) => {
        const current = item.id === active
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current ? 'true' : undefined}
              className={railLinkClass(current, markerTop !== null)}
              onClick={
                glide
                  ? (event) => {
                      const section = document.getElementById(item.id)
                      if (!section) return
                      event.preventDefault()
                      // As a plain anchor would: a history entry, and keyboard focus moves on
                      // to the section (the next Tab starts there, not back in the rail).
                      history.pushState(null, '', `#${item.id}`)
                      if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1')
                      section.focus({ preventScroll: true })
                      glideTo(section)
                    }
                  : undefined
              }
            >
              <Icon name={item.icon} className="size-5 shrink-0" />
              {item.label}
            </a>
          </li>
        )
      })}
    </RailShell>
  )
}
