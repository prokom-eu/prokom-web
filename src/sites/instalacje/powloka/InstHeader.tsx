'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

import { CAPSULE } from '@/components/shared/capsule'
import { MenuButton } from '@/components/shared/MenuButton'
import { type CapsuleNavItem, SiteHeader } from '@/components/shared/SiteHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import { activeSection, type InstMenu, type MenuColumn } from '@/lib/instalacje/menu'
import { requestSearch } from '@/lib/site/searchOpen'

import type { MegaPromo, Navigation } from '../dane/types'
import { hue } from '../hue'
import { InstIcon } from '../InstIcon'
import { offerText } from './offerText'

type Mega = 'services' | 'objects'

/** Closing delay after the pointer leaves the menu (spec §4: 250–300 ms; prototype 280). */
const CLOSE_DELAY = 280
/** A click on a button whose panel has been open longer than this closes it. */
const TOGGLE_AFTER = 600

type Props = {
  homeLabel: string
  navigation: Navigation
  menu: InstMenu
  /** The search window and the menu sheet are there (they need the shared data of the panel). */
  withShared: boolean
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
 * The Instalacje line in the shared header capsule (L1-I, NAGLOWEK-KAPSULA, board 11): the
 * capsule brings the layout, states and stickiness; the line brings its menu (two mega menus
 * „Usługi” and „Dla kogo” + six links, unchanged), the search loupe (below 1400 px, where the side
 * rail with „Szukaj” is not shown), the theme switch and „Zaplanuj instalację”.
 *
 * Mega menu behaviour kept from I3 (spec §4): opens on hover, closes 280 ms after the pointer
 * leaves, a click toggles (closes when open > 600 ms), Esc closes and returns focus, a press
 * outside closes, Tab loops inside the open panel and its trigger. One panel at a time.
 */
export function InstHeader({ homeLabel, navigation, menu, withShared }: Props) {
  const pathname = usePathname()
  const [mega, setMega] = useState<Mega | null>(null)
  const [shownPath, setShownPath] = useState(pathname)
  const openedAt = useRef(0)
  const closeTimer = useRef<number | undefined>(undefined)
  const triggers = useRef<Record<Mega, HTMLButtonElement | null>>({ services: null, objects: null })
  const panels = useRef<Record<Mega, HTMLDivElement | null>>({ services: null, objects: null })
  const section = activeSection(pathname, menu, navigation)

  // A followed link closes the panel (render-time reset).
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setMega(null)
  }

  const keep = () => window.clearTimeout(closeTimer.current)
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

  // Esc and a press outside the trigger and its panel close it.
  useEffect(() => {
    if (!mega) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMega(null)
      triggers.current[mega]?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggers.current[mega]?.contains(target) && !panels.current[mega]?.contains(target))
        setMega(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [mega])

  // Focus trap: the open panel's trigger and its links, in a loop.
  const trapTab = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !mega) return
    const panel = panels.current[mega]
    const trigger = triggers.current[mega]
    if (!panel || !trigger) return
    const items = [trigger, ...panel.querySelectorAll<HTMLElement>('a[href], button')]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index === -1) return
    event.preventDefault()
    const next = (index + (event.shiftKey ? -1 : 1) + items.length) % items.length
    items[next]?.focus()
  }

  const megaFor = (key: string) => {
    if (key !== 'services' && key !== 'objects') return null
    const which: Mega = key
    const label = which === 'services' ? 'Usługi' : 'Dla kogo'
    return (
      <div className="imenu" onMouseEnter={keep} onMouseLeave={closeLater} onKeyDown={trapTab}>
        <button
          ref={(element) => {
            triggers.current[which] = element
          }}
          type="button"
          className={CAPSULE.link}
          aria-expanded={mega === which}
          aria-controls={`mega-${which}`}
          aria-current={section.header === which ? 'true' : undefined}
          onMouseEnter={(event) => open(which, event.timeStamp)}
          onClick={(event) => toggle(which, event.timeStamp)}
        >
          {label}
          <InstIcon name="chevronDown" size={13} strokeWidth={2.6} />
        </button>
        <div
          ref={(element) => {
            panels.current[which] = element
          }}
          id={`mega-${which}`}
          className={`${CAPSULE.mega} imega${which === 'objects' ? ' imega--o' : ''}`}
          hidden={mega !== which}
          role="region"
          aria-label={label}
        >
          <MegaColumns columns={which === 'services' ? menu.services : menu.objects} />
          {which === 'services' ? (
            <Promo promo={navigation.megaServices} title={offerText(menu.offer)} />
          ) : (
            <Promo promo={navigation.megaObjects} title={navigation.megaObjects.title ?? ''} warm />
          )}
        </div>
      </div>
    )
  }

  const nav: CapsuleNavItem[] = [
    { key: 'services', label: 'Usługi' },
    { key: 'objects', label: 'Dla kogo' },
    ...navigation.header.map((link) => ({
      key: link.href,
      label: link.label,
      href: link.href,
      current: section.header === link.href,
    })),
  ]

  return (
    <SiteHeader
      line="instalacje"
      homeLabel={homeLabel}
      nav={nav}
      megaFor={megaFor}
      actions={
        <>
          {withShared && (
            <button
              type="button"
              className={`${CAPSULE.iconButton} isearch`}
              aria-label="Szukaj na stronie"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => requestSearch()}
            >
              <Icon name="search" strokeWidth={2.2} className="size-[18px]" />
            </button>
          )}
          <ThemeToggle className={CAPSULE.iconButton} />
        </>
      }
      cta={{ label: navigation.cta.label, shortLabel: 'Zaplanuj', href: navigation.cta.href }}
      menuButton={
        withShared ? (
          <>
            {/* Tablets have no rail and no app bar: the search stays one tap away (audit 09.11). */}
            <button
              type="button"
              className={`${CAPSULE.iconButton} isearch-t`}
              aria-label="Szukaj na stronie"
              onClick={() => requestSearch()}
            >
              <Icon name="search" strokeWidth={2.2} className="size-[18px]" />
            </button>
            <MenuButton />
          </>
        ) : undefined
      }
    />
  )
}
