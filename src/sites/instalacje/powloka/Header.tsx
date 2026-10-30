'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'

import { activeSection, type InstMenu, type MenuColumn } from '@/lib/instalacje/menu'

import type { MegaPromo, Navigation } from '../dane/types'
import { hue } from '../hue'
import { InstIcon } from '../InstIcon'
import { offerText } from './offerText'
import { useShell } from './ShellProvider'
import { ThemeButton } from './ThemeButton'

type Mega = 'services' | 'objects'

/** Closing delay after the pointer leaves the menu (spec §4: 250–300 ms; prototype 280). */
const CLOSE_DELAY = 280
/** A click on a button whose panel has been open longer than this closes it. */
const TOGGLE_AFTER = 600

type Props = {
  logo: ReactNode
  navigation: Navigation
  menu: InstMenu
  phone: { label: string; href: string } | null
}

function MegaColumns({ columns }: { columns: MenuColumn[] }) {
  return columns.map((column) => (
    <div key={column.label} className="megac">
      <span className="megah">{column.label}</span>
      {column.items.map((item) => (
        <Link key={item.key} href={item.href} style={hue(item.color)}>
          <span className="ico s mhi">
            <InstIcon name={item.icon} size={18} />
          </span>
          <span>
            <b>{item.label}</b>
            {item.caption && <span>{item.caption}</span>}
          </span>
        </Link>
      ))}
    </div>
  ))
}

function Promo({ promo, title, warm }: { promo: MegaPromo; title: string; warm?: boolean }) {
  return (
    <div className={warm ? 'megap megapo' : 'megap'}>
      <span className="eye text-[12px]">{promo.eyebrow}</span>
      <b>{title}</b>
      <span>{promo.text}</span>
      <Link href={promo.button.href} className="btn btn-p btn-s self-start">
        {promo.button.label}
      </Link>
      <Link href={promo.link.href} className="megal">
        {promo.link.label}
      </Link>
    </div>
  )
}

/**
 * Header of the Instalacje shell (`zrodlo/header.html`, `common.js → mg`): logo, desktop menu with
 * two mega menus (≥ 1101 px), theme, phone, „Zaplanuj”, menu button (≤ 1100 px → sheet). On a
 * phone it hides while scrolling down (`ShellProvider`).
 *
 * Mega menu (spec §4): opens on hover, closes 280 ms after the pointer leaves, an invisible
 * bridge over the gap (CSS `.mega::before`), a click toggles (closes when open > 600 ms), Esc
 * closes and returns focus, Tab stays inside the open panel and its button.
 */
export function Header({ logo, navigation, menu, phone }: Props) {
  const pathname = usePathname()
  const { sheet, openSheet, headerHidden } = useShell()
  const [mega, setMega] = useState<Mega | null>(null)
  const [shownPath, setShownPath] = useState(pathname)
  const openedAt = useRef(0)
  const closeTimer = useRef<number | undefined>(undefined)
  const dropdown = useRef<HTMLDivElement>(null)
  const buttons = useRef<Record<Mega, HTMLButtonElement | null>>({ services: null, objects: null })
  const section = activeSection(pathname, menu, navigation)

  // A followed link closes the panel (render-time reset, like the Software header).
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setMega(null)
  }

  const keep = () => window.clearTimeout(closeTimer.current)
  // `at`: the event's timeStamp (one clock for hover and click).
  const open = (which: Mega, at: number) => {
    keep()
    if (mega !== which) openedAt.current = at
    setMega(which)
  }
  const toggle = (which: Mega, at: number) => {
    keep()
    if (mega === which && at - openedAt.current > TOGGLE_AFTER) setMega(null)
    else open(which, at)
  }
  const closeLater = () => {
    keep()
    closeTimer.current = window.setTimeout(() => setMega(null), CLOSE_DELAY)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Esc and a press outside the menu close it.
  useEffect(() => {
    if (!mega) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMega(null)
      buttons.current[mega]?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!dropdown.current?.contains(event.target as Node)) setMega(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [mega])

  // Focus trap: the open panel's button and its links, in a loop.
  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !mega) return
    const panel = dropdown.current?.querySelector<HTMLElement>(`#mega-${mega}`)
    const trigger = buttons.current[mega]
    if (!panel || !trigger) return
    const items = [trigger, ...panel.querySelectorAll<HTMLElement>('a[href], button')]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index === -1) return
    event.preventDefault()
    const next = (index + (event.shiftKey ? -1 : 1) + items.length) % items.length
    items[next]?.focus()
  }

  const menuButton = (which: Mega, label: string) => (
    <button
      ref={(element) => {
        buttons.current[which] = element
      }}
      type="button"
      className={`nbtn${mega === which ? ' on' : ''}${section.header === which ? ' cur' : ''}`}
      aria-expanded={mega === which}
      aria-controls={`mega-${which}`}
      onMouseEnter={(event) => open(which, event.timeStamp)}
      onClick={(event) => toggle(which, event.timeStamp)}
    >
      {label}
      <InstIcon name="chevronDown" size={14} strokeWidth={2.6} />
    </button>
  )

  // The menu button opens the sheet on the tab of the current section (MOBILE-APLIKACJA §2).
  const sheetTab = section.tab === 'objects' ? 'objects' : 'services'

  return (
    <header id="naglowek" className={headerHidden && !sheet ? 'hdr hdrh' : 'hdr'}>
      <div className="wrap hdrw">
        {logo}
        <nav className="nav" aria-label="Główne menu">
          <div
            ref={dropdown}
            className="ndd"
            onMouseEnter={keep}
            onMouseLeave={closeLater}
            onKeyDown={trapTab}
          >
            {menuButton('services', 'Usługi')}
            {menuButton('objects', 'Dla kogo')}
            <div
              id="mega-services"
              className="mega"
              hidden={mega !== 'services'}
              aria-label="Usługi"
              role="region"
            >
              <MegaColumns columns={menu.services} />
              <Promo promo={navigation.megaServices} title={offerText(menu.offer)} />
            </div>
            <div
              id="mega-objects"
              className="mega megao"
              hidden={mega !== 'objects'}
              aria-label="Dla kogo"
              role="region"
            >
              <MegaColumns columns={menu.objects} />
              <Promo
                promo={navigation.megaObjects}
                title={navigation.megaObjects.title ?? ''}
                warm
              />
            </div>
          </div>
          {navigation.header.map((link) => {
            const current = section.header === link.href
            const className = [current ? 'on' : '', link.accent ? 'arn' : ''].join(' ').trim()
            return (
              <Link
                key={link.href}
                href={link.href}
                className={className || undefined}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="hdra">
          <ThemeButton />
          {phone && (
            <a href={phone.href} className="iconb mobb" aria-label={`Zadzwoń: ${phone.label}`}>
              <InstIcon name="phone" size={19} />
            </a>
          )}
          <Link href={navigation.cta.href} className="btn btn-p btn-s desk">
            {navigation.cta.label}
          </Link>
          <button
            type="button"
            className="iconb mobb"
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={sheet !== null}
            onClick={() => openSheet(sheet ?? sheetTab)}
          >
            <InstIcon name="menu" size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  )
}
