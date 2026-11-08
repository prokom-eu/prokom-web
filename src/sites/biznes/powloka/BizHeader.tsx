'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { CAPSULE } from '@/components/shared/capsule'
import { MenuButton } from '@/components/shared/MenuButton'
import { type CapsuleNavItem, SiteHeader } from '@/components/shared/SiteHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import type { OfferMenu } from '@/lib/catalog/menu'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'
import { requestSearch } from '@/lib/site/searchOpen'

import { MegaMenuPanel } from '../components/MegaMenuPanel'
import { CartCount } from './CartCount'

/** Closing delay after the pointer leaves the mega menu (spec §8.1: 280 ms). */
const CLOSE_DELAY = 280

type Props = {
  homeLabel: string
  menu: PublicBiznesNavigation['menu']
  offer: OfferMenu
  phone: { label: string; href: string } | null
  hours: string | null
  /** `shared.headerCta`: „Zapytanie” with the count of the inquiry list. */
  cta: { label: string; href: string } | null
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
export function BizHeader({ homeLabel, menu, offer, phone, hours, cta }: Props) {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const [shownPath, setShownPath] = useState(pathname)
  const timer = useRef<number | undefined>(undefined)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // A followed link closes the panel (render-time reset).
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpen(false)
  }

  const keep = () => window.clearTimeout(timer.current)
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
  const nav: CapsuleNavItem[] = menu
    .filter((item) => item.type === 'link' || offer.departments.length > 0)
    .map((item) =>
      item.type === 'link' && item.href
        ? {
            key: item.href,
            label: item.label,
            href: item.href,
            current: isCurrent(pathname, item.href),
          }
        : { key: 'oferta', label: item.label },
    )

  return (
    <SiteHeader
      line="biznes"
      homeLabel={homeLabel}
      nav={nav}
      megaFor={() => (
        <div
          onPointerEnter={(event) => hover(event) && (keep(), setOpen(true))}
          onPointerLeave={(event) => hover(event) && closeLater()}
        >
          <button
            ref={trigger}
            type="button"
            className={CAPSULE.link}
            aria-expanded={open}
            aria-controls="oferta-mega"
            aria-current={isCurrent(pathname, '/oferta') ? 'true' : undefined}
            onClick={() => {
              keep()
              setOpen((value) => !value)
            }}
          >
            {offerLabel}
            <Icon name="arrow" className="ml-1 size-3 rotate-90" strokeWidth={2.4} />
          </button>
          <div ref={panel} id="oferta-mega" className={CAPSULE.mega} hidden={!open}>
            <MegaMenuPanel offer={offer} phone={phone} hours={hours} />
          </div>
        </div>
      )}
      actions={
        <>
          <button
            type="button"
            className={CAPSULE.searchButton}
            onClick={() => requestSearch()}
            aria-label="Szukaj w ofercie"
          >
            <Icon name="search" className="size-[18px]" />
            <kbd>Ctrl K</kbd>
          </button>
          <ThemeToggle className={CAPSULE.iconButton} />
        </>
      }
      cta={cta && { ...cta, badge: <CartCount className={CAPSULE.count} /> }}
      menuButton={<MenuButton />}
    />
  )
}
