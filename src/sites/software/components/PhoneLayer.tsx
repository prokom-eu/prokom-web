'use client'

import Link from 'next/link'
import { useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { HomeAwareLink } from '@/components/HomeAwareLink'
import { useThemeColor } from '@/components/useThemeColor'

import { Icon } from '@/components/ui/Icon'
import type { MenuTile } from '@/lib/software/mobileNav'
import type { SoftwareNavigation } from '@/lib/software/navigation'

import { DESKTOP_QUERY } from './layer'
import { ChevronIcon, WandIcon } from './FrameIcons'
import { MenuSearch } from './MenuSearch'
import { ProjectPill } from './ProjectPill'
import { TabBar } from './TabBar'
import { ThemeSegment } from './ThemeSegment'

type Props = {
  navigation: Pick<
    SoftwareNavigation,
    'tabBar' | 'mobileMenu' | 'mobileMenuFooter' | 'projectPill' | 'projectDrawer'
  >
  /** Offer tiles priced from `SolutionAreas` (`menuTiles`). */
  tiles: MenuTile[]
  homeHrefs: Readonly<Record<string, string>>
  /** The line's phone (`SiteSettings.phone`) and its `tel:` link. */
  phone: { label: string; href: string | null } | null
  /** Bottom line of the sheet: the company and its main address. */
  footerLine: string | null
}

const SECTION = 'mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2'
const ROW = 'flex min-h-14 items-center justify-between gap-3 px-4 font-bold'

/**
 * Phone layer of the Software frame (spec. §3.2, §8.6), up to 1080 px: the bottom bar, the menu
 * sheet (`stany/80`, `80b`) and „Twój projekt” (pill and sheet, `stany/81a`, `81`). Data from
 * `SiteSettings.software.navigation`; tile prices from the areas; nothing on the desktop.
 */
export function PhoneLayer({ navigation, tiles, homeHrefs, phone, footerLine }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  // The browser bar follows a theme chosen in the menu (MOBILE-APLIKACJA §4 pkt 8).
  useThemeColor('software')
  const { mobileMenu, mobileMenuFooter } = navigation
  const [kreatorTitle, kreatorCaption, kreatorHref] = mobileMenu.kreator
  const [ctaLabel, ctaHref] = mobileMenuFooter.cta

  return (
    <>
      <ProjectPill pill={navigation.projectPill} texts={navigation.projectDrawer} />
      <TabBar
        items={navigation.tabBar.items}
        homeHrefs={homeHrefs}
        onMenu={() => setMenuOpen(true)}
        menuOpen={menuOpen}
      />
      <BottomSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        desktopQuery={DESKTOP_QUERY}
        dragToClose
        closeOnBack
      >
        <MenuSearch placeholder={mobileMenu.search} />

        <HomeAwareLink
          href={kreatorHref}
          homeHref={homeHrefs[kreatorHref] ?? kreatorHref}
          className="mt-4 flex items-center gap-4 rounded-3xl bg-linear-to-br from-accent to-accent-2 p-4 text-accent-ink shadow-raised"
        >
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface/20">
            <WandIcon className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-extrabold">{kreatorTitle}</span>
            <span className="block text-sm font-semibold">{kreatorCaption}</span>
          </span>
          <Icon name="arrow" strokeWidth={2.4} className="size-6" />
        </HomeAwareLink>

        {(tiles.length > 0 || mobileMenu.offer.length > 0) && <h3 className={SECTION}>Oferta</h3>}
        {tiles.length > 0 && (
          <>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {tiles.map((tile) => (
                <li key={`${tile.href}${tile.name}`}>
                  <Link
                    href={tile.href}
                    className="flex h-full flex-col rounded-3xl border border-border bg-card p-4"
                  >
                    {tile.key && (
                      <span
                        aria-hidden="true"
                        className="inline-flex size-11 items-center justify-center rounded-2xl text-white"
                        style={{ backgroundImage: `var(--grad-area-${tile.key})` }}
                      >
                        {tile.icon && <Icon name={tile.icon} className="size-5" />}
                      </span>
                    )}
                    <span className="mt-3 font-bold leading-snug">{tile.name}</span>
                    <span className="mt-auto pt-3 font-extrabold text-accent-text">
                      {tile.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <LinkList links={mobileMenu.offer} className="mt-4" />

        <h3 className={SECTION}>Firma</h3>
        <LinkList links={mobileMenu.company} className="mt-3" />

        <div className="mt-6">
          <ThemeSegment label="Wygląd strony" />
        </div>

        <Link
          href={ctaHref}
          className="mt-6 flex min-h-[52px] items-center justify-center rounded-2xl bg-button px-5 font-bold text-accent-ink shadow-raised"
        >
          {ctaLabel} →
        </Link>
        {phone &&
          (phone.href ? (
            <a
              href={phone.href}
              className="mt-3 flex min-h-[52px] items-center justify-center gap-3 rounded-2xl border border-border font-bold"
            >
              <Icon name="phone" className="size-5" />
              {phone.label}
            </a>
          ) : (
            <p className="mt-3 text-center font-bold">{phone.label}</p>
          ))}
        {footerLine && <p className="mt-4 text-center text-sm text-ink-2">{footerLine}</p>}
      </BottomSheet>
    </>
  )
}

/** Rows with a chevron; a third entry is a small badge („0 zł”). */
function LinkList({
  links,
  className,
}: {
  links: readonly (readonly string[])[]
  className: string
}) {
  if (links.length === 0) return null
  return (
    <ul className={`${className} overflow-hidden rounded-3xl border border-border bg-card`}>
      {links.map(([label, href, note]) => (
        <li key={`${href}${label}`} className="border-b border-border last:border-b-0">
          <Link href={href ?? '/'} className={ROW}>
            <span className="flex items-center gap-3">
              {label}
              {note && (
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-extrabold text-accent-text">
                  {note}
                </span>
              )}
            </span>
            <ChevronIcon open={false} className="size-5 -rotate-90 text-ink-2" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
