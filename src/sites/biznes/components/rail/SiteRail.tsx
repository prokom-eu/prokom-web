'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { RailShell, railLinkClass } from '@/components/SectionRail'
import { Icon } from '@/components/ui/Icon'

import { SITE_RAIL, siteRailCurrent } from './siteRailItems'

/**
 * Side rail of Biznes subpages from 1400 px (K33 §2.4): „Szukaj” on top, then the global menu
 * with the current page marked. The start page has its own rail of sections, so here nothing.
 */
export function SiteRail() {
  const pathname = usePathname()
  if (pathname === '/') return null
  const current = siteRailCurrent(pathname)
  return (
    // „Menu boczne” as on the board: „Menu” alone is the phone's menu button and dialog.
    <RailShell label="Menu boczne" heading="Menu" search>
      {SITE_RAIL.map((item) => {
        const here = item.href === current
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={here ? 'page' : undefined}
              className={railLinkClass(here)}
            >
              <Icon name={item.icon} className="size-5 shrink-0" />
              {item.label}
            </Link>
          </li>
        )
      })}
    </RailShell>
  )
}
