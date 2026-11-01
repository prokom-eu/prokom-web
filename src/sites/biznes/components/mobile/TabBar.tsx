'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { useThemeColor } from '@/components/useThemeColor'
import { Icon } from '@/components/ui/Icon'
import {
  type BiznesTab,
  CONTACT_PATH,
  INQUIRY_PAGE_PATH,
  activeBiznesTab,
} from '@/lib/biznes/mobileNav'
import { cartCount } from '@/lib/cart/cart'
import { useCart } from '@/lib/cart/store'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { plural } from '@/lib/plural'
import { requestSearch } from '@/lib/site/searchOpen'

const ITEM = 'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold'
/** The active tab's icon sits in a pill (board `App-Kategoria`). */
const PILL = 'inline-flex h-8 w-12 items-center justify-center rounded-full'

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TabContent({
  icon,
  label,
  active,
}: {
  icon: ReactNode
  label: ReactNode
  active: boolean
}) {
  return (
    <>
      <span className={cx(PILL, active && 'bg-accent-soft')}>{icon}</span>
      {label}
    </>
  )
}

/**
 * Bottom tab bar of the Biznes phone app (MOBILE-APLIKACJA §1, K4-FINAL §7) below 768 px:
 * Start · Oferta · Szukaj · Zapytanie (with its counter) · Kontakt. The active tab follows the
 * address (`activeBiznesTab`); Szukaj opens the search dialog of the header (`requestSearch`).
 * Translucent like the header, above the iPhone's home indicator (safe area).
 */
export function TabBar() {
  const pathname = usePathname()
  const active = activeBiznesTab(pathname)
  const count = cartCount(useCart())
  // The browser bar follows the theme chosen on the site, not only the system's (always mounted).
  useThemeColor('biznes')

  const link = (tab: BiznesTab, href: string, icon: ReactNode, label: ReactNode) => {
    const current = active === tab
    return (
      <Link
        href={href}
        // The tab's own page is „page”; a product or brand under Oferta is just „true”.
        aria-current={current ? (pathname === href ? 'page' : 'true') : undefined}
        className={cx(ITEM, current ? 'text-accent-text' : 'text-ink-2')}
      >
        <TabContent icon={icon} label={label} active={current} />
      </Link>
    )
  }

  return (
    <nav
      aria-label="Pasek aplikacji"
      data-tab-bar
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md backdrop-saturate-150 md:hidden"
    >
      {link('start', '/', <Icon name="home" className="size-[22px]" />, 'Start')}
      {link('oferta', CATALOG_PATH, <Icon name="grid" className="size-[22px]" />, 'Oferta')}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => requestSearch()}
        className={cx(ITEM, 'text-ink-2')}
      >
        <TabContent
          icon={<Icon name="search" className="size-[22px]" />}
          label="Szukaj"
          active={false}
        />
      </button>
      {link(
        'zapytanie',
        INQUIRY_PAGE_PATH,
        <span className="relative">
          <ListIcon />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-2.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-text px-1 text-xs font-black text-accent-ink"
            >
              {count}
            </span>
          )}
        </span>,
        <>
          Zapytanie
          {count > 0 && (
            <span className="sr-only">
              {' '}
              · {count} {plural(count, ['pozycja', 'pozycje', 'pozycji'])}
            </span>
          )}
        </>,
      )}
      {link('kontakt', CONTACT_PATH, <Icon name="phone" className="size-[22px]" />, 'Kontakt')}
    </nav>
  )
}
