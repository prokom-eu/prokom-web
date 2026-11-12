'use client'

import { usePathname } from 'next/navigation'

import { SiteRail, type SiteRailProps } from '@/components/shared/SiteRail'

import { useCartCount } from './CartCount'

type Props = {
  sections: SiteRailProps['sections']
  /** `shared.tabBar.center`: „Zapytanie”, with the live count of the inquiry list. */
  action: { label: string; href: string; icon?: string | null } | null
}

/**
 * The shared side rail on prokombiznes.pl (from 1400 px, plan 0611 §8.1 pkt 4): the home page
 * sections from the panel (missing ones are left out), „Na tej stronie” on subpages and
 * „Zapytanie” with the count. „Szukaj” opens the line's search window (Ctrl K).
 */
export function BizRail({ sections, action }: Props) {
  const pathname = usePathname()
  const count = useCartCount()
  return (
    <SiteRail
      sections={sections}
      onHome={pathname === '/'}
      action={
        action && {
          ...action,
          count,
          countLabel: 'W zapytaniu',
          current: pathname === action.href,
        }
      }
    />
  )
}
