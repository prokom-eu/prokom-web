import { IntentLink as Link } from './IntentLink'
import type { ReactNode } from 'react'

import type { SharedLineKey } from '@/lib/shared/lines'

import { CAPSULE } from './capsule'
import { CapsuleShell } from './CapsuleShell'
import { CapsuleSpy } from './CapsuleSpy'
import { LineLogo } from './LineLogo'

/** A menu entry of the line (data and order from the panel, as today). */
export type CapsuleNavItem = {
  key: string
  label: string
  /** Plain link; without it the entry is a mega menu trigger rendered by `megaFor`. */
  href?: string
  /** The current page: pill + `aria-current="page"` (not for home page sections). */
  current?: boolean
  /** Home page sections this entry stands for — the scroll-spy pill (`spyStops`). */
  sections?: readonly string[]
}

export type SiteHeaderProps = {
  line: SharedLineKey
  /** Accessible name of the logo link, e.g. „PRO-KOM Biznes — strona główna”. */
  homeLabel: string
  nav: readonly CapsuleNavItem[]
  /** The line's mega menu for an entry without `href`: trigger + panel (`CAPSULE.link`, `.mega`). */
  megaFor?: (key: string) => ReactNode
  /** Home page only: every anchored section in order — turns on the scroll-spy pill that glides
   *  under the entry whose `sections` hold the section being read (plan 0611 §8.1 pkt 2). */
  spyStops?: readonly string[]
  /** Right-hand buttons before the action: search, theme, „Twój projekt” (`CAPSULE.*`) — from
   *  1081 px; on phones they live in the menu sheet (board 11). */
  actions?: ReactNode
  /** The line's main action (`shared.headerCta`); `badge` = a live count (`CAPSULE.count`). */
  cta?: { label: string; shortLabel?: string | null; href: string; badge?: ReactNode } | null
  /** Up to 1080 px: the button that opens the menu sheet. */
  menuButton?: ReactNode
  /** A sheet is open: the capsule stays on phones. */
  paused?: boolean
  /** Fixed state for the preview page only. */
  state?: 'top' | 'scrolled'
}

/**
 * Header capsule of the three lines (NAGLOWEK-KAPSULA, board 11; spec §5 `SiteHeader`): mark →
 * the line's menu → right-hand buttons → action. One component for every line: the line gives
 * the data and its mega menus as slots; the capsule brings the layout, the states (scrolled,
 * cramped 1081–1359 px, phone), stickiness and accessibility.
 */
export function SiteHeader({
  line,
  homeLabel,
  nav,
  megaFor,
  spyStops,
  actions,
  cta,
  menuButton,
  paused,
  state,
}: SiteHeaderProps) {
  return (
    <CapsuleShell paused={paused} state={state}>
      <header className="cap">
        <Link href="/" className="cap__logo" aria-label={homeLabel}>
          <LineLogo line={line} alt="" eager />
        </Link>
        <nav aria-label="Menu główne" className="cap__nav">
          {spyStops && spyStops.length > 0 && (
            <CapsuleSpy
              entries={nav.map(({ key, sections }) => ({ key, sections }))}
              stops={spyStops}
            />
          )}
          <ul>
            {nav.map((item) => {
              // An entry without a link is a mega trigger; with no mega from the line it is left
              // out rather than an empty list item.
              const content = item.href ? (
                <Link
                  href={item.href}
                  className={CAPSULE.link}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                megaFor?.(item.key)
              )
              return content ? (
                <li key={item.key} data-cap-key={item.key}>
                  {content}
                </li>
              ) : null
            })}
          </ul>
        </nav>
        <div className="cap__actions">
          {actions && <div className="cap__extras">{actions}</div>}
          {cta && (
            <Link href={cta.href} className="cap-cta">
              <span className="cap-cta__long">{cta.label}</span>
              <span className="cap-cta__short">{cta.shortLabel || cta.label}</span>
              {cta.badge}
            </Link>
          )}
          {menuButton && <span className="cap-menu">{menuButton}</span>}
        </div>
      </header>
    </CapsuleShell>
  )
}
