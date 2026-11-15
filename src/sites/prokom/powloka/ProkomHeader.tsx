'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { CAPSULE } from '@/components/shared/capsule'
import { MenuButton } from '@/components/shared/MenuButton'
import { type CapsuleNavItem, SiteHeader } from '@/components/shared/SiteHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import { requestSearch } from '@/lib/site/searchOpen'

import { lineStyle } from '../lineColors'
import type { HubNavItem, MegaLine, StartLink } from '../shell'

/** Closing delay after the pointer leaves the menu (as in every line, NAGLOWEK-KAPSULA). */
const CLOSE_DELAY = 280
/** A click on the trigger of a panel open longer than this closes it. */
const TOGGLE_AFTER = 600
const OFFER_KEY = 'oferta'

type Props = {
  homeLabel: string
  nav: HubNavItem[]
  lines: MegaLine[]
  start: StartLink[]
  cta: { label: string; shortLabel: string; href: string } | null
  /** „Cała oferta” (`/linie`, H3-1) — `null` until the page exists. */
  offerHref: string | null
}

/** A service links to its line's site; without an address it is plain text, never a dead link. */
function ServiceItem({ href, children }: { href: string | null; children: ReactNode }) {
  return href ? (
    <a href={href} className="pk-mega__service">
      {children}
    </a>
  ) : (
    <div className="pk-mega__service">{children}</div>
  )
}

const isCurrent = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

/**
 * pro-kom.eu in the shared header capsule (spec §5.2, board Naglowek): „Oferta ▾” opens the mega
 * menu — tabs of the lines on the left (hover, click or arrow keys pick one), the chosen line's
 * services in the middle, „Zacznij od siebie” and the „Dobierz” card on the right. The capsule
 * brings layout, states and stickiness; behaviour of the panel as in the lines: hover opens, the
 * pointer leaving closes after 280 ms, Esc closes and returns focus, a press outside closes,
 * Tab loops inside the open panel. Search, theme switch and „Dobierz w 10 s” on the right.
 */
