'use client'

/// <reference types="react/canary" />
// `ViewTransition` ships in the React of Next.js (19.3 canary); its types live in `react/canary`.
import { usePathname } from 'next/navigation'
import { type ReactNode, ViewTransition } from 'react'

/**
 * Page content of Biznes cross-fades when the address changes (M1′, MOBILE-APLIKACJA §1;
 * Next.js guide „View transitions”; the Software pattern): keyed by the path, the old page
 * exits and the new one enters (`::view-transition-*(.bz-page-out / .bz-page-in)`,
 * globals.css). `default="none"`: every other transition stays still — the menu sheet's own
 * history entry (`BottomSheet` `closeOnBack`) is a router transition too. Header and tab bar
 * keep their own names. Without browser support or with reduced motion the page simply swaps.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <ViewTransition key={pathname} enter="bz-page-in" exit="bz-page-out" default="none">
      {children}
    </ViewTransition>
  )
}
