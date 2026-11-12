'use client'

import { IntentLink as Link } from '@/components/shared/IntentLink'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { CAPSULE } from '@/components/shared/capsule'
import { MenuButton } from '@/components/shared/MenuButton'
import { type CapsuleNavItem, SiteHeader } from '@/components/shared/SiteHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import type { MegaColumn } from '@/lib/software/megaMenu'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import { requestSearch } from '@/lib/site/searchOpen'

import { ProjectMenu } from '../components/ProjectMenu'
import { ProjectCount } from './ProjectCount'

/** Closing delay after the pointer leaves the mega menu (as Biznes and Instalacje: 280 ms). */
const CLOSE_DELAY = 280
/** A click right after the hover opened the panel keeps it open (600 ms). */
const TOGGLE_AFTER = 600

type Props = {
  homeLabel: string
  navigation: SoftwareNavigation
  /** Columns of „Oferta ▾” with the solutions' „od” prices (`megaColumns`). */
  mega: MegaColumn[]
  /** `shared.headerCta`: „Bezpłatna wycena” / „Wycena”; `withCount` = counter `project`. */
  cta: { label: string; shortLabel?: string; href: string; withCount: boolean } | null
}

const noop = () => () => {}

/** The current menu entry of a subpage (`aria-current="page"` and the pill). */
const isCurrent = (pathname: string, href: string) =>
  href !== '/' && (pathname === href || pathname.startsWith(`${href}/`))

/**
 * The Software line in the shared header capsule (SWA5, ZMIANY-v24 §3.2): the capsule brings the
 * layout, states and hiding on a phone; the line brings its menu from the panel
 * (`navigation.header`) with „Kreator 60 s” as the accent pill, „Oferta ▾” (four groups of the
 * offer with the „od” prices — opens on hover or click, closes 280 ms after the pointer leaves,
 * Esc returns focus), the search loupe, the theme switch, „Twój projekt” (only with items) and
 * the CTA with the project's count. On the start page Kreator and the CTA lead to its sections.
 */