export function ProkomHeader({ homeLabel, nav, lines, start, cta, offerHref }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const [shownPath, setShownPath] = useState(pathname)
  const openedAt = useRef(0)
  const closeTimer = useRef<number | undefined>(undefined)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const panel = useRef<HTMLDivElement | null>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const line = lines[lineIndex] ?? lines[0]

  // A followed link closes the panel (render-time reset).
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpen(false)
  }

  const keep = () => window.clearTimeout(closeTimer.current)
  const show = (at: number) => {
    keep()
    if (!open) openedAt.current = at
    setOpen(true)
  }
  const toggle = (at: number) => {
    keep()
    if (open && at - openedAt.current > TOGGLE_AFTER) setOpen(false)
    else show(at)
  }
  const closeLater = () => {
    keep()
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!trigger.current?.contains(target) && !panel.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const trapTab = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !open || !panel.current || !trigger.current) return
    const items = [
      trigger.current,
      ...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([tabindex="-1"])'),
    ]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index === -1) return
    event.preventDefault()
    items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
  }

  // Tabs of the lines: arrows move the selection and the focus (WAI-ARIA tabs, vertical).
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = { ArrowDown: 1, ArrowUp: -1, Home: -index, End: lines.length - 1 - index }[
      event.key
    ]
    if (step === undefined) return
    event.preventDefault()
    const next = (index + step + lines.length) % lines.length
    setLineIndex(next)
    tabs.current[next]?.focus()
  }

  const megaFor = (key: string) => {
    if (key !== OFFER_KEY || !line) return null
    return (
      <div className="pk-menu" onMouseEnter={keep} onMouseLeave={closeLater} onKeyDown={trapTab}>
        <button
          ref={trigger}
          type="button"
          className={CAPSULE.link}
          aria-expanded={open}
          aria-controls={`${id}-mega`}
          onMouseEnter={(event) => show(event.timeStamp)}
          onClick={(event) => toggle(event.timeStamp)}
        >
          Oferta
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pk-menu__chev size-3"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div
          ref={panel}
          id={`${id}-mega`}
          className={`${CAPSULE.mega} pk-mega`}
          hidden={!open}
          role="region"
          aria-label="Oferta PRO-KOM"
        >
          <div className="pk-mega__lines">
            <p className="pk-mega__head" id={`${id}-lines`}>
              Linie PRO-KOM
            </p>
            <div role="tablist" aria-orientation="vertical" aria-labelledby={`${id}-lines`}>
              {lines.map((entry, index) => (
                <button
                  key={entry.key}
                  ref={(element) => {
                    tabs.current[index] = element
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${entry.key}`}
                  aria-selected={index === lineIndex}
                  aria-controls={`${id}-panel`}
                  tabIndex={index === lineIndex ? 0 : -1}
                  className="pk-mega__tab"
                  style={lineStyle(entry.key)}
                  onMouseEnter={() => setLineIndex(index)}
                  onFocus={() => setLineIndex(index)}
                  onClick={() => setLineIndex(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >
                  <span className="pk-mega__dot" aria-hidden="true" />
                  {entry.name}
                </button>
              ))}
            </div>
            {offerHref && (
              <Link href={offerHref} className="pk-mega__all">
                Cała oferta PRO-KOM →
              </Link>
            )}
          </div>
          <div
            className="pk-mega__panel"
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${line.key}`}
            style={lineStyle(line.key)}
          >
            <p className="pk-mega__name">PRO-KOM {line.name}</p>
            {line.description && <p className="pk-mega__desc">{line.description}</p>}
            <ul className="pk-mega__services">
              {line.services.map((service) => (
                <li key={service.key}>
                  <ServiceItem href={line.url}>
                    <span className="pk-mega__icon">
                      <Icon name={service.icon} className="size-[18px]" />
                    </span>
                    <span>
                      <b>{service.title}</b>
                      <span>{service.short}</span>
                    </span>
                  </ServiceItem>
                </li>
              ))}
            </ul>
            {line.url && (
              <a href={line.url} className="pk-mega__more">
                Wszystko w {line.name} ({line.count}) — {line.domain} ↗
              </a>
            )}
          </div>
          <div className="pk-mega__start">
            <p className="pk-mega__head">Zacznij od siebie</p>
            <ul>
              {start.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="pk-mega__startlink">
                    <Icon name={link.icon} className="size-[18px]" />
                    <span>
                      <b>{link.label}</b>
                      <span>{link.sub}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {cta && (
              <Link href={cta.href} className="pk-mega__pick">
                <b>Dobierz w 10 sekund</b>
                <span>Wybierz branżę, zobacz plan →</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const items: CapsuleNavItem[] = [
    { key: OFFER_KEY, label: 'Oferta' },
    ...nav.map((item) => ({ ...item, current: isCurrent(pathname, item.href) })),
  ]

  return (
    <SiteHeader
      line="prokom"
      homeLabel={homeLabel}
      nav={items}
      megaFor={megaFor}
      actions={
        <>
          <button
            type="button"
            className={CAPSULE.iconButton}
            aria-label="Szukaj w PRO-KOM"
            aria-keyshortcuts="Control+K Meta+K"
            onClick={() => requestSearch()}
          >
            <Icon name="search" strokeWidth={2.2} className="size-[18px]" />
          </button>
          <ThemeToggle className={CAPSULE.iconButton} />
        </>
      }
      cta={cta}
      menuButton={
        <>
          <button
            type="button"
            className={`${CAPSULE.iconButton} pk-search-t`}
            aria-label="Szukaj w PRO-KOM"
            onClick={() => requestSearch()}
          >
            <Icon name="search" strokeWidth={2.2} className="size-[18px]" />
          </button>
          <MenuButton />
        </>
      }
    />
  )
}
