'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { HomeAwareLink } from '@/components/HomeAwareLink'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics/track'
import { activeTab } from '@/lib/software/mobileNav'

import { MenuIcon, WandIcon } from './FrameIcons'

type Props = {
  /** `navigation.tabBar.items`: 5 × `[label, href]`; the middle one is the wizard, `#…` the menu. */
  items: readonly (readonly [string, string])[]
  /** Section of the start page for an item's address (`/dobierz` → `#dobierz`, from the header). */
  homeHrefs: Readonly<Record<string, string>>
  onMenu: () => void
  menuOpen: boolean
}

/** Icons of the board's bar in its order: Start, Oferta, (Kreator), Kontakt, Menu. */
const ICONS: readonly (ReactNode | null)[] = [
  <Icon key="home" name="home" className="size-6" />,
  <Icon key="grid" name="grid" className="size-6" />,
  null,
  <Icon key="chat" name="chat" className="size-6" />,
  <MenuIcon key="menu" className="size-6" />,
]
const WIZARD = 2
/** `pasek_klik` keys in the same order (ADR-020): labels come from the panel and may change. */
const TAB_KEYS = ['start', 'oferta', 'kreator', 'kontakt', 'menu']
const trackTab = (i: number) => track('pasek_klik', { pozycja: TAB_KEYS[i] ?? `pozycja-${i}` })

const ITEM =
  'relative flex min-h-14 flex-1 flex-col items-center justify-end gap-1 pb-1.5 text-xs font-bold'

/**
 * Bottom bar of the Software phone layer (spec. §3.2, `stany/82`, `82b`), up to 1080 px: fixed
 * 10 px above the bottom (plus the safe area), translucent like the header. The active item
 * follows the address (`activeTab`) — accent text, the icon lifted a little and one dash that
 * slides above it (SWV7: a slot of 1/n width moved by whole slots, transform only); the wizard is
 * a raised round button; „Menu” opens the menu sheet.
 */
export function TabBar({ items, homeHrefs, onMenu, menuOpen }: Props) {
  const pathname = usePathname()
  const active = activeTab(items, pathname)
  return (
    <nav
      aria-label="Pasek nawigacji"
      data-tab-bar
      className="fixed inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom))] z-40 flex items-stretch rounded-[26px] border border-border bg-header-bg px-1 backdrop-blur-md backdrop-saturate-150 min-[1081px]:hidden"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1 flex justify-center transition-[translate,opacity] duration-(--dur-state) ease-(--ease-out) motion-reduce:transition-none"
        style={{
          width: `calc((100% - 8px) / ${items.length})`,
          translate: `${Math.max(active, 0) * 100}% 0`,
          opacity: active >= 0 && active !== WIZARD ? 1 : 0,
        }}
      >
        <span className="h-[3px] w-6 rounded-full bg-accent" />
      </span>
      {items.map(([label, href], i) => {
        const current = i === active
        if (href.startsWith('#')) {
          return (
            <button
              key={label}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => {
                trackTab(i)
                onMenu()
              }}
              className={cx(ITEM, 'text-ink-2')}
            >
              {ICONS[i]}
              {label}
            </button>
          )
        }
        const content =
          i === WIZARD ? (
            <>
              <span className="-mt-7 inline-flex size-14 items-center justify-center rounded-[20px] bg-accent text-accent-ink shadow-raised ring-4 ring-surface">
                <WandIcon className="size-7" />
              </span>
              {label}
            </>
          ) : (
            <>
              <span
                className={cx(
                  'transition-[translate] duration-(--dur-state) ease-(--ease-spring) motion-reduce:transition-none',
                  current && '-translate-y-0.5',
                )}
              >
                {ICONS[i]}
              </span>
              {label}
            </>
          )
        const className = cx(ITEM, current ? 'text-accent-text' : 'text-ink')
        const homeHref = homeHrefs[href]
        return homeHref ? (
          <HomeAwareLink
            key={label}
            href={href}
            homeHref={homeHref}
            aria-current={current ? 'page' : undefined}
            className={className}
            onClick={() => trackTab(i)}
          >
            {content}
          </HomeAwareLink>
        ) : (
          <Link
            key={label}
            href={href}
            aria-current={current ? 'page' : undefined}
            className={className}
            onClick={() => trackTab(i)}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}
