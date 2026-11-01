'use client'

/// <reference types="react/canary" />
// `ViewTransition` ships in the React of Next.js (19.3 canary); its types live in `react/canary`.
import { usePathname } from 'next/navigation'
import { type ReactNode, ViewTransition } from 'react'

/**
 * Page content of Software cross-fades when the address changes (SWV5, ZMIANY-v23 §5; Next.js
 * guide „View transitions”, no config flag): keyed by the path, the old page exits and the new
 * one enters (`::view-transition-*(.sw-page-out / .sw-page-in)`, globals.css). `default="none"`:
 * every other transition stays still — a sheet's own history entry (`BottomSheet`
 * `closeOnBack`) is a router transition too, and a view transition there would hold the page
 * (no clicks, no updates) while it runs. Header and bottom bar keep their own names. Without
 * browser support or with reduced motion the page simply swaps.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <ViewTransition key={pathname} enter="sw-page-in" exit="sw-page-out" default="none">
      {children}
    </ViewTransition>
  )
}