export function SwHeader({ homeLabel, navigation, mega, cta }: Props) {
  const pathname = usePathname() ?? '/'
  // The proxy rewrites paths: the server's pathname is not the visitor's — the start page's
  // anchors only after hydration (as `HomeAwareLink`).
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  const onHome = hydrated && pathname === '/'
  const [open, setOpen] = useState(false)
  const [shownPath, setShownPath] = useState(pathname)
  const timer = useRef<number | undefined>(undefined)
  const openedAt = useRef(0)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // A followed link closes the panel (render-time reset).
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpen(false)
  }

  const keep = () => window.clearTimeout(timer.current)
  const close = (focusTrigger: boolean) => {
    keep()
    setOpen(false)
    if (focusTrigger) trigger.current?.focus()
  }
  /** `at`: the event's time stamp (no clock read in render code). */
  const openNow = (at: number) => {
    keep()
    if (!open) openedAt.current = at
    setOpen(true)
  }
  const closeLater = () => {
    keep()
    timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Focus goes back to „Oferta” only from the trigger or the panel (not from a hover-open).
      const active = document.activeElement
      const inside = trigger.current?.contains(active) || panel.current?.contains(active)
      setOpen(false)
      if (inside) trigger.current?.focus()
    }
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!trigger.current?.contains(target) && !panel.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const hover = (event: { pointerType: string }) => event.pointerType === 'mouse'
  const items = navigation.header
  const pillOf = new Map<string, (typeof items)[number]>()
  const nav: CapsuleNavItem[] = items.flatMap((item): CapsuleNavItem[] => {
    if (!('href' in item)) return mega.length > 0 ? [{ key: 'oferta', label: item.label }] : []
    // The accent pill is drawn by the line (no link → the capsule asks `megaFor`).
    if (item.pill) {
      pillOf.set(item.href, item)
      return [{ key: item.href, label: item.label }]
    }
    return [
      {
        key: item.href,
        label: item.label,
        href: onHome && item.homeHref ? item.homeHref : item.href,
        current: isCurrent(pathname, item.href),
      },
    ]
  })

  const megaPanel = (
    <div
      onPointerEnter={(event) => hover(event) && openNow(event.timeStamp)}
      onPointerLeave={(event) => hover(event) && closeLater()}
      // Focus leaving „Oferta ▾” and its panel closes it.
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && !event.currentTarget.contains(next)) close(false)
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={CAPSULE.link}
        aria-expanded={open}
        aria-controls="oferta-mega"
        aria-current={isCurrent(pathname, '/rozwiazania') ? 'true' : undefined}
        onClick={(event) => {
          // The hover has just opened it: the click that follows must not close it.
          if (open && event.timeStamp - openedAt.current > TOGGLE_AFTER) close(false)
          else openNow(event.timeStamp)
        }}
      >
        {items.find((item) => !('href' in item))?.label ?? 'Oferta'}
        <Icon name="arrow" className="ml-1 size-3 rotate-90" strokeWidth={2.4} />
      </button>
      <div
        ref={panel}
        id="oferta-mega"
        className={`${CAPSULE.mega} sw-mega`}
        data-open={open ? '' : undefined}
        inert={!open}
        // A followed link closes it, also one to the page already open (`?rozwiazanie=`).
        onClick={(event) => {
          if ((event.target as Element).closest('a')) close(false)
        }}
      >
        <div className="sw-mega__cols">
          {/* Plain columns with headings, no landmarks: the panel already sits in „Menu główne”. */}
          {mega.map((column) => (
            <div key={column.title}>
              <h2 className="sw-mega__head">{column.title}</h2>
              <ul>
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="sw-mega__item">
                      <b>{item.label}</b>
                      {item.note && <small>{item.note}</small>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="sw-mega__promo">
          <span className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
            {navigation.mega.card.eyebrow}
          </span>
          <b>{navigation.mega.card.title}</b>
          <p>{navigation.mega.card.text}</p>
          <Link href={navigation.mega.card.cta[1]} className="cap-cta">
            {navigation.mega.card.cta[0]}
          </Link>
          {navigation.mega.card.links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )

  const megaFor = (key: string) => {
    if (key === 'oferta') return megaPanel
    const pill = pillOf.get(key)
    if (!pill || !('href' in pill)) return null
    return (
      <Link
        href={onHome && pill.homeHref ? pill.homeHref : pill.href}
        className={`${CAPSULE.link} sw-cap-pill`}
        aria-current={isCurrent(pathname, pill.href) ? 'page' : undefined}
      >
        {pill.label}
        {pill.badge && <span className="sw-cap-pill__badge">{pill.badge}</span>}
      </Link>
    )
  }

  return (
    <SiteHeader
      line="software"
      homeLabel={homeLabel}
      nav={nav}
      megaFor={megaFor}
      actions={
        <>
          <button
            type="button"
            className={CAPSULE.searchButton}
            onClick={() => requestSearch()}
            aria-keyshortcuts="Control+K Meta+K /"
          >
            <Icon name="search" className="size-[18px]" />
            {/* The name from the content (WCAG 2.5.3): the shortcut is shown, not read out. */}
            <span className="sr-only">Szukaj na stronie</span>
            <kbd aria-hidden="true">Ctrl K</kbd>
          </button>
          {navigation.headerRight.themeToggle && <ThemeToggle className={CAPSULE.iconButton} />}
          {navigation.headerRight.projectDrawer && <ProjectMenu texts={navigation.projectDrawer} />}
        </>
      }
      cta={
        cta && {
          label: cta.label,
          shortLabel: cta.shortLabel,
          href:
            onHome && navigation.headerRight.ctaHomeHref
              ? navigation.headerRight.ctaHomeHref
              : cta.href,
          badge: cta.withCount ? <ProjectCount className={CAPSULE.count} /> : null,
        }
      }
      menuButton={<MenuButton />}
    />
  )
}
