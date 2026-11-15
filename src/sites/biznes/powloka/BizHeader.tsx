'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { CAPSULE } from '@/components/shared/capsule'
import { MenuButton } from '@/components/shared/MenuButton'
import { type CapsuleNavItem, SiteHeader } from '@/components/shared/SiteHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import type { OfferMenu } from '@/lib/catalog/menu'
import { type PublicBiznesNavigation, withoutEmptyDropdowns } from '@/lib/site/navigation'
import { requestSearch } from '@/lib/site/searchOpen'

import { megaKey } from '../components/menu/megaKeys'
import { OfferMega } from '../components/menu/OfferMega'
import { CartCount } from './CartCount'

/** Closing delay after the pointer leaves the mega menu (spec §8.1: 280 ms). */
const CLOSE_DELAY = 280
/** A click right after the hover opened the panel keeps it open (as Instalacje: 600 ms). */
const TOGGLE_AFTER = 600

type Props = {
  homeLabel: string
  menu: PublicBiznesNavigation['menu']
  offer: OfferMenu
  /** `shared.headerCta`: „Zapytanie” with the count of the inquiry list. */
  cta: { label: string; href: string } | null
  /** Anchors of the home page sections from the panel (`shared.rail`), in page order. */
  homeSections?: readonly string[]
}

/**
 * Plan 0611 §8.1 pkt 2: the home page sections each menu entry stands for — the capsule's pill
 * glides to the entry of the section being read. Keys as in `nav` below („Oferta ▾” = `oferta`,
 * links by their address); other sections (hero, plan, FAQ…) hide the pill.
 */
const HOME_SPY: Record<string, readonly string[]> = {
  oferta: ['oferta', 'zaopatrzenie', 'wybierane'],
  '/marki': ['marki'],
  '/o-firmie': ['fakty'],
  '/kontakt': ['kontakt'],
}

/** The current menu entry of a subpage (`aria-current="page"` and the pill). */
const isCurrent = (pathname: string, href: string) =>
  href !== '/' && (pathname === href || pathname.startsWith(`${href}/`))

/**
 * The Biznes line in the shared header capsule (D3-B, plan 0611 §8.1 pkt 2): the capsule brings
 * the layout, states and hiding on a phone; the line brings its menu from the panel, „Oferta ▾”
 * (the mega menu — opens on hover or click, closes 280 ms after the pointer leaves, Esc returns
 * focus), the search loupe, the theme switch and „Zapytanie” with the live count.
 */
export function BizHeader({ homeLabel, menu, offer, cta, homeSections }: Props) {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
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
  /** Focus a department once the opened panel is visible (it is `inert` until then). */
  const focusTab = (index: number) =>
    requestAnimationFrame(() =>
      panel.current?.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.focus(),
    )
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
      setOpen(false)
      trigger.current?.focus()
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
  const offerLabel = menu.find((item) => item.type !== 'link')?.label ?? 'Oferta'
  // Until the catalog has content (staging before the import) „Oferta ▾” is a plain link.
  const items = withoutEmptyDropdowns(menu, { offer: offer.departments.length > 0 })
  const nav: CapsuleNavItem[] = items.map((item) =>
    item.type === 'link' && item.href
      ? {
          key: item.href,
          label: item.label,
          href: item.href,
          current: isCurrent(pathname, item.href),
          sections: HOME_SPY[item.href],
        }
      : { key: 'oferta', label: item.label, sections: HOME_SPY.oferta },
  )

  return (
    <SiteHeader
      line="biznes"
      homeLabel={homeLabel}
      nav={nav}
      spyStops={pathname === '/' ? homeSections : undefined}
      megaFor={() => (
        <div
          onPointerEnter={(event) => hover(event) && openNow(event.timeStamp)}
          onPointerLeave={(event) => hover(event) && closeLater()}
          // The focus leaving „Oferta ▾” and its panel closes it (plan 0611 §8.1 pkt 3).
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
            aria-current={isCurrent(pathname, '/oferta') ? 'true' : undefined}
            onKeyDown={(event) => {
              const action = megaKey(event.key, {
                zone: 'trigger',
                index: active,
                count: offer.departments.length,
              })
              if (action.type !== 'open') return
              event.preventDefault()
              openNow(event.timeStamp)
              focusTab(action.focus)
            }}
            onClick={(event) => {
              // The hover has just opened it: the click that follows must not close it.
              if (open && event.timeStamp - openedAt.current > TOGGLE_AFTER) {
                keep()
                setOpen(false)
              } else openNow(event.timeStamp)
            }}
          >
            {offerLabel}
            <Icon name="arrow" className="ml-1 size-3 rotate-90" strokeWidth={2.4} />
          </button>
          <div
            ref={panel}
            id="oferta-mega"
            className={`${CAPSULE.mega} bmg-panel`}
            data-open={open ? '' : undefined}
            inert={!open}
            // A followed link closes it, also one to the page already open (`?grupa=`).
            onClick={(event) => {
              if ((event.target as Element).closest('a')) close(false)
            }}
          >
            <OfferMega
              offer={offer}
              active={active}
              onActive={setActive}
              onClose={() => close(true)}
              onSearch={() => {
                close(false)
                requestSearch()
              }}
            />
          </div>
        </div>
      )}
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
            <span className="sr-only">Szukaj w ofercie</span>
            <kbd aria-hidden="true">Ctrl K</kbd>
          </button>
          <ThemeToggle className={CAPSULE.iconButton} />
        </>
      }
      cta={cta && { ...cta, badge: <CartCount className={CAPSULE.count} /> }}
      menuButton={<MenuButton />}
    />
  )
}
