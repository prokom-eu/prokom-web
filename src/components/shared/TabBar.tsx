'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { isIconName } from '@/lib/catalog/options'
import { requestMenu } from '@/lib/shared/menuOpen'

type TabLink = { label?: string | null; href?: string | null }

export type TabBarProps = {
  /** `shared.tabBar.second`: Oferta / Usługi. */
  second: TabLink | null
  /** `shared.tabBar.center`: the line's action, raised in the accent (Zapytanie / Zaplanuj / Kreator). */
  center: (TabLink & { icon?: string | null }) | null
  /** A live count on the centre (`CAPSULE.count`-like pill from the line: cart, project). */
  centerBadge?: ReactNode
  /** Path of the contact page (`/kontakt`). */
  contactHref?: string
}

const isCurrent = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

/**
 * Phone tab bar of every line (spec §5 `TabBar`, board Telefon): Start · {second} · {centre —
 * raised, 52 px, in the accent} · Kontakt · Menu. Only the second and centre come from the panel;
 * Menu opens the shared sheet (`requestMenu`). Up to 767 px, above the safe area.
 */
export function TabBar({ second, center, centerBadge, contactHref = '/kontakt' }: TabBarProps) {
  const pathname = usePathname() ?? '/'
  const item = (href: string) =>
    cx(
      'flex min-h-11 flex-col items-center justify-end gap-1 pb-0.5 text-[11px] font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
      isCurrent(pathname, href) ? 'text-ink' : 'text-ink-2',
    )
  const icon = (href: string) =>
    cx(
      'flex size-[30px] items-center justify-center',
      isCurrent(pathname, href) && 'text-accent-text',
    )
  const centerIcon = center?.icon && isIconName(center.icon) ? center.icon : 'grid'

  return (
    <nav
      aria-label="Pasek aplikacji"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-end border-t border-border bg-surface/97 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))] min-[768px]:hidden"
      data-tab-bar
    >
      <Link
        href="/"
        className={item('/')}
        aria-current={isCurrent(pathname, '/') ? 'page' : undefined}
      >
        <span className={icon('/')}>
          <Icon name="home" />
        </span>
        Start
      </Link>
      {second?.label && second.href ? (
        <Link
          href={second.href}
          className={item(second.href)}
          aria-current={isCurrent(pathname, second.href) ? 'page' : undefined}
        >
          <span className={icon(second.href)}>
            <Icon name="grid" />
          </span>
          {second.label}
        </Link>
      ) : (
        <span />
      )}
      {center?.label && center.href ? (
        <Link
          href={center.href}
          className={cx(item(center.href), 'text-ink')}
          aria-current={isCurrent(pathname, center.href) ? 'page' : undefined}
          data-tab-center
        >
          <span className="relative -mt-[22px] flex size-[52px] items-center justify-center rounded-[18px] bg-accent text-accent-ink shadow-[0_10px_22px_-10px_var(--accent)]">
            <Icon name={centerIcon} />
            {centerBadge && <span className="absolute -top-1 -right-1">{centerBadge}</span>}
          </span>
          {center.label}
        </Link>
      ) : (
        <span />
      )}
      <Link
        href={contactHref}
        className={item(contactHref)}
        aria-current={isCurrent(pathname, contactHref) ? 'page' : undefined}
      >
        <span className={icon(contactHref)}>
          <Icon name="phone" />
        </span>
        Kontakt
      </Link>
      <button type="button" onClick={requestMenu} className={item('#menu')} aria-haspopup="dialog">
        <span className={icon('#menu')}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            aria-hidden="true"
            className="size-5"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </span>
        Menu
      </button>
    </nav>
  )
}
